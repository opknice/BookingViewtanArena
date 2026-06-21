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

                      <div className="info-box">
                        <div className="contact-info-section">
                          <div className="tournament-contact">
                            <h4>📞 สนใจติดต่อ</h4>
                            <p>📱 ต้า: 080-3044091 | LINE: t.wsk</p>
                            <p>📱 ริน: 092-8939459 | LINE: ecream1330</p>
                            
                            <div className="social-links-tournament">
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
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="info-box">

              
              <div className="contact-info-section">
              <div class="tournament-contact">

              <h4>📞 สนใจติดต่อ</h4>
              
              <p>📱 ต้า: 080-3044091 | LINE: t.wsk</p>
              <p>📱 ริน: 092-8939459 | LINE: ecream1330</p>
              
                <div className="social-links-tournament">
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

                  
                  </div>
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
