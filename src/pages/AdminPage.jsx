import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooking } from '../contexts/BookingContext'
import { money, timeToMinutes, mergeSlotRanges, thaiDate, parseLocalDate } from '../utils/helpers'
import { PRICE_DAY, PRICE_NIGHT, SLOT_MINUTES } from '../constants/booking'
import HeroSection from '../components/HeroSection'
import AdminLoginModal from '../components/AdminLoginModal'

const STATUS = {
  pending: { label: 'รอตรวจสอบ', color: 'pending' },
  confirmed: { label: 'ยืนยันแล้ว', color: 'confirmed' },
  cancelled: { label: 'ยกเลิก', color: 'cancelled' }
}

export default function AdminPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [showAdminModal, setShowAdminModal] = useState(false)

  const { bookings, subscribeToAllBookings, updateBookingStatus } = useBooking()

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
