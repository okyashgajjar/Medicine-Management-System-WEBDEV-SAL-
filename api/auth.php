<?php
session_start();
header('Content-Type: application/json');

$host = 'localhost';
$db   = 'medicine_verification';
$user = 'root';
$pass = '';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$action = $_GET['action'] ?? '';

function sanitize($data) {
    return htmlspecialchars(strip_tags($data));
}

// --- LOGIN ---
if ($action === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    $user_type = sanitize($data['user_type'] ?? '');
    $identifier = sanitize($data['identifier'] ?? '');
    $password = $data['password'] ?? '';

    if ($user_type === 'admin') {
        $stmt = $conn->prepare("SELECT * FROM admins WHERE username=?");
        $stmt->bind_param("s", $identifier);
    } else {
        $stmt = $conn->prepare("SELECT * FROM companies WHERE license_number=?");
        $stmt->bind_param("s", $identifier);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_type'] = $user_type;
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['company_name'] = $user_type === 'company' ? $user['company_name'] : null;
        echo json_encode(['message' => 'Login successful', 'user_type' => $user_type]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
    exit;
}

// --- REGISTER COMPANY ---
if ($action === 'register_company') {
    $data = json_decode(file_get_contents('php://input'), true);
    $company_name = sanitize($data['company_name'] ?? '');
    $license_number = sanitize($data['license_number'] ?? '');
    $email = sanitize($data['email'] ?? '');
    $password = $data['password'] ?? '';

    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 6 characters']);
        exit;
    }

    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

    $stmt = $conn->prepare("INSERT INTO companies (company_name, license_number, email, password) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $company_name, $license_number, $email, $hashed_password);
    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(['message' => 'Company registered successfully. Await admin approval.']);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Registration failed. License or Email may already exist.']);
    }
    exit;
}

// --- LOGOUT ---
if ($action === 'logout') {
    session_destroy();
    echo json_encode(['message' => 'Logged out']);
    exit;
}

http_response_code(400);
echo json_encode(['error' => 'Invalid action']);
?>
