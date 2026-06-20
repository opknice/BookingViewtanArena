import { useState } from 'react'
import HeroSection from '../components/HeroSection'
import AdminLoginModal from '../components/AdminLoginModal'

export default function TournamentPage() {
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState(null)

  const tournaments = [
    {
      id: 1,
      title: 'VAR SUPER LEAGUE 38+',
      subtitle: '🕐 แข่งขัน ทุกวัน ศุกร์ เวลาตั้งแต่ 19:00 น.',
      image: '/VarSuperLeague.png',
      status: 'open',
      statusText: 'เปิดรับสมัคร',
      description: 'เปิดรับสมัครทีมฟุตบอล 8 คน 8 ทีม\nเน้นออกทำลังกาย เน้นมิตรภาพในเกมกีฬา',
      fee: '1,499 บาท',
      ageLimit: '38+ เกิดปี 2531',
      schedule: 'ทุกศุกร์ เวลาตั้งแต่ 19:00 น.',
      location: 'สนามฟุตบอล VAR วิวตาล อารีน่า',
      prizes: [
        'อันดับ 1 รับ 5,000 พร้อมถ้วยรางวัล',
        'อันดับ 2 รับ 2,500 พร้อมถ้วยรางวัล',
        'อันดับ 3 รับ 1,500 พร้อมถ้วยรางวัล',
        'อันดับ 4 รับ 500 พร้อมถ้วยรางวัล + บริการสนามวิวตาลฟรี 1 ชั่วโมง',
        'อันดับ 5-8 รับเครื่องดื่มสิงห์ทีมละ 6 ขวด',
        'ดาวซัลโว รับ 500 พร้อมถ้วยรางวัล'
      ],
      contacts: [
        '📱 ต้า: 080-3044091 | LINE: t.wsk',
        '📱 รับ: 092-8939459 | LINE: ecream1330'
      ]
    },
    {
      id: 2,
      title: 'ALCOHOL3 LEAGUE CUP',
      subtitle: '🕐 แข่งขัน ทุกวัน พุธ เวลาตั้งแต่ 19:00 น.',
      image: '/Alcohol3LeagueCup.png',
      status: 'completed',
      statusText: 'จบการแข่งขันแล้ว',
      description: 'เปิดรับสมัครทีมฟุตบอล 7 คน 10 ทีม\nรับทีมที่มีน้ำใจเป็นนักกีฬา ไม่หัวร้อน ไม่ตำกรรมการทีมงานและผู้จัด\nปิดตัวเดินสายต่างจังหวัดทุกศุกร์',
      location: 'สนามฟุตบอล VAR วิวตาล อารีน่า',
      specialNote: 'พรี! (ไม่มีค่าประกันทีม ค่าสมัคร ค่ามัดจำ)',
      prizes: [
        'อันดับที่ 1 รับเครื่องดื่มตราสิงห์ที่ 4 ลัง + ถ้วยรางวัล',
        'อันดับที่ 2 รับเครื่องดื่มตราสิงห์ที่ 3 ลัง + ถ้วยรางวัล',
        'อันดับที่ 3 รับเครื่องดื่มตราสิงห์ที่ 2 ลัง + ถ้วยรางวัล',
        'อันดับที่ 4 รับเครื่องดื่มตราสิงห์ที่ 1 ลัง + ถ้วยรางวัล + ใช้บริการสนามบอลวิวตาลฟรี 1 ชั่วโมง ก่อนเวลา 19.00 น',
        'อันดับที่ 5 เป็นต้นไปรับเครื่องดื่มตราสิงห์ทีมละ 1 ลัง',
        'อันดับที่ 10 รับใช้บริการสนามบอลวิวตาลฟรี 1 ชั่วโมงก่อนเวลา 19.00 น'
      ],
      contacts: [
        '📱 ต้า: 080-3044091 | LINE: t.wsk',
        '📱 รับ: 092-8939459 | LINE: ecream1330'
      ]
    }
    
  ]

  return (
    <div className="app-shell">
      <HeroSection onAdminClick={() => setShowAdminModal(true)} />

      <main className="main-layout">
        <div className="feature-page">
          <div className="feature-card">
            <div className="feature-header">
              <span className="feature-icon-large">🏆</span>
              <h1>ทัวร์นาเมนต์ฟุตบอล</h1>
              <p className="feature-subtitle">
                รายการแข่งขันฟุตบอลที่สนาม VAR วิวตาล อารีน่า
              </p>
            </div>

            {/* Tournament Cards Grid */}
            <div className="tournament-grid">
              {tournaments.map(tournament => (
                <div 
                  key={tournament.id} 
                  className="tournament-card-small"
                  onClick={() => setSelectedTournament(tournament)}
                >
                  <div className="tournament-card-image">
                    <img src={tournament.image} alt={tournament.title} />
                    <div className={`tournament-badge ${tournament.status}`}>
                      {tournament.statusText}
                    </div>
                  </div>
                  <div className="tournament-card-info">
                    <h3>{tournament.title}</h3>
                    {tournament.subtitle && <p className="tournament-card-subtitle">{tournament.subtitle}</p>}
                    <button className="btn btn-secondary btn-small">ดูรายละเอียด</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Tournament Detail Modal */}
            {selectedTournament && (
              <div className="modal-overlay" onClick={() => setSelectedTournament(null)}>
                <div className="modal-content tournament-modal" onClick={(e) => e.stopPropagation()}>
                  <button className="modal-close" onClick={() => setSelectedTournament(null)}>×</button>
                  
                  <div className="tournament-detail-scroll">
                    <div className="tournament-image-wrapper">
                      <img src={selectedTournament.image} alt={selectedTournament.title} className="tournament-image" />
                      <div className={`tournament-badge-overlay ${selectedTournament.status}`}>
                        {selectedTournament.statusText}
                      </div>
                    </div>

                    <div className="tournament-content">
                      <h2>{selectedTournament.title}</h2>
                      {selectedTournament.subtitle && (
                        <p className="tournament-tagline">{selectedTournament.subtitle}</p>
                      )}
                      <p className="tournament-desc">
                        {selectedTournament.description.split('\n').map((line, i) => (
                          <span key={i}>{line}<br /></span>
                        ))}
                      </p>

                      <div className="tournament-details-grid">
                        {selectedTournament.fee && (
                          <div className="detail-item">
                            <span className="detail-icon">💰</span>
                            <div className="detail-text">
                              <strong>ค่าสมัคร</strong>
                              <p>{selectedTournament.fee}</p>
                            </div>
                          </div>
                        )}
                        {selectedTournament.ageLimit && (
                          <div className="detail-item">
                            <span className="detail-icon">�</span>
                            <div className="detail-text">
                              <strong>ผู้เล่น</strong>
                              <p>{selectedTournament.ageLimit}</p>
                            </div>
                          </div>
                        )}
                        {selectedTournament.schedule && (
                          <div className="detail-item">
                            <span className="detail-icon">🕐</span>
                            <div className="detail-text">
                              <strong>เวลาแข่งขัน</strong>
                              <p>{selectedTournament.schedule}</p>
                            </div>
                          </div>
                        )}
                        <div className="detail-item">
                          <span className="detail-icon">📍</span>
                          <div className="detail-text">
                            <strong>สนาม</strong>
                            <p>{selectedTournament.location}</p>
                          </div>
                        </div>
                        {selectedTournament.specialNote && (
                          <div className="detail-item highlight-box">
                            <span className="detail-icon">⚠️</span>
                            <div className="detail-text">
                              {selectedTournament.specialNote.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="tournament-prizes">
                        <h4>🏆 {selectedTournament.fee ? 'เงินรางวัล' : 'รางวัล'}</h4>
                        <ul className="prize-list">
                          {selectedTournament.prizes.map((prize, i) => (
                            <li key={i}>{prize}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="tournament-contact">
                        <h4>📞 สนใจติดต่อ</h4>
                        {selectedTournament.contacts.map((contact, i) => (
                          <p key={i}>{contact}</p>
                        ))}
                      </div>

                      
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="info-box">
              <h3>📢 สนใจจัดทัวร์นาเมนต์?</h3>
              <p>
                ติดต่อสอบถามรายละเอียดเพิ่มเติมเกี่ยวกับการจัดทัวร์นาเมนต์
                ที่สนามของเรา เรามีแพ็คเกจพิเศษสำหรับการจัดงานแข่งขัน
              </p>
              
              <div className="contact-info-section">
              <div class="tournament-contact">
                <h4>📞 สนใจติดต่อ</h4>
                <p>📱 ต้า: 080-3044091 | LINE: t.wsk </p> 
                <p>📱 ริน: 092-8939459 | LINE: ecream1330</p>
              </div>

                <div className="social-links-tournament">
                  <a 
                    href="https://www.facebook.com/profile.php?id=61575577062298" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link-box facebook"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>VAR วิวตาล อารีน่า</span>
                  </a>

                  <a 
                    href="https://www.facebook.com/profile.php?id=61586388821352" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link-box facebook"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>กาลาติกอส98</span>
                  </a>

                  <a 
                    href="https://www.instagram.com/viewtan_arena" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link-box instagram"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>Instagram</span>
                  </a>

                  <a 
                    href="https://tiktok.com/@viewtan_arena" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link-box tiktok"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    <span>TikTok</span>
                  </a>

                  <a 
                    href="https://page.line.me/562hvrwj" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-link-box line"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                    </svg>
                    <span>LINE</span>
                  </a>
                </div>
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
