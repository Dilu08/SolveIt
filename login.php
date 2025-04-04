<?php
session_start();

include('db/db.con.php');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST["username"];
    $password = $_POST["password"];

    
    $sql = "SELECT `id`, `username`, `password` FROM `users` WHERE `username` = ?";

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        echo "<script>alert('Database error: " . $conn->error . "'); window.location.href='login.html';</script>";
        exit;
    }

    $stmt->bind_param("s", $username);

    if ($stmt->execute() === false) {
        echo "<script>alert('Database error: " . $stmt->error . "'); window.location.href='login.html';</script>";
        exit;
    }

    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($id, $dbUsername, $hashedPassword);
        $stmt->fetch();

        if (password_verify($password, $hashedPassword)) {
            $_SESSION["user_id"] = $id;
            $_SESSION["username"] = $dbUsername;
            echo "<script>alert('Login successful!'); window.location.href='start.html';</script>";
            exit;
        } else {
            echo "<script>alert('Incorrect password.'); window.location.href='login.html';</script>";
            exit;
        }
    } else {
        echo "<script>alert('User not found.'); window.location.href='login.html';</script>";
        exit;
    }

    $stmt->close();
}

$conn->close();
?>