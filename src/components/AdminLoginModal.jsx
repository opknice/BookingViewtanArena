import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Simple hash check (in production, use proper authentication with backend)
const ADMIN_PASSWORD_HASH = 'c507a68f3093e885765257ed3f176c757aaf62bb4cbc2ef94b2e7da3406d9676' // SHA256 of '55555'
const MAX_ATTEMPTS = 5
const LOCKOUT_TIME = 5 * 60 * 1000 // 5 minutes

// Simple client-side hash function (for demonstration only - use proper auth in production)
async function simpleHash(text) {
  if (window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
  // Fallback for older browsers - simple check
  return text === '55555' ? ADMIN_PASSWORD_HASH : 'invalid'
}

export default function AdminLoginModal({ isOpen, onClose }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(null)
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check lockout
    if (lockedUntil && Date.now() < lockedUntil) {
      const remainingSeconds = Math.ceil((lockedUntil - Date.now()) / 1000)
      setError(`ถูกล็อกเนื่องจากใส่รหัสผ่านผิดหลายครั้ง กรุณารออีก ${remainingSeconds} วินาที`)
      return
    }

    try {
      const hash = await simpleHash(password)
      if (hash === ADMIN_PASSWORD_HASH) {
        setAttempts(0)
        setLockedUntil(null)
        setPassword('')
        setError('')
        onClose()
        navigate('/admin')
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)

        if (newAttempts >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCKOUT_TIME)
          setError(`รหัสผ่านไม่ถูกต้อง ถูกล็อก ${LOCKOUT_TIME / 60000} นาที`)
          setPassword('')
        } else {
          setError(`รหัสผ่านไม่ถูกต้อง (เหลือ ${MAX_ATTEMPTS - newAttempts} ครั้ง)`)
        }
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
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
