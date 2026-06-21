import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { BookingProvider } from './contexts/BookingContext'
import HomePage from './pages/HomePage'
import BookingPage from './pages/BookingPage'
import CheckStatusPage from './pages/CheckStatusPage'
import TournamentPage from './pages/TournamentPage'
import FindTeamPage from './pages/FindTeamPage'
import AcademyPage from './pages/AcademyPage'
import ContactPage from './pages/ContactPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <BookingProvider>
      <Router>
        <Routes>
          <Route path="/" element={<BookingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/check-status" element={<CheckStatusPage />} />
          <Route path="/tournament" element={<TournamentPage />} />
          <Route path="/find-team" element={<FindTeamPage />} />
          <Route path="/academy" element={<AcademyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
    </BookingProvider>
  )
}

export default App
