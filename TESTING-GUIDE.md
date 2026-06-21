# 🧪 คู่มือทดสอบระบบ Booking

## 📋 Test Checklist

### ✅ 1. Basic Booking Flow
```
□ เลือกวันที่ในปฏิทิน
□ เลือกช่วงเวลา 1-3 ช่วง
□ กดจองสนาม
□ กรอกข้อมูล (ชื่อ + เบอร์)
□ ยืนยันการจอง
□ ได้รับ Booking ID
□ สถานะเป็น "รอตรวจสอบ"
```

**Expected:** การจองสำเร็จ + แสดง Confirmation Modal

---

### ✅ 2. Race Condition Test (CRITICAL)
```
Preparation:
1. เปิด 2 browser tabs (Chrome + Edge หรือ Chrome Incognito)
2. ล็อกอินหรือเข้าหน้าจองทั้ง 2 tabs

Test Steps:
Tab 1:
□ เลือกวันเดียวกัน
□ เลือกช่วงเวลา 18:00-18:30

Tab 2:
□ เลือกวันเดียวกัน
□ เลือกช่วงเวลา 18:00-18:30

Both Tabs:
□ กดจองสนามพร้อมกัน
□ กรอกข้อมูลพร้อมกัน
□ กดยืนยันพร้อมกัน
```

**Expected Results:**
- ✅ Tab แรกที่ submit จะสำเร็จ
- ✅ Tab หลังจะได้ error: "ช่วงเวลา XX:XX-XX:XX วันที่ YYYY-MM-DD ถูกจองแล้ว กรุณาเลือกช่วงเวลาอื่น"
- ✅ ในฐานข้อมูลมีแค่ 1 booking เท่านั้น

**How to Verify:**
```
1. Admin → ดูรายการจอง
2. ต้องมีแค่ 1 รายการ
3. Firebase → bookings → นับจำนวน
```

---

### ✅ 3. Weekly Booking Test (CRITICAL)
```
Preparation:
□ Login as Admin (password: 55555)
□ คลิก "จองรายสัปดาห์"

Test Case A: Normal Weekly Booking
□ ชื่อ: Test Weekly
□ เบอร์: 0812345678
□ วันที่เริ่มต้น: จันทร์หน้า
□ วันในสัปดาห์: จันทร์
□ เวลา: 18:00 - 19:00
□ จำนวน: 4 สัปดาห์
□ กดยืนยัน
```

**Expected Results:**
- ✅ จองสำเร็จ
- ✅ เห็นการจอง 4 รายการในปฏิทิน
- ✅ แต่ละรายการอยู่ในวันจันทร์ที่ต่างกัน (ห่างกัน 7 วัน)

**Verification:**
```javascript
// ตรวจสอบใน Firebase
bookings: {
  "BK1234_20260622_1800_ABC": { date: "2026-06-22", ... }  // จันทร์
  "BK1234_20260629_1800_DEF": { date: "2026-06-29", ... }  // จันทร์ถัดไป
  "BK1234_20260706_1800_GHI": { date: "2026-07-06", ... }  // จันทร์ถัดไป
  "BK1234_20260713_1800_JKL": { date: "2026-07-13", ... }  // จันทร์ถัดไป
}
```

---

### ✅ 4. Weekly Booking Conflict Test
```
Setup:
1. มีการจองอยู่แล้ว: วันอังคาร 22/07/2026 เวลา 18:00-19:00
2. พยายามจองรายสัปดาห์ที่ครอบคลุมวันนี้

Test Steps:
□ Admin → จองรายสัปดาห์
□ ชื่อ: Test Conflict
□ เบอร์: 0823456789
□ วันที่เริ่มต้น: 22/06/2026 (อังคาร)
□ วันในสัปดาห์: อังคาร
□ เวลา: 18:00 - 19:00
□ จำนวน: 6 สัปดาห์ (จะครอบคลุม 22/07)
□ กดยืนยัน
```

**Expected Results:**
- ✅ แสดง error message:
```
ไม่สามารถจองได้ เนื่องจากมีการจองซ้ำในวันที่:

• วันอังคารที่ 22 กรกฎาคม 2026 เวลา 18:00 - 19:00 (ชื่อเดิม)

กรุณาเลือกเวลาหรือจำนวนสัปดาห์ใหม่
```

