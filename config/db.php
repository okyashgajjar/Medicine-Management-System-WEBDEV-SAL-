<?php
// Database config
define('DB_HOST', 'localhost');
define('DB_USER', 'root');  // XAMPP default
define('DB_PASS', '');      // XAMPP default
define('DB_NAME', 'medicine_verification');

// Create connection
$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if ($mysqli->connect_errno) {
    json_response(false, "Failed to connect to MySQL: " . $mysqli->connect_error);
}

// JSON response helper
if (!function_exists('json_response')) {
    function json_response($success, $message, $data = null) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => $success,
            'message' => $message,
            'data' => $data
        ]);
        exit;
    }
}
?>
