import {
  THAI_MONTHS,
  THAI_DAYS_FULL,
  PRICE_DAY,
  PRICE_NIGHT,
  SLOT_MINUTES,
  OPEN_MINUTE,
  CLOSE_MINUTE
} from '../constants/booking'

export function money(value) {
  return Number(value || 0).toLocaleString('th-TH')
}

export function timeToMinutes(time) {
  const [hour, minute] = String(time || '').split(':').map(Number)
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null
  return (hour * 60) + minute
}

export function minutesToTime(totalMinutes) {
  const hour = Math.floor(totalMinutes / 60)
  const minute = totalMinutes % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function slotPrice(startTime) {
  const startMinute = timeToMinutes(startTime)
  const hourlyPrice = startMinute < (18 * 60) ? PRICE_DAY : PRICE_NIGHT
  return Math.round((hourlyPrice * SLOT_MINUTES) / 60)
}

export function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function parseLocalDate(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function thaiDate(date) {
  return `${THAI_DAYS_FULL[date.getDay()]}ที่ ${date.getDate()} ${THAI_MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

export function normalizePhone(value) {
  return String(value || '').replace(/\D+/g, '').slice(0, 10)
}

export function generateSlots() {
  return Array.from({ length: (CLOSE_MINUTE - OPEN_MINUTE) / SLOT_MINUTES }, (_, index) => {
    const startMinute = OPEN_MINUTE + (index * SLOT_MINUTES)
    const startTime = minutesToTime(startMinute)
    return {
      startTime,
      endTime: minutesToTime(startMinute + SLOT_MINUTES),
      price: slotPrice(startTime),
      isNight: startMinute >= (18 * 60)
    }
  })
}

export function mergeSlotRanges(slots) {
  const sorted = [...(slots || [])].sort((a, b) =>
    String(a.startTime || '').localeCompare(String(b.startTime || ''))
  )
  const ranges = []

  sorted.forEach((slot) => {
    const last = ranges[ranges.length - 1]
    const price = Number(slot.price || 0)
    const samePricePeriod = last &&
      (timeToMinutes(last.startTime) < (18 * 60)) === (timeToMinutes(slot.startTime) < (18 * 60))

    if (last && last.endTime === slot.startTime && samePricePeriod) {
      last.endTime = slot.endTime
      last.price += price
      last.count += 1
      return
    }

    ranges.push({
      startTime: slot.startTime,
      endTime: slot.endTime,
      price,
      count: 1
    })
  })

  return ranges
}

export function mergeBookedSlots(bookedSlots) {
  const sorted = [...(bookedSlots || [])].sort((a, b) =>
    String(a.startTime || '').localeCompare(String(b.startTime || ''))
  )
  const ranges = []

  sorted.forEach((slot) => {
    const last = ranges[ranges.length - 1]
    if (last && last.endTime === slot.startTime && last.name === slot.name) {
      last.endTime = slot.endTime
      return
    }

    ranges.push({
      startTime: slot.startTime,
      endTime: slot.endTime,
      name: slot.name
    })
  })

  return ranges
}

export function generateGroupId() {
  const bytes = new Uint8Array(4)
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes)
    return `BK${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase()}`
  }
  return `BK${Date.now().toString(36).toUpperCase()}`
}
