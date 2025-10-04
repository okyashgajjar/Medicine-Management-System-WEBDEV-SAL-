<?php
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
$q = $_GET['q'] ?? '';
$q = trim($q);

function sanitize($data) { return htmlspecialchars(strip_tags($data)); }
$q_sanitized = "%".$q."%";

if ($action === 'search_medicines') {
    $stmt = $conn->prepare("SELECT m.medicine_name, m.ingredients, m.use_case, c.company_name, c.license_number
                            FROM medicines m
                            JOIN companies c ON m.company_id=c.id
                            WHERE c.status='approved' AND 
                                  (m.medicine_name LIKE ? OR m.use_case LIKE ? OR c.company_name LIKE ?)");
    $stmt->bind_param("sss",$q_sanitized,$q_sanitized,$q_sanitized);
    $stmt->execute();
    $res = $stmt->get_result();
    echo json_encode($res->fetch_all(MYSQLI_ASSOC));
    exit;
}

http_response_code(400);
echo json_encode(['error'=>'Invalid action']);
?>
    