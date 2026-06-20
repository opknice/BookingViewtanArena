import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/">
          <span className="brand-kicker">VAR วิวตาล อารีน่า</span>
          <span className="brand-title">สนามหญ้าเทียมเพชรบุรี</span>
          <span className="brand-subtitle">เปิดทุกวัน 16:00 - 24:00 น.</span>
        </Link>

        <nav className="top-nav">
          <Link
            className={`nav-btn ${location.pathname === '/' ? 'active' : ''}`}
            to="/"
          >
            จองสนาม
          </Link>
          <Link
            className={`nav-btn ${location.pathname === '/check-status' ? 'active' : ''}`}
            to="/check-status"
          >
            เช็คสถานะ
          </Link>
        </nav>
      </div>
    </header>
  )
}
