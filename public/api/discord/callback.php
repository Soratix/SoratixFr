<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    discord_redirect('/admin?error=config');
}

$config = discord_config();
discord_start_session();

$code = $_GET['code'] ?? null;
$state = $_GET['state'] ?? null;

if (!$code || !$state || !isset($_SESSION['discord_oauth_state']) || !hash_equals($_SESSION['discord_oauth_state'], $state)) {
    unset($_SESSION['discord_oauth_state']);
    discord_redirect('/admin?error=state');
}

unset($_SESSION['discord_oauth_state']);

$tokenResponse = discord_http_post('https://discord.com/api/oauth2/token', [
    'client_id' => $config['client_id'],
    'client_secret' => $config['client_secret'],
    'grant_type' => 'authorization_code',
    'code' => $code,
    'redirect_uri' => $config['redirect_uri'],
]);

$accessToken = $tokenResponse['access_token'] ?? null;
if (!$accessToken) {
    discord_redirect('/admin?error=discord');
}

$user = discord_http_get('https://discord.com/api/users/@me', $accessToken);
$userId = $user['id'] ?? null;

if (!$userId || $userId !== (string) $config['allowed_user_id']) {
    discord_redirect('/admin?error=unauthorized');
}

$_SESSION['discord_user'] = [
    'id' => $userId,
    'username' => $user['username'] ?? 'unknown',
    'global_name' => $user['global_name'] ?? null,
    'avatar' => $user['avatar'] ?? null,
];

discord_redirect('/admin?auth=ok');
