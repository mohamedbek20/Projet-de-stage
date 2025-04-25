<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Gérer la requête OPTIONS (pre-flight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('HTTP/1.1 200 OK');
    exit();
}

$servername = "localhost";
$username = "root"; 
$password = "";  
$dbname = "gestion_clients"; 

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => "Connection failed: " . $conn->connect_error]));
}

if (isset($_GET['id'])) {
    $id = $_GET['id'];
    
    // Supprimer d'abord les factures associées
    $sql_factures = "DELETE FROM factures WHERE client_id = $id";
    $conn->query($sql_factures);
    
    // Ensuite supprimer le client
    $sql = "DELETE FROM clients WHERE id = $id";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(['success' => true, 'message' => 'Client supprimé avec succès']);
    } else {
        echo json_encode(['success' => false, 'message' => "Erreur lors de la suppression du client : " . $conn->error]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'ID du client non fourni']);
}

$conn->close();
?>