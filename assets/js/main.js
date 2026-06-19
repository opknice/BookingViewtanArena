(function () {
  'use strict';

  const THAI_MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ];
  const THAI_DAYS_SHORT = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  const THAI_DAYS_FULL = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

  const OPEN_MINUTE = 6 * 60;
  const CLOSE_MINUTE = 24 * 60;
  const SLOT_MINUTES = 30;
  const PRICE_DAY = 800;
  const PRICE_NIGHT = 1000;

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

  function slotPrice(startTime) {
    const startMinute = timeToMinutes(startTime);
    const hourlyPrice = startMinute < (18 * 60) ? PRICE_DAY : PRICE_NIGHT;
    return Math.round((hourlyPrice * SLOT_MINUTES) / 60);
  }

  const ALL_SLOTS = Array.from({ length: (CLOSE_MINUTE - OPEN_MINUTE) / SLOT_MINUTES }, (_, index) => {
    const startMinute = OPEN_MINUTE + (index * SLOT_MINUTES);
    const startTime = minutesToTime(startMinute);
    return {
      startTime,
      endTime: minutesToTime(startMinute + SLOT_MINUTES),
      price: slotPrice(startTime),
      isNight: startMinute >= (18 * 60),
    };
  });
  const SLOT_COUNT = ALL_SLOTS.length;

  const STATUS_LABELS = {
    pending: 'รอตรวจสอบ',
    confirmed: 'ยืนยันแล้ว',
    cancelled: 'ยกเลิก',
  };

  const page = document.body.dataset.page;

  function money(value) {
    return Number(value || 0).toLocaleString('th-TH');
  }

  function mergeSlotRanges(slots) {
    const sorted = [...(slots || [])].sort((a, b) => String(a.startTime || '').localeCompare(String(b.startTime || '')));
    const ranges = [];

    sorted.forEach((slot) => {
      const last = ranges[ranges.length - 1];
      const price = Number(slot.price || 0);
      const samePricePeriod = last
        && (timeToMinutes(last.startTime) < (18 * 60)) === (timeToMinutes(slot.startTime) < (18 * 60));

      if (last && last.endTime === slot.startTime && samePricePeriod) {
        last.endTime = slot.endTime;
        last.price += price;
        last.count += 1;
        return;
      }

      ranges.push({
        startTime: slot.startTime,
        endTime: slot.endTime,
        price,
        count: 1,
      });
    });

    return ranges;
  }

  function parseLocalDate(dateKey) {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function thaiDate(date) {
    return `${THAI_DAYS_FULL[date.getDay()]}ที่ ${date.getDate()} ${THAI_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  }

  function normalizePhone(value) {
    return String(value || '').replace(/\D+/g, '').slice(0, 10);
  }

  function show(element) {
    if (element) element.hidden = false;
  }

  function hide(element) {
    if (element) element.hidden = true;
  }

  function renderContainerMessage(container, message, className = 'empty-state') {
    if (!container) return;
    container.innerHTML = '';
    container.appendChild(createElement('div', className, message));
  }

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function initBookingPage() {
    if (!window.FirebaseBooking) {
      const slotList = document.querySelector('[data-slot-list]');
      renderContainerMessage(slotList, 'โหลด Firebase helper ไม่สำเร็จ กรุณาตรวจสอบ firebase-config.js', 'empty-state error');
      return;
    }

    const today = parseLocalDate(document.body.dataset.today || dateKey(new Date()));
    const state = {
      today,
      viewMonth: { year: today.getFullYear(), month: today.getMonth() },
      selectedDate: today,
      bookedMap: {},
      pickedSlots: new Set(),
      refreshTimer: null,
      refreshSequence: 0,
      isSubmitting: false,
    };

    const els = {
      calendarTitle: document.querySelector('[data-calendar-title]'),
      calendarGrid: document.querySelector('[data-calendar-grid]'),
      prevMonth: document.querySelector('[data-prev-month]'),
      nextMonth: document.querySelector('[data-next-month]'),
      selectedDateTitle: document.querySelector('[data-selected-date-title]'),
      availableCount: document.querySelector('[data-available-count]'),
      slotList: document.querySelector('[data-slot-list]'),
      summaryBar: document.querySelector('[data-summary-bar]'),
      pickedCount: document.querySelector('[data-picked-count]'),
      summaryBreakdown: document.querySelector('[data-summary-breakdown]'),
      summaryTotal: document.querySelector('[data-summary-total]'),
      clearSelection: document.querySelector('[data-clear-selection]'),
      openBookingModal: document.querySelector('[data-open-booking-modal]'),
      bookingModal: document.querySelector('[data-booking-modal]'),
      closeBookingModal: document.querySelector('[data-close-booking-modal]'),
      bookingForm: document.querySelector('[data-booking-form]'),
      submitBooking: document.querySelector('[data-submit-booking]'),
      modalDate: document.querySelector('[data-modal-date]'),
      modalSlots: document.querySelector('[data-modal-slots]'),
      modalSlotCount: document.querySelector('[data-modal-slot-count]'),
      modalTotal: document.querySelector('[data-modal-total]'),
      formMessage: document.querySelector('[data-form-message]'),
      confirmModal: document.querySelector('[data-confirm-modal]'),
      closeConfirmModal: document.querySelector('[data-close-confirm-modal]'),
      confirmId: document.querySelector('[data-confirm-id]'),
      confirmName: document.querySelector('[data-confirm-name]'),
      confirmDate: document.querySelector('[data-confirm-date]'),
      confirmSlots: document.querySelector('[data-confirm-slots]'),
      confirmCount: document.querySelector('[data-confirm-count]'),
      confirmTotal: document.querySelector('[data-confirm-total]'),
      confirmStatusLink: document.querySelector('[data-confirm-status-link]'),
    };

    function getPickedList() {
      return ALL_SLOTS.filter((slot) => state.pickedSlots.has(slot.startTime));
    }

    function getTotals() {
      const pickedList = getPickedList();
      const day = pickedList.filter((slot) => !slot.isNight);
      const night = pickedList.filter((slot) => slot.isNight);

      return {
        pickedList,
        day,
        night,
        totalDay: day.reduce((sum, slot) => sum + slot.price, 0),
        totalNight: night.reduce((sum, slot) => sum + slot.price, 0),
        totalPrice: pickedList.reduce((sum, slot) => sum + slot.price, 0),
      };
    }

    function isPast(day) {
      const target = new Date(state.viewMonth.year, state.viewMonth.month, day);
      const todayOnly = new Date(state.today.getFullYear(), state.today.getMonth(), state.today.getDate());
      return target < todayOnly;
    }

    function changeMonth(direction) {
      let nextMonth = state.viewMonth.month + direction;
      let nextYear = state.viewMonth.year;

      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear += 1;
      }

      if (nextMonth < 0) {
        nextMonth = 11;
        nextYear -= 1;
      }

      state.viewMonth = { year: nextYear, month: nextMonth };
      renderCalendar();
    }

    function selectDay(day) {
      if (isPast(day)) return;

      state.selectedDate = new Date(state.viewMonth.year, state.viewMonth.month, day);
      state.pickedSlots.clear();
      renderCalendar();
      refreshBookings();
      renderSummary();
    }

    function renderCalendar() {
      const { year, month } = state.viewMonth;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstWeekday = new Date(year, month, 1).getDay();

      els.calendarTitle.textContent = `${THAI_MONTHS[month]} ${year}`;
      els.calendarGrid.innerHTML = '';

      THAI_DAYS_SHORT.forEach((dayName) => {
        const cell = document.createElement('div');
        cell.className = 'cal-day-name';
        cell.textContent = dayName;
        els.calendarGrid.appendChild(cell);
      });

      Array.from({ length: firstWeekday }).forEach(() => {
        els.calendarGrid.appendChild(document.createElement('div'));
      });

      for (let day = 1; day <= daysInMonth; day += 1) {
        const button = document.createElement('button');
        const selected = state.selectedDate.getFullYear() === year
          && state.selectedDate.getMonth() === month
          && state.selectedDate.getDate() === day;
        const isToday = state.today.getFullYear() === year
          && state.today.getMonth() === month
          && state.today.getDate() === day;
        const past = isPast(day);

        button.type = 'button';
        button.className = [
          'cal-day',
          selected ? 'selected' : '',
          isToday && !selected ? 'today' : '',
          past ? 'past' : '',
        ].filter(Boolean).join(' ');
        button.textContent = String(day);
        button.disabled = past;
        button.addEventListener('click', () => selectDay(day));
        els.calendarGrid.appendChild(button);
      }
    }

    function buildBookedMap(bookings) {
      const map = {};
      Object.values(bookings || {}).forEach((booking) => {
        if (!booking || typeof booking !== 'object') return;
        if (booking.status !== 'confirmed') return;

        const bookedStart = timeToMinutes(booking.startTime);
        const bookedEnd = timeToMinutes(booking.endTime) || (bookedStart + SLOT_MINUTES);
        if (!Number.isFinite(bookedStart) || !Number.isFinite(bookedEnd)) return;

        ALL_SLOTS.forEach((slot) => {
          const slotStart = timeToMinutes(slot.startTime);
          const slotEnd = timeToMinutes(slot.endTime);
          const overlaps = slotStart < bookedEnd && slotEnd > bookedStart;

          if (overlaps) {
            map[slot.startTime] = {
              status: booking.status,
              name: String(booking.name || '').trim(),
            };
          }
        });
      });
      return map;
    }

    function bookedMapsAreEqual(a, b) {
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);

      if (aKeys.length !== bKeys.length) return false;
      return aKeys.every((key) => {
        const aValue = a[key] || {};
        const bValue = b[key] || {};
        return aValue.status === bValue.status && aValue.name === bValue.name;
      });
    }

    function removeUnavailablePickedSlots() {
      let changed = false;

      state.pickedSlots.forEach((startTime) => {
        if (state.bookedMap[startTime]) {
          state.pickedSlots.delete(startTime);
          changed = true;
        }
      });

      return changed;
    }

    async function refreshBookings(options = {}) {
      const silent = Boolean(options.silent);
      const force = Boolean(options.force);
      const requestId = ++state.refreshSequence;
      const selectedKey = dateKey(state.selectedDate);
      els.selectedDateTitle.textContent = thaiDate(state.selectedDate);

      if (!silent) {
        els.slotList.innerHTML = '<div class="empty-state">กำลังโหลดตารางเวลา...</div>';
      }

      try {
        const bookings = await window.FirebaseBooking.fetchBookingsByDate(selectedKey);
        if (requestId !== state.refreshSequence) return;

        const nextBookedMap = buildBookedMap(bookings);
        const hasBookingChanges = !bookedMapsAreEqual(state.bookedMap, nextBookedMap);
        state.bookedMap = nextBookedMap;
        const hasSelectionChanges = removeUnavailablePickedSlots();

        if (!force && silent && !hasBookingChanges && !hasSelectionChanges) {
          return;
        }

        renderSlots();
        renderSummary();
      } catch (error) {
        if (requestId !== state.refreshSequence) return;

        if (silent) {
          return;
        }

        state.bookedMap = {};
        renderContainerMessage(
          els.slotList,
          `โหลดข้อมูล Firebase ไม่สำเร็จ: ${error.message || 'กรุณาตรวจสอบ config'}`,
          'empty-state error',
        );
      }
    }

    function renderSlots() {
      const availableCount = ALL_SLOTS.filter((slot) => !state.bookedMap[slot.startTime]).length;
      els.availableCount.textContent = `${availableCount} / ${SLOT_COUNT} ว่าง`;
      els.slotList.innerHTML = '';

      appendSection('day', 'กลางวัน', '800 บาท/ชม.');
      ALL_SLOTS.filter((slot) => !slot.isNight).forEach(appendSlotRow);

      const divider = document.createElement('hr');
      divider.className = 'nightline';
      els.slotList.appendChild(divider);

      appendSection('night', 'กลางคืน', '1000 บาท/ชม.');
      ALL_SLOTS.filter((slot) => slot.isNight).forEach(appendSlotRow);
    }

    function appendSection(type, label, priceText) {
      const section = document.createElement('div');
      section.className = `slot-section ${type}`;
      section.innerHTML = `<span></span><strong>${label}</strong><small>${priceText}</small>`;
      els.slotList.appendChild(section);
    }

    function appendSlotRow(slot) {
      const bookingInfo = state.bookedMap[slot.startTime];
      const status = bookingInfo?.status || '';
      const selected = state.pickedSlots.has(slot.startTime);
      const row = document.createElement('button');
      const statusText = status === 'confirmed'
        ? `ถูกจองแล้ว${bookingInfo.name ? ` (${bookingInfo.name})` : ''}`
        : selected
          ? 'เลือกแล้ว'
          : 'ว่าง';

      row.type = 'button';
      row.className = [
        'slot-row',
        status ? 'booked' : 'available',
        selected ? 'selected' : '',
        status ? `status-${status}` : '',
        slot.isNight ? 'night' : 'day',
      ].filter(Boolean).join(' ');
      row.disabled = Boolean(status);
      row.innerHTML = `
        <span class="slot-check">${selected ? '✓' : ''}</span>
        <span class="slot-time">${slot.startTime} - ${slot.endTime}</span>
        <span class="slot-status">${statusText}</span>
      `;
      row.addEventListener('click', () => toggleSlot(slot));
      els.slotList.appendChild(row);
    }

    function toggleSlot(slot) {
      if (state.bookedMap[slot.startTime]) return;

      if (state.pickedSlots.has(slot.startTime)) {
        state.pickedSlots.delete(slot.startTime);
      } else {
        state.pickedSlots.add(slot.startTime);
      }

      renderSlots();
      renderSummary();
    }

    function renderSummary() {
      const totals = getTotals();

      if (totals.pickedList.length === 0) {
        hide(els.summaryBar);
        return;
      }

      els.pickedCount.textContent = `${totals.pickedList.length} ช่วงเวลา`;
      els.summaryTotal.textContent = money(totals.totalPrice);

      const parts = [];
      if (totals.day.length) {
        parts.push(`กลางวัน ${totals.day.length} ช่วง = ${money(totals.totalDay)} บาท`);
      }
      if (totals.night.length) {
        parts.push(`กลางคืน ${totals.night.length} ช่วง = ${money(totals.totalNight)} บาท`);
      }
      els.summaryBreakdown.textContent = parts.join(' | ');

      show(els.summaryBar);
    }

    function renderModalSummary() {
      const totals = getTotals();
      els.modalDate.textContent = thaiDate(state.selectedDate);
      els.modalSlots.innerHTML = '';

      appendModalGroup('day', 'กลางวัน - 800 บาท/60 นาที', totals.day);
      appendModalGroup('night', 'กลางคืน - 1000 บาท/60 นาที', totals.night);

      els.modalSlotCount.textContent = `รวม`;
      els.modalTotal.textContent = `${money(totals.totalPrice)} บาท`;
    }

    function appendModalGroup(type, title, slots) {
      if (!slots.length) return;

      const group = document.createElement('div');
      group.className = `modal-slot-group ${type}`;
      group.innerHTML = `<div class="modal-slot-title">${title}</div>`;

      mergeSlotRanges(slots).forEach((slot) => {
        const line = document.createElement('div');
        line.className = 'modal-slot-line';
        line.innerHTML = `<span>${slot.startTime} - ${slot.endTime}</span><strong>${money(slot.price)} บาท</strong>`;
        group.appendChild(line);
      });

      els.modalSlots.appendChild(group);
    }

    function setFieldError(name, message) {
      const input = els.bookingForm.elements[name];
      const error = els.bookingForm.querySelector(`[data-error-for="${name}"]`);
      if (input) input.classList.toggle('invalid', Boolean(message));
      if (error) error.textContent = message || '';
    }

    function validateForm() {
      const name = els.bookingForm.elements.name.value.trim();
      const phone = normalizePhone(els.bookingForm.elements.phone.value);
      const errors = {};

      els.bookingForm.elements.phone.value = phone;

      if (!name) errors.name = 'กรุณากรอกชื่อ-นามสกุล';
      if (!/^0\d{9}$/.test(phone)) errors.phone = 'เบอร์โทรต้องเป็นตัวเลข 10 หลักและขึ้นต้นด้วย 0';

      setFieldError('name', errors.name);
      setFieldError('phone', errors.phone);
      return { valid: Object.keys(errors).length === 0, name, phone };
    }

    function openBookingModal() {
      if (!state.pickedSlots.size) return;
      els.bookingForm.reset();
      setFieldError('name', '');
      setFieldError('phone', '');
      els.formMessage.textContent = '';
      renderModalSummary();
      show(els.bookingModal);
      window.setTimeout(() => els.bookingForm.elements.name.focus(), 50);
    }

    function closeBookingModal() {
      hide(els.bookingModal);
    }

    async function submitBooking(event) {
      event.preventDefault();
      if (state.isSubmitting) return;

      const result = validateForm();
      if (!result.valid) return;

      const totals = getTotals();
      state.isSubmitting = true;
      els.submitBooking.disabled = true;
      els.submitBooking.textContent = 'กำลังบันทึก...';
      els.formMessage.textContent = '';

      try {
        const response = await window.FirebaseBooking.createBooking({
          name: result.name,
          phone: result.phone,
          date: dateKey(state.selectedDate),
          slots: totals.pickedList.map((slot) => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        });

        state.pickedSlots.clear();

        closeBookingModal();
        renderSlots();
        renderSummary();
        showConfirm(response, result.name, result.phone);
      } catch (error) {
        if (error.payload && error.payload.errors) {
          Object.entries(error.payload.errors).forEach(([key, message]) => setFieldError(key, message));
        }
        els.formMessage.textContent = error.message || 'บันทึกการจองไม่สำเร็จ';
        await refreshBookings();
      } finally {
        state.isSubmitting = false;
        els.submitBooking.disabled = false;
        els.submitBooking.textContent = 'ยืนยันการจอง';
      }
    }


    // ===== TELEGRAM NOTIFICATION =====
function sendTelegramNotification(response, name, phone, date, slots, total) {
  const WORKER_URL = 'https://telegram-notifier.thanakrit-kas.workers.dev';

  const slotLines = mergeSlotRanges(slots)
    .map((s) => `  • ${s.startTime} - ${s.endTime} (${money(s.price)} บาท)`)
    .join('\n');

  const message =
    `🔔 *มีการจองใหม่!*\n` +
    `━━━━━━━━━━━━━━━\n` +
    `📌 รหัส: #${response.groupId}\n` +
    `👤 ชื่อ: ${name}\n` +
    `📞 โทร: ${phone}\n` +
    `📅 วันที่: ${date}\n` +
    `⏰ ช่วงเวลา:\n${slotLines}\n` +
    `━━━━━━━━━━━━━━━\n` +
    `💰 รวม: ${money(total)} บาท\n` +
    `🔄 สถานะ: รอตรวจสอบ`;

  fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
    .then((r) => r.json())
    .then((result) => {
      if (result.ok) {
        console.log('✅ แจ้งเตือน Telegram สำเร็จ');
      } else {
        console.warn('⚠️ Telegram ตอบกลับ:', result);
      }
    })
    .catch((err) => console.warn('⚠️ ส่ง Telegram ไม่ได้:', err.message));
}
// ===== END TELEGRAM NOTIFICATION =====


    function showConfirm(response, fallbackName, phone) {
      const bookings = response.bookings || [];
      const total = Number(response.totalPrice || bookings.reduce((sum, booking) => sum + Number(booking.price || 0), 0));

      els.confirmId.textContent = `#${response.groupId}`;
      els.confirmName.textContent = bookings[0]?.name || fallbackName;
      els.confirmDate.textContent = thaiDate(state.selectedDate);
      els.confirmSlots.innerHTML = '';

      mergeSlotRanges(bookings).forEach((booking) => {
        const item = document.createElement('div');
        item.className = 'confirm-slot-item';
        item.textContent = `${booking.startTime} - ${booking.endTime} · ${money(booking.price)} บาท`;
        els.confirmSlots.appendChild(item);
      });

      els.confirmCount.textContent = `รวม`;
      els.confirmTotal.textContent = `${money(total)} บาท`;
      els.confirmStatusLink.href = `check-status.html?phone=${encodeURIComponent(phone)}`;

      sendTelegramNotification(response, bookings[0]?.name || fallbackName, phone, thaiDate(state.selectedDate), bookings, total);

      show(els.confirmModal);
    }

    els.prevMonth.addEventListener('click', () => changeMonth(-1));
    els.nextMonth.addEventListener('click', () => changeMonth(1));
    els.clearSelection.addEventListener('click', () => {
      state.pickedSlots.clear();
      renderSlots();
      renderSummary();
    });
    els.openBookingModal.addEventListener('click', openBookingModal);
    els.closeBookingModal.addEventListener('click', closeBookingModal);
    els.bookingModal.addEventListener('click', (event) => {
      if (event.target === els.bookingModal) closeBookingModal();
    });
    els.bookingForm.addEventListener('submit', submitBooking);
    els.closeConfirmModal.addEventListener('click', () => hide(els.confirmModal));

    renderCalendar();
    refreshBookings({ force: true });
    state.refreshTimer = window.setInterval(() => refreshBookings({ silent: true }), 30000);
  }

  function initStatusPage() {
    if (!window.FirebaseBooking) {
      const results = document.querySelector('[data-status-results]');
      renderContainerMessage(results, 'โหลด Firebase helper ไม่สำเร็จ กรุณาตรวจสอบ firebase-config.js', 'empty-state error');
      return;
    }

    const form = document.querySelector('[data-status-form]');
    const results = document.querySelector('[data-status-results]');
    const message = document.querySelector('[data-status-message]');
    const phoneInput = form.elements.phone;
    const initialPhone = new URLSearchParams(window.location.search).get('phone');

    if (initialPhone) {
      phoneInput.value = normalizePhone(initialPhone);
      searchStatus();
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      searchStatus();
    });

    async function searchStatus() {
      const phone = normalizePhone(phoneInput.value);
      phoneInput.value = phone;
      message.textContent = '';
      results.innerHTML = '';

      if (!/^0\d{9}$/.test(phone)) {
        message.textContent = 'กรุณากรอกเบอร์โทร 10 หลักและขึ้นต้นด้วย 0';
        return;
      }

      results.innerHTML = '<div class="empty-state">กำลังค้นหาการจอง...</div>';

      try {
        const bookings = await window.FirebaseBooking.fetchBookingsByPhone(phone);
        renderResults(groupBookings(bookings));
      } catch (error) {
        renderContainerMessage(
          results,
          `โหลดข้อมูล Firebase ไม่สำเร็จ: ${error.message || 'กรุณาตรวจสอบ config'}`,
          'empty-state error',
        );
      }
    }

    function groupBookings(bookings) {
      const groups = {};

      Object.entries(bookings || {}).forEach(([id, booking]) => {
        if (!booking || typeof booking !== 'object') return;

        const groupId = booking.groupId || id;
        if (!groups[groupId]) {
          groups[groupId] = {
            groupId,
            name: booking.name || '',
            phone: booking.phone || '',
            date: booking.date || '',
            slots: [],
          };
        }

        groups[groupId].slots.push({ id, ...booking });
      });

      return Object.values(groups)
        .map((group) => {
          group.slots.sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
          group.status = deriveGroupStatus(group.slots);
          group.total = group.slots.reduce((sum, slot) => sum + Number(slot.price || 0), 0);
          return group;
        })
        .sort((a, b) => String(b.date).localeCompare(String(a.date)));
    }

    function deriveGroupStatus(slots) {
      if (slots.some((slot) => slot.status === 'pending')) return 'pending';
      if (slots.some((slot) => slot.status === 'confirmed')) return 'confirmed';
      return 'cancelled';
    }

    function renderResults(groups) {
      results.innerHTML = '';

      if (!groups.length) {
        results.innerHTML = '<div class="empty-state">ไม่พบการจองจากเบอร์โทรนี้</div>';
        return;
      }

      groups.forEach((group) => {
        const card = document.createElement('article');
        const status = group.status || 'pending';
        const dateText = group.date ? thaiDate(parseLocalDate(group.date)) : '-';

        card.className = 'result-card';
        const top = createElement('div', 'result-top');
        const id = createElement('span', 'result-id');
        const idStrong = createElement('strong', null, `#${group.groupId}`);
        const badge = createElement('span', `status-pill ${status}`, STATUS_LABELS[status] || status);
        const title = createElement('h2', null, dateText);
        const slotWrap = createElement('div', 'result-slots');
        const total = createElement('div', 'result-total');
        const totalLabel = createElement('span', null, `รวม ${group.slots.length} ช่วงเวลา`);
        const totalValue = createElement('strong', null, `${money(group.total)} บาท`);

        id.append('รหัส ', idStrong);
        top.append(id, badge);
        total.append(totalLabel, totalValue);
        card.append(top, title, slotWrap, total);

        mergeSlotRanges(group.slots).forEach((slot) => {
          const row = createElement('div', 'result-slot');
          const time = createElement('span', null, `${slot.startTime} - ${slot.endTime}`);
          const slotStartMinute = timeToMinutes(slot.startTime);
          const price = createElement(
            'span',
            null,
            `${slotStartMinute >= (18 * 60) ? 'กลางคืน' : 'กลางวัน'} · ${money(slot.price)} บาท`,
          );

          row.append(time, price);
          slotWrap.appendChild(row);
        });

        results.appendChild(card);
      });
    }
  }

  if (page === 'booking') {
    initBookingPage();
  }

  if (page === 'status') {
    initStatusPage();
  }
})();
