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
    const ALL_SLOTS = generateSlots()
    const pickedList = ALL_SLOTS.filter(slot => pickedSlots.has(slot.startTime))

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
    </div>
  )
}
