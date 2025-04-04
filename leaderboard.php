<?php
session_start();

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "solveit";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    error_log('Database connection error: ' . $conn->connect_error);
    echo json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

$sql = "SELECT users.username, scores.score FROM scores INNER JOIN users ON scores.user_id = users.id ORDER BY scores.score DESC LIMIT 10"; 
$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    error_log('SQL query error: ' . $conn->error);
    echo json_encode(['error' => 'Error executing query: ' . $conn->error]);
    $conn->close();
    exit;
}

$leaderboard = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $leaderboard[] = $row;
    }
}

echo json_encode($leaderboard);

$conn->close();
?>