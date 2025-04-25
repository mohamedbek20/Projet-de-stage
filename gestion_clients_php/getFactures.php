<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db.php';

try {

    if (!isset($_GET['client_id'])) {
        error_log("ID client manquant dans la requête");
        echo json_encode([
            'success' => false,
            'message' => 'ID client manquant'
        ]);
        exit;
    }

    $client_id = $_GET['client_id'];
    error_log("Récupération des factures pour le client ID: " . $client_id);
    
    
    $pdo->exec('USE gestion_clients');
    error_log("Base de données sélectionnée");
    
    
    $tableExists = $pdo->query("SHOW TABLES LIKE 'factures'")->rowCount() > 0;
    error_log("Table factures existe: " . ($tableExists ? "oui" : "non"));
    
    if (!$tableExists) {
        error_log("Création de la table factures");
        
        $pdo->exec("CREATE TABLE IF NOT EXISTS factures (
            id INT AUTO_INCREMENT PRIMARY KEY,
            client_id INT NOT NULL,
            description TEXT NOT NULL,
            montant DECIMAL(10,2) NOT NULL,
            status VARCHAR(50) DEFAULT 'non réglée',
            date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    }
    
    
    $stmt = $pdo->prepare('SELECT id FROM clients WHERE id = ?');
    $stmt->execute([$client_id]);
    if ($stmt->rowCount() === 0) {
        error_log("Client non trouvé avec l'ID: " . $client_id);
        echo json_encode([]);
        exit;
    }
    
    
    $stmt = $pdo->prepare('SELECT id, client_id, description, montant, status, date_creation FROM factures WHERE client_id = ? ORDER BY date_creation DESC');
    $stmt->execute([$client_id]);
    $factures = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    error_log("Nombre de factures trouvées: " . count($factures));
    
    
    if (empty($factures)) {
        error_log("Aucune facture trouvée pour le client ID: " . $client_id);
        echo json_encode([]);
    } else {
        
        $formattedFactures = array_map(function($facture) {
            return [
                'id' => (int)$facture['id'],
                'client_id' => (int)$facture['client_id'],
                'description' => $facture['description'],
                'montant' => (float)$facture['montant'],
                'status' => $facture['status'],
                'date_creation' => $facture['date_creation']
            ];
        }, $factures);
        
        error_log("Factures formatées: " . json_encode($formattedFactures));
        echo json_encode($formattedFactures);
    }

} catch(PDOException $e) {
    error_log("Erreur PDO dans getFactures.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de la récupération des factures',
        'error' => $e->getMessage()
    ]);
}
?>
