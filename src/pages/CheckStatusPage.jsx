import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useBooking } from '../contexts/BookingContext'
import { normalizePhone, thaiDate, parseLocalDate, money } from '../utils/helpers'
import { STATUS_LABELS } from '../constants/booking'
import HeroSection from '../components/HeroSection'
import AdminLoginModal from '../components/AdminLoginModal'

export default function CheckStatusPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [phone, setPhone] = useState(searchParams.get('phone') || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showAdminModal, setShowAdminModal] = useState(false)

  const { subscribeToBookingsByPhone } = useBooking()

  useEffect(() => {
    const initialPhone = searchParams.get('phone')
    if (initialPhone) {
      setPhone(normalizePhone(initialPhone))
      handleSearch(normalizePhone(initialPhone))
    }
  }, [])

  const handleSearch = (searchPhone = null) => {
    const phoneToSearch = normalizePhone(searchPhone || phone)
    setPhone(phoneToSearch)
    setMessage('')

    if (!/^0\d{9}$/.test(phoneToSearch)) {
      setMessage('กรุณากรอกเบอร์โทร 10 หลักและขึ้นต้นด้วย 0')
      setResults([])
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToBookingsByPhone(phoneToSearch, (bookings) => {
      const groups = groupBookings(bookings)
      setResults(groups)
      setLoading(false)
    })

    return unsubscribe
  }

  const groupBookings = (bookings) => {
    const groups = {}

    Object.entries(bookings || {}).forEach(([id, booking]) => {
      if (!booking || typeof booking !== 'object') return

      const groupId = booking.groupId || id
      if (!groups[groupId]) {
        groups[groupId] = {
          groupId,
          name: booking.name || '',
          phone: booking.phone || '',
          date: booking.date || '',
          slots: []
        }
      }

      groups[groupId].slots.push({ id, ...booking })
    })

    return Object.values(groups)
      .map((group) => {
        group.slots.sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)))
        group.status = deriveGroupStatus(group.slots)
        group.total = group.slots.reduce((sum, slot) => sum + Number(slot.price || 0), 0)
        return group
      })
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
  }

  const deriveGroupStatus = (slots) => {
    if (slots.some((slot) => slot.status === 'pending')) return 'pending'
    if (slots.some((slot) => slot.status === 'confirmed')) return 'confirmed'
    return 'cancelled'
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSearch()
  }

  return (
    <div className="app-shell">
      <HeroSection onAdminClick={() => setShowAdminModal(true)} />

      <main className="main-layout">
        <section className="status-page">
          <div className="status-card">
            <p className="slots-eyebrow">Booking status</p>
            <h1>เช็คสถานะการจอง</h1>
            <p className="status-intro">
              กรอกเบอร์โทรที่ใช้ตอนจองเพื่อดูรายการของคุณ
            </p>

            <form className="status-search" onSubmit={handleSubmit} noValidate>
              <input
                type="tel"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength="10"
                placeholder="เบอร์โทร 10 หลัก เช่น 0812345678"
                required
              />
              <button className="btn btn-primary" type="submit">
                ค้นหา
              </button>
            </form>

            {message && <p className="form-message">{message}</p>}

            <div className="result-list">
              {loading && <div className="empty-state">กำลังค้นหาการจอง...</div>}

              {!loading && results.length === 0 && phone && !message && (
                <div className="empty-state">ไม่พบการจองจากเบอร์โทรนี้</div>
              )}

              {!loading && results.map((group) => {
                const dateText = group.date ? thaiDate(parseLocalDate(group.date)) : '-'
                return (
                  <article key={group.groupId} className="result-card">
                    <div className="result-top">
                      <span className="result-id">
                        <strong>#{group.groupId}</strong>
                      </span>
                      <span className={`status-pill ${group.status}`}>
                        {STATUS_LABELS[group.status] || group.status}
                      </span>
                    </div>

                    <h2>{dateText}</h2>

                    <div className="result-slots">
                      {group.slots.map((slot, index) => (
                        <div key={index} className="result-slot">
                          <span>{slot.startTime} - {slot.endTime}</span>
                          <strong>{money(slot.price)} บาท</strong>
                        </div>
                      ))}
                    </div>

                    <div className="result-total">
                      <span>รวม</span>
                      <strong>{money(group.total)} บาท</strong>
                    </div>
                  </article>
                )
              })}
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
