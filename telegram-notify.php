<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$configPath = __DIR__ . '/telegram-config.php';
if (!is_file($configPath)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'ไม่พบไฟล์ telegram-config.php'], JSON_UNESCAPED_UNICODE);
    exit;
}

$config = require $configPath;
$botToken = trim((string)($config['bot_token'] ?? ''));
$chatId = trim((string)($config['chat_id'] ?? ''));

if ($botToken === '') {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'ยังไม่ได้ตั้งค่า Telegram bot token'], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($chatId === '' && !empty($config['auto_detect_chat'])) {
    $chatId = detectLatestChatId($botToken);
}

if ($chatId === '') {
    http_response_code(202);
    echo json_encode([
        'ok' => false,
        'skipped' => true,
        'message' => 'ยังไม่พบ chat_id กรุณาส่งข้อความหา bot ก่อน หรือใส่ chat_id ใน telegram-config.php',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$rawBody = file_get_contents('php://input') ?: '';
$payload = json_decode($rawBody, true);

if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'JSON payload ไม่ถูกต้อง'], JSON_UNESCAPED_UNICODE);
    exit;
}

$message = buildBookingMessage($payload);
$telegramResponse = telegramRequest($botToken, 'sendMessage', [
    'chat_id' => $chatId,
    'text' => $message,
    'disable_web_page_preview' => true,
]);

if (empty($telegramResponse['ok'])) {
    http_response_code(502);
    echo json_encode([
        'ok' => false,
        'message' => $telegramResponse['description'] ?? 'ส่งข้อความไป Telegram ไม่สำเร็จ',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);

function buildBookingMessage(array $payload): string
{
    date_default_timezone_set('Asia/Bangkok');

    $groupId = cleanText($payload['groupId'] ?? '-');
    $name = cleanText($payload['name'] ?? '-');
    $phone = cleanText($payload['phone'] ?? '-');
    $dateText = cleanText($payload['dateText'] ?? ($payload['date'] ?? '-'));
    $bookings = is_array($payload['bookings'] ?? null) ? $payload['bookings'] : [];
    $totalPrice = (float)($payload['totalPrice'] ?? 0);
    $slotCount = count($bookings);
    $lines = [];

    foreach (mergeSlotRanges($bookings) as $booking) {
        $start = cleanText($booking['startTime'] ?? '');
        $end = cleanText($booking['endTime'] ?? '');
        $price = number_format((float)($booking['price'] ?? 0));
        $lines[] = "- {$start} - {$end} ({$price} บาท)";
    }

    if (!$lines) {
        $lines[] = '- ไม่พบรายละเอียดช่วงเวลา';
    }

    return implode("\n", [
        'มีรายการจองสนามใหม่',
        "รหัสการจอง: #{$groupId}",
        "ชื่อ: {$name}",
        "โทร: {$phone}",
        "วันที่: {$dateText}",
        'ช่วงเวลา:',
        implode("\n", $lines),
        'รวม: ' . $slotCount . ' ช่วงเวลา / ' . number_format($totalPrice) . ' บาท',
        'สถานะ: รอตรวจสอบ',
        'เวลาแจ้ง: ' . date('Y-m-d H:i:s'),
    ]);
}

function cleanText($value): string
{
    return trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', (string)$value));
}

function mergeSlotRanges(array $slots): array
{
    usort($slots, fn ($a, $b) => strcmp((string)($a['startTime'] ?? ''), (string)($b['startTime'] ?? '')));

    $ranges = [];
    foreach ($slots as $slot) {
        if (!is_array($slot)) {
            continue;
        }

        $lastIndex = count($ranges) - 1;
        $price = (float)($slot['price'] ?? 0);
        $samePricePeriod = $lastIndex >= 0
            && (timeToMinutes($ranges[$lastIndex]['startTime'] ?? '') < (18 * 60))
                === (timeToMinutes($slot['startTime'] ?? '') < (18 * 60));

        if ($lastIndex >= 0 && ($ranges[$lastIndex]['endTime'] ?? '') === ($slot['startTime'] ?? '') && $samePricePeriod) {
            $ranges[$lastIndex]['endTime'] = $slot['endTime'] ?? '';
            $ranges[$lastIndex]['price'] += $price;
            $ranges[$lastIndex]['count'] += 1;
            continue;
        }

        $ranges[] = [
            'startTime' => $slot['startTime'] ?? '',
            'endTime' => $slot['endTime'] ?? '',
            'price' => $price,
            'count' => 1,
        ];
    }

    return $ranges;
}

function timeToMinutes($time): ?int
{
    if (!preg_match('/^(\d{1,2}):(\d{2})$/', (string)$time, $matches)) {
        return null;
    }

    return ((int)$matches[1] * 60) + (int)$matches[2];
}

function detectLatestChatId(string $botToken): string
{
    $response = telegramRequest($botToken, 'getUpdates', [
        'limit' => 20,
        'timeout' => 0,
        'allowed_updates' => ['message', 'channel_post'],
    ]);

    if (empty($response['ok']) || empty($response['result']) || !is_array($response['result'])) {
        return '';
    }

    $updates = array_reverse($response['result']);
    foreach ($updates as $update) {
        if (!is_array($update)) {
            continue;
        }

        $message = $update['message'] ?? $update['channel_post'] ?? null;
        if (is_array($message) && isset($message['chat']['id'])) {
            return (string)$message['chat']['id'];
        }
    }

    return '';
}

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
