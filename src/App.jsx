import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { BookingProvider } from './contexts/BookingContext'
import BookingPage from './pages/BookingPage'
import CheckStatusPage from './pages/CheckStatusPage'
import AdminPage from './pages/AdminPage'

function App() {
  return (
    <BookingProvider>
      <Router>
        <Routes>
          <Route path="/" element={<BookingPage />} />
          <Route path="/check-status" element={<CheckStatusPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
    </BookingProvider>
  )
}

export default App
