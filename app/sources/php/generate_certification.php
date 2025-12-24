<?php

use Dompdf\Dompdf;

require_once __DIR__ . '/../../vendor/autoload.php';

// Get varables
$input = json_decode(file_get_contents('php://input'), true);
$name = htmlspecialchars($input['name']);
$difficulty = htmlspecialchars($input['difficulty']);
$wpm = htmlspecialchars($input['wpm']);
$accuracy = htmlspecialchars($input['accuracy']);
$exam_date = htmlspecialchars($input['exam_date']);

if (empty($name) || empty($difficulty) || empty($wpm) || empty($accuracy) || empty($exam_date)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields.']);
    exit;
}


$dompdf = new Dompdf();
$dompdf->setPaper('A4', 'landscape');
$html = file_get_contents(__DIR__ . '/../certificate/certification.html');

$html = str_replace('{{ name }}', $name, $html);
$html = str_replace('{{ difficulty }}', $difficulty, $html);
$html = str_replace('{{ wpm }}', $wpm, $html);
$html = str_replace('{{ accuracy }}', $accuracy, $html);
$html = str_replace('{{ exam_date }}', $exam_date, $html);
$certification_id = random_int(1000, 9999);
$html = str_replace('{{ certification_id }}', $certification_id, $html);

$value = $name . $difficulty . $wpm . $accuracy . $exam_date . $certification_id;
$check_hash = hash('sha256', $value);
$html = str_replace('{{ check_hash }}', $check_hash, $html);

$dompdf->loadHtml($html);
$dompdf->render();
$pdfOutput = $dompdf->output();
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="certificate.pdf"');
echo $pdfOutput;
?>