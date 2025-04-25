<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }
require_once 'db.php';
try { $pdo->exec('USE gestion_clients'); $stmt = $pdo->query('SELECT * FROM clients ORDER BY id DESC'); $clients = $stmt->fetchAll(PDO::FETCH_ASSOC); echo json_encode([ 'success' => true, 'clients' => $clients ]); } catch(PDOException $e) { error_log("Erreur PDO: " . $e->getMessage()); echo json_encode([ 'success' => false, 'message' => 'Erreur lors de la récupération des clients', 'error' => $e->getMessage() ]); } ?>
