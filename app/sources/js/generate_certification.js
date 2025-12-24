
function redirectToCertificate(name, difficulty, wpm, accuracy)
{
    // Format: 25th December 2025
    const examDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Post parameters to generate the certificate
    const url = `generate_certificate.php?name=${name}&exam_date=${examDate}&difficulty=${difficulty}&wpm=${wpm}&accuracy=${accuracy}`;

    // Redirect to the certificate generation page
    window.location.href = "./app/sources/php/" + url;
}