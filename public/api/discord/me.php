<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    discord_json(['authenticated' => false, 'error' => 'config'], 503);
}

discord_start_session();

$user = $_SESSION['discord_user'] ?? null;
if (!$user) {
    discord_json(['authenticated' => false], 401);
}

discord_json([
    'authenticated' => true,
    'user' => $user,
]);
