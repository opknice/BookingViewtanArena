import { money, generateSlots } from '../utils/helpers'

export default function SummaryBar({ pickedSlots, onClear, onBook }) {
  // Safety check for pickedSlots
  if (!pickedSlots || typeof pickedSlots.has !== 'function') return null
  
  const ALL_SLOTS = generateSlots()
  const pickedList = ALL_SLOTS.filter(slot => pickedSlots.has(slot.startTime))
  
  if (pickedList.length === 0) return null

  const day = pickedList.filter(slot => !slot.isNight)
  const night = pickedList.filter(slot => slot.isNight)
  const totalDay = day.reduce((sum, slot) => sum + slot.price, 0)
  const totalNight = night.reduce((sum, slot) => sum + slot.price, 0)
  const totalPrice = totalDay + totalNight

  const parts = []
  if (day.length) {
    parts.push(`กลางวัน ${day.length} ช่วง = ${money(totalDay)} บาท`)
  }
  if (night.length) {
    parts.push(`กลางคืน ${night.length} ช่วง = ${money(totalNight)} บาท`)
  }

  return (
    <div className="summary-bar">
      <div className="summary-inner">
        <div className="summary-copy">
          <div className="summary-count">
            เลือกแล้ว <strong>{pickedList.length} ช่วงเวลา</strong>
          </div>
          <div className="summary-breakdown">{parts.join(' | ')}</div>
        </div>
        <div className="summary-total">
          <span>{money(totalPrice)}</span> <small>บาท</small>
        </div>
        <button className="btn btn-ghost" type="button" onClick={onClear}>
          เคลียร์
        </button>
        <button className="btn btn-primary" type="button" onClick={onBook}>
          จองสนาม
        </button>
      </div>
    </div>
  )
}
