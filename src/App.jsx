import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { BookingProvider } from './contexts/BookingContext'
import BookingPage from './pages/BookingPage'
import CheckStatusPage from './pages/CheckStatusPage'
import TournamentPage from './pages/TournamentPage'
import FindTeamPage from './pages/FindTeamPage'
import AcademyPage from './pages/AcademyPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <BookingProvider>
      <Router>
        <Routes>
          <Route path="/" element={<BookingPage />} />
          <Route path="/check-status" element={<CheckStatusPage />} />
          <Route path="/tournament" element={<TournamentPage />} />
          <Route path="/find-team" element={<FindTeamPage />} />
          <Route path="/academy" element={<AcademyPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
    </BookingProvider>
  )
}

export default App
