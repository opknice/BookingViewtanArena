import { useState } from 'react'
import { THAI_MONTHS, THAI_DAYS_SHORT } from '../constants/booking'

export default function Calendar({ selectedDate, onDateChange }) {
  const today = new Date()
  const [viewMonth, setViewMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth()
  })

  const changeMonth = (direction) => {
    let nextMonth = viewMonth.month + direction
    let nextYear = viewMonth.year

    if (nextMonth > 11) {
      nextMonth = 0
      nextYear += 1
    }
    if (nextMonth < 0) {
      nextMonth = 11
      nextYear -= 1
    }

    setViewMonth({ year: nextYear, month: nextMonth })
  }

  const isPast = (day) => {
    const target = new Date(viewMonth.year, viewMonth.month, day)
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return target < todayOnly
  }

  const renderDays = () => {
    const days = []
    const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate()
    const firstWeekday = new Date(viewMonth.year, viewMonth.month, 1).getDay()

    // Day names
    THAI_DAYS_SHORT.forEach((dayName) => {
      days.push(
        <div key={`day-name-${dayName}`} className="cal-day-name">
          {dayName}
        </div>
      )
    })

    // Empty cells
    for (let i = 0; i < firstWeekday; i++) {
      days.push(<div key={`empty-${i}`}></div>)
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate.getFullYear() === viewMonth.year &&
                        selectedDate.getMonth() === viewMonth.month &&
                        selectedDate.getDate() === day
      const isToday = today.getFullYear() === viewMonth.year &&
                     today.getMonth() === viewMonth.month &&
                     today.getDate() === day
      const past = isPast(day)

      days.push(
        <button
          key={day}
          type="button"
          className={`cal-day ${isSelected ? 'selected' : ''} ${isToday && !isSelected ? 'today' : ''} ${past ? 'past' : ''}`}
          disabled={past}
          onClick={() => {
            if (!past) {
              onDateChange(new Date(viewMonth.year, viewMonth.month, day))
            }
          }}
        >
          {day}
        </button>
      )
    }

    return days
  }

  return (
    <div className="card calendar-card">
      <div className="cal-header">
        <button
          className="cal-nav"
          type="button"
          onClick={() => changeMonth(-1)}
        >
          ‹
        </button>
        <div className="cal-title">
          {THAI_MONTHS[viewMonth.month]} {viewMonth.year}
        </div>
        <button
          className="cal-nav"
          type="button"
          onClick={() => changeMonth(1)}
        >
          ›
        </button>
      </div>

      <div className="cal-grid">{renderDays()}</div>

      <div className="legend">
        <div className="legend-title">อัตราค่าบริการ</div>
        <div className="legend-row">
          <span className="legend-dot day"></span>
          <span>16:00 - 18:00</span>
          <strong>800 บาท/ชม.</strong>
        </div>
        <div className="legend-row">
          <span className="legend-dot night"></span>
          <span>18:00 - 24:00</span>
          <strong>1,000 บาท/ชม.</strong>
        </div>
      </div>
    </div>
  )
}
