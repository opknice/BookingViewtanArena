# Booking Viewtan Arena - React Version

ระบบจองสนามฟุตบอล VAR วิวตาล อารีน่า ที่พัฒนาด้วย React และ Firebase Realtime Database

## 🎉 Version 1.1.0 - Bug Fixes Complete! ✅

**สถานะ:** PRODUCTION READY  
**วันที่อัปเดต:** 21 มิถุนายน 2026  
**บัคที่แก้ไข:** 8/8 (100%)  

### 🐛 บัคที่แก้ไขไปแล้ว
- ✅ Double Booking Prevention (Race Condition)
- ✅ Weekly Booking Date Fix
- ✅ 24:00 Time Support
- ✅ Unique Booking ID Generation
- ✅ Admin Password Security + Brute Force Protection
- ✅ Enhanced Validation
- ✅ Improved Error Messages
- ✅ Telegram Notification Reliability

📖 **อ่านรายละเอียด:** [BUG-FIX-SUMMARY.md](BUG-FIX-SUMMARY.md) | [สรุปการแก้ไข.txt](สรุปการแก้ไข.txt)

## 🚀 คุณสมบัติ

✅ **Real-time Updates** - ข้อมูลอัปเดตแบบ Real-time ทุกหน้า  
✅ **React Router** - การนำทางที่ราบรื่น  
✅ **Firebase Realtime Database** - จัดเก็บและอัปเดตข้อมูลแบบ Real-time  
✅ **Responsive Design** - รองรับทุกอุปกรณ์  
✅ **Thai Language** - ภาษาไทยทั้งหมด  
✅ **Admin Panel** - จัดการการจองแบบ Real-time  
✅ **Weekly Booking** - จองรายสัปดาห์สำหรับลูกค้าประจำ  
✅ **Conflict Detection** - ป้องกัน Double Booking  
✅ **Security** - Admin login with Brute Force Protection  
✅ **Telegram Notifications** - แจ้งเตือนผ่าน Telegram

## 📁 โครงสร้างโปรเจค

```
BookingViewtanArena/
├── src/
│   ├── components/          # React Components
│   │   ├── Calendar.jsx
│   │   ├── Header.jsx
│   │   ├── HeroSection.jsx
│   │   ├── SlotList.jsx
│   │   ├── BookedSummary.jsx
│   │   ├── SummaryBar.jsx
│   │   ├── BookingModal.jsx
│   │   ├── AdminLoginModal.jsx
│   │   └── ConfirmModal.jsx
│   ├── pages/               # หน้าต่างๆ
│   │   ├── BookingPage.jsx
│   │   ├── CheckStatusPage.jsx
│   │   └── AdminPage.jsx
│   ├── contexts/            # React Context (State Management)
│   │   └── BookingContext.jsx
│   ├── config/              # การตั้งค่า
│   │   └── firebase.js
│   ├── constants/           # ค่าคงที่
│   │   └── booking.js
│   ├── utils/               # Helper functions
│   │   └── helpers.js
│   ├── App.jsx              # Main App Component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global CSS
├── pic/                     # รูปภาพ
├── index-react.html         # HTML Template
├── package.json
├── vite.config.js
└── README-REACT.md

```

## 🛠 การติดตั้ง

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. รัน Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ http://localhost:3000

### 3. Build สำหรับ Production

```bash
npm run build
```

ไฟล์ที่ build แล้วจะอยู่ในโฟลเดอร์ `dist/`

## 📱 หน้าต่างๆ ในระบบ

### 1. หน้าจองสนาม (`/`)
- ปฏิทินเลือกวันที่
- ตารางเวลาว่าง/จอง (Real-time)
- เลือกช่วงเวลาที่ต้องการ
- แสดงราคาและสรุปการจอง
- แสดงรายการที่ถูกจองแล้วในวันนั้น (Real-time)

### 2. หน้าเช็คสถานะ (`/check-status`)
- ค้นหาการจองด้วยเบอร์โทร
- แสดงรายการจองทั้งหมด (Real-time)
- แสดงสถานะ: รอตรวจสอบ, ยืนยันแล้ว, ยกเลิก

### 3. หน้า Admin Panel (`/admin`)
- สถิติการจอง (Real-time)
- รายการจองทั้งหมด (Real-time)
- กรองตามวันที่/สถานะ
- ยืนยัน/ยกเลิกการจอง
- รหัสผ่าน: `55555`

## 🔥 Firebase Realtime Database

### Structure
```json
{
  "bookings": {
    "BK12345_1600": {
      "groupId": "BK12345",
      "name": "สมชาย ใจดี",
      "phone": "0812345678",
      "date": "2024-06-20",
      "startTime": "16:00",
      "endTime": "16:30",
      "price": 400,
      "status": "pending",
      "createdAt": 1718870400000,
      "adminNote": ""
    }
  }
}
```

### Real-time Features
- ใช้ `onValue()` สำหรับ subscribe ข้อมูล
- อัปเดตอัตโนมัติเมื่อมีการเปลี่ยนแปลง
- ไม่ต้อง refresh หน้า

## 🎯 การใช้งาน Context