---

### ✅ 5. 24:00 Time Handling Test
```
Test Steps:
□ Admin → จองรายสัปดาห์
□ ชื่อ: Test Midnight
□ เบอร์: 0834567890
□ วันในสัปดาห์: ศุกร์
□ เวลาเริ่มต้น: 23:00
□ เวลาสิ้นสุด: 24:00 ← ทดสอบจุดนี้
□ จำนวน: 2 สัปดาห์
□ กดยืนยัน
```

**Expected Results:**
- ✅ จองสำเร็จ ไม่มี error
- ✅ แสดงเวลาถูกต้อง: 23:00 - 24:00
- ✅ คำนวณราคาถูกต้อง (1 ชม. = 1000 บาท)

**Calculation Check:**
```
Start: 23:00 = 23 * 60 = 1380 minutes
End:   24:00 = 24 * 60 = 1440 minutes (NOT NaN!)
Duration: 1440 - 1380 = 60 minutes = 1 hour
Price: 1000 บาท (night rate)
```

---

### ✅ 6. Admin Brute Force Protection Test
```
Test Steps:
□ คลิกปุ่ม "Admin" ที่ header
□ ใส่รหัสผ่านผิด: "11111" → Submit
□ ใส่รหัสผ่านผิด: "22222" → Submit
□ ใส่รหัสผ่านผิด: "33333" → Submit
□ ใส่รหัสผ่านผิด: "44444" → Submit
□ ใส่รหัสผ่านผิด: "55556" → Submit (ครั้งที่ 5)
```

**Expected Results After 5 Failed Attempts:**
- ✅ Modal แสดง: "รหัสผ่านไม่ถูกต้อง ถูกล็อก 5 นาที"
- ✅ Input field ถูก clear
- ✅ ใส่รหัสถูกก็ไม่สามารถเข้าได้ (ต้องรอ 5 นาที)
- ✅ หลัง 5 นาที สามารถพยายามใหม่ได้

**Countdown Test:**
```
□ หลัง lock แล้ว กดยืนยันอีกครั้ง
□ ต้องแสดงเวลาที่เหลือ เช่น:
  "ถูกล็อกเนื่องจากใส่รหัสผ่านผิดหลายครั้ง กรุณารออีก 287 วินาที"
```

---

### ✅ 7. Empty Slot Validation Test
```
Test Steps:
□ เข้าหน้าจอง
□ เลือกวันที่
□ ไม่เลือกช่วงเวลาใดๆ (ปล่อยว่าง)
□ คลิกปุ่ม "จองสนาม"
```

**Expected Results:**
- ✅ Modal ไม่เปิด (เพราะ SummaryBar ไม่แสดง)

**Alternative Test:**
```javascript
// ถ้า SummaryBar แสดง (มีการเลือกช่วง) แล้วลบออกทั้งหมด
□ เลือกช่วงเวลา 1 ช่วง
□ คลิกช่วงเวลานั้นอีกครั้งเพื่อยกเลิก
□ SummaryBar ต้องหายไป
```

---

### ✅ 8. Recheck Before Submit Test
```
Setup:
1. เปิด 2 tabs
2. Tab 1: เลือกช่วง 18:00-18:30
3. Tab 2: เลือกช่วง 18:00-18:30

Test Steps:
Tab 1:
□ กรอกข้อมูล + กดยืนยัน (สำเร็จ)

Tab 2 (ยังค้างอยู่ที่ modal):
□ รอให้ Firebase sync (1-2 วินาที)
□ กรอกข้อมูล + กดยืนยัน
```

**Expected Results:**
- ✅ Tab 2 จะได้ error: "ช่วงเวลาที่เลือกถูกจองไปแล้ว กรุณาเลือกช่วงเวลาใหม่"
- ✅ Modal ไม่ปิด
- ✅ ไม่มีการบันทึกลง Firebase

---

### ✅ 9. Telegram Notification Test
```
Test Steps:
□ จองช่วงเวลาปกติ
□ กรอกข้อมูล + ยืนยัน
□ เปิด Telegram bot/channel ที่เชื่อมต่อ
```

**Expected Telegram Message:**
```
🔔 มีการจองใหม่!
━━━━━━━━━━━━━━━
📌 รหัส: #BK1234ABCD
👤 ชื่อ: ทดสอบ จองสนาม
📞 โทร: 0812345678
📅 วันที่: 2026-06-22
⏰ ช่วงเวลา:
  • 18:00 - 18:30 (500 บาท)
  • 18:30 - 19:00 (500 บาท)
━━━━━━━━━━━━━━━
💰 รวม: 1,000 บาท
🔄 สถานะ: รอตรวจสอบ
```

**Timeout Test:**
```
1. Disconnect internet
2. ทำการจอง
□ จองต้องสำเร็จ (ไม่ fail เพราะ Telegram ไม่ทำงาน)
□ Console อาจมี warning: "⚠️ Telegram notification timeout"
```

---

### ✅ 10. Admin Approval Flow
```
Test Steps:
□ จองช่วงเวลา (สถานะ: รอตรวจสอบ)
□ Login as Admin
□ หารายการจองที่เพิ่งสร้าง
□ คลิกปุ่ม "ยืนยัน"
□ Confirm ใน modal
```

**Expected Results:**
- ✅ สถานะเปลี่ยนเป็น "ยืนยันแล้ว" (สีเขียว)
- ✅ ช่วงเวลานั้นปรากฏเป็น "ถูกจองแล้ว" ในหน้าจองสนาม
- ✅ ลูกค้าไม่สามารถจองช่วงนี้ซ้ำได้

---

## 🔍 Performance Tests

### Test 11: Large Dataset
```
Setup:
1. สร้างการจอง 100+ รายการ
2. Spread across 30 days

Test:
□ Load admin page
□ Filter by date
□ Search by phone
□ Measure response time
```

**Expected:**
- ✅ Page load < 2 seconds
- ✅ Filter response < 500ms
- ✅ No memory leaks

---

### Test 12: Concurrent Users
```
Simulate 10 users:
1. เปิด 10 browser tabs
2. แต่ละ tab เลือกวันเดียวกัน
3. เลือกช่วงเวลาต่างกัน
4. จองพร้อมกัน (ใช้ script ถ้าจำเป็น)

Expected:
□ ทุก booking สำเร็จ
□ ไม่มี ID ซ้ำ
□ ไม่มี race condition
```

---

## 📊 Test Results Template

```markdown
### Test Session: [Date]

| Test Case | Status | Notes |
|-----------|--------|-------|
| Basic Booking | ✅ | - |
| Race Condition | ✅ | Tested with 2 tabs |
| Weekly Booking | ✅ | 4 weeks, all correct dates |
| Weekly Conflict | ✅ | Error message shown |
| 24:00 Handling | ✅ | No calculation errors |
| Brute Force | ✅ | Locked after 5 attempts |
| Empty Validation | ✅ | SummaryBar hides |
| Recheck Submit | ✅ | Conflict detected |
| Telegram | ✅ | Message received |
| Admin Approval | ✅ | Status updated |

**Browser:** Chrome 126
**OS:** Windows 11
**Network:** Fast 3G (throttled)
**Overall:** PASS ✅
```

---

## 🐛 Bug Report Template

Found a bug? Report it:

```markdown
### Bug Report

**Title:** [Short description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**


**Actual Behavior:**


**Screenshots/Logs:**


**Environment:**
- Browser: 
- OS: 
- Date: 
```

---

## ✅ Pre-Production Checklist

Before deploying to production:

```
□ All 12 test cases passed
□ Firebase security rules configured
□ Environment variables set
□ HTTPS enabled
□ Rate limiting configured
□ Error monitoring setup (Sentry)
□ Backup strategy in place
□ Admin password changed from default
□ Telegram notifications working
□ Performance metrics acceptable
□ Mobile responsive testing done
□ Cross-browser testing done (Chrome, Safari, Firefox)
□ Load testing completed
□ Documentation updated
```

---

## 📞 Support

หากพบปัญหาระหว่างทดสอบ:
1. ตรวจสอบ Console logs (F12)
2. ตรวจสอบ Network tab
3. ดู Firebase Realtime Database
4. อ่าน `BUG-FIX-SUMMARY.md`
