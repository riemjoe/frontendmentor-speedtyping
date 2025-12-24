
function redirectToCertificate(name, difficulty, wpm, accuracy, charsTyped, duration)
{
    // Post parameters to generate the certificate
    const url = `generate_certificate.php?name=${name}&difficulty=${difficulty}&wpm=${wpm}&accuracy=${accuracy}&chars_typed=${charsTyped}&duration=${duration}`;

    // Redirect to the certificate generation page
    window.location.href = "./app/sources/php/" + url;
}