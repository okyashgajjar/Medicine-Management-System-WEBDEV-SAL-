<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'admin') {
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

$action = $_GET['action'] ?? '';

function sanitize($data) {
    return htmlspecialchars(strip_tags($data));
}

// --- DASHBOARD STATS ---
if ($action === 'get_dashboard_stats') {
    $stats = [];

    $res = $conn->query("SELECT COUNT(*) as total FROM companies");
    $stats['total_companies'] = $res->fetch_assoc()['total'];

    $res = $conn->query("SELECT COUNT(*) as total FROM companies WHERE status='pending'");
    $stats['pending_companies'] = $res->fetch_assoc()['total'];

    $res = $conn->query("SELECT COUNT(*) as total FROM companies WHERE status='banned'");
    $stats['banned_companies'] = $res->fetch_assoc()['total'];

    $res = $conn->query("SELECT COUNT(*) as total FROM medicines");
    $stats['total_medicines'] = $res->fetch_assoc()['total'];

    echo json_encode($stats);
    exit;
}

// --- GET ALL COMPANIES ---
if ($action === 'get_all_companies') {
    $res = $conn->query("SELECT id, company_name, license_number, email, status FROM companies ORDER BY created_at DESC");
    $companies = $res->fetch_all(MYSQLI_ASSOC);
    echo json_encode($companies);
    exit;
}

// --- UPDATE COMPANY STATUS ---
if ($action === 'update_company_status') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id'] ?? 0);
    $status = sanitize($data['status'] ?? '');
    if (!in_array($status, ['pending','approved','banned'])) {
        http_response_code(400);
        echo json_encode(['error'=>'Invalid status']);
        exit;
    }

    $stmt = $conn->prepare("UPDATE companies SET status=? WHERE id=?");
    $stmt->bind_param("si", $status, $id);
    if($stmt->execute()){
        echo json_encode(['message'=>'Company status updated successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['error'=>'Could not update status']);
    }
    exit;
}

// --- GET MEDICINES BY COMPANY ---
if ($action === 'get_medicines_by_company') {
    $company_id = intval($_GET['company_id'] ?? 0);
    $stmt = $conn->prepare("SELECT id, medicine_name FROM medicines WHERE company_id=?");
    $stmt->bind_param("i", $company_id);
    $stmt->execute();
    $res = $stmt->get_result();
    echo json_encode($res->fetch_all(MYSQLI_ASSOC));
    exit;
}

// --- DELETE MEDICINE ---
if ($action === 'delete_medicine') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id'] ?? 0);

    $stmt = $conn->prepare("DELETE FROM medicines WHERE id=?");
    $stmt->bind_param("i", $id);
    if($stmt->execute()){
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
