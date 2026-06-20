import { useState } from 'react'
import HeroSection from '../components/HeroSection'
import AdminLoginModal from '../components/AdminLoginModal'

export default function HomePage() {
  const [showAdminModal, setShowAdminModal] = useState(false)

  return (
    <div className="app-shell">
      <HeroSection onAdminClick={() => setShowAdminModal(true)} />

      <main className="main-layout">
        <div className="home-content">
          <div className="welcome-card">
            <h2>ยินดีต้อนรับสู่ VAR วิวตาล อารีน่า</h2>
            <p>สนามหญ้าเทียมมาตรฐาน พร้อมอุปกรณ์ครบครัน</p>
            <div className="feature-grid">
              <div className="feature-item">
                <span className="feature-icon" aria-label="ลูกฟุตบอล">⚽</span>
                <h3>สนามหญ้าเทียมคุณภาพ</h3>
                <p>พื้นหญ้าเทียมมาตรฐาน FIFA มีความนุ่มและปลอดภัย</p>
              </div>
              <div className="feature-item">
                <span className="feature-icon" aria-label="นาฬิกา">🕐</span>
                <h3>เปิดบริการทุกวัน</h3>
                <p>16:00 - 24:00 น. จองได้ทุกวัน</p>
              </div>
              <div className="feature-item">
                <span className="feature-icon" aria-label="เงิน">💰</span>
                <h3>ราคาย่อมเยา</h3>
                <p>ราคาเริ่มต้น 350 บาท/ชั่วโมง</p>
              </div>
              <div className="feature-item">
                <span className="feature-icon" aria-label="โทรศัพท์มือถือ">📱</span>
                <h3>จองง่าย รวดเร็ว</h3>
                <p>จองออนไลน์ได้ทันที ไม่ต้องรอนาน</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />
    </div>
  )
}
