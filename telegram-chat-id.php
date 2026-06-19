<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$configPath = __DIR__ . '/telegram-config.php';
if (!is_file($configPath)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'ไม่พบไฟล์ telegram-config.php'], JSON_UNESCAPED_UNICODE);
    exit;
}

$config = require $configPath;
$botToken = trim((string)($config['bot_token'] ?? ''));

if ($botToken === '') {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'ยังไม่ได้ตั้งค่า Telegram bot token'], JSON_UNESCAPED_UNICODE);
    exit;
}

$response = telegramRequest($botToken, 'getUpdates', [
    'limit' => 20,
    'timeout' => 0,
    'allowed_updates' => ['message', 'channel_post'],
]);

if (empty($response['ok'])) {
    http_response_code(502);
    echo json_encode([
        'ok' => false,
        'message' => $response['description'] ?? 'อ่าน chat_id จาก Telegram ไม่สำเร็จ',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$chats = [];
foreach (($response['result'] ?? []) as $update) {
    if (!is_array($update)) {
        continue;
    }

    $message = $update['message'] ?? $update['channel_post'] ?? null;
    if (!is_array($message) || !isset($message['chat']['id'])) {
        continue;
    }

    $chat = $message['chat'];
    $chatId = (string)$chat['id'];
    $chats[$chatId] = [
        'chat_id' => $chatId,
        'type' => $chat['type'] ?? '',
        'title' => $chat['title'] ?? trim(($chat['first_name'] ?? '') . ' ' . ($chat['last_name'] ?? '')),
        'username' => $chat['username'] ?? '',
    ];
}

echo json_encode([
    'ok' => true,
    'message' => $chats ? 'นำ chat_id ไปใส่ใน telegram-config.php ได้เลย' : 'ยังไม่พบ chat กรุณาส่งข้อความหา bot ก่อน แล้ว refresh หน้านี้',
    'chats' => array_values($chats),
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

function telegramRequest(string $botToken, string $method, array $payload): array
{
    $url = 'https://api.telegram.org/bot' . $botToken . '/' . $method;
    $body = json_encode($payload, JSON_UNESCAPED_UNICODE);

    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 10,
        ]);

        $rawResponse = curl_exec($ch);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($rawResponse === false) {
            return ['ok' => false, 'description' => $curlError ?: 'Telegram request failed'];
        }
    } else {
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => "Content-Type: application/json\r\n",
                'content' => $body,
                'timeout' => 10,
            ],
        ]);

        $rawResponse = @file_get_contents($url, false, $context);
        if ($rawResponse === false) {
            return ['ok' => false, 'description' => 'Telegram request failed'];
        }
    }

    $decoded = json_decode((string)$rawResponse, true);
    return is_array($decoded) ? $decoded : ['ok' => false, 'description' => 'Telegram response ไม่ถูกต้อง'];
}
