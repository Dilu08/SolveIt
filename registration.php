<?php
session_start();

include('db/db.con.php');  

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST["username"];
    $email = $_POST["email"];
    $password = $_POST["password"];
    $confirmPassword = $_POST["confirm-password"];

    // Password validation
    if ($password !== $confirmPassword) {
        echo "<script>alert('Passwords do not match.'); window.location.href='registration.html';</script>"; 
        exit;
    }

    // Hashing for security
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    
    $sql = "INSERT INTO users (username, email, password) VALUES ('$name', '$email', '$hashedPassword')";

    if ($conn->query($sql) === TRUE) {
        echo "<script>alert('You have created a account successfully'); window.location.href='login.html';</script>"; 
        exit;
    } else {
        echo "<script>alert('Error: " . $sql . "<br>" . $conn->error . "'); registration.html';</script>"; 
        exit;
    }
}

$conn->close();
?>
