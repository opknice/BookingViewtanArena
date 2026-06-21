import { Link } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import { useState } from 'react'
import AdminLoginModal from '../components/AdminLoginModal'

export default function HomePage() {
  const [showAdminModal, setShowAdminModal] = useState(false)

  return (
    <div className="app-shell">
      <HeroSection onAdminClick={() => setShowAdminModal(true)} />

      <main className="main-layout">
        {/* Welcome Section */}
        <section className="welcome-section" style={{ padding: '3rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1a1a1a' }}>
              ยินดีต้อนรับสู่ VAR วิวตาล อารีน่า
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#666', maxWidth: '800px', margin: '0 auto' }}>
              สนามฟุตบอลหญ้าเทียมคุณภาพสูงใจกลางเมืองเพชรบุรี พร้อมบริการครบวงจร
            </p>
          </div>

          {/* Features Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {/* จองสนาม */}
            <Link to="/" style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '2rem',
                borderRadius: '12px',
                color: 'white',
                height: '100%',
                transition: 'transform 0.3s ease',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚽</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>จองสนาม</h3>
                <p style={{ opacity: 0.9 }}>
                  จองสนามออนไลน์ได้ทันที เลือกวันและเวลาที่ต้องการ ดูสถานะสนามว่างแบบ Real-time
                </p>
              </div>
            </Link>

            {/* เช็คสถานะ */}
            <Link to="/check-status" style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                padding: '2rem',
                borderRadius: '12px',
                color: 'white',
                height: '100%',
                transition: 'transform 0.3s ease',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>เช็คสถานะการจอง</h3>
                <p style={{ opacity: 0.9 }}>
                  ตรวจสอบสถานะการจองของคุณด้วยเบอร์โทรศัพท์ ดูรายละเอียดและจัดการการจอง
                </p>
              </div>
            </Link>

            {/* หารายการแข่งขัน */}
            <Link to="/tournament" style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                padding: '2rem',
                borderRadius: '12px',
                color: 'white',
                height: '100%',
                transition: 'transform 0.3s ease',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>หารายการแข่งขัน</h3>
                <p style={{ opacity: 0.9 }}>
                  ดูรายการแข่งขันที่กำลังจะมีขึ้น สมัครเข้าร่วมทัวร์นาเมนต์ และติดตามข่าวสารการแข่งขัน
                </p>
              </div>
            </Link>

            {/* หาก๊วน/หาเพื่อนเล่น */}
            <Link to="/find-team" style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                padding: '2rem',
                borderRadius: '12px',
                color: 'white',
                height: '100%',
                transition: 'transform 0.3s ease',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>หาก๊วน/หาเพื่อนเล่น</h3>
                <p style={{ opacity: 0.9 }}>
                  หาทีมหรือเพื่อนร่วมเล่นฟุตบอล เชื่อมต่อกับนักเตะคนอื่นๆ และสร้างทีมในฝัน
                </p>
              </div>
            </Link>

            {/* สมัคร Academy */}
            <Link to="/academy" style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                padding: '2rem',
                borderRadius: '12px',
                color: 'white',
                height: '100%',
                transition: 'transform 0.3s ease',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>สมัคร Academy</h3>
                <p style={{ opacity: 0.9 }}>
                  โรงเรียนฟุตบอลสำหรับเด็กและเยาวชน พัฒนาทักษะกับโค้ชมืออาชีพ
                </p>
              </div>
            </Link>

            {/* ติดต่อเรา */}
            <Link to="/contact" style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                padding: '2rem',
                borderRadius: '12px',
                color: '#333',
                height: '100%',
                transition: 'transform 0.3s ease',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📞</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>ติดต่อเรา</h3>
                <p>
                  ติดต่อสอบถามข้อมูล แจ้งปัญหา หรือให้คำแนะนำ ทีมงานพร้อมให้บริการ
                </p>
              </div>
            </Link>
          </div>

          {/* Info Section */}
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '2.5rem',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center',
            marginTop: '3rem'
          }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              เปิดให้บริการทุกวัน
            </h3>
            <p style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              ⏰ 16:00 - 24:00 น.
            </p>
            <p style={{ fontSize: '1.1rem', opacity: 0.95, marginBottom: '1.5rem' }}>
              สนามฟุตบอลหญ้าเทียมมาตรฐาน พร้อมระบบไฟส่องสว่าง<br/>
              ห้องน้ำสะอาด ที่จอดรถกว้างขวาง
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link 
                to="/" 
                style={{ 
                  background: 'white',
                  color: '#667eea',
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                จองสนามเลย
              </Link>
              <Link 
                to="/contact" 
                style={{ 
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  border: '2px solid white',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                ติดต่อสอบถาม
              </Link>
            </div>
          </div>
        </section>
      </main>

      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />
    </div>
  )
}
