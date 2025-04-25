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

    // Décoder les données JSON
    $data = json_decode($raw_data, true);
    
    // Vérifier si le décodage a réussi
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode([
            'success' => false,
            'message' => 'Données JSON invalides',
            'error' => json_last_error_msg(),
            'raw_data' => $raw_data
        ]);
        exit;
    }

    // Vérifier si les données nécessaires sont présentes
    if (!isset($data['client_id']) || !isset($data['description']) || !isset($data['montant'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Données manquantes',
            'received_data' => $data
        ]);
        exit;
    }

    $pdo->exec('USE gestion_clients');
    
    $tableExists = $pdo->query("SHOW TABLES LIKE 'factures'")->rowCount() > 0;
    
    if (!$tableExists) {
        
        $pdo->exec("CREATE TABLE IF NOT EXISTS factures (
            id INT AUTO_INCREMENT PRIMARY KEY,
            client_id INT NOT NULL,
            description TEXT NOT NULL,
            montant DECIMAL(10,2) NOT NULL,
            status VARCHAR(50) DEFAULT 'non réglée',
            date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients(id)
        )");
    }
    
    $stmt = $pdo->prepare('INSERT INTO factures (client_id, description, montant, status) VALUES (?, ?, ?, ?)');
    
    $stmt->execute([
        $data['client_id'],
        $data['description'],
        $data['montant'],
        $data['status'] ?? 'non réglée'
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Facture ajoutée avec succès',
        'id' => $pdo->lastInsertId()
    ]);

} catch(PDOException $e) {
    error_log($e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de l\'ajout de la facture',
        'error' => $e->getMessage()
    ]);
}
?>
