import { generateSlots, mergeBookedSlots } from '../utils/helpers'

export default function BookedSummary({ bookedMap }) {
  const ALL_SLOTS = generateSlots()
  
  const bookedList = ALL_SLOTS
    .filter(slot => bookedMap[slot.startTime])
    .map(slot => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      name: bookedMap[slot.startTime].name
    }))

  if (bookedList.length === 0) {
    return (
      <div className="hint-box">
        <strong>บันทึกการจองของวันนี้</strong>
        <div className="booked-summary-empty">ยังไม่มีการจองในวันนี้</div>
      </div>
    )
  }

  const merged = mergeBookedSlots(bookedList)

  return (
    <div className="hint-box">
      <strong>บันทึกการจองของวันนี้</strong>
      <div className="booked-summary-list">
        {merged.map((item, index) => (
          <div key={index} className="booked-summary-item">
            <span className="booked-summary-time">
              {item.startTime} - {item.endTime} น.
            </span>
            <span className="booked-summary-name">
              {item.name || 'ไม่ระบุชื่อ'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
