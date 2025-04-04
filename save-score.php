<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    http_response_code(403);
    echo json_encode(['error' => 'User not logged in']);
    error_log('User not logged in, score not saved.');
    exit;
}

$userId = $_SESSION['user_id'];
$score = isset($_POST['score']) ? intval($_POST['score']) : 0;

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "solveit";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
    error_log('Database connection error: ' . $conn->connect_error);
    exit;
}

// Check if a score already exists for the user
$checkSql = "SELECT id FROM scores WHERE user_id = ?";
$checkStmt = $conn->prepare($checkSql);
$checkStmt->bind_param("i", $userId);
$checkStmt->execute();
$checkStmt->store_result();

if ($checkStmt->num_rows > 0) {
    // Score exists, update it
    $updateSql = "UPDATE scores SET score = ? WHERE user_id = ?"; 
    $updateStmt = $conn->prepare($updateSql);
    $updateStmt->bind_param("ii", $score, $userId); 

    if ($updateStmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error updating score: ' . $updateStmt->error]);
        error_log('Error updating score: ' . $updateStmt->error);
    }
    $updateStmt->close();
} else {
    // No score exists, insert a new row
    $insertSql = "INSERT INTO scores (user_id, score) VALUES (?, ?)"; 
    $insertStmt = $conn->prepare($insertSql);
    $insertStmt->bind_param("ii", $userId, $score); 

    if ($insertStmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Error saving score: ' . $insertStmt->error]);
        error_log('Error saving score: ' . $insertStmt->error);
    }
    $insertStmt->close();
}

$checkStmt->close();
$conn->close();
?>