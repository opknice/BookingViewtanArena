import { Link, useLocation } from 'react-router-dom'

export default function HeroSection({ onAdminClick }) {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const isBookingPage = location.pathname === '/booking'
  const isCheckStatusPage = location.pathname === '/check-status'
  const isTournamentPage = location.pathname === '/tournament'
  const isFindTeamPage = location.pathname === '/find-team'
  const isAcademyPage = location.pathname === '/academy'

  return (
    <section className="home-hero">
      <img className="home-hero-bg" src="/Ball.png" alt="" />
      <div className="home-hero-shade"></div>
      <div className="home-hero-inner">
        <div className="home-hero-copy">
          <span>VAR วิวตาล อารีน่า</span>
          <h1>สนามหญ้าเทียมเพชรบุรี</h1>
          <p>เปิดทุกวัน 16:00 - 24:00 น.</p>
          <div className="home-hero-links">
            <Link 
              to="/" 
              className={isHomePage ? 'active' : ''}
            >
              หน้าแรก
            </Link>
            <Link 
              to="/booking" 
              className={isBookingPage ? 'active' : ''}
            >
              จองสนาม
            </Link>
            <Link 
              to="/check-status"
              className={isCheckStatusPage ? 'active' : ''}
            >
              เช็คสถานะ
            </Link>
            <Link 
              to="/tournament"
              className={isTournamentPage ? 'active' : ''}
            >
              หารายการแข่งขัน
            </Link>
            <Link 
              to="/find-team"
              className={isFindTeamPage ? 'active' : ''}
            >
              หาก๊วน/หาเพื่อนเล่น
            </Link>
            <Link 
              to="/academy"
              className={isAcademyPage ? 'active' : ''}
            >
              สมัคร Academy
            </Link>
          </div>
        </div>
        <img 
          className="home-hero-logo" 
          src="/VAR.png" 
          alt="VAR Viewtan Arena"
          onClick={onAdminClick}
          style={{ cursor: 'pointer' }}
        />
      </div>
    </section>
  )
}
