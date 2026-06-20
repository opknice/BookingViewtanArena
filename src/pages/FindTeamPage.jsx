import { useState } from 'react'
import HeroSection from '../components/HeroSection'
import AdminLoginModal from '../components/AdminLoginModal'

export default function FindTeamPage() {
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [activeTab, setActiveTab] = useState('find-team') // 'find-team' or 'find-players'

  return (
    <div className="app-shell">
      <HeroSection onAdminClick={() => setShowAdminModal(true)} />

      <main className="main-layout">
        <div className="feature-page">
          <div className="feature-card">
            <div className="feature-header">
              <span className="feature-icon-large">👥</span>
              <h1>หาก๊วน/หาเพื่อนเล่น</h1>
              <p className="feature-subtitle">
                เชื่อมต่อนักฟุตบอลและทีมที่กำลังหาสมาชิกในพื้นที่
              </p>
            </div>

            <div className="tab-buttons">
              <button 
                className={`tab-btn ${activeTab === 'find-team' ? 'active' : ''}`}
                onClick={() => setActiveTab('find-team')}
              >
                หาทีม
              </button>
              <button 
                className={`tab-btn ${activeTab === 'find-players' ? 'active' : ''}`}
                onClick={() => setActiveTab('find-players')}
              >
                หาผู้เล่น
              </button>
            </div>

            {activeTab === 'find-team' && (
              <div className="team-list">
                <div className="team-item">
                  <div className="team-avatar">FC</div>
                  <div className="team-content">
                    <h3>FC Legends</h3>
                    <p>กำลังหาผู้เล่นเพิ่ม 2-3 คน ตำแหน่ง กองหลัง และกองกลาง</p>
                    <div className="team-meta">
                      <span>⚽ ระดับ: กลาง-ดี</span>
                      <span>📅 ซ้อมทุกวันศุกร์ 19:00-21:00</span>
                      <span>📍 สนาม: VAR วิวตาล</span>
                    </div>
                  </div>
                  <button className="btn btn-primary">สนใจเข้าร่วม</button>
                </div>

                <div className="team-item">
                  <div className="team-avatar">⚡</div>
                  <div className="team-content">
                    <h3>Thunder FC</h3>
                    <p>หากองหน้า 1 คน และผู้รักษาประตู 1 คน สำหรับแข่งลีก</p>
                    <div className="team-meta">
                      <span>⚽ ระดับ: ดี-ดีมาก</span>
                      <span>📅 ซ้อมทุกวันอังคาร-เสาร์</span>
                      <span>📍 สนาม: หลายสนามในเพชรบุรี</span>
                    </div>
                  </div>
                  <button className="btn btn-primary">สนใจเข้าร่วม</button>
                </div>

                <div className="team-item">
                  <div className="team-avatar">⭐</div>
                  <div className="team-content">
                    <h3>Weekend Warriors</h3>
                    <p>ทีมสันทนาการหาเพื่อนเล่นใหม่ ไม่จำกัดระดับ มาสนุกกันครับ!</p>
                    <div className="team-meta">
                      <span>⚽ ระดับ: ทุกระดับ</span>
                      <span>📅 เล่นทุกวันเสาร์-อาทิตย์</span>
                      <span>📍 สนาม: VAR วิวตาล</span>
                    </div>
                  </div>
                  <button className="btn btn-primary">สนใจเข้าร่วม</button>
                </div>
              </div>
            )}

            {activeTab === 'find-players' && (
              <div className="team-list">
                <div className="team-item">
                  <div className="team-avatar">👤</div>
                  <div className="team-content">
                    <h3>สมชาย ใจดี</h3>
                    <p>หาทีมที่ต้องการกองหลังตัวรับ มีประสบการณ์ 5 ปี</p>
                    <div className="team-meta">
                      <span>⚽ ตำแหน่ง: กองหลัง (CB)</span>
                      <span>📅 ว่างทุกวันเสาร์-อาทิตย์</span>
                      <span>🎯 ระดับ: ดี</span>
                    </div>
                  </div>
                  <button className="btn btn-primary">ติดต่อ</button>
                </div>

                <div className="team-item">
                  <div className="team-avatar">👤</div>
                  <div className="team-content">
                    <h3>วิชัย แข็งแรง</h3>
                    <p>ผู้รักษาประตูหาทีมแข่งทัวร์นาเมนต์ อายุ 28 ปี</p>
                    <div className="team-meta">
                      <span>⚽ ตำแหน่ง: ผู้รักษาประตู (GK)</span>
                      <span>📅 ว่างทุกวันศุกร์-อาทิตย์</span>
                      <span>🎯 ระดับ: ดีมาก</span>
                    </div>
                  </div>
                  <button className="btn btn-primary">ติดต่อ</button>
                </div>

                <div className="team-item">
                  <div className="team-avatar">👤</div>
                  <div className="team-content">
                    <h3>ประยุทธ์ เตะแม่น</h3>
                    <p>กองหน้าตัวจริง หาทีมเล่นสันทนาการ ไม่แข่ง เล่นเพื่อสุขภาพ</p>
                    <div className="team-meta">
                      <span>⚽ ตำแหน่ง: กองหน้า (ST)</span>
                      <span>📅 ว่างทุกวันเสาร์เท่านั้น</span>
                      <span>🎯 ระดับ: กลาง</span>
                    </div>
                  </div>
                  <button className="btn btn-primary">ติดต่อ</button>
                </div>
              </div>
            )}

            <div className="post-your-own">
              <h3>ประกาศของคุณ</h3>
              <p>ต้องการหาทีมหรือหาผู้เล่นเพิ่ม? โพสต์ประกาศฟรี!</p>
              <button className="btn btn-primary">โพสต์ประกาศ</button>
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
