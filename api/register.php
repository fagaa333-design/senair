<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

$name = trim((string) ($_POST['name'] ?? ''));
$email = strtolower(trim((string) ($_POST['email'] ?? '')));
$password = (string) ($_POST['password'] ?? '');

if (mb_strlen($name) < 2 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 4) {
    jsonResponse([
        'success' => false,
        'message' => 'Revisa tus datos. La contraseña debe tener al menos 4 caracteres.',
    ], 400);
}

try {
    $statement = database()->prepare(
        'INSERT INTO users (name, email, password) VALUES (:name, :email, :password)'
    );
    $statement->execute([
        ':name' => $name,
        ':email' => $email,
        ':password' => password_hash($password, PASSWORD_DEFAULT),
    ]);

    jsonResponse([
        'success' => true,
        'name' => $name,
        'email' => $email,
        'message' => 'Registro completado.',
        'redirect' => '../FRONTEND/html/index.html',
    ], 201);
} catch (PDOException $error) {
    if ($error->getCode() === '23000') {
        jsonResponse(['success' => false, 'message' => 'El correo ya está registrado.'], 409);
    }

    jsonResponse(['success' => false, 'message' => 'No se pudo crear el usuario.'], 500);
}