```jsx
import { useBooking } from './contexts/BookingContext'

function MyComponent() {
  const { 
    bookings,                        // ข้อมูลการจองทั้งหมด
    subscribeToAllBookings,          // Subscribe ทั้งหมด
    subscribeToBookingsByDate,       // Subscribe ตามวันที่
    subscribeToBookingsByPhone,      // Subscribe ตามเบอร์โทร
    createBooking,                   // สร้างการจอง
    updateBookingStatus              // อัปเดตสถานะ
  } = useBooking()

  // Subscribe to bookings by date
  useEffect(() => {
    const unsubscribe = subscribeToBookingsByDate('2024-06-20', (data) => {
      console.log('Bookings updated:', data)
    })
    return unsubscribe  // Cleanup
  }, [])
}
```

## 🔧 Configuration

### Firebase Config (`src/config/firebase.js`)
```javascript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  databaseURL: 'YOUR_DATABASE_URL',
  projectId: 'YOUR_PROJECT_ID',
  // ...
}
```

### Constants (`src/constants/booking.js`)
```javascript
export const OPEN_MINUTE = 16 * 60  // 16:00
export const CLOSE_MINUTE = 24 * 60  // 24:00
export const SLOT_MINUTES = 30
export const PRICE_DAY = 800
export const PRICE_NIGHT = 1000
```

## 📦 Dependencies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.22.0",
  "firebase": "^10.8.0"
}
```

## 🎨 Styling

- ใช้ CSS เดิมจากโปรเจคเดิม (Vanilla JS)
- รองรับ Responsive Design
- ใช้ CSS Variables สำหรับ Theming

## 📞 Telegram Notification

การแจ้งเตือนจะส่งอัตโนมัติเมื่อมีการจองใหม่ผ่าน Cloudflare Worker:
- URL: `https://telegram-notifier.thanakrit-kas.workers.dev`

## 🚨 Important Notes

1. **Admin Authentication** - ใช้ client-side auth with SHA256 + Brute Force Protection (แนะนำ backend auth สำหรับ production)
2. **Default Password** - `55555` (ควรเปลี่ยนก่อน deploy production!)
3. **Real-time** - ทุกหน้าจะอัปเดตอัตโนมัติเมื่อมีการเปลี่ยนแปลงข้อมูล
4. **Memory Leaks** - ต้อง unsubscribe เมื่อ component unmount
5. **Conflict Detection** - ป้องกัน double booking ด้วย read-before-write pattern

## 📚 เอกสารเพิ่มเติม

- 📖 [QUICK-START.md](QUICK-START.md) - เริ่มต้นใช้งานด่วน
- 📖 [CHANGELOG.md](CHANGELOG.md) - ประวัติการเปลี่ยนแปลง
- 📖 [BUG-FIX-SUMMARY.md](BUG-FIX-SUMMARY.md) - สรุปการแก้ไขบัค
- 📖 [TESTING-GUIDE.md](TESTING-GUIDE.md) - คู่มือการทดสอบ
- 📖 [สรุปการแก้ไข.txt](สรุปการแก้ไข.txt) - สรุปภาษาไทย

## 🧪 การทดสอบ

### Quick Test
```bash
npm run build
```
**Expected:** ✅ Build สำเร็จ, ไม่มี errors

### Manual Tests
1. **Basic Booking** - จองช่วงเวลาปกติ
2. **Race Condition** - เปิด 2 tabs จองช่วงเดียวกันพร้อมกัน (ต้องป้องกันได้)
3. **Weekly Booking** - Admin จองรายสัปดาห์ (ต้องบันทึกถูก date)
4. **24:00 Time** - จองถึงเที่ยงคืน (ต้องทำงานได้)
5. **Admin Brute Force** - ใส่รหัสผิด 5 ครั้ง (ต้องโดนล็อก)

ดูรายละเอียดใน [TESTING-GUIDE.md](TESTING-GUIDE.md)

## ⚠️ Before Production Deployment

### Security Checklist
- [ ] เปลี่ยนรหัสผ่าน Admin
- [ ] ตั้งค่า Firebase Security Rules
- [ ] ใช้ Environment Variables สำหรับ sensitive data
- [ ] Enable HTTPS only
- [ ] เพิ่ม CAPTCHA (recommended)

### Monitoring
- [ ] Setup error tracking (Sentry)
- [ ] Setup analytics
- [ ] Monitor Firebase usage
- [ ] Setup automated backups

### Performance
- [ ] Enable CDN
- [ ] Optimize images
- [ ] Enable caching
- [ ] Consider rate limiting

## 📄 License

MIT License
```

## เปรียบเทียบเวอร์ชัน

### Vanilla JS (เดิม)
- ไฟล์ HTML แยกกัน 3 ไฟล์
- JavaScript แยก 2 ไฟล์
- Manual DOM manipulation
- Manual event listeners
- Polling หรือ manual refresh

### React (ใหม่)
- SPA (Single Page Application)
- Component-based architecture
- React Router สำหรับ navigation
- React Context สำหรับ state management
- Firebase Realtime listeners
- Automatic re-rendering
- Better code organization
