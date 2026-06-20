import { useState } from 'react'
import HeroSection from '../components/HeroSection'
import AdminLoginModal from '../components/AdminLoginModal'

export default function TournamentPage() {
  const [showAdminModal, setShowAdminModal] = useState(false)

  return (
    <div className="app-shell">
      <HeroSection onAdminClick={() => setShowAdminModal(true)} />

      <main className="main-layout">
        <div className="feature-page">
          <div className="feature-card">
            <div className="feature-header">
              <span className="feature-icon-large">🏆</span>
              <h1>หารายการแข่งขัน</h1>
              <p className="feature-subtitle">
                รายการฟุตบอลและทัวร์นาเมนต์ที่เปิดรับสมัครทีม
              </p>
            </div>

            <div className="tournament-list">
              <div className="tournament-item">
                <div className="tournament-badge upcoming">เร็วๆ นี้</div>
                <h3>VAR Champions League 2026</h3>
                <div className="tournament-info">
                  <span>📅 วันที่: 15-17 สิงหาคม 2026</span>
                  <span>👥 จำนวนทีม: 16 ทีม</span>
                  <span>💰 ค่าสมัคร: 3,000 บาท/ทีม</span>
                  <span>🏆 เงินรางวัล: 30,000 บาท</span>
                </div>
                <div className="tournament-status">
                  <span>เปิดรับสมัคร: 8/16 ทีม</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '50%' }}></div>
                  </div>
                </div>
                <button className="btn btn-primary">สมัครเข้าร่วม</button>
              </div>

              <div className="tournament-item">
                <div className="tournament-badge open">เปิดรับสมัคร</div>
                <h3>Weekly 5vs5 Tournament</h3>
                <div className="tournament-info">
                  <span>📅 วันที่: ทุกวันเสาร์</span>
                  <span>👥 จำนวนทีม: 8 ทีม</span>
                  <span>💰 ค่าสมัคร: 1,500 บาท/ทีม</span>
                  <span>🏆 เงินรางวัล: 8,000 บาท</span>
                </div>
                <div className="tournament-status">
                  <span>เปิดรับสมัคร: 3/8 ทีม</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '37.5%' }}></div>
                  </div>
                </div>
                <button className="btn btn-primary">สมัครเข้าร่วม</button>
              </div>

              <div className="tournament-item completed">
                <div className="tournament-badge closed">ปิดรับสมัคร</div>
                <h3>VAR Summer Cup 2026</h3>
                <div className="tournament-info">
                  <span>📅 วันที่: 1-3 มิถุนายน 2026</span>
                  <span>👥 จำนวนทีม: 16 ทีม (เต็มแล้ว)</span>
                  <span>🏆 ผลการแข่งขัน: ดูผลการแข่งขัน</span>
                </div>
                <button className="btn btn-ghost">ดูรายละเอียด</button>
              </div>
            </div>

            <div className="info-box">
              <h3>📢 สนใจจัดทัวร์นาเมนต์?</h3>
              <p>
                ติดต่อสอบถามรายละเอียดเพิ่มเติมเกี่ยวกับการจัดทัวร์นาเมนต์
                ที่สนามของเรา เรามีแพ็คเกจพิเศษสำหรับการจัดงานแข่งขัน
              </p>
              <button className="btn btn-primary">ติดต่อเรา</button>
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
