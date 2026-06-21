import { useState } from 'react'
import HeroSection from '../components/HeroSection'
import AdminLoginModal from '../components/AdminLoginModal'
import { normalizePhone } from '../utils/helpers'

export default function AcademyPage() {
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    childName: '',
    parentName: '',
    phone: '',
    ageGroup: ''
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!formData.childName.trim()) {
      newErrors.childName = 'กรุณากรอกชื่อเด็ก'
    }
    if (!formData.parentName.trim()) {
      newErrors.parentName = 'กรุณากรอกชื่อผู้ปกครอง'
    }
    const phone = normalizePhone(formData.phone)
    if (!/^0\d{9}$/.test(phone)) {
      newErrors.phone = 'เบอร์โทรต้องเป็นตัวเลข 10 หลักและขึ้นต้นด้วย 0'
    }
    if (!formData.ageGroup) {
      newErrors.ageGroup = 'กรุณาเลือกช่วงอายุ'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate() || submitting) return

    setSubmitting(true)
    
    try {
      const normalizedPhone = normalizePhone(formData.phone)
      
      const registrationData = {
        childName: formData.childName.trim(),
        ageGroup: formData.ageGroup,
        parentName: formData.parentName.trim(),
        phone: normalizedPhone,
        status: 'pending'
      }
      
      // ส่ง Telegram notification
      await sendAcademyTelegramNotification(registrationData)
      
      setSubmitting(false)
      setSubmitted(true)
      setFormData({ childName: '', parentName: '', phone: '', ageGroup: '' })
      setErrors({})
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSubmitted(false)
        setShowForm(false)
      }, 3000)
    } catch (error) {
      console.error('Error submitting registration:', error)
      setSubmitting(false)
      setErrors({ submit: 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง' })
    }
  }

  // ฟังก์ชันส่ง Telegram notification สำหรับการสมัคร Academy
  const sendAcademyTelegramNotification = async (data) => {
    const WORKER_URL = 'https://telegram-notifier.thanakrit-kas.workers.dev'
    
    const timestamp = new Date().toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const message =
      `⚽ *มีการสมัคร Premier Academy ใหม่!*\n` +
      `━━━━━━━━━━━━━━━\n` +
      `👶 ชื่อเด็ก: ${data.childName}\n` +
      `📊 ช่วงอายุ: ${data.ageGroup} ปี\n` +
      `👤 ผู้ปกครอง: ${data.parentName}\n` +
      `📞 โทร: ${data.phone}\n` +
      `🕐 เวลาสมัคร: ${timestamp}\n` +
      `━━━━━━━━━━━━━━━\n`

    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })

      if (!response.ok) {
        throw new Error('ส่ง Telegram ไม่สำเร็จ')
      }
    } catch (err) {
      console.warn('⚠️ ส่ง Telegram ไม่ได้:', err.message)
      // ไม่ throw error ออกมาเพื่อให้ฟอร์มยังแสดงว่าสำเร็จ
      throw err
    }
  }

  return (
    <div className="app-shell">
      <HeroSection onAdminClick={() => setShowAdminModal(true)} />

      <main className="main-layout">
        <div className="feature-page">
          <div className="feature-card">


            <div className="academy-hero">
              <img src="/Academy.png" alt="Premier Academy" className="academy-hero-image" />
            </div>



          

            <div className="academy-schedule">
              <h2>📅 ตารางการเรียน</h2>
              <div className="schedule-card">
                <div className="schedule-item">
                  <span className="schedule-icon">🕐</span>
                  <div className="schedule-content">
                    <h4>เวลาเรียน</h4>
                    <p>เสาร์-อาทิตย์ เวลา 16.00-18.00 น.</p>
                  </div>
                </div>
                <div className="schedule-item">
                  <span className="schedule-icon">📍</span>
                  <div className="schedule-content">
                    <h4>สถานที่</h4>
                    <p>สนาม VAR วิวตาลอารีน่า</p>
                  </div>
                </div>
                <div className="schedule-item special">
                  <span className="schedule-icon">💰</span>
                  <div className="schedule-content">
                    <h4>ค่าเรียน</h4>
                    <p className="price-highlight">1,200 บาท</p>
                    <small>รับชุด ฟรี 1 ชุด !!</small>
                  </div>
                  
                </div>
                
              </div>
                

            </div>

                            <button 
                      className="btn btn-primary btn-large"
                      onClick={() => setShowForm(true)}
                    >
                      สมัครเรียนตอนนี้
                    </button>

            
             
              

           

            <div className="academy-contact-info">
              <h3>📞 ติดต่อสอบถามเพิ่มเติม</h3>
              <div className="contact-methods">
                <div className="contact-method">
                  <span className="contact-icon">📱</span>
                  <div>
                    <p><strong>โทร</strong></p>
                    <p>087-1177788, 097-2566909</p>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      </main>

      {showForm && (
        <div className="modal-overlay" onClick={() => !submitting && setShowForm(false)}>
          <section className="modal academy-modal" onClick={(e) => e.stopPropagation()}>
            {!submitted ? (
              <>
                <h2>แบบฟอร์มสมัครเรียน</h2>
                <p className="modal-subtitle">กรุณากรอกข้อมูลให้ครบถ้วน</p>

                <form onSubmit={handleSubmit} className="academy-form" noValidate>
                  <label className="field">
                    <span>ชื่อ-นามสกุลเด็ก *</span>
                    <input
                      type="text"
                      value={formData.childName}
                      onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                      className={errors.childName ? 'invalid' : ''}
                      placeholder="เช่น น้องมิกกี้ สุขใจ"
                      disabled={submitting}
                    />
                    <small className="field-error">{errors.childName || ''}</small>
                  </label>

                  <label className="field">
                    <span>ช่วงอายุ *</span>
                    <select
                      value={formData.ageGroup}
                      onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                      className={errors.ageGroup ? 'invalid' : ''}
                      disabled={submitting}
                    >
                      <option value="">-- เลือกช่วงอายุ --</option>
                      <option value="6-8">6-8 ปี</option>
                      <option value="9-11">9-11 ปี</option>
                    </select>
                    <small className="field-error">{errors.ageGroup || ''}</small>
                  </label>

                  <label className="field">
                    <span>ชื่อ-นามสกุลผู้ปกครอง *</span>
                    <input
                      type="text"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className={errors.parentName ? 'invalid' : ''}
                      placeholder="เช่น นายสมชาย ใจดี"
                      disabled={submitting}
                    />
                    <small className="field-error">{errors.parentName || ''}</small>
                  </label>

                  <label className="field">
                    <span>เบอร์โทรศัพท์ผู้ปกครอง *</span>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={errors.phone ? 'invalid' : ''}
                      maxLength="10"
                      placeholder="0812345678"
                      disabled={submitting}
                    />
                    <small className="field-error">{errors.phone || ''}</small>
                  </label>

                  <div className="form-note">
                    <p>📌 หมายเหตุ: หลังจากส่งแบบฟอร์ม ทางโค้ชจะติดต่อกลับภายใน 1-2 วันทำการ</p>
                  </div>

                  {errors.submit && (
                    <div className="error-message" style={{ color: '#dc3545', padding: '12px', marginBottom: '16px', backgroundColor: '#f8d7da', borderRadius: '4px', textAlign: 'center' }}>
                      ⚠️ {errors.submit}
                    </div>
                  )}

                  <div className="btn-row">
                    <button 
                      className="btn btn-muted" 
                      type="button" 
                      onClick={() => setShowForm(false)}
                      disabled={submitting}
                    >
                      ยกเลิก
                    </button>
                    <button 
                      className="btn btn-primary" 
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? 'กำลังส่งข้อมูล...' : 'ส่งใบสมัคร'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="success-message">
                <div className="success-icon">✅</div>
                <h2>ส่งใบสมัครสำเร็จ!</h2>
                <p>ขอบคุณสำหรับการสมัครเรียน</p>
                <p>ทางโค้ชจะติดต่อกลับภายใน 1-2 วันทำการ</p>
              </div>
            )}
          </section>
        </div>
      )}

      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />
    </div>
  )
}
