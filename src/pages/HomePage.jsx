import { useState } from 'react'
import { Link } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import AdminLoginModal from '../components/AdminLoginModal'

export default function HomePage() {
  const [showAdminModal, setShowAdminModal] = useState(false)

  return (
    <div className="app-shell">
      <HeroSection onAdminClick={() => setShowAdminModal(true)} />

      <main className="main-layout">
        <div className="home-content">
          {/* Welcome Section */}
          <div className="welcome-card">
            <div className="welcome-header">
              <div className="welcome-text">
                <h2>ยินดีต้อนรับสู่ VAR วิวตาล อารีน่า</h2>
                <p>สนามหญ้าเทียมมาตรฐาน FIFA พร้อมอุปกรณ์ครบครัน</p>
              </div>
              <div className="welcome-quick-actions">
                <Link to="/booking" className="btn btn-primary">
                  📅 จองสนามตอนนี้
                </Link>
                <Link to="/check-status" className="btn btn-ghost">
                  🔍 เช็คสถานะการจอง
                </Link>
              </div>
            </div>

            {/* Features Grid */}
            <div className="feature-grid">
              <div className="feature-item">
                <span className="feature-icon" aria-label="ลูกฟุตบอล">⚽</span>
                <h3>สนามหญ้าเทียมคุณภาพ</h3>
                <p>พื้นหญ้าเทียมมาตรฐาน FIFA มีความนุ่มและปลอดภัย เหมาะกับการเล่นฟุตบอลทุกระดับ</p>
              </div>
              <div className="feature-item">
                <span className="feature-icon" aria-label="นาฬิกา">🕐</span>
                <h3>เปิดบริการทุกวัน</h3>
                <p>เปิดให้บริการทุกวัน 16:00 - 24:00 น. จองได้สะดวก ไม่มีวันหยุด</p>
              </div>
              <div className="feature-item">
                <span className="feature-icon" aria-label="เงิน">💰</span>
                <h3>ราคาย่อมเยา</h3>
                <p>ราคาเริ่มต้น 800 บาท/ชั่วโมง (ก่อน 19:00 น.) และ 1,000 บาท/ชั่วโมง (หลัง 19:00 น.)</p>
              </div>
              <div className="feature-item">
                <span className="feature-icon" aria-label="โทรศัพท์มือถือ">📱</span>
                <h3>จองง่าย รวดเร็ว</h3>
                <p>จองออนไลน์ได้ทันที ระบบอัตโนมัติ แจ้งเตือนผ่าน Telegram ไม่ต้องรอนาน</p>
              </div>
              <div className="feature-item">
                <span className="feature-icon" aria-label="แสงไฟ">💡</span>
                <h3>ไฟส่องสนามสว่าง</h3>
                <p>ระบบแสงสว่างมาตรฐาน เหมาะสำหรับการเล่นเวลากลางคืน มองเห็นได้ชัดเจน</p>
              </div>
              <div className="feature-item">
                <span className="feature-icon" aria-label="น้ำ">🚿</span>
                <h3>สิ่งอำนวยความสะดวก</h3>
                <p>ห้องน้ำ ห้องอาบน้ำ และที่จอดรถกว้างขวาง รองรับผู้ใช้บริการได้อย่างสะดวกสบาย</p>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="services-section">
            <h2 className="section-title">บริการของเรา</h2>
            <div className="services-grid">
              <Link to="/booking" className="service-card">
                <div className="service-icon">📅</div>
                <h3>จองสนาม</h3>
                <p>จองสนามออนไลน์ เลือกวันและเวลาที่ต้องการได้ทันที</p>
                <span className="service-link">จองเลย →</span>
              </Link>

              <Link to="/tournament" className="service-card">
                <div className="service-icon">🏆</div>
                <h3>ทัวร์นาเมนต์</h3>
                <p>ร่วมแข่งขันฟุตบอลรายการต่างๆ ที่สนามของเรา</p>
                <span className="service-link">ดูรายการ →</span>
              </Link>

              <Link to="/find-team" className="service-card">
                <div className="service-icon">👥</div>
                <h3>หาก๊วน/หาเพื่อนเล่น</h3>
                <p>หาทีมหรือเพื่อนเล่นฟุตบอลในพื้นที่เพชรบุรี</p>
                <span className="service-link">เข้ากลุ่ม →</span>
              </Link>

              <Link to="/academy" className="service-card">
                <div className="service-icon">⚽</div>
                <h3>Premier Academy</h3>
                <p>โรงเรียนสอนฟุตบอลสำหรับเด็กอายุ 6-11 ปี</p>
                <span className="service-link">สมัครเลย →</span>
              </Link>
            </div>
          </div>

          {/* Location & Contact Section */}
          <div className="location-contact-section">
            <div className="location-card">
              <h3>📍 ที่อยู่สนาม</h3>
              <p>สนาม VAR วิวตาล อารีน่า</p>
              <p>จังหวัดเพชรบุรี</p>
              <div className="contact-buttons">
                <a 
                  href="https://www.google.com/maps/search/VAR+%E0%B8%A7%E0%B8%B4%E0%B8%A7%E0%B8%95%E0%B8%B2%E0%B8%A5+%E0%B8%AD%E0%B8%B2%E0%B8%A3%E0%B8%B5%E0%B8%99%E0%B9%88%E0%B8%B2" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-small"
                >
                  🗺️ เปิดแผนที่
                </a>
              </div>
            </div>

            <div className="contact-card">
              <h3>📞 ติดต่อเรา</h3>
              <div className="contact-list">
                <div className="contact-item">
                  <span className="contact-icon">📱</span>
                  <div>
                    <strong>โทรศัพท์</strong>
                    <p>087-1177788, 097-2566909</p>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="contact-icon">💬</span>
                  <div>
                    <strong>LINE</strong>
                    <p>@VARViewtanArena</p>
                  </div>
                </div>
              </div>
              <div className="social-links">
                <a 
                  href="https://www.facebook.com/profile.php?id=61575577062298" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link facebook"
                  title="Facebook"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.instagram.com/viewtan_arena" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link instagram"
                  title="Instagram"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://tiktok.com/@viewtan_arena" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link tiktok"
                  title="TikTok"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
                <a 
                  href="https://page.line.me/562hvrwj" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="social-link line"
                  title="LINE"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="cta-section">
            <div className="cta-content">
              <h2>พร้อมจองสนามแล้วหรือยัง?</h2>
              <p>เลือกวันที่และเวลาที่ต้องการ จองได้ทันทีผ่านระบบออนไลน์</p>
              <div className="cta-buttons">
                <Link to="/booking" className="btn btn-primary btn-large">
                  จองสนามตอนนี้
                </Link>
                <Link to="/check-status" className="btn btn-ghost btn-large">
                  เช็คสถานะการจอง
                </Link>
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
