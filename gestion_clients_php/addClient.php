<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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
    if (empty($data['nom']) || empty($data['prenom']) || empty($data['email']) || 
        empty($data['telephone']) || empty($data['adresse']) || empty($data['pays'])) {
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
    $nom = trim($data['nom']);
    $prenom = trim($data['prenom']);
    $email = trim($data['email']);
    $adresse = trim($data['adresse']);
    $pays = trim($data['pays']);

    // Vérification si l'email ou le téléphone existe déjà
    $pdo->exec('USE gestion_clients');
    $checkExisting = $pdo->prepare('SELECT id FROM clients WHERE email = ? OR telephone = ?');
    $checkExisting->execute([$email, $telephone]);
    
    if ($checkExisting->rowCount() > 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Email ou numéro de téléphone déjà existant'
        ]);
        exit;
    }
    
    $stmt = $pdo->prepare('INSERT INTO clients (nom, prenom, email, telephone, adresse, pays) VALUES (?, ?, ?, ?, ?, ?)');
    error_log("Requête préparée");
    
    $stmt->execute([$nom, $prenom, $email, $telephone, $adresse, $pays]);
    error_log("Requête exécutée");
    
    echo json_encode([
        'success' => true,
        'message' => 'Client ajouté avec succès',
        'client' => [
            'id' => $pdo->lastInsertId(),
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
        'message' => 'Erreur lors de l\'ajout du client',
        'error' => $e->getMessage()
    ]);
}
?>