(function () {
  'use strict';

  const THAI_MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ];
  const THAI_DAYS_FULL = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

  const STATUS = {
    pending: { label: 'รอตรวจสอบ', color: 'pending' },
    confirmed: { label: 'ยืนยันแล้ว', color: 'confirmed' },
    cancelled: { label: 'ยกเลิก', color: 'cancelled' },
  };
  const PRICE_DAY = 800;
  const PRICE_NIGHT = 1000;
  const SLOT_MINUTES = 30;

  const state = {
    orders: [],
    search: '',
    filterDate: '',
    filterStatus: 'all',
    modal: null,
    loading: false,
    refreshTimer: null,
  };

  const els = {
    total: document.querySelector('[data-stat-total]'),
    pending: document.querySelector('[data-stat-pending]'),
    confirmed: document.querySelector('[data-stat-confirmed]'),
    cancelled: document.querySelector('[data-stat-cancelled]'),
    revenue: document.querySelector('[data-stat-revenue]'),
    search: document.querySelector('[data-admin-search]'),
    dateFilter: document.querySelector('[data-admin-date-filter]'),
    statusFilter: document.querySelector('[data-admin-status-filter]'),
    clearFilter: document.querySelector('[data-admin-clear-filter]'),
    refresh: document.querySelector('[data-admin-refresh]'),
    count: document.querySelector('[data-admin-count]'),
    list: document.querySelector('[data-admin-list]'),
    modal: document.querySelector('[data-admin-modal]'),
    modalIcon: document.querySelector('[data-admin-modal-icon]'),
    modalTitle: document.querySelector('[data-admin-modal-title]'),
    modalCopy: document.querySelector('[data-admin-modal-copy]'),
    modalInfo: document.querySelector('[data-admin-modal-info]'),
    modalClose: document.querySelector('[data-admin-modal-close]'),
    modalConfirm: document.querySelector('[data-admin-modal-confirm]'),
    toast: document.querySelector('[data-admin-toast]'),
  };

  function money(value) {
    return Number(value || 0).toLocaleString('th-TH');
  }

  function timeToMinutes(time) {
    const [hour, minute] = String(time || '').split(':').map(Number);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
    return (hour * 60) + minute;
  }

  function fallbackPrice(startTime, endTime) {
    const startMinute = timeToMinutes(startTime);
    const endMinute = timeToMinutes(endTime) || (startMinute + SLOT_MINUTES);
    const hourlyPrice = startMinute < (18 * 60) ? PRICE_DAY : PRICE_NIGHT;
    const duration = Number.isFinite(startMinute) && Number.isFinite(endMinute)
      ? Math.max(SLOT_MINUTES, endMinute - startMinute)
      : SLOT_MINUTES;

    return Math.round((hourlyPrice * duration) / 60);
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
        isNight: slot.isNight,
      });
    });

    return ranges;
  }

  function slotsOverlap(a, b) {
    const aStart = timeToMinutes(a.startTime);
    const aEnd = timeToMinutes(a.endTime) || (aStart + SLOT_MINUTES);
    const bStart = timeToMinutes(b.startTime);
    const bEnd = timeToMinutes(b.endTime) || (bStart + SLOT_MINUTES);

    if (![aStart, aEnd, bStart, bEnd].every(Number.isFinite)) return false;
    return aStart < bEnd && aEnd > bStart;
  }

  function findConfirmedConflict(group) {
    const groupIds = new Set(group.map((order) => order.id));
    const confirmedOrders = state.orders.filter((order) => order.status === 'confirmed' && !groupIds.has(order.id));

    for (const target of group) {
      const conflict = confirmedOrders.find((order) => order.date === target.date && slotsOverlap(target, order));
      if (conflict) {
        return { target, conflict };
      }
    }

    return null;
  }

  function parseLocalDate(dateKey) {
    const [year, month, day] = String(dateKey || '').split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  function thaiDate(dateKey) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateKey || ''))) return '-';
    const date = parseLocalDate(dateKey);
    return `${THAI_DAYS_FULL[date.getDay()]}ที่ ${date.getDate()} ${THAI_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  }

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function renderContainerMessage(container, message, className = 'empty-state') {
    if (!container) return;
    container.innerHTML = '';
    container.appendChild(createElement('div', className, message));
  }

  function normalizeBooking(id, booking) {
    const startTime = String(booking.startTime || '');
    const endTime = booking.endTime || '';
    const startMinute = timeToMinutes(startTime);

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
      isNight: startMinute >= (18 * 60),
    };
  }

  async function loadBookings(options = {}) {
    const silent = Boolean(options.silent);

    if (state.loading) return;
    state.loading = true;
    els.refresh.disabled = true;

    if (!silent) {
      renderContainerMessage(els.list, 'กำลังโหลดรายการจอง...');
    }

    try {
      const data = await window.FirebaseBooking.fetchAllBookings();
      state.orders = Object.entries(data || {})
        .filter(([, booking]) => booking && typeof booking === 'object')
        .map(([id, booking]) => normalizeBooking(id, booking));

      renderDateOptions();
      render();
    } catch (error) {
      if (!silent) {
        renderContainerMessage(
          els.list,
          `โหลดข้อมูล Firebase ไม่สำเร็จ: ${error.message || 'กรุณาตรวจสอบ config'}`,
          'empty-state error',
        );
      }
    } finally {
      state.loading = false;
      els.refresh.disabled = false;
    }
  }

  function renderDateOptions() {
    const current = state.filterDate;
    const dates = Array.from(new Set(state.orders.map((order) => order.date).filter(Boolean))).sort();
    els.dateFilter.innerHTML = '';
    els.dateFilter.appendChild(new Option('ทุกวัน', ''));

    dates.forEach((date) => {
      els.dateFilter.appendChild(new Option(thaiDate(date), date));
    });

    if (dates.includes(current)) {
      els.dateFilter.value = current;
    } else {
      state.filterDate = '';
      els.dateFilter.value = '';
    }
  }

  function getFilteredGroups() {
    const query = state.search.trim().toLowerCase();
    const groups = groupOrders(state.orders);

    return groups.filter((group) => {
      if (state.filterDate && !group.some((order) => order.date === state.filterDate)) return false;
      if (state.filterStatus !== 'all' && groupStatus(group) !== state.filterStatus) return false;

      if (!query) return true;
      return group.some((order) => [
        order.id,
        order.groupId,
        order.name,
        order.phone,
      ].some((value) => String(value || '').toLowerCase().includes(query)));
    });
  }

  function groupOrders(orders) {
    const grouped = new Map();

    orders.forEach((order) => {
      if (!grouped.has(order.groupId)) grouped.set(order.groupId, []);
      grouped.get(order.groupId).push(order);
    });

    return Array.from(grouped.values())
      .map((group) => group.sort((a, b) => a.startTime.localeCompare(b.startTime)))
      .sort((a, b) => {
        const aFirst = a[0];
        const bFirst = b[0];
        if (aFirst.date !== bFirst.date) return bFirst.date.localeCompare(aFirst.date);
        return aFirst.startTime.localeCompare(bFirst.startTime);
      });
  }

  function groupStatus(group) {
    if (group.some((order) => order.status === 'pending')) return 'pending';
    if (group.some((order) => order.status === 'confirmed')) return 'confirmed';
    return 'cancelled';
  }

  function renderStats() {
    const groups = groupOrders(state.orders);
    const stats = groups.reduce((acc, group) => {
      const status = groupStatus(group);
      acc.total += 1;
      acc[status] += 1;
      return acc;
    }, { total: 0, pending: 0, confirmed: 0, cancelled: 0 });
    const revenue = state.orders
      .filter((order) => order.status === 'confirmed')
      .reduce((sum, order) => sum + order.price, 0);

    els.total.textContent = stats.total;
    els.pending.textContent = stats.pending;
    els.confirmed.textContent = stats.confirmed;
    els.cancelled.textContent = stats.cancelled;
    els.revenue.textContent = `${money(revenue)} บาท`;
  }

  function render() {
    renderStats();

    const groups = getFilteredGroups();
    const slotCount = groups.reduce((sum, group) => sum + group.length, 0);
    els.count.textContent = `${groups.length} กลุ่ม `;
    els.list.innerHTML = '';

    if (!groups.length) {
      renderContainerMessage(els.list, 'ไม่พบรายการจองตามตัวกรองนี้');
      return;
    }

    groups.forEach((group) => {
      els.list.appendChild(renderGroup(group));
    });
  }

  function renderGroup(group) {
    const first = group[0];
    const status = groupStatus(group);
    const total = group.reduce((sum, order) => sum + order.price, 0);
    const isAllCancelled = group.every((order) => order.status === 'cancelled');
    const isAllConfirmed = group.every((order) => order.status === 'confirmed');

    const card = createElement('article', `admin-booking-card ${status}`);
    const head = createElement('div', 'admin-booking-head');
    const id = createElement('span', 'admin-booking-id', `#${first.groupId}`);
    const name = createElement('strong', 'admin-booking-name', first.name);
    const phone = createElement('span', 'admin-booking-phone', first.phone);
    const badge = createElement('span', `admin-status ${STATUS[status].color}`, STATUS[status].label);
    const date = createElement('span', 'admin-booking-date', thaiDate(first.date));
    const slots = createElement('div', 'admin-slot-tags');
    const foot = createElement('div', 'admin-booking-foot');
    const totalLabel = createElement('span', 'admin-total-label', `รวม`);
    const totalValue = createElement('strong', 'admin-total-value', `${money(total)} บาท`);
    const actions = createElement('div', 'admin-card-actions');

    head.append(id, name, phone, badge, date);

    mergeSlotRanges(group).forEach((order) => {
      const tag = createElement('div', `admin-slot-tag ${order.isNight ? 'night' : 'day'}`);
      tag.append(
        createElement('span', null, order.isNight ? 'กลางคืน' : 'กลางวัน'),
        createElement('strong', null, `${order.startTime} - ${order.endTime}`),
        createElement('span', null, `${money(order.price)} บาท`),
      );
      slots.appendChild(tag);
    });

    if (isAllCancelled) {
      actions.appendChild(actionButton('คืนสถานะ', 'neutral', () => openModal('undo', group)));
    } else {
      actions.appendChild(actionButton('ยืนยัน', 'confirm', () => openModal('confirm', group), isAllConfirmed));
      actions.appendChild(actionButton('ยกเลิก', 'cancel', () => openModal('cancel', group)));
    }

    foot.append(totalLabel, totalValue, actions);
    card.append(head, slots, foot);
    return card;
  }

  function actionButton(text, type, onClick, disabled = false) {
    const button = createElement('button', `admin-action ${type}`, text);
    button.type = 'button';
    button.disabled = disabled;
    button.addEventListener('click', onClick);
    return button;
  }

  function openModal(type, group) {
    const first = group[0];
    const map = {
      confirm: {
        icon: '✅',
        title: 'ยืนยันการจอง?',
        copy: 'รายการนี้จะถูกเปลี่ยนเป็นสถานะยืนยันแล้ว',
        nextStatus: 'confirmed',
        buttonText: 'ยืนยันเลย',
        buttonClass: 'btn btn-primary',
      },
      cancel: {
        icon: '✕',
        title: 'ยกเลิกการจอง?',
        copy: 'รายการนี้จะถูกยกเลิก และช่วงเวลาจะกลับไปว่างบนหน้าจอง',
        nextStatus: 'cancelled',
        buttonText: 'ยกเลิกเลย',
        buttonClass: 'btn admin-danger',
      },
      undo: {
        icon: '↩',
        title: 'คืนสถานะเป็นรอตรวจสอบ?',
        copy: 'รายการนี้จะกลับไปอยู่ในสถานะรอตรวจสอบอีกครั้ง',
        nextStatus: 'pending',
        buttonText: 'คืนสถานะ',
        buttonClass: 'btn btn-primary',
      },
    };

    const config = map[type];
    state.modal = { type, group, config };

    els.modalIcon.textContent = config.icon;
    els.modalTitle.textContent = config.title;
    els.modalCopy.textContent = config.copy;
    els.modalInfo.innerHTML = '';
    els.modalInfo.append(
      createElement('div', null, `รหัส: #${first.groupId}`),
      createElement('div', null, `ชื่อ: ${first.name}`),
      createElement('div', null, `เบอร์: ${first.phone}`),
      createElement('div', null, `วันที่: ${thaiDate(first.date)}`),
      createElement('div', null, `จำนวน: ${group.length} ช่วงเวลา`),
    );
    els.modalConfirm.className = config.buttonClass;
    els.modalConfirm.textContent = config.buttonText;
    els.modal.hidden = false;
  }

  function closeModal() {
    state.modal = null;
    els.modal.hidden = true;
  }

  async function applyModalAction() {
    if (!state.modal) return;

    const { group, config } = state.modal;
    const conflict = config.nextStatus === 'confirmed' ? findConfirmedConflict(group) : null;
    if (conflict) {
      showToast(
        `${conflict.target.startTime} - ${conflict.target.endTime} ถูกยืนยันแล้วโดย ${conflict.conflict.name}`,
        'danger',
      );
      return;
    }

    const updates = {};
    group.forEach((order) => {
      updates[`${order.id}/status`] = config.nextStatus;
    });

    els.modalConfirm.disabled = true;

    try {
      await window.FirebaseBooking.patchBookings(updates);
      group.forEach((order) => {
        order.status = config.nextStatus;
      });
      closeModal();
      render();
      showToast(`อัปเดตเป็น "${STATUS[config.nextStatus].label}" แล้ว`, config.nextStatus === 'cancelled' ? 'danger' : 'success');
      loadBookings({ silent: true });
    } catch (error) {
      showToast(error.message || 'อัปเดตสถานะไม่สำเร็จ', 'danger');
    } finally {
      els.modalConfirm.disabled = false;
    }
  }

  function showToast(message, type = 'success') {
    els.toast.textContent = message;
    els.toast.className = `admin-toast ${type}`;
    els.toast.hidden = false;

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      els.toast.hidden = true;
    }, 3000);
  }

  function bindEvents() {
    els.search.addEventListener('input', (event) => {
      state.search = event.target.value;
      render();
    });
    els.dateFilter.addEventListener('change', (event) => {
      state.filterDate = event.target.value;
      render();
    });
    els.statusFilter.addEventListener('change', (event) => {
      state.filterStatus = event.target.value;
      render();
    });
    els.clearFilter.addEventListener('click', () => {
      state.search = '';
      state.filterDate = '';
      state.filterStatus = 'all';
      els.search.value = '';
      els.dateFilter.value = '';
      els.statusFilter.value = 'all';
      render();
    });
    els.refresh.addEventListener('click', () => loadBookings());
    els.modalClose.addEventListener('click', closeModal);
    els.modal.addEventListener('click', (event) => {
      if (event.target === els.modal) closeModal();
    });
    els.modalConfirm.addEventListener('click', applyModalAction);
  }

  bindEvents();
  if (!window.FirebaseBooking) {
    renderContainerMessage(els.list, 'โหลด Firebase helper ไม่สำเร็จ กรุณาตรวจสอบ firebase-config.js', 'empty-state error');
    els.refresh.disabled = true;
    return;
  }

  loadBookings();
  state.refreshTimer = window.setInterval(() => loadBookings({ silent: true }), 30000);
})();
