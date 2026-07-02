<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    discord_redirect('/admin?error=config');
}

$config = discord_config();
discord_start_session();

$state = bin2hex(random_bytes(16));
$_SESSION['discord_oauth_state'] = $state;

$params = http_build_query([
    'client_id' => $config['client_id'],
    'redirect_uri' => $config['redirect_uri'],
    'response_type' => 'code',
    'scope' => 'identify',
    'state' => $state,
    'prompt' => 'none',
]);

header('Location: https://discord.com/api/oauth2/authorize?' . $params);
exit;
