<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

$credential = (string) ($_POST['credential'] ?? '');
if ($credential === '') {
    jsonResponse(['success' => false, 'message' => 'No se recibió la credencial de Google.'], 400);
}

$clientId = '856307656254-b7bfc6vfb9uo65reouctksoue2pa9ago.apps.googleusercontent.com';
$tokenUrl = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . rawurlencode($credential);
$tokenJson = @file_get_contents($tokenUrl);
$token = is_string($tokenJson) ? json_decode($tokenJson, true) : null;

if (!is_array($token) || ($token['aud'] ?? '') !== $clientId || ($token['email_verified'] ?? '') !== 'true') {
    jsonResponse(['success' => false, 'message' => 'No se pudo validar la cuenta de Google.'], 401);
}

$email = strtolower(trim((string) ($token['email'] ?? '')));
$name = trim((string) ($token['name'] ?? 'Usuario'));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['success' => false, 'message' => 'Google no devolvió un correo válido.'], 400);
}

try {
    $database = database();
    $find = $database->prepare('SELECT name, email FROM users WHERE email = :email LIMIT 1');
    $find->execute([':email' => $email]);
    $user = $find->fetch();

    if (!$user) {
        $insert = $database->prepare(
            'INSERT INTO users (name, email, password) VALUES (:name, :email, :password)'
        );
        $insert->execute([
            ':name' => $name,
            ':email' => $email,
            ':password' => password_hash(bin2hex(random_bytes(24)), PASSWORD_DEFAULT),
        ]);
    } else {
        $name = $user['name'];
    }

    jsonResponse([
        'success' => true,
        'name' => $name,
        'email' => $email,
        'redirect' => '../FRONTEND/html/index.html',
    ]);
} catch (PDOException) {
    jsonResponse(['success' => false, 'message' => 'Error de base de datos.'], 500);
}
