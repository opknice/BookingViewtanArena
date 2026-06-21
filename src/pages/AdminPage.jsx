import { useState, useEffect } from 'react'
import { useBooking } from '../contexts/BookingContext'
import { money, timeToMinutes, mergeSlotRanges, thaiDate, parseLocalDate, dateKey, normalizePhone, generateGroupId } from '../utils/helpers'
import { PRICE_DAY, PRICE_NIGHT, SLOT_MINUTES, THAI_DAYS_FULL } from '../constants/booking'
import HeroSection from '../components/HeroSection'
import AdminLoginModal from '../components/AdminLoginModal'

const STATUS = {
  pending: { label: 'รอตรวจสอบ', color: 'pending' },
  confirmed: { label: 'ยืนยันแล้ว', color: 'confirmed' },
  cancelled: { label: 'ยกเลิก', color: 'cancelled' }
}

export default function AdminPage() {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [showWeeklyBookingModal, setShowWeeklyBookingModal] = useState(false)

  const { bookings, subscribeToAllBookings, updateBookingStatus, createBooking } = useBooking()

  // Subscribe to all bookings (realtime)
  useEffect(() => {
    const unsubscribe = subscribeToAllBookings()
    return unsubscribe
  }, [subscribeToAllBookings])

  // Process bookings into orders
  useEffect(() => {
    const normalizedOrders = Object.entries(bookings || {})
      .filter(([, booking]) => booking && typeof booking === 'object')
      .map(([id, booking]) => normalizeBooking(id, booking))

    setOrders(normalizedOrders)
  }, [bookings])

  const normalizeBooking = (id, booking) => {
    const startTime = String(booking.startTime || '')
    const endTime = booking.endTime || ''
    const startMinute = timeToMinutes(startTime)

    return {
      id,
      groupId: booking.groupId || id,
      name: booking.name || '-',
      phone: booking.phone || '-',
      date: booking.date || '',
      startTime,
      endTime,
      price: Number(booking.price || fallbackPrice(startTime, endTime)),
      status: STATUS[booking.status] ? booking.status : 'pending',
      adminNote: booking.adminNote || '',
      createdAt: Number(booking.createdAt || 0),
      isNight: startMinute >= (18 * 60)
    }
  }

  const fallbackPrice = (startTime, endTime) => {
    const startMinute = timeToMinutes(startTime)
    const endMinute = timeToMinutes(endTime) || (startMinute + SLOT_MINUTES)
    const hourlyPrice = startMinute < (18 * 60) ? PRICE_DAY : PRICE_NIGHT
    const duration = Number.isFinite(startMinute) && Number.isFinite(endMinute)
      ? Math.max(SLOT_MINUTES, endMinute - startMinute)
      : SLOT_MINUTES

    return Math.round((hourlyPrice * duration) / 60)
  }

  const groupOrders = (ordersList) => {
    const grouped = new Map()

    ordersList.forEach((order) => {
      if (!grouped.has(order.groupId)) grouped.set(order.groupId, [])
      grouped.get(order.groupId).push(order)
    })

    return Array.from(grouped.values())
      .map((group) => group.sort((a, b) => a.startTime.localeCompare(b.startTime)))
      .sort((a, b) => {
        const aFirst = a[0]
        const bFirst = b[0]
        
        // เรียงตามสถานะก่อน: pending > confirmed > cancelled
        const aStatus = groupStatus(a)
        const bStatus = groupStatus(b)
        const statusPriority = { pending: 0, confirmed: 1, cancelled: 2 }
        
        if (aStatus !== bStatus) {
          return statusPriority[aStatus] - statusPriority[bStatus]
        }
        
        // ถ้าสถานะเดียวกัน เรียงตามวันที่ (ใหม่ก่อน)
        if (aFirst.date !== bFirst.date) return bFirst.date.localeCompare(aFirst.date)
        
        // ถ้าวันเดียวกัน เรียงตามเวลา (เร็วก่อน)
        return aFirst.startTime.localeCompare(bFirst.startTime)
      })
  }

  const groupStatus = (group) => {
    if (group.some((order) => order.status === 'pending')) return 'pending'
    if (group.some((order) => order.status === 'confirmed')) return 'confirmed'
    return 'cancelled'
  }

  const getFilteredGroups = () => {
    const query = search.trim().toLowerCase()
    const groups = groupOrders(orders)

    return groups.filter((group) => {
      if (filterDate && !group.some((order) => order.date === filterDate)) return false
      if (filterStatus !== 'all' && groupStatus(group) !== filterStatus) return false

      if (!query) return true
      return group.some((order) => [
        order.id,
        order.groupId,
        order.name,
        order.phone
      ].some((value) => String(value || '').toLowerCase().includes(query)))
    })
  }

  const getStats = () => {
    const groups = groupOrders(orders)
    const stats = groups.reduce((acc, group) => {
      const status = groupStatus(group)
      acc.total += 1
      acc[status] += 1
      return acc
    }, { total: 0, pending: 0, confirmed: 0, cancelled: 0 })

    const revenue = orders
      .filter((order) => order.status === 'confirmed')
      .reduce((sum, order) => sum + order.price, 0)

    return { ...stats, revenue }
  }

  const handleUpdateStatus = async (group, newStatus) => {
    try {
      const bookingIds = group.map(order => order.id)
      await updateBookingStatus(bookingIds, newStatus)
      setModal(null)
      showToast(`อัปเดตเป็น "${STATUS[newStatus].label}" แล้ว`, newStatus === 'cancelled' ? 'danger' : 'success')
    } catch (error) {
      showToast(error.message || 'อัปเดตสถานะไม่สำเร็จ', 'danger')
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  const handleWeeklyBooking = async (weeklyData) => {
    try {
      const { name, phone, startDate, dayOfWeek, startTime, endTime, weeks } = weeklyData

      // แปลงเวลาเป็นนาที (รองรับ 24:00)
      const parseTime = (timeStr) => {
        const [hour, minute] = timeStr.split(':').map(Number)
        return (hour * 60) + minute
      }

      // คำนวณวันที่ทั้งหมดที่จะจอง
      const bookingDates = []
      const startDateObj = parseLocalDate(startDate)
      
      // หาวัน dayOfWeek แรก (0=อาทิตย์, 1=จันทร์, ...)
      let currentDate = new Date(startDateObj)
      const targetDay = dayOfWeek
      const currentDay = currentDate.getDay()
      const daysUntilTarget = (targetDay - currentDay + 7) % 7
      
      if (daysUntilTarget > 0) {
        currentDate.setDate(currentDate.getDate() + daysUntilTarget)
      }

      // สร้างรายการวันที่ทั้งหมด
      for (let i = 0; i < weeks; i++) {
        bookingDates.push(dateKey(new Date(currentDate)))
        currentDate.setDate(currentDate.getDate() + 7)
      }

      // ตรวจสอบ Conflict
      const conflicts = []
      const startMinute = parseTime(startTime)
      const endMinute = parseTime(endTime)

      bookingDates.forEach(date => {
        const dateBookings = Object.values(bookings).filter(
          b => b.date === date && b.status !== 'cancelled'
        )

        dateBookings.forEach(booking => {
          const bookedStart = timeToMinutes(booking.startTime)
          const bookedEnd = timeToMinutes(booking.endTime)

          // ตรวจสอบว่าเวลาทับซ้อนกันหรือไม่
          if (
            (startMinute >= bookedStart && startMinute < bookedEnd) ||
            (endMinute > bookedStart && endMinute <= bookedEnd) ||
            (startMinute <= bookedStart && endMinute >= bookedEnd)
          ) {
            conflicts.push({
              date,
              time: `${booking.startTime} - ${booking.endTime}`,
              name: booking.name
            })
          }
        })
      })

      // ถ้ามี Conflict
      if (conflicts.length > 0) {
        const conflictMsg = conflicts
          .map(c => `${thaiDate(parseLocalDate(c.date))} เวลา ${c.time} (${c.name})`)
          .join('\n')
        
        throw new Error(
          `ไม่สามารถจองได้ เนื่องจากมีการจองในวันที่ดังต่อไปนี้:\n\n${conflictMsg}\n\nกรุณาเลือกเวลาหรือจำนวนสัปดาห์ใหม่`
        )
      }

      // สร้างการจองทั้งหมด
      const hourlyPrice = startMinute < (18 * 60) ? PRICE_DAY : PRICE_NIGHT
      const duration = endMinute - startMinute
      const price = Math.round((hourlyPrice * duration) / 60)

      // สร้างการจองแต่ละสัปดาห์
      const allBookings = []
      for (const date of bookingDates) {
        const booking = {
          name: name.trim(),
          phone,
          date,
          startTime,
          endTime,
          price
        }
        allBookings.push(booking)
      }

      // บันทึกลง Firebase ทีเดียว
      await createBooking({
        name,
        phone,
        date: bookingDates[0], // ใช้วันแรกเป็น reference
        slots: allBookings.map(b => ({
          startTime: b.startTime,
          endTime: b.endTime,
          price: b.price,
          date: b.date // เพิ่ม date เข้าไปด้วย
        }))
      })

      setShowWeeklyBookingModal(false)
      showToast(
        `จองสำเร็จ! จองรายสัปดาห์ทั้งหมด ${weeks} สัปดาห์ (${allBookings.length} ช่วงเวลา)`,
        'success'
      )
    } catch (error) {
      showToast(error.message || 'จองไม่สำเร็จ กรุณาลองใหม่', 'danger')
    }
  }

  const stats = getStats()
  const filteredGroups = getFilteredGroups()
  const dates = Array.from(new Set(orders.map((order) => order.date).filter(Boolean))).sort()

  return (
    <div className="admin-shell">
      <HeroSection onAdminClick={() => setShowAdminModal(true)} />

      <section className="admin-stats">
        <div className="admin-stats-inner">
          <article className="stat-card">
            <span className="stat-icon">📋</span>
            <strong>{stats.total}</strong>
            <span>กลุ่มการจองทั้งหมด</span>
          </article>
          <article className="stat-card pending">
            <span className="stat-icon">🟡</span>
            <strong>{stats.pending}</strong>
            <span>กลุ่มรอตรวจสอบ</span>
          </article>
          <article className="stat-card confirmed">
            <span className="stat-icon">🟢</span>
            <strong>{stats.confirmed}</strong>
            <span>กลุ่มยืนยันแล้ว</span>
          </article>
          <article className="stat-card cancelled">
            <span className="stat-icon">🔴</span>
            <strong>{stats.cancelled}</strong>
            <span>กลุ่มยกเลิกแล้ว</span>
          </article>
          <article className="stat-card revenue">
            <span className="stat-icon">💰</span>
            <strong>{money(stats.revenue)} บาท</strong>
            <span>รายได้ที่ยืนยันแล้ว</span>
          </article>
        </div>
      </section>

      <main className="admin-main">
        <section className="admin-filter">
          <label className="admin-filter-field search">
            <span>ค้นหา</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ชื่อ / เบอร์ / รหัสจอง"
            />
          </label>

          <label className="admin-filter-field">
            <span>วันที่</span>
            <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
              <option value="">ทุกวัน</option>
              {dates.map(date => (
                <option key={date} value={date}>{thaiDate(parseLocalDate(date))}</option>
              ))}
            </select>
          </label>

          <label className="admin-filter-field">
            <span>สถานะ</span>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">ทั้งหมด</option>
              <option value="pending">รอตรวจสอบ</option>
              <option value="confirmed">ยืนยันแล้ว</option>
              <option value="cancelled">ยกเลิก</option>
            </select>
          </label>

          <button
            className="btn btn-muted"
            type="button"
            onClick={() => {
              setSearch('')
              setFilterDate('')
              setFilterStatus('all')
            }}
          >
            ล้าง
          </button>

          <button
            className="btn btn-primary"
            type="button"
            onClick={() => setShowWeeklyBookingModal(true)}
            style={{ marginLeft: 'auto' }}
          >
            📅 จองรายสัปดาห์
          </button>

          <span className="admin-count">{filteredGroups.length} กลุ่ม</span>
        </section>

        <section className="admin-list">
          {filteredGroups.length === 0 && (
            <div className="empty-state">ไม่พบรายการจองตามตัวกรองนี้</div>
          )}

          {filteredGroups.map((group) => (
            <AdminBookingCard
              key={group[0].groupId}
              group={group}
              onAction={(type) => setModal({ type, group })}
            />
          ))}
        </section>
      </main>

      {modal && (
        <AdminModal
          modal={modal}
          onClose={() => setModal(null)}
          onConfirm={() => {
            const config = getModalConfig(modal.type)
            handleUpdateStatus(modal.group, config.nextStatus)
          }}
        />
      )}

      {toast.show && (
        <div className={`admin-toast ${toast.type}`}>{toast.message}</div>
      )}

      <AdminLoginModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />

      <WeeklyBookingModal
        isOpen={showWeeklyBookingModal}
        onClose={() => setShowWeeklyBookingModal(false)}
        onConfirm={handleWeeklyBooking}
      />
    </div>
  )
}

function AdminBookingCard({ group, onAction }) {
  const first = group[0]
  const status = groupStatus(group)
  const total = group.reduce((sum, order) => sum + order.price, 0)
  const isAllCancelled = group.every((order) => order.status === 'cancelled')
  const isAllConfirmed = group.every((order) => order.status === 'confirmed')

  return (
    <article className={`admin-booking-card ${status}`}>
      <div className="admin-booking-head">
        <span className="admin-booking-id">#{first.groupId}</span>
        <strong className="admin-booking-name">{first.name}</strong>
        <span className="admin-booking-phone">{first.phone}</span>
        <span className={`admin-status ${STATUS[status].color}`}>
          {STATUS[status].label}
        </span>
        <span className="admin-booking-date">{thaiDate(parseLocalDate(first.date))}</span>
      </div>

      <div className="admin-slot-tags">
        {mergeSlotRanges(group).map((order, index) => (
          <div key={index} className={`admin-slot-tag ${order.isNight ? 'night' : 'day'}`}>
            <strong>{order.startTime} - {order.endTime}</strong>
            <span>{money(order.price)} บาท</span>
          </div>
        ))}
      </div>

      <div className="admin-booking-foot">
        <span className="admin-total-label">รวม</span>
        <strong className="admin-total-value">{money(total)} บาท</strong>
        <div className="admin-card-actions">
          {isAllCancelled ? (
            <button
              className="admin-action neutral"
              onClick={() => onAction('undo')}
            >
              คืนสถานะ
            </button>
          ) : (
            <>
              <button
                className="admin-action confirm"
                disabled={isAllConfirmed}
                onClick={() => onAction('confirm')}
              >
                ยืนยัน
              </button>
              <button
                className="admin-action cancel"
                onClick={() => onAction('cancel')}
              >
                ยกเลิก
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

function AdminModal({ modal, onClose, onConfirm }) {
  const config = getModalConfig(modal.type)
  const first = modal.group[0]

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <section className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-icon">{config.icon}</div>
        <h2>{config.title}</h2>
        <p>{config.copy}</p>

        <div className="admin-modal-info">
          <div>รหัส: #{first.groupId}</div>
          <div>ชื่อ: {first.name}</div>
          <div>เบอร์: {first.phone}</div>
          <div>วันที่: {thaiDate(parseLocalDate(first.date))}</div>
          <div>จำนวน: {modal.group.length} ช่วงเวลา</div>
        </div>

        <div className="btn-row">
          <button className="btn btn-muted" onClick={onClose}>
            ไม่ใช่
          </button>
          <button className={config.buttonClass} onClick={onConfirm}>
            {config.buttonText}
          </button>
        </div>
      </section>
    </div>
  )
}

function getModalConfig(type) {
  const map = {
    confirm: {
      icon: '✅',
      title: 'ยืนยันการจอง?',
      copy: 'รายการนี้จะถูกเปลี่ยนเป็นสถานะยืนยันแล้ว',
      nextStatus: 'confirmed',
      buttonText: 'ยืนยันเลย',
      buttonClass: 'btn btn-primary'
    },
    cancel: {
      icon: '✕',
      title: 'ยกเลิกการจอง?',
      copy: 'รายการนี้จะถูกยกเลิก และช่วงเวลาจะกลับไปว่างบนหน้าจอง',
      nextStatus: 'cancelled',
      buttonText: 'ยกเลิกเลย',
      buttonClass: 'btn admin-danger'
    },
    undo: {
      icon: '↩',
      title: 'คืนสถานะเป็นรอตรวจสอบ?',
      copy: 'รายการนี้จะกลับไปอยู่ในสถานะรอตรวจสอบอีกครั้ง',
      nextStatus: 'pending',
      buttonText: 'คืนสถานะ',
      buttonClass: 'btn btn-primary'
    }
  }
  return map[type]
}

function groupStatus(group) {
  if (group.some((order) => order.status === 'pending')) return 'pending'
  if (group.some((order) => order.status === 'confirmed')) return 'confirmed'
  return 'cancelled'
}

// Weekly Booking Modal Component
function WeeklyBookingModal({ isOpen, onClose, onConfirm }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    startDate: '',
    dayOfWeek: 1, // จันทร์
    startTime: '18:00',
    endTime: '19:00',
    weeks: 20
  })
  const [errors, setErrors] = useState({})

  // สร้างรายการเวลา 16:00-24:00 (เพิ่มทีละ 30 นาที)
  const generateTimeOptions = () => {
    const times = []
    for (let hour = 16; hour < 24; hour++) {
      times.push(`${String(hour).padStart(2, '0')}:00`)
      times.push(`${String(hour).padStart(2, '0')}:30`)
    }
    times.push('24:00')
    return times
  }

  const timeOptions = generateTimeOptions()

  useEffect(() => {
    if (isOpen) {
      // ตั้งค่า startDate เป็นวันจันทร์หน้า
      const today = new Date()
      const nextMonday = new Date(today)
      const daysUntilMonday = (8 - today.getDay()) % 7 || 7
      nextMonday.setDate(today.getDate() + daysUntilMonday)
      
      setFormData(prev => ({
        ...prev,
        startDate: dateKey(nextMonday)
      }))
      setErrors({})
    }
  }, [isOpen])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'กรุณากรอกชื่อ-นามสกุล'
    }

    if (!/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'เบอร์โทรต้องเป็นตัวเลข 10 หลักและขึ้นต้นด้วย 0'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'กรุณาเลือกวันที่เริ่มต้น'
    }

    // แปลงเวลาเป็นนาที (รองรับ 24:00)
    const parseTime = (timeStr) => {
      const [hour, minute] = timeStr.split(':').map(Number)
      return (hour * 60) + minute
    }

    const startMinute = parseTime(formData.startTime)
    const endMinute = parseTime(formData.endTime)

    if (endMinute <= startMinute) {
      newErrors.time = 'เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น'
    } else if (endMinute - startMinute < 30) {
      newErrors.time = 'ต้องจองอย่างน้อย 30 นาที'
    }

    if (formData.weeks < 1 || formData.weeks > 52) {
      newErrors.weeks = 'จำนวนสัปดาห์ต้องอยู่ระหว่าง 1-52'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onConfirm(formData)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const calculateTotalPrice = () => {
    // แปลงเวลาเป็นนาที (รองรับ 24:00)
    const parseTime = (timeStr) => {
      const [hour, minute] = timeStr.split(':').map(Number)
      return (hour * 60) + minute
    }

    const startMinute = parseTime(formData.startTime)
    const endMinute = parseTime(formData.endTime)

    const hourlyPrice = startMinute < (18 * 60) ? PRICE_DAY : PRICE_NIGHT
    const duration = endMinute - startMinute
    const pricePerWeek = Math.round((hourlyPrice * duration) / 60)
    return pricePerWeek * formData.weeks
  }

  if (!isOpen) return null

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <section className="admin-modal weekly-booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-icon">📅</div>
        <h2>จองรายสัปดาห์</h2>
        <p>จองสนามแบบล็อกยาวหลายสัปดาห์ในวันและเวลาเดียวกัน</p>

        <form onSubmit={handleSubmit} className="weekly-booking-form">
          <div className="form-group">
            <label>
              ชื่อ-นามสกุล <span className="required">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="กรอกชื่อ-นามสกุล"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>
              เบอร์โทรศัพท์ <span className="required">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', normalizePhone(e.target.value))}
              placeholder="0812345678"
              maxLength="10"
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label>
              วันที่เริ่มต้น <span className="required">*</span>
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              min={dateKey(new Date())}
              className={errors.startDate ? 'error' : ''}
            />
            {errors.startDate && <span className="error-text">{errors.startDate}</span>}
          </div>

          <div className="form-group">
            <label>
              วันในสัปดาห์ <span className="required">*</span>
            </label>
            <select
              value={formData.dayOfWeek}
              onChange={(e) => handleChange('dayOfWeek', Number(e.target.value))}
            >
              {THAI_DAYS_FULL.map((day, index) => (
                <option key={index} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                เวลาเริ่มต้น <span className="required">*</span>
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className={errors.time ? 'error' : ''}
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                เวลาสิ้นสุด <span className="required">*</span>
              </label>
              <select
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                className={errors.time ? 'error' : ''}
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {errors.time && <span className="error-text">{errors.time}</span>}

          <div className="form-group">
            <label>
              จำนวนสัปดาห์ <span className="required">*</span>
            </label>
            <input
              type="number"
              value={formData.weeks}
              onChange={(e) => handleChange('weeks', Number(e.target.value))}
              min="1"
              max="52"
              className={errors.weeks ? 'error' : ''}
            />
            {errors.weeks && <span className="error-text">{errors.weeks}</span>}
          </div>

          <div className="booking-summary">
            <div className="summary-row">
              <span>วัน:</span>
              <strong>{THAI_DAYS_FULL[formData.dayOfWeek]}</strong>
            </div>
            <div className="summary-row">
              <span>เวลา:</span>
              <strong>{formData.startTime} - {formData.endTime}</strong>
            </div>
            <div className="summary-row">
              <span>จำนวนสัปดาห์:</span>
              <strong>{formData.weeks} สัปดาห์</strong>
            </div>
            <div className="summary-row total">
              <span>ราคารวม:</span>
              <strong>{money(calculateTotalPrice())} บาท</strong>
            </div>
          </div>

          <div className="btn-row">
            <button type="button" className="btn btn-muted" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary">
              ตรวจสอบและจอง
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

