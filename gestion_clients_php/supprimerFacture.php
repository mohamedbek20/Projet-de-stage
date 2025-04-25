<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


$servername = "localhost";
$username = "root"; 
$password = "";  
$dbname = "gestion_clients"; 

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if (isset($_GET['id'])) {
    $id = $_GET['id'];
    $sql = "DELETE FROM factures WHERE id = $id";

    if ($conn->query($sql) === TRUE) {
        echo "Facture supprimée avec succès";
    } else {
        echo "Erreur lors de la suppression de la facture: " . $conn->error;
    }
}


$conn->close();
?>
