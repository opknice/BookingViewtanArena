import { useState, useEffect } from 'react'
import { useBooking } from '../contexts/BookingContext'
import { dateKey, timeToMinutes, generateSlots } from '../utils/helpers'
import { SLOT_MINUTES } from '../constants/booking'
import HeroSection from '../components/HeroSection'
import Calendar from '../components/Calendar'
import SlotList from '../components/SlotList'
import BookedSummary from '../components/BookedSummary'
import SummaryBar from '../components/SummaryBar'
import BookingModal from '../components/BookingModal'
import AdminLoginModal from '../components/AdminLoginModal'
import ConfirmModal from '../components/ConfirmModal'

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [pickedSlots, setPickedSlots] = useState(new Set())
  const [bookedMap, setBookedMap] = useState({})
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmData, setConfirmData] = useState(null)
  const [userPhone, setUserPhone] = useState('')

  const { subscribeToBookingsByDate, createBooking } = useBooking()

  // Build booked map from bookings
  const buildBookedMap = (bookings) => {
    const map = {}
    const ALL_SLOTS = generateSlots()

    Object.values(bookings || {}).forEach((booking) => {
      if (!booking || typeof booking !== 'object') return
      if (booking.status !== 'confirmed') return

      const bookedStart = timeToMinutes(booking.startTime)
      const bookedEnd = timeToMinutes(booking.endTime) || (bookedStart + SLOT_MINUTES)
      if (!Number.isFinite(bookedStart) || !Number.isFinite(bookedEnd)) return

      ALL_SLOTS.forEach((slot) => {
        const slotStart = timeToMinutes(slot.startTime)
        const slotEnd = timeToMinutes(slot.endTime)
        const overlaps = slotStart < bookedEnd && slotEnd > bookedStart

        if (overlaps) {
          map[slot.startTime] = {
            status: booking.status,
            name: String(booking.name || '').trim()
          }
        }
      })
    })

    return map
  }

  // Subscribe to bookings on date change (realtime)
  useEffect(() => {
    const date = dateKey(selectedDate)
    const unsubscribe = subscribeToBookingsByDate(date, (bookings) => {
      const newBookedMap = buildBookedMap(bookings)
      setBookedMap(newBookedMap)

      // Remove unavailable slots from selection
      setPickedSlots((prev) => {
        const newPicked = new Set(prev)
        let changed = false
        prev.forEach((startTime) => {
          if (newBookedMap[startTime]) {
            newPicked.delete(startTime)
            changed = true
          }
        })
        return changed ? newPicked : prev
      })
    })

    return unsubscribe
  }, [selectedDate, subscribeToBookingsByDate])

  const handleDateChange = (date) => {
    setSelectedDate(date)
    setPickedSlots(new Set())
  }

  const handleToggleSlot = (slot) => {
    if (bookedMap[slot.startTime]) return

    setPickedSlots((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(slot.startTime)) {
        newSet.delete(slot.startTime)
      } else {
        newSet.add(slot.startTime)
      }
      return newSet
    })
  }

  const handleSubmitBooking = async (formData) => {
    try {
      const ALL_SLOTS = generateSlots()
      const pickedList = ALL_SLOTS.filter(slot => pickedSlots.has(slot.startTime))

      // Validate picked slots
      if (pickedList.length === 0) {
        throw new Error('กรุณาเลือกช่วงเวลาอย่างน้อย 1 ช่วง')
      }

      // Check if any selected slot is already booked (recheck before submission)
      const hasConflict = pickedList.some(slot => bookedMap[slot.startTime])
      if (hasConflict) {
        throw new Error('ช่วงเวลาที่เลือกถูกจองไปแล้ว กรุณาเลือกช่วงเวลาใหม่')
      }

      const result = await createBooking({
        name: formData.name,
        phone: formData.phone,
        date: dateKey(selectedDate),
        slots: pickedList
      })

      setUserPhone(formData.phone)
      setConfirmData(result)
      setShowBookingModal(false)
      setShowConfirmModal(true)
      setPickedSlots(new Set())
    } catch (error) {
      // Re-throw error to be handled by BookingModal
      throw error
    }
  }

  return (
    <div className="app-shell">
      <HeroSection onAdminClick={() => setShowAdminModal(true)} />

      <main className="main-layout">
        <section className="booking-grid" id="booking-calendar">
          <aside className="left-panel">
            <Calendar selectedDate={selectedDate} onDateChange={handleDateChange} />
            <BookedSummary bookedMap={bookedMap} />
          </aside>

          <SlotList
            selectedDate={selectedDate}
            bookedMap={bookedMap}
            pickedSlots={pickedSlots}
            onToggleSlot={handleToggleSlot}
          />
        </section>
      </main>

      <SummaryBar
        pickedSlots={pickedSlots}
        onClear={() => setPickedSlots(new Set())}
        onBook={() => setShowBookingModal(true)}
      />

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        selectedDate={selectedDate}
        pickedSlots={pickedSlots}
        onSubmit={handleSubmitBooking}
      />

      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        bookingData={confirmData}
        phone={userPhone}
      />

      {/* Tournament Contact Section */}
      <div className="info-box">
        <h3>📢 สนใจจัดทัวร์นาเมนต์?</h3>
        <p>
          ติดต่อสอบถามรายละเอียดเพิ่มเติมเกี่ยวกับการจัดทัวร์นาเมนต์ที่สนามของเรา 
          เรามีแพ็คเกจพิเศษสำหรับการจัดงานแข่งขัน
        </p>
        <div className="contact-info-section">
          <div className="tournament-contact">
            <div className="social-links-tournament">
              <a 
                href="tel:0820164532"
                className="social-link-box phone"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                </svg>
                <span>โทร 082 016 4532</span>
              </a>
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
  )
}
