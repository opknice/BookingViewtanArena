import { useState } from 'react'
import { thaiDate, money, mergeSlotRanges, generateSlots, normalizePhone } from '../utils/helpers'

export default function BookingModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  pickedSlots, 
  onSubmit 
}) {
  const [formData, setFormData] = useState({ name: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const ALL_SLOTS = generateSlots()
  const pickedList = ALL_SLOTS.filter(slot => pickedSlots.has(slot.startTime))
  const day = pickedList.filter(slot => !slot.isNight)
  const night = pickedList.filter(slot => slot.isNight)
  const totalPrice = pickedList.reduce((sum, slot) => sum + slot.price, 0)

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อ-นามสกุล'
    }
    const phone = normalizePhone(formData.phone)
    if (!/^0\d{9}$/.test(phone)) {
      newErrors.phone = 'เบอร์โทรต้องเป็นตัวเลข 10 หลักและขึ้นต้นด้วย 0'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate() || submitting) return

    setSubmitting(true)
    try {
      await onSubmit({
        name: formData.name.trim(),
        phone: normalizePhone(formData.phone)
      })
      setFormData({ name: '', phone: '' })
      setErrors({})
    } catch (error) {
      if (error.payload?.errors) {
        setErrors(error.payload.errors)
      } else {
        setErrors({ general: error.message })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const renderSlotGroup = (slots, type, title) => {
    if (slots.length === 0) return null

    return (
      <div className={`modal-slot-group ${type}`}>
        <div className="modal-slot-title">{title}</div>
        {mergeSlotRanges(slots).map((slot, index) => (
          <div key={index} className="modal-slot-line">
            <span>{slot.startTime} - {slot.endTime}</span>
            <strong>{money(slot.price)} บาท</strong>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>สรุปการจอง</h2>
        <p className="modal-date">{thaiDate(selectedDate)}</p>

        <div className="modal-slots">
          {renderSlotGroup(day, 'day', 'กลางวัน - 800 บาท/60 นาที')}
          {renderSlotGroup(night, 'night', 'กลางคืน - 1000 บาท/60 นาที')}
        </div>

        <div className="modal-total-row">
          <span>รวม</span>
          <strong>{money(totalPrice)} บาท</strong>
        </div>

        <form onSubmit={handleSubmit} className="booking-form" noValidate>
          <label className="field">
            <span>ชื่อ-นามสกุล *</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'invalid' : ''}
              placeholder="เช่น สมชาย ใจดี"
              required
            />
            <small className="field-error">{errors.name || ''}</small>
          </label>

          <label className="field">
            <span>เบอร์โทรศัพท์ *</span>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={errors.phone ? 'invalid' : ''}
              maxLength="10"
              placeholder="0812345678"
              required
            />
            <small className="field-error">{errors.phone || ''}</small>
          </label>

          {errors.general && (
            <p className="form-message">{errors.general}</p>
          )}

          <div className="btn-row">
            <button className="btn btn-muted" type="button" onClick={onClose}>
              ยกเลิก
            </button>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'กำลังบันทึก...' : 'ยืนยันการจอง'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
