<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

$email = strtolower(trim((string) ($_POST['email'] ?? '')));
$password = (string) ($_POST['password'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
    jsonResponse(['success' => false, 'message' => 'Email y contraseña requeridos.'], 400);
}

try {
    $statement = database()->prepare('SELECT name, email, password FROM users WHERE email = :email LIMIT 1');
    $statement->execute([':email' => $email]);
    $user = $statement->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        jsonResponse(['success' => false, 'message' => 'Credenciales inválidas.'], 401);
    }

    jsonResponse([
        'success' => true,
        'name' => $user['name'],
        'email' => $user['email'],
        'redirect' => '../FRONTEND/html/index.html',
    ]);
} catch (PDOException) {
    jsonResponse(['success' => false, 'message' => 'Error de base de datos.'], 500);
}
