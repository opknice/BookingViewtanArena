import { generateSlots } from '../utils/helpers'

export default function SlotList({ selectedDate, bookedMap, pickedSlots, onToggleSlot }) {
  const ALL_SLOTS = generateSlots()
  const availableCount = ALL_SLOTS.filter(slot => !bookedMap[slot.startTime]).length

  const renderSlot = (slot) => {
    const bookingInfo = bookedMap[slot.startTime]
    const status = bookingInfo?.status || ''
    const selected = pickedSlots.has(slot.startTime)
    const statusText = status === 'confirmed'
      ? `ถูกจองแล้ว${bookingInfo.name ? ` (${bookingInfo.name})` : ''}`
      : selected
        ? 'เลือกแล้ว'
        : 'ว่าง'

    return (
      <button
        key={slot.startTime}
        type="button"
        className={`slot-row ${status ? 'booked' : 'available'} ${selected ? 'selected' : ''} ${status ? `status-${status}` : ''} ${slot.isNight ? 'night' : 'day'}`}
        disabled={Boolean(status)}
        onClick={() => !status && onToggleSlot(slot)}
      >
        <span className="slot-check">{selected ? '✓' : ''}</span>
        <span className="slot-time">{slot.startTime} - {slot.endTime}</span>
        <span className="slot-status">{statusText}</span>
      </button>
    )
  }

  return (
    <section className="card slots-card">
      <div className="slots-head">
        <div>
          <p className="slots-eyebrow">ตารางเวลา</p>
          <h1>{selectedDate.toLocaleDateString('th-TH', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</h1>
        </div>
        <span className="slots-count">
          {availableCount} / {ALL_SLOTS.length} ว่าง
        </span>
      </div>

      <div className="slot-list">
        <div className="slot-section day">
          <span></span>
          <strong>กลางวัน</strong>
          <small>800 บาท/ชม.</small>
        </div>

        {ALL_SLOTS.filter(slot => !slot.isNight).map(renderSlot)}

        <hr className="nightline" />

        <div className="slot-section night">
          <span></span>
          <strong>กลางคืน</strong>
          <small>1000 บาท/ชม.</small>
        </div>

        {ALL_SLOTS.filter(slot => slot.isNight).map(renderSlot)}
      </div>
    </section>
  )
}
