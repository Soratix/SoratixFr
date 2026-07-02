<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

discord_start_session();
$_SESSION = [];
session_destroy();

discord_json(['success' => true]);
