<?php

return [
    // เก็บ token ไว้ฝั่ง server เท่านั้น ห้ามนำไปใส่ในไฟล์ JavaScript
    'bot_token' => '8818169790:AAGwISQoONsmTSphqtejJTbB9x08_e9fxlk',

    // ถ้ารู้ chat_id แล้ว แนะนำให้ใส่ที่นี่เพื่อระบุปลายทางให้แน่นอน
    // วิธีหา: ส่งข้อความหา bot ก่อน แล้วเปิด telegram-chat-id.php ใน browser
    'chat_id' => '-1003676473162',

    // true = ถ้า chat_id ว่าง ระบบจะใช้ chat ล่าสุดที่เคยส่งข้อความหา bot
    'auto_detect_chat' => true,
];
