import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AdminLoginModal({ isOpen, onClose }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (password === '55555') {
      onClose()
      navigate('/admin')
    } else {
      setError('รหัสผ่านไม่ถูกต้อง')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>เข้าสู่ระบบผู้ดูแลระบบ</h2>
        <p className="modal-date">กรุณากรอกรหัสผ่านเพื่อเข้าสู่ Admin Panel</p>

        <form className="booking-form" onSubmit={handleSubmit} autoComplete="off" noValidate>
          <label className="field">
            <span>รหัสผ่าน *</span>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              className={error ? 'invalid' : ''}
              placeholder="กรอกรหัสผ่าน"
              required
            />
            <small className="field-error">{error}</small>
          </label>

          <div className="btn-row">
            <button className="btn btn-muted" type="button" onClick={onClose}>
              ยกเลิก
            </button>
            <button className="btn btn-primary" type="submit">
              ยืนยัน
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
