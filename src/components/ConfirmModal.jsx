import { Link } from 'react-router-dom'
import { thaiDate, money, mergeSlotRanges } from '../utils/helpers'

export default function ConfirmModal({ isOpen, onClose, bookingData, phone }) {
  if (!isOpen || !bookingData) return null

  const { groupId, bookings, totalPrice } = bookingData

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">✓</div>
        <h2>จองสำเร็จ!</h2>
        <p>รอการยืนยันจากเจ้าหน้าที่</p>

        <div className="confirm-card">
          <div className="confirm-id">
            รหัสการจอง: <strong>#{groupId}</strong>
          </div>
          <div className="confirm-row">
            <span>ชื่อ:</span>
            <strong>{bookings[0]?.name || '-'}</strong>
          </div>
          <div className="confirm-row">
            <span>วันที่:</span>
            <strong>{bookings[0]?.date || '-'}</strong>
          </div>

          <div className="confirm-slot-list">
            {mergeSlotRanges(bookings).map((slot, index) => (
              <div key={index} className="confirm-slot-item">
                {slot.startTime} - {slot.endTime} · {money(slot.price)} บาท
              </div>
            ))}
          </div>

          <div className="confirm-total">
            <span>รวม</span>
            <strong>{money(totalPrice)} บาท</strong>
          </div>

          <span className="status-pill pending">รอตรวจสอบ</span>
        </div>

        <div className="btn-row">
          <Link 
            className="btn btn-muted" 
            to={`/check-status?phone=${encodeURIComponent(phone)}`}
          >
            เช็คสถานะ
          </Link>
          <button className="btn btn-primary" type="button" onClick={onClose}>
            กลับหน้าหลัก
          </button>
        </div>
      </section>
    </div>
  )
}
