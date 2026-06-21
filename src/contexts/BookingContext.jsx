import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ref, onValue, query, orderByChild, equalTo, update, set, push } from 'firebase/database'
import { database } from '../config/firebase'
import { dateKey, timeToMinutes, generateGroupId } from '../utils/helpers'
import { SLOT_MINUTES } from '../constants/booking'

const BookingContext = createContext()

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState({})
  const [loading, setLoading] = useState(false)

  // Subscribe to all bookings (realtime)
  const subscribeToAllBookings = useCallback(() => {
    const bookingsRef = ref(database, 'bookings')
    const unsubscribe = onValue(
      bookingsRef, 
      (snapshot) => {
        const data = snapshot.val()
        setBookings(data || {})
      },
      (error) => {
        console.error('Firebase subscription error:', error)
        setBookings({})
      }
    )
    return unsubscribe
  }, [])

  // Subscribe to bookings by date (realtime)
  const subscribeToBookingsByDate = useCallback((date, callback) => {
    const bookingsRef = ref(database, 'bookings')
    const dateQuery = query(bookingsRef, orderByChild('date'), equalTo(date))
    
    const unsubscribe = onValue(
      dateQuery, 
      (snapshot) => {
        const data = snapshot.val()
        callback(data || {})
      },
      (error) => {
        console.error('Firebase subscription error:', error)
        callback({})
      }
    )
    
    return unsubscribe
  }, [])

  // Subscribe to bookings by phone (realtime)
  const subscribeToBookingsByPhone = useCallback((phone, callback) => {
    const bookingsRef = ref(database, 'bookings')
    const phoneQuery = query(bookingsRef, orderByChild('phone'), equalTo(phone))
    
    const unsubscribe = onValue(
      phoneQuery, 
      (snapshot) => {
        const data = snapshot.val()
        callback(data || {})
      },
      (error) => {
        console.error('Firebase subscription error:', error)
        callback({})
      }
    )
    
    return unsubscribe
  }, [])

  // Create booking with conflict detection
  const createBooking = useCallback(async (payload) => {
    setLoading(true)
    try {
      const { name, phone, date, slots } = payload

      // Validate
      if (!name || !name.trim()) {
        throw new Error('กรุณากรอกชื่อ-นามสกุล')
      }
      if (!/^0\d{9}$/.test(phone)) {
        throw new Error('เบอร์โทรต้องเป็นตัวเลข 10 หลักและขึ้นต้นด้วย 0')
      }
      if (!slots || slots.length === 0) {
        throw new Error('กรุณาเลือกช่วงเวลา')
      }

      // Group slots by date for conflict checking
      const slotsByDate = {}
      slots.forEach(slot => {
        const bookingDate = slot.date || date
        if (!slotsByDate[bookingDate]) {
          slotsByDate[bookingDate] = []
        }
        slotsByDate[bookingDate].push(slot)
      })

      // Check for conflicts on each date
      const bookingsRef = ref(database, 'bookings')
      const snapshot = await new Promise((resolve, reject) => {
        onValue(bookingsRef, resolve, reject, { onlyOnce: true })
      })
      const existingBookings = snapshot.val() || {}

      for (const [checkDate, dateSlots] of Object.entries(slotsByDate)) {
        const confirmedBookings = Object.values(existingBookings).filter(
          b => b && b.date === checkDate && b.status === 'confirmed'
        )

        for (const slot of dateSlots) {
          const slotStart = timeToMinutes(slot.startTime)
          const slotEnd = timeToMinutes(slot.endTime)

          if (!Number.isFinite(slotStart) || !Number.isFinite(slotEnd)) {
            throw new Error('เวลาที่เลือกไม่ถูกต้อง')
          }

          // Check overlap with existing bookings
          for (const existing of confirmedBookings) {
            const existStart = timeToMinutes(existing.startTime)
            const existEnd = timeToMinutes(existing.endTime)

            if (Number.isFinite(existStart) && Number.isFinite(existEnd)) {
              const hasOverlap = slotStart < existEnd && slotEnd > existStart
              if (hasOverlap) {
                throw new Error(
                  `ช่วงเวลา ${slot.startTime}-${slot.endTime} วันที่ ${checkDate} ถูกจองแล้ว กรุณาเลือกช่วงเวลาอื่น`
                )
              }
            }
          }
        }
      }

      // Create bookings if no conflicts
      const groupId = generateGroupId()
      const createdAt = Date.now()
      const updates = {}

      const bookingList = slots.map((slot, index) => {
        const bookingDate = slot.date || date
        // Create unique ID using date, time, and random suffix
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
        const id = `${groupId}_${bookingDate.replace(/-/g, '')}_${slot.startTime.replace(':', '')}${slot.endTime.replace(':', '')}_${randomSuffix}`
        const booking = {
          groupId,
          name: name.trim(),
          phone,
          date: bookingDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          price: slot.price,
          status: 'pending',
          createdAt,
          adminNote: ''
        }
        updates[`bookings/${id}`] = booking
        return { ...booking, id }
      })

      await update(ref(database), updates)

      // Send Telegram notification
      sendTelegramNotification({
        groupId,
        name: name.trim(),
        phone,
        date: bookingList[0].date,
        slots: bookingList,
        totalPrice: bookingList.reduce((sum, b) => sum + b.price, 0)
      })

      return {
        success: true,
        groupId,
        bookings: bookingList,
        totalPrice: bookingList.reduce((sum, b) => sum + b.price, 0)
      }
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Update booking status
  const updateBookingStatus = useCallback(async (bookingIds, status) => {
    try {
      const updates = {}
      bookingIds.forEach(id => {
        updates[`bookings/${id}/status`] = status
      })
      await update(ref(database), updates)
    } catch (error) {
      console.error('Failed to update booking status:', error)
      throw new Error('ไม่สามารถอัพเดทสถานะได้ กรุณาลองใหม่อีกครั้ง')
    }
  }, [])

  return (
    <BookingContext.Provider value={{
      bookings,
      loading,
      subscribeToAllBookings,
      subscribeToBookingsByDate,
      subscribeToBookingsByPhone,
      createBooking,
      updateBookingStatus
    }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider')
  }
  return context
}

// Telegram notification helper with retry and timeout
async function sendTelegramNotification(data) {
  const WORKER_URL = 'https://telegram-notifier.thanakrit-kas.workers.dev'
  const TIMEOUT = 5000 // 5 seconds
  
  // Validate data
  if (!data.slots || data.slots.length === 0) {
    console.warn('⚠️ Cannot send notification: No slots provided')
    return
  }
  
  const slotLines = data.slots
    .map(s => `  • ${s.startTime} - ${s.endTime} (${(s.price || 0).toLocaleString('th-TH')} บาท)`)
    .join('\n')

  const message =
    `🔔 *มีการจองใหม่!*\n` +
    `━━━━━━━━━━━━━━━\n` +
    `📌 รหัส: #${data.groupId}\n` +
    `👤 ชื่อ: ${data.name}\n` +
    `📞 โทร: ${data.phone}\n` +
    `📅 วันที่: ${data.date}\n` +
    `⏰ ช่วงเวลา:\n${slotLines}\n` +
    `━━━━━━━━━━━━━━━\n` +
    `💰 รวม: ${(data.totalPrice || 0).toLocaleString('th-TH')} บาท\n` +
    `🔄 สถานะ: รอตรวจสอบ`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT)

  try {
    await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      signal: controller.signal
    })
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('⚠️ Telegram notification timeout')
    } else {
      console.warn('⚠️ ส่ง Telegram ไม่ได้:', err.message)
    }
  } finally {
    clearTimeout(timeoutId)
  }
}
