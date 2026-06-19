(function () {
  'use strict';

  const firebaseConfig = {
    apiKey: 'AIzaSyBHHkgs8r_NelrV7xDd_SD0p67-HBFvEAg',
    authDomain: 'bookingviewtanarena.firebaseapp.com',
    databaseURL: 'https://bookingviewtanarena-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'bookingviewtanarena',
    storageBucket: 'bookingviewtanarena.firebasestorage.app',
    messagingSenderId: '524767957686',
    appId: '1:524767957686:web:6358642c4abaac1ba88c17',
    measurementId: 'G-9H2WJ2YBRZ',
  };

  const PRICE_DAY = 800;
  const PRICE_NIGHT = 1000;
  const SLOT_MINUTES = 30;
  const OPEN_MINUTE = 6 * 60;
  const CLOSE_MINUTE = 24 * 60;

  function isConfigured() {
    return Boolean(firebaseConfig.projectId && firebaseConfig.databaseURL && firebaseConfig.databaseURL.startsWith('https://'));
  }

  function buildUrl(path, queryParams) {
    const base = firebaseConfig.databaseURL.replace(/\/+$/, '');
    const cleanPath = String(path).replace(/^\/+/, '');
    const url = new URL(`${base}/${cleanPath}`);

    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    return url.toString();
  }

  async function request(path, options = {}, queryParams = null) {
    if (!isConfigured()) {
      return null;
    }

    const response = await fetch(buildUrl(path, queryParams), {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'ไม่สามารถเชื่อมต่อ Firebase ได้');
    }

    return response.json();
  }

  function normalizePhone(value) {
    return String(value || '').replace(/\D+/g, '').slice(0, 10);
  }

  async function fetchBookingsByDate(date) {
    const data = await request('bookings.json', {}, {
      orderBy: '"date"',
      equalTo: `"${date}"`,
    });

    return data || {};
  }

  async function fetchBookingsByPhone(phone) {
    const data = await request('bookings.json', {}, {
      orderBy: '"phone"',
      equalTo: `"${phone}"`,
    });

    return data || {};
  }

  async function fetchAllBookings() {
    const data = await request('bookings.json');
    return data || {};
  }

  async function patchBookings(updates) {
    if (!updates || Object.keys(updates).length === 0) {
      return null;
    }

    return request('bookings.json', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  function timeToMinutes(time) {
    const [hour, minute] = String(time || '').split(':').map(Number);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    return (hour * 60) + minute;
  }

  function minutesToTime(totalMinutes) {
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  function getSlotPrice(startTime) {
    const startMinute = timeToMinutes(startTime);
    const hourlyPrice = startMinute < (18 * 60) ? PRICE_DAY : PRICE_NIGHT;
    return Math.round((hourlyPrice * SLOT_MINUTES) / 60);
  }

  function normalizeSlot(slot) {
    const startTime = String(slot.startTime || '');
    const startMinute = timeToMinutes(startTime);
    const endTime = Number.isFinite(startMinute) ? minutesToTime(startMinute + SLOT_MINUTES) : '';

    return {
      startTime,
      endTime,
      price: getSlotPrice(startTime),
    };
  }

  function normalizeSlots(slots) {
    const seen = new Set();

    return (slots || []).reduce((validSlots, slot) => {
      const normalized = normalizeSlot(slot);
      const startMinute = timeToMinutes(normalized.startTime);
      const isValidStartTime = Number.isFinite(startMinute)
        && startMinute >= OPEN_MINUTE
        && startMinute < CLOSE_MINUTE
        && startMinute % SLOT_MINUTES === 0;

      if (!isValidStartTime || seen.has(normalized.startTime)) {
        return validSlots;
      }

      seen.add(normalized.startTime);
      validSlots.push(normalized);
      return validSlots;
    }, []);
  }

  function generateGroupId() {
    const bytes = new Uint8Array(4);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
      return `BK${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    }

    return `BK${Date.now().toString(36).toUpperCase()}`;
  }

  function hasBookingConflict(slot, bookings) {
    const slotStart = timeToMinutes(slot.startTime);
    const slotEnd = timeToMinutes(slot.endTime);

    return Object.values(bookings || {}).some((booking) => {
      if (!booking || typeof booking !== 'object') return;
      if (booking.status !== 'confirmed') return false;

      const bookingStart = timeToMinutes(booking.startTime);
      const bookingEnd = timeToMinutes(booking.endTime) || (bookingStart + SLOT_MINUTES);
      if (!Number.isFinite(bookingStart) || !Number.isFinite(bookingEnd)) return false;

      return slotStart < bookingEnd && slotEnd > bookingStart;
    });
  }

  async function createBooking(payload) {
    if (!isConfigured()) {
      throw new Error('ยังไม่ได้ตั้งค่า Firebase Database URL ใน firebase-config.js');
    }

    const name = String(payload.name || '').trim();
    const phone = normalizePhone(payload.phone);
    const date = String(payload.date || '');
    const slots = normalizeSlots(payload.slots);

    if (!name) {
      const error = new Error('กรุณากรอกชื่อ-นามสกุล');
      error.payload = { errors: { name: error.message } };
      throw error;
    }

    if (!/^0\d{9}$/.test(phone)) {
      const error = new Error('เบอร์โทรต้องเป็นตัวเลข 10 หลักและขึ้นต้นด้วย 0');
      error.payload = { errors: { phone: error.message } };
      throw error;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('วันที่ไม่ถูกต้อง');
    }

    if (!slots.length || slots.length > ((CLOSE_MINUTE - OPEN_MINUTE) / SLOT_MINUTES)) {
      throw new Error('กรุณาเลือกช่วงเวลาให้ถูกต้อง');
    }

    const existingBookings = await fetchBookingsByDate(payload.date);
    const conflicts = slots
      .filter((slot) => hasBookingConflict(slot, existingBookings))
      .map((slot) => slot.startTime);

    if (conflicts.length) {
      const error = new Error('มีบางช่วงเวลาถูกจองไปแล้ว กรุณาเลือกใหม่');
      error.payload = { conflicts };
      throw error;
    }

    const groupId = generateGroupId();
    const createdAt = Date.now();
    const updates = {};
    const bookings = slots.map((slot) => {
      const id = `${groupId}_${slot.startTime.replace(':', '')}`;
      const booking = {
        groupId,
        name,
        phone,
        date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        price: slot.price,
        status: 'pending',
        createdAt,
        adminNote: '',
      };

      updates[id] = booking;
      return { ...booking, id };
    });

    await request('bookings.json', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    return {
      success: true,
      message: 'จองสำเร็จ',
      groupId,
      bookings,
      totalPrice: bookings.reduce((sum, booking) => sum + Number(booking.price || 0), 0),
    };
  }

  window.FirebaseBooking = {
    config: firebaseConfig,
    isConfigured,
    fetchBookingsByDate,
    fetchBookingsByPhone,
    fetchAllBookings,
    patchBookings,
    createBooking,
  };
})();
