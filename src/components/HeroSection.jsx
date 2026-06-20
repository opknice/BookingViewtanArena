import { Link } from 'react-router-dom'

export default function HeroSection({ onAdminClick }) {
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
            <Link to="/#booking-calendar">จองสนาม</Link>
            <Link to="/check-status">เช็คสถานะ</Link>
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
