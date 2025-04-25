<?php
// Activer l'affichage des erreurs pour le débogage
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Headers CORS
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=UTF-8');

// Gérer la requête OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérifier que c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    exit();
}

try {
    // Récupérer les données brutes
    $input = file_get_contents('php://input');
    error_log("Données reçues: " . $input);

    // Décoder les données JSON
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Erreur de décodage JSON: ' . json_last_error_msg());
    }

    // Vérifier les données requises
    if (!isset($data['id']) || !isset($data['nom']) || !isset($data['prenom'])) {
        throw new Exception('Données manquantes');
    }

    // Connexion à la base de données
    $pdo = new PDO(
        "mysql:host=localhost;dbname=gestion_clients;charset=utf8",
        "root",
        "",
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // Préparer et exécuter la requête
    $stmt = $pdo->prepare("
        UPDATE clients 
        SET nom = :nom,
            prenom = :prenom,
            email = :email,
            telephone = :telephone,
            adresse = :adresse
        WHERE id = :id
    ");

    $success = $stmt->execute([
        ':id' => $data['id'],
        ':nom' => $data['nom'],
        ':prenom' => $data['prenom'],
        ':email' => $data['email'] ?? null,
        ':telephone' => $data['telephone'] ?? null,
        ':adresse' => $data['adresse'] ?? null
    ]);

    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Client modifié avec succès'
        ]);
    } else {
        throw new Exception('Échec de la modification');
    }

} catch (Exception $e) {
    error_log("Erreur dans modifierClient.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>