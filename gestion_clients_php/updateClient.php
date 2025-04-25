<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db.php';

try {
    $raw_data = file_get_contents('php://input');
    error_log("Données brutes reçues: " . $raw_data);

    $data = json_decode($raw_data, true);
    error_log("Données décodées: " . print_r($data, true));

    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode([
            'success' => false,
            'message' => 'Données JSON invalides',
            'error' => json_last_error_msg()
        ]);
        exit;
    }

    // Vérification des champs obligatoires
    if (empty($data['id']) || empty($data['nom']) || empty($data['prenom']) || empty($data['email']) || 
        empty($data['telephone']) || empty($data['adresse']) || empty($data['pays_nom'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Tous les champs sont obligatoires'
        ]);
        exit;
    }

    // Validation de l'email
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            'success' => false,
            'message' => 'Format d\'email invalide'
        ]);
        exit;
    }

    // Validation du numéro de téléphone
    $telephone = trim($data['telephone']);
    // Accepte les numéros français (0XXXXXXXXX) ou internationaux (+XXX...)
    if (!preg_match('/^(0[1-9][0-9]{8}|\\+[0-9]{1,4}[0-9]{9})$/', $telephone)) {
        echo json_encode([
            'success' => false,
            'message' => 'Numéro de téléphone invalide'
        ]);
        exit;
    }

    // Nettoyage des données
    $id = intval($data['id']);
    $nom = trim($data['nom']);
    $prenom = trim($data['prenom']);
    $email = trim($data['email']);
    $adresse = trim($data['adresse']);
    $pays = trim($data['pays_nom']); // Utiliser le nom complet du pays

    // Vérification si l'email ou le téléphone existe déjà pour un autre client
    $pdo->exec('USE gestion_clients');
    $checkExisting = $pdo->prepare('SELECT id FROM clients WHERE (email = ? OR telephone = ?) AND id != ?');
    $checkExisting->execute([$email, $telephone, $id]);
    
    if ($checkExisting->rowCount() > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Email ou numéro de téléphone déjà existant pour un autre client'
        ]);
        exit;
    }

    $stmt = $pdo->prepare('UPDATE clients SET nom = ?, prenom = ?, email = ?, telephone = ?, adresse = ?, pays = ? WHERE id = ?');
    error_log("Requête préparée");
    
    $stmt->execute([$nom, $prenom, $email, $telephone, $adresse, $pays, $id]);
    error_log("Requête exécutée");

    if ($stmt->rowCount() === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Client non trouvé ou aucune modification effectuée'
        ]);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Client mis à jour avec succès',
        'client' => [
            'id' => $id,
            'nom' => $nom,
            'prenom' => $prenom,
            'email' => $email,
            'telephone' => $telephone,
            'adresse' => $adresse,
            'pays' => $pays
        ]
    ]);

} catch(PDOException $e) {
    error_log("Erreur PDO: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de la mise à jour du client',
        'error' => $e->getMessage()
    ]);
}
?> 