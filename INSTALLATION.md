# คู่มือการติดตั้งและใช้งาน Booking Viewtan Arena (React Version)

## ✅ สิ่งที่ต้องเตรียม

1. **Node.js** (เวอร์ชัน 16 หรือสูงกว่า)
   - ดาวน์โหลดได้ที่: https://nodejs.org/
   - ตรวจสอบเวอร์ชัน: `node --version`

2. **npm** (มาพร้อม Node.js)
   - ตรวจสอบเวอร์ชัน: `npm --version`

## 📦 ขั้นตอนการติดตั้ง

### 1. ติดตั้ง Dependencies

เปิด Terminal/Command Prompt ที่โฟลเดอร์โปรเจค แล้วรัน:

```bash
npm install
```

รอจนกว่าจะติดตั้งเสร็จ (ประมาณ 1-2 นาที)

### 2. รัน Development Server

```bash
npm run dev
```

เมื่อรันสำเร็จจะแสดงข้อความประมาณนี้:
```
  VITE v5.1.4  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 3. เปิดในเบราว์เซอร์

เปิดเบราว์เซอร์แล้วไปที่: **http://localhost:3000**

## 🎯 การใช้งาน

### หน้าจองสนาม (/)

1. **เลือกวันที่** - คลิกที่ปฏิทินเพื่อเลือกวันที่ต้องการจอง
2. **เลือกช่วงเวลา** - คลิกช่วงเวลาที่ต้องการ (สีเขียว = ว่าง, สีแดง = จองแล้ว)
3. **ตรวจสอบราคา** - ดูสรุปการจองที่แถบด้านล่าง
4. **กรอกข้อมูล** - คลิก "จองสนาม" แล้วกรอกชื่อและเบอร์โทร
5. **ยืนยัน** - คลิก "ยืนยันการจอง"
6. **บันทึกรหัส** - จดรหัสการจองที่ได้ไว้สำหรับเช็คสถานะ

### หน้าเช็คสถานะ (/check-status)

1. กรอกเบอร์โทรที่ใช้จอง (10 หลัก)
2. คลิก "ค้นหา"
3. ดูรายการจองและสถานะ (Real-time)

### หน้า Admin Panel (/admin)

**วิธีเข้า:**
- **วิธีที่ 1:** คลิกที่โลโก้ VAR บนหน้าจอง
- **วิธีที่ 2:** ไปที่ URL โดยตรง: http://localhost:3000/admin

**รหัสผ่าน:** `55555`

**ฟีเจอร์:**
- ดูสถิติการจอง (Real-time)
- รายการจองทั้งหมด (Real-time)
- กรองตามวันที่/สถานะ
- ยืนยันการจอง
- ยกเลิกการจอง

## 🔄 Real-time Features

โปรเจคนี้ใช้ Firebase Realtime Database ทำให้:

✅ **ไม่ต้อง refresh หน้า** - ข้อมูลอัปเดตอัตโนมัติ
✅ **Multi-user support** - หลายคนใช้พร้อมกันได้
✅ **Instant updates** - เห็นการเปลี่ยนแปลงทันที

### ทดสอบ Real-time:

1. เปิด 2 หน้าต่างเบราว์เซอร์
2. หน้าที่ 1: หน้าจองสนาม
3. หน้าที่ 2: หน้า Admin Panel
4. จองสนามในหน้าที่ 1
5. ดูว่าหน้าที่ 2 อัปเดตทันที (ไม่ต้อง refresh)

## 🏗️ Build สำหรับ Production

### 1. Build โปรเจค

```bash
npm run build
```

ไฟล์ที่ build แล้วจะอยู่ในโฟลเดอร์ `dist/`

### 2. Preview Build

```bash
npm run preview
```

เปิดที่: http://localhost:4173

### 3. Deploy

คัดลอกไฟล์ในโฟลเดอร์ `dist/` ไปยัง:
- **Firebase Hosting**
- **Vercel**
- **Netlify**
- **หรือ Web Server ทั่วไป**

## 📂 โครงสร้างไฟล์ที่สำคัญ

```
BookingViewtanArena/
├── src/
│   ├── pages/                    # หน้าต่างๆ
│   │   ├── BookingPage.jsx       # หน้าจองสนาม
│   │   ├── CheckStatusPage.jsx   # หน้าเช็คสถานะ
│   │   └── AdminPage.jsx         # หน้า Admin
│   │
│   ├── components/               # Components
│   │   ├── Calendar.jsx          # ปฏิทิน
│   │   ├── SlotList.jsx          # รายการช่วงเวลา
│   │   └── ...                   # อื่นๆ
│   │
│   ├── contexts/
│   │   └── BookingContext.jsx    # State Management
│   │
│   ├── config/
│   │   └── firebase.js           # Firebase Config
│   │
│   ├── constants/
│   │   └── booking.js            # ค่าคงที่ (ราคา, เวลา)
│   │
│   └── utils/
│       └── helpers.js            # Helper functions
│
├── package.json                  # Dependencies
├── vite.config.js                # Vite Config
└── index-react.html              # HTML Template
```

## ⚙️ การแก้ไข Configuration

### 1. เปลี่ยนราคา

แก้ไขไฟล์ `src/constants/booking.js`:

```javascript
export const PRICE_DAY = 800      // ราคากลางวัน (บาท/ชม.)
export const PRICE_NIGHT = 1000   // ราคากลางคืน (บาท/ชม.)
```

### 2. เปลี่ยนเวลาเปิด-ปิด

แก้ไขไฟล์ `src/constants/booking.js`:

```javascript
export const OPEN_MINUTE = 16 * 60   // เปิด 16:00
export const CLOSE_MINUTE = 24 * 60  // ปิด 24:00
export const SLOT_MINUTES = 30       // ช่วงละ 30 นาที
```

### 3. เปลี่ยนรหัสผ่าน Admin

แก้ไขไฟล์ `src/components/AdminLoginModal.jsx`:

```javascript
if (password === '55555') {  // เปลี่ยนรหัสผ่านที่นี่
  // ...
}
```

### 4. Firebase Config

แก้ไขไฟล์ `src/config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  databaseURL: 'YOUR_DATABASE_URL',
  projectId: 'YOUR_PROJECT_ID',
  // ...
}
```

## 🔧 คำสั่งที่มีใช้งาน

```bash
# ติดตั้ง dependencies
npm install

# รัน development server
npm run dev

# Build สำหรับ production
npm run build

# Preview production build
npm run preview
```

## 🐛 แก้ไขปัญหาที่พบบ่อย

### 1. Port 3000 ถูกใช้งานอยู่

แก้ไข `vite.config.js`:

```javascript
export default defineConfig({
  server: {
    port: 3001  // เปลี่ยนเป็น port อื่น
  }
})
```

### 2. Firebase ไม่ทำงาน

- ตรวจสอบ `databaseURL` ใน `src/config/firebase.js`
- ตรวจสอบ Firebase Rules ว่าอนุญาต read/write

### 3. Module not found

```bash
# ลบ node_modules และติดตั้งใหม่
rm -rf node_modules
npm install
```

## 📱 ทดสอบบนมือถือ

1. รัน development server: `npm run dev`
2. หา Local IP ของคอมพิวเตอร์ (เช่น `192.168.1.100`)
3. บนมือถือ (ต้องต่อ WiFi เดียวกัน) เปิดที่: `http://192.168.1.100:3000`

## 🚀 Deploy to Production

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Vercel

```bash
npm install -g vercel
vercel login
vercel
```

### Netlify

1. Build: `npm run build`
2. Drag & Drop โฟลเดอร์ `dist/` ไปที่ https://app.netlify.com/drop

## 📞 ติดต่อ

หากมีปัญหาหรือข้อสงสัย:
- Email: support@example.com
- Line: @example

## 🎉 เริ่มใช้งาน

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่: **http://localhost:3000**

สนุกกับการจองสนาม! ⚽
