<?php

use Dompdf\Dompdf;
use Dompdf\Options;

require_once __DIR__ . '/../../../vendor/autoload.php';

// Get varables
$name = $_GET['name'] ?? '';
$difficulty = $_GET['difficulty'] ?? '';
$wpm = $_GET['wpm'] ?? '';
$accuracy = $_GET['accuracy'] ?? '';
$chars_typed = $_GET['chars_typed'] ?? '';
$duration = $_GET['duration'] ?? '';

if (empty($name) || empty($difficulty) || empty($wpm) || empty($accuracy)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields.']);
    exit;
}

if($difficulty === 'easy') {
    $difficulty = 'Beginners';
} elseif($difficulty === 'medium') {
    $difficulty = 'Experienced';
} elseif($difficulty === 'hard') {
    $difficulty = 'Professional';
} else {
    $difficulty = 'Unknown';
}

// Signature image as base64
$signature_path = __DIR__ . '/../../certificate/signature.png';
$signature_data = file_get_contents($signature_path);
$signature_img_base64 = base64_encode($signature_data);

// Format 01 MONTH 2025, 16:00:00
$exam_date = date('d F Y, H:i:s');

// PDF generation
$options = new Options();
$options->set('defaultFont', 'Arial');
$dompdf = new Dompdf($options);
$dompdf->setPaper('A4', 'landscape');
$html = file_get_contents(__DIR__ . '/../../certificate/certification.html');

$html = str_replace('{{ name }}', $name, $html);
$html = str_replace('{{ difficulty }}', $difficulty, $html);
$html = str_replace('{{ wpm }}', $wpm, $html);
$html = str_replace('{{ accuracy }}', $accuracy, $html);
$html = str_replace('{{ exam_date }}', $exam_date, $html);
$html = str_replace('{{ chars_typed }}', $chars_typed, $html);
$html = str_replace('{{ duration }}', $duration, $html);
$html = str_replace('{{ signature_img_base64 }}', $signature_img_base64, $html);
$certification_id = uniqid('CERT-');
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