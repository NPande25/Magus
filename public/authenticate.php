<?php
// Retrieve form data
$username = $_POST['username'];
$password = $_POST['password'];
$room_id = $_POST['room_id'];

// Connect to MySQL server
$servername = "your_server_name";
$username = "your_mysql_username";
$password = "your_mysql_password";
$dbname = "your_database_name";

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Query to authenticate user
$sql = "SELECT * FROM users WHERE username = '$username'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // User found, validate password
    $row = $result->fetch_assoc();
    if (password_verify($password, $row['password_hash'])) {
        // Password is correct, proceed with joining the room
        // You can redirect the user to the room page or perform other actions here
        echo "Authentication successful";
    } else {
        // Password is incorrect
        echo "Incorrect password";
    }
} else {
    // User not found
    echo "User not found";
}

$conn->close();
?>
