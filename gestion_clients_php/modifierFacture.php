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
    error_log("Données reçues: " . $raw_data);
    
    $data = json_decode($raw_data, true);
    
    if (!$data) {
        error_log("Erreur décodage JSON: " . json_last_error_msg());
        throw new Exception('Données invalides');
    }
    
    if (!isset($data['id']) || !isset($data['description']) || !isset($data['montant'])) {
        throw new Exception('Paramètres manquants');
    }

    $pdo->exec('USE gestion_clients');
    
    $stmt = $pdo->prepare('UPDATE factures SET description = ?, montant = ?, status = ? WHERE id = ?');
    
    $status = isset($data['status']) ? $data['status'] : 'non réglée';
    
    $result = $stmt->execute([
        $data['description'],
        $data['montant'],
        $status,
        $data['id']
    ]);

    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Facture modifiée avec succès'
        ]);
    } else {
        throw new Exception('Erreur lors de la modification');
    }

} catch (Exception $e) {
    error_log("Erreur: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>