<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'company') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

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

$company_id = $_SESSION['user_id'];

$action = $_GET['action'] ?? '';
function sanitize($data) { return htmlspecialchars(strip_tags($data)); }

// --- GET MY MEDICINES ---
if ($action === 'get_my_medicines') {
    $stmt = $conn->prepare("SELECT id, medicine_name, ingredients, use_case FROM medicines WHERE company_id=?");
    $stmt->bind_param("i",$company_id);
    $stmt->execute();
    $res = $stmt->get_result();
    echo json_encode($res->fetch_all(MYSQLI_ASSOC));
    exit;
}

// --- GET ALL APPROVED MEDICINES ---
if ($action === 'get_all_medicines') {
    $res = $conn->query("SELECT m.medicine_name, m.ingredients, m.use_case, c.company_name, c.license_number
                         FROM medicines m
                         JOIN companies c ON m.company_id=c.id
                         WHERE c.status='approved'");
    echo json_encode($res->fetch_all(MYSQLI_ASSOC));
    exit;
}

// --- ADD MEDICINE ---
if ($action === 'add_medicine') {
    $data = json_decode(file_get_contents('php://input'), true);
    $name = sanitize($data['medicine_name'] ?? '');
    $ingredients = sanitize($data['ingredients'] ?? '');
    $use_case = sanitize($data['use_case'] ?? '');

    $stmt = $conn->prepare("INSERT INTO medicines (company_id, medicine_name, ingredients, use_case) VALUES (?,?,?,?)");
    $stmt->bind_param("isss",$company_id, $name, $ingredients, $use_case);
    if($stmt->execute()) {
        http_response_code(201);
        echo json_encode(['message'=>'Medicine added successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error'=>'Could not add medicine']);
    }
    exit;
}

// --- UPDATE MEDICINE ---
if ($action === 'update_medicine') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id'] ?? 0);
    $name = sanitize($data['medicine_name'] ?? '');
    $ingredients = sanitize($data['ingredients'] ?? '');
    $use_case = sanitize($data['use_case'] ?? '');

    $stmt = $conn->prepare("UPDATE medicines SET medicine_name=?, ingredients=?, use_case=? WHERE id=? AND company_id=?");
    $stmt->bind_param("sssii", $name, $ingredients, $use_case, $id, $company_id);
    if($stmt->execute()) {
        echo json_encode(['message'=>'Medicine updated successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error'=>'Could not update medicine']);
    }
    exit;
}

// --- DELETE MEDICINE ---
if ($action === 'delete_medicine') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id'] ?? 0);

    $stmt = $conn->prepare("DELETE FROM medicines WHERE id=? AND company_id=?");
    $stmt->bind_param("ii", $id, $company_id);
    if($stmt->execute()) {
        echo json_encode(['message'=>'Medicine deleted successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error'=>'Could not delete medicine']);
    }
    exit;
}

http_response_code(400);
echo json_encode(['error'=>'Invalid action']);
?>
