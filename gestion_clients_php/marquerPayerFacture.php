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
    
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode([
            'success' => false,
            'message' => 'Données JSON invalides',
            'error' => json_last_error_msg()
        ]);
        exit;
    }

    
    if (!isset($data['id'])) {
        echo json_encode([
            'success' => false,
            'message' => 'ID de la facture manquant',
            'received_data' => $data
        ]);
        exit;
    }

    $facture_id = $data['id'];
    error_log("Mise à jour du statut pour la facture ID: " . $facture_id);
    
    
    $pdo->exec('USE gestion_clients');
    
    
    $stmt = $pdo->prepare('UPDATE factures SET status = ? WHERE id = ?');
    $result = $stmt->execute(['payée', $facture_id]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Statut de la facture mis à jour avec succès'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de la mise à jour du statut'
        ]);
    }

} catch(PDOException $e) {
    error_log("Erreur PDO dans marquerPayerFacture.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Erreur lors de la mise à jour du statut',
        'error' => $e->getMessage()
    ]);
}
?>
