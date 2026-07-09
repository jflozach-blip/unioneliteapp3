'use strict';

const STORAGE_KEY = 'driver-basic-lite-v1';

const DAYS = [
  { name: 'Mon', type: 'weekday' },
  { name: 'Tue', type: 'weekday' },
  { name: 'Wed', type: 'weekday' },
  { name: 'Thu', type: 'weekday' },
  { name: 'Fri', type: 'weekday' },
  { name: 'Sat', type: 'saturday' },
  { name: 'Sun', type: 'sunday' }
];

const state = {
  weekStartDate: getMonday(new Date()),
  days: DAYS.map(() => ({
    worked: false,
    dutyId: '',
    dutyCode: '',
    duty: null,
    hours: 0,
    otMinutes: 0,
    manualMinutes: 0,
    bankHoliday: false,
    sick: false,
    payIn: 0,
    adjustStart: '',
    adjustFinish: '',
    deductMinutes: 0
  })),
  rates: { basic: 19.88, ot: 22.83, sunday: 29.35, tax: 17, social: 6 },
  savedWeeks: {},
  sickDates: [],
  annualLeaveDates: [],
  payInPaidByWeek: {},
  currentDayIndex: null,
  dutySets: typeof DUTY_SETS !== 'undefined' ? DUTY_SETS : []
};

const el = {
  grid: document.getElementById('grid'),
  weekStartInput: document.getElementById('weekStartInput'),
  prevWeekBtn: document.getElementById('prevWeekBtn'),
  nextWeekBtn: document.getElementById('nextWeekBtn'),
  saveWeekBtn: document.getElementById('saveWeekBtn'),
  loadWeekBtn: document.getElementById('loadWeekBtn'),
  savedWeeksSelect: document.getElementById('savedWeeksSelect'),
  statusMsg: document.getElementById('statusMsg'),
  summaryTotal: document.getElementById('summaryTotal'),
  summaryWorked: document.getElementById('summaryWorked'),
  summaryPayIn: document.getElementById('summaryPayIn'),
  menuBtn: document.getElementById('menuBtn'),
  learnBtn: document.getElementById('learnBtn'),
  menuPanel: document.getElementById('menuPanel'),

  modalBackdrop: document.getElementById('dayModalBackdrop'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  cancelEditBtn: document.getElementById('cancelEditBtn'),
  saveEditBtn: document.getElementById('saveEditBtn'),
  modalDateLabel: document.getElementById('modalDateLabel'),
  workedSelect: document.getElementById('workedSelect'),
  dutySelect: document.getElementById('dutySelect'),
  otMinutesInput: document.getElementById('otMinutesInput'),
  manualMinutesInput: document.getElementById('manualMinutesInput'),
  bankHolidaySelect: document.getElementById('bankHolidaySelect'),
  sickSelect: document.getElementById('sickSelect'),
  payInInput: document.getElementById('payInInput'),
  learnModal: document.getElementById('learnModal'),
  learnTitle: document.getElementById('learnTitle'),
  learnContent: document.getElementById('learnContent'),
  closeLearnBtn: document.getElementById('closeLearnBtn'),
  trackerModalBackdrop: document.getElementById('trackerModalBackdrop'),
  closeTrackerModalBtn: document.getElementById('closeTrackerModalBtn'),
  trackerModalContent: document.getElementById('trackerModalContent'),
  ratesModalBackdrop: document.getElementById('ratesModalBackdrop'),
  ratesModalContent: document.getElementById('ratesModalContent'),
  rateModalBackdrop: document.getElementById('rateModalBackdrop'),
  rateTitle: document.getElementById('rateTitle'),
  rateLabel: document.getElementById('rateLabel'),
  rateInput: document.getElementById('rateInput'),
  closeRateModalBtn: document.getElementById('closeRateModalBtn'),
  saveRateBtn: document.getElementById('saveRateBtn')
};

const LEARN_PAGES = {
  home: {
    title: '📘 Learning Centre',
    items: [
      { label: '⏱ Overtime rules', page: 'rules_ot' },
      { label: '💷 Pay tracking basics', page: 'pay_basics' },
      { label: '🌴 Leave & sick planner', page: 'leave_sick' },
      { label: '🚨 Union support', page: 'union_support' }
    ]
  },
  rules_ot: {
    title: '⏱ Overtime Rules',
    content: `<div class="learn-body"><strong>Overtime Rules:</strong><br><br>1. Fulfil your contracted minimum of <b>39 hours</b>.<br>2. Complete the rota hours assigned for your week.<br>3. Reach the <b>43-hour mark</b> for total hours worked.<br><br><strong>Important:</strong><br>Overtime will only be paid after reaching the <b>43-hour threshold</b>.</div>`
  },
  pay_basics: {
    title: '💷 Pay Tracking Basics',
    content: `<div class="learn-body"><strong>Always check official duties before finalising.</strong><br><br>• Add each duty worked.<br>• Add overtime in h.mm format.<br>• Add manual paid time where needed.<br>• Keep pay-in/fares separate from wage totals.<br>• Use the weekly breakdown to compare basic, Sunday, overtime and estimated net pay.</div>`
  },
  leave_sick: {
    title: '🌴 Leave & Sick Planner',
    content: `<div class="learn-body"><strong>Planner basics:</strong><br><br>• Use Annual Leave mode to mark AL days.<br>• Use Sick Day mode to mark SK days.<br>• Selected AL/SK days override normal duty tiles for that date.</div>`
  },
  union_support: {
    title: '🚨 Union Support',
    content: `<div class="learn-body"><strong>Union Elite members can contact a union representative directly from the app.</strong><br><br>Use the support button for workplace concerns such as pay issues, overtime or rota questions, disciplinary support, or urgent workplace support.</div>`
  }
};

function money(v) { return '£' + Number(v || 0).toFixed(2); }
function dateFor(i) { const d = new Date(state.weekStartDate); d.setDate(d.getDate() + i); return d; }
function weekName() { return `Week of ${state.weekStartDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`; }
function weekKey() { return dateToISO(state.weekStartDate); }
function isBankHolidayDay(i) { return i === 0 || i === 4; }

function getDutySetForDate(date) {
  const iso = dateToISO(date);
  let chosen = null;
  state.dutySets.forEach(set => {
    if (set && set.validFrom && iso >= set.validFrom && (!set.validTo || iso <= set.validTo)) {
      if (!chosen || set.validFrom > chosen.validFrom) chosen = set;
    }
  });
  return chosen ? (chosen.data || chosen) : { weekday: [], saturday: [], sunday: [] };
}

function dutiesFor(dayIndex, bankHoliday = false) {
  const weekSet = getDutySetForDate(state.weekStartDate);
  if (bankHoliday && isBankHolidayDay(dayIndex)) return weekSet.sunday || [];
  if (dayIndex === 5) return weekSet.saturday || [];
  if (dayIndex === 6) return weekSet.sunday || [];
  return weekSet.weekday || [];
}

function findDuty(dayIndex, dutyId, bh = false) {
  const list = dutiesFor(dayIndex, bh);
  return list.find(d => String(d.id) === String(dutyId)) || null;
}

function parseTime(v) {
  const raw = String(v || '').trim();
  if (!raw) return { ok: true, minutes: 0, message: '' };

  let m = raw.match(/^(\d{1,2})(?:\.(\d{1,2}))?$/);
  if (m) {
    const h = +m[1] || 0;
    const mm = m[2] ? +m[2] : 0;
    if (mm >= 60) return { ok: false, message: 'Minutes must be 00–59.' };
    return { ok: true, minutes: h * 60 + mm, message: '' };
  }

  m = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (m) {
    const h = +m[1] || 0;
    const mm = +m[2] || 0;
    if (mm >= 60) return { ok: false, message: 'Minutes must be 00–59.' };
    return { ok: true, minutes: h * 60 + mm, message: '' };
  }

  return { ok: false, message: 'Use h.mm or HH:MM format.' };
}

function dayPay(i, e) {
  const iso = dateToISO(dateFor(i));
  if (e.sick || state.sickDates.includes(iso)) return 0;
  if (state.annualLeaveDates.includes(iso)) return 0;

  let base = 0;
  if (e.worked && e.duty) {
    if (e.bankHoliday && isBankHolidayDay(i)) base = Number(e.hours || 0) * (state.rates.basic * 2);
    else if (i === 6) base = Number(e.hours || 0) * state.rates.sunday;
    else base = Number(e.hours || 0) * state.rates.basic;
  }

  return base + (Number(e.otMinutes || 0) / 60) * state.rates.ot + (Number(e.manualMinutes || 0) / 60) * state.rates.basic;
}

function totalPayIn() { return state.days.reduce((s, d) => s + Number(d.payIn || 0), 0); }
function calc() { return state.days.reduce((t, e, i) => t + dayPay(i, e), 0); }

function getPayInPaidMap() {
  const key = weekKey();
  if (!state.payInPaidByWeek[key] || typeof state.payInPaidByWeek[key] !== 'object' || Array.isArray(state.payInPaidByWeek[key])) {
    state.payInPaidByWeek[key] = {};
  }
  return state.payInPaidByWeek[key];
}

function getPayInTotals() {
  const paidMap = getPayInPaidMap();
  const rows = state.days.map((e, i) => {
    const amount = Number(e.payIn || 0);
    const paid = !!paidMap[i] && amount > 0;
    return {
      index: i,
      day: DAYS[i].name,
      date: fmtDate(dateFor(i)),
      amount,
      paid
    };
  });

  const total = rows.reduce((s, r) => s + r.amount, 0);
  const deducted = rows.reduce((s, r) => s + (r.paid ? r.amount : 0), 0);
  const remaining = Math.max(0, total - deducted);

  return { rows, total, deducted, remaining };
}

function ensurePayInTrackerStyles() {
  if (document.getElementById('payInTrackerStyles')) return;

  const style = document.createElement('style');
  style.id = 'payInTrackerStyles';
  style.textContent = `
    .payin-hero {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }

    .payin-stat {
      display: grid;
      gap: 5px;
      padding: 12px;
      border-radius: 16px;
      background: rgba(15, 23, 42, .88);
      border: 1px solid rgba(147, 197, 253, .18);
    }

    .payin-stat span {
      color: #94a3b8;
      font-size: .74rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .04em;
    }

    .payin-stat strong {
      font-size: 1.2rem;
      font-weight: 1000;
      color: #f8fafc;
    }

    .payin-stat.remaining strong {
      color: #fde68a;
    }

    .payin-day-row {
      display: grid;
      grid-template-columns: 1fr 120px 180px;
      gap: 8px;
      align-items: center;
      padding: 10px;
      border-radius: 16px;
      border: 1px solid rgba(148, 163, 184, .16);
      background: rgba(15, 23, 42, .76);
    }

    .payin-day-row.is-paid {
      border-color: rgba(34, 197, 94, .42);
      background: rgba(20, 83, 45, .18);
    }

    .payin-day-main {
      display: grid;
      gap: 3px;
      font-weight: 1000;
    }

    .payin-day-main small {
      color: #94a3b8;
      font-weight: 800;
    }

    .payin-input {
      width: 100%;
      min-height: 40px;
      border-radius: 12px;
      border: 1px solid rgba(147, 197, 253, .24);
      background: #071225;
      color: #f8fafc;
      padding: 8px 10px;
      font-weight: 900;
    }

    .payin-actions {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 6px;
    }

    .payin-actions button {
      min-height: 40px;
      border-radius: 12px;
      font-weight: 1000;
      padding: 8px;
    }

    .payin-deduct-btn.is-paid {
      background: linear-gradient(180deg, #16a34a, #166534);
      border-color: #22c55e;
    }

    .payin-note {
      color: #bfdbfe;
      font-weight: 850;
      line-height: 1.45;
      padding: 10px 12px;
      border-radius: 14px;
      background: rgba(37, 99, 235, .12);
      border: 1px solid rgba(147, 197, 253, .18);
    }

    @media (max-width: 680px) {
      .payin-hero,
      .payin-day-row,
      .payin-actions {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);
}

function renderPayInTracker() {
  if (!el.trackerModalContent) return;
  ensurePayInTrackerStyles();

  const title = document.getElementById('trackerModalTitle');
  if (title) title.textContent = 'Pay-in Tracker Pro';

  const totals = getPayInTotals();

  const rowsHtml = totals.rows.map(row => `
    <div class="payin-day-row ${row.paid ? 'is-paid' : ''}">
      <div class="payin-day-main">
        <span>${row.day} ${row.date}</span>
        <small>${row.paid ? 'Deducted from remaining total' : 'Not deducted yet'}</small>
      </div>

      <input
        class="payin-input"
        data-payin-input="${row.index}"
        type="number"
        min="0"
        step="0.01"
        value="${row.amount ? row.amount.toFixed(2) : ''}"
        placeholder="0.00"
      >

      <div class="payin-actions">
        <button type="button" data-payin-action="save" data-day="${row.index}">Save</button>
        <button
          type="button"
          class="payin-deduct-btn ${row.paid ? 'is-paid' : ''}"
          data-payin-action="toggle"
          data-day="${row.index}"
          ${row.amount <= 0 ? 'disabled' : ''}
        >${row.paid ? 'Undo' : 'Deduct'}</button>
        <button type="button" data-payin-action="clear" data-day="${row.index}">Clear</button>
      </div>
    </div>
  `).join('');

  el.trackerModalContent.innerHTML = `
    <div class="tracker-section">
      <div class="payin-hero">
        <div class="payin-stat">
          <span>Total pay-in</span>
          <strong>${money(totals.total)}</strong>
        </div>
        <div class="payin-stat">
          <span>Deducted</span>
          <strong>${money(totals.deducted)}</strong>
        </div>
        <div class="payin-stat remaining">
          <span>Remaining</span>
          <strong>${money(totals.remaining)}</strong>
        </div>
      </div>

      <div class="payin-note">
        Save each day’s pay-in, then press <strong>Deduct</strong> when that day has been cleared.
        Deducted days reduce the remaining pay-in total without changing wage pay.
      </div>
    </div>

    <div class="tracker-section">
      <h3>Day pay-in options</h3>
      <div class="tracker-list">${rowsHtml}</div>
    </div>
  `;
}

function openPayInTracker() {
  renderPayInTracker();
  if (el.trackerModalBackdrop) {
    el.trackerModalBackdrop.classList.add('open');
    el.trackerModalBackdrop.setAttribute('aria-hidden', 'false');
  }
}

function closeShellMenuBackdrop() {
  const shell = document.getElementById('shellMenuBackdrop');
  if (shell) {
    shell.classList.remove('open');
    shell.setAttribute('aria-hidden', 'true');
  }
}

function interceptInsightMenu(event) {
  const btn = event.target.closest?.('[data-shell-action="insight"]');
  if (!btn) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  closeShellMenuBackdrop();
  openPayInTracker();
}

function handlePayInTrackerClick(event) {
  const btn = event.target.closest?.('[data-payin-action]');
  if (!btn) return;

  const dayIndex = Number(btn.dataset.day);
  if (!Number.isInteger(dayIndex) || !state.days[dayIndex]) return;

  const action = btn.dataset.payinAction;
  const paidMap = getPayInPaidMap();
  const input = el.trackerModalContent.querySelector(`[data-payin-input="${dayIndex}"]`);

  if (action === 'save') {
    const value = Math.max(0, Number.parseFloat(input?.value || '0') || 0);
    state.days[dayIndex].payIn = value;
    if (value <= 0) delete paidMap[dayIndex];
    setStatus(`${DAYS[dayIndex].name} pay-in saved`);
  }

  if (action === 'toggle') {
    const amount = Number(state.days[dayIndex].payIn || 0);
    if (amount > 0) {
      if (paidMap[dayIndex]) {
        delete paidMap[dayIndex];
        setStatus(`${DAYS[dayIndex].name} pay-in returned to remaining total`);
      } else {
        paidMap[dayIndex] = true;
        setStatus(`${DAYS[dayIndex].name} pay-in deducted`);
      }
    }
  }

  if (action === 'clear') {
    state.days[dayIndex].payIn = 0;
    delete paidMap[dayIndex];
    setStatus(`${DAYS[dayIndex].name} pay-in cleared`);
  }

  saveState(true);
  render();
  renderPayInTracker();
}

function calcSummary() {
  let weekday = 0, sat = 0, sun = 0, bhH = 0, otH = 0, manH = 0, payin = 0, days = 0, sickDays = 0;
  let bestDay = null, bestPay = 0, lowDay = null, lowPay = null;

  state.days.forEach((e, i) => {
    const iso = dateToISO(dateFor(i));
    const isSick = e.sick || state.sickDates.includes(iso);
    if (isSick) { sickDays++; return; }

    payin += Number(e.payIn || 0);
    const man = Number(e.manualMinutes || 0) / 60;
    const ot = Number(e.otMinutes || 0) / 60;
    const hasDuty = e.worked && e.duty;

    if (hasDuty) {
      if (e.bankHoliday && isBankHolidayDay(i)) bhH += Number(e.hours || 0);
      else if (i < 5) weekday += Number(e.hours || 0);
      else if (i === 5) sat += Number(e.hours || 0);
      else sun += Number(e.hours || 0);
    }

    manH += man;
    otH += ot;
    if (hasDuty || man > 0 || ot > 0) days++;

    const dp = dayPay(i, e);
    if (dp > 0) {
      if (dp > bestPay) { bestPay = dp; bestDay = DAYS[i].name; }
      if (lowPay === null || dp < lowPay) { lowPay = dp; lowDay = DAYS[i].name; }
    }
  });

  const basicH = weekday + sat;
  const dutyH = basicH + sun + bhH;
  const totalH = dutyH + otH + manH;
  const basicPay = basicH * state.rates.basic;
  const sunPay = sun * state.rates.sunday;
  const bhPay = bhH * (state.rates.basic * 2);
  const otPay = otH * state.rates.ot;
  const manPay = manH * state.rates.basic;
  const gross = basicPay + sunPay + bhPay + otPay + manPay;
  const tax = gross * (state.rates.tax / 100);
  const social = (gross - tax) * (state.rates.social / 100);
  const net = gross - tax - social;

  return {
    totalHours: totalH,
    dutyHours: dutyH,
    otHours: otH,
    manualHours: manH,
    manualPay: manPay,
    bankHolidayHours: bhH,
    bankHolidayPay: bhPay,
    daysWorked: days,
    sickDays,
    basicPay,
    sundayPay: sunPay,
    overtimePay: otPay,
    grossPay: gross,
    tax,
    social,
    netPay: net,
    payInTotal: payin,
    bestDay,
    bestPay,
    lowestDay: lowDay,
    lowestPay: lowPay,
    averagePerWorkedDay: days ? gross / days : 0
  };
}

function normalizeStateDays() {
  state.days = state.days.map((day, i) => {
    const bh = !!day.bankHoliday && isBankHolidayDay(i);
    return {
      worked: !!day.worked,
      dutyId: day.dutyId || '',
      dutyCode: day.dutyCode || '',
      duty: day.dutyId ? findDuty(i, day.dutyId, bh) : null,
      hours: Number(day.hours || 0),
      otMinutes: Number(day.otMinutes || 0),
      manualMinutes: Number(day.manualMinutes || 0),
      bankHoliday: bh,
      sick: !!day.sick,
      payIn: Number(day.payIn || 0),
      adjustStart: day.adjustStart || '',
      adjustFinish: day.adjustFinish || '',
      deductMinutes: Number(day.deductMinutes || 0)
    };
  });
}

function populateDutySelect(i, bankHoliday = false) {
  if (!el.dutySelect) return;
  el.dutySelect.innerHTML = '<option value="">RD — Day off</option>';
  dutiesFor(i, bankHoliday).forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = `${d.code} • ${d.start}-${d.finish} • ${moneyHours(d.paid)}`;
    el.dutySelect.appendChild(opt);
  });
}

function renderLoadOptions() {
  if (!el.savedWeeksSelect) return;
  el.savedWeeksSelect.innerHTML = '';
  const keys = Object.keys(state.savedWeeks).sort().reverse();
  if (!keys.length) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'No saved snapshots';
    el.savedWeeksSelect.appendChild(opt);
    return;
  }
  keys.forEach(k => {
    const opt = document.createElement('option');
    opt.value = k;
    opt.textContent = k;
    el.savedWeeksSelect.appendChild(opt);
  });
}

function setStatus(t) { if (el.statusMsg) el.statusMsg.textContent = t; }

function renderSummary() {
  if (el.summaryTotal) el.summaryTotal.textContent = money(calc());
  if (el.summaryWorked) el.summaryWorked.textContent = String(state.days.filter(d => d.worked || d.sick || d.bankHoliday || state.annualLeaveDates.includes(dateToISO(dateFor(state.days.indexOf(d))))).length);
  if (el.summaryPayIn) el.summaryPayIn.textContent = money(totalPayIn());
}

function renderLearnPage(pageKey = 'home') {
  const page = LEARN_PAGES[pageKey] || LEARN_PAGES.home;
  if (el.learnTitle) el.learnTitle.textContent = page.title;
  if (page.items) {
    el.learnContent.innerHTML = `<div class="learn-list">${page.items.map(i => `<div class="learn-card" data-page="${i.page}">${i.label}</div>`).join('')}</div>`;
    el.learnContent.querySelectorAll('.learn-card').forEach(card => {
      card.addEventListener('click', () => openLearn(card.dataset.page));
    });
  } else {
    el.learnContent.innerHTML = `<div class="learn-page-shell"><div class="learn-hero"><span class="learn-section-icon">📘</span><span><span class="learn-hero-title">${page.title}</span><span class="learn-hero-sub">Quick reference guide.</span></span></div>${page.content}</div>`;
  }
}

function openLearn(page = 'home') {
  renderLearnPage(page);
  if (!el.learnModal) return;
  el.learnModal.classList.add('show');
  el.learnModal.setAttribute('aria-hidden', 'false');
}
function closeLearn() {
  if (!el.learnModal) return;
  el.learnModal.classList.remove('show');
  el.learnModal.setAttribute('aria-hidden', 'true');
}

function calcTrackerRows() {
  return state.days.map((e, i) => ({
    day: DAYS[i].name,
    date: fmtDate(dateFor(i)),
    amount: Number(e.payIn || 0)
  })).filter(x => x.amount > 0);
}

function renderTrackerModal() {
  const s = calcSummary();
  const rows = calcTrackerRows();
  const listHtml = rows.length
    ? rows.map(x => `<div class="tracker-row"><div class="tracker-row-main">${x.day} ${x.date}</div><div class="tracker-row-mid">${money(x.amount)}</div><div class="tracker-row-end">Pay in</div></div>`).join('')
    : `<div class="tracker-row"><div class="tracker-row-main">No pay-in recorded this week</div><div class="tracker-row-mid">£0.00</div><div class="tracker-row-end">—</div></div>`;

  el.trackerModalContent.innerHTML = `
    <div class="tracker-section">
      <h3>Weekly pay tracker</h3>
      <div class="tracker-list">
        <div class="tracker-row"><div class="tracker-row-main">Basic pay</div><div class="tracker-row-mid">${money(s.basicPay)}</div><div class="tracker-row-end">${s.totalHours.toFixed(2)}h</div></div>
        <div class="tracker-row"><div class="tracker-row-main">Sunday pay</div><div class="tracker-row-mid">${money(s.sundayPay)}</div><div class="tracker-row-end">${s.sickDays} sick</div></div>
        <div class="tracker-row"><div class="tracker-row-main">Overtime pay</div><div class="tracker-row-mid">${money(s.overtimePay)}</div><div class="tracker-row-end">${s.otHours.toFixed(2)}h</div></div>
        <div class="tracker-row"><div class="tracker-row-main">Manual pay</div><div class="tracker-row-mid">${money(s.manualPay)}</div><div class="tracker-row-end">${s.manualHours.toFixed(2)}h</div></div>
        <div class="tracker-row"><div class="tracker-row-main">Bank holiday pay</div><div class="tracker-row-mid">${money(s.bankHolidayPay)}</div><div class="tracker-row-end">${s.bankHolidayHours.toFixed(2)}h</div></div>
        <div class="tracker-row"><div class="tracker-row-main">Gross pay</div><div class="tracker-row-mid">${money(s.grossPay)}</div><div class="tracker-row-end">${s.daysWorked} days</div></div>
        <div class="tracker-row"><div class="tracker-row-main">Tax</div><div class="tracker-row-mid">${money(s.tax)}</div><div class="tracker-row-end">${state.rates.tax}%</div></div>
        <div class="tracker-row"><div class="tracker-row-main">Social</div><div class="tracker-row-mid">${money(s.social)}</div><div class="tracker-row-end">${state.rates.social}%</div></div>
        <div class="tracker-row"><div class="tracker-row-main">Net pay</div><div class="tracker-row-mid">${money(s.netPay)}</div><div class="tracker-row-end">${money(s.averagePerWorkedDay)} avg</div></div>
      </div>
    </div>
    <div class="tracker-section">
      <h3>Pay-in / fares</h3>
      <div class="tracker-list">${listHtml}</div>
      <div class="tracker-row"><div class="tracker-row-main">Total pay-in</div><div class="tracker-row-mid">${money(s.payInTotal)}</div><div class="tracker-row-end">Not in wages</div></div>
    </div>
  `;
}

function openTracker() {
  renderTrackerModal();
  el.trackerModalBackdrop.classList.add('open');
  el.trackerModalBackdrop.setAttribute('aria-hidden', 'false');
}
function closeTracker() {
  el.trackerModalBackdrop.classList.remove('open');
  el.trackerModalBackdrop.setAttribute('aria-hidden', 'true');
}

function openRates() {
  const s = calcSummary();
  el.ratesModalContent.innerHTML = `
    <div class="tracker-section">
      <h3>£ Pay Rates</h3>
      <div class="tracker-list">
        <div class="tracker-row"><div class="tracker-row-main">Basic rate</div><div class="tracker-row-mid">${money(state.rates.basic)}</div><div class="tracker-row-end">per hour</div></div>
        <div class="tracker-row"><div class="tracker-row-main">Overtime rate</div><div class="tracker-row-mid">${money(state.rates.ot)}</div><div class="tracker-row-end">per hour</div></div>
        <div class="tracker-row"><div class="tracker-row-main">Sunday rate</div><div class="tracker-row-mid">${money(state.rates.sunday)}</div><div class="tracker-row-end">per hour</div></div>
        <div class="tracker-row"><div class="tracker-row-main">Bank Holiday rate</div><div class="tracker-row-mid">${money(state.rates.basic * 2)}</div><div class="tracker-row-end">2× basic</div></div>
      </div>
    </div>
    <div class="tracker-section">
      <h3>Summary preview</h3>
      <div class="tracker-list">
        <div class="tracker-row"><div class="tracker-row-main">Gross pay</div><div class="tracker-row-mid">${money(s.grossPay)}</div><div class="tracker-row-end">Weekly</div></div>
        <div class="tracker-row"><div class="tracker-row-main">Net pay</div><div class="tracker-row-mid">${money(s.netPay)}</div><div class="tracker-row-end">Weekly</div></div>
      </div>
    </div>`;
  el.ratesModalBackdrop.classList.add('open');
  el.ratesModalBackdrop.setAttribute('aria-hidden', 'false');
}
function closeRates() { el.ratesModalBackdrop.classList.remove('open'); el.ratesModalBackdrop.setAttribute('aria-hidden', 'true'); }

function openRateModal(type) {
  state.currentRateType = type;
  if (el.rateTitle) el.rateTitle.textContent = type === 'tax' ? 'Update Tax %' : 'Update Social %';
  if (el.rateLabel) el.rateLabel.textContent = type === 'tax' ? 'Tax %' : 'Social %';
  if (el.rateInput) el.rateInput.value = state.rates[type];
  el.rateModalBackdrop.classList.add('open');
  el.rateModalBackdrop.setAttribute('aria-hidden', 'false');
}
function closeRateModal() { el.rateModalBackdrop.classList.remove('open'); el.rateModalBackdrop.setAttribute('aria-hidden', 'true'); }
function saveRate() {
  const v = parseFloat(el.rateInput.value);
  if (!Number.isFinite(v) || v < 0 || !state.currentRateType) return;
  state.rates[state.currentRateType] = v;
  saveState(true);
  closeRateModal();
  render();
}

function adjustedDutyHours(d, start, finish) {
  const base = d ? Number(d.paid || 0) * 60 : 0;
  if (!d) return { hours: 0, deductMinutes: 0, changed: false };
  const parseHM = s => {
    const m = String(s || '').match(/^(\d{1,2}):(\d{2})$/);
    return m ? (+m[1]) * 60 + (+m[2]) : null;
  };
  const bS = parseHM(d.start), bF = parseHM(d.finish), aS = parseHM(start || d.start), aF = parseHM(finish || d.finish);
  if (bS == null || bF == null || aS == null || aF == null) return { hours: d.paid, deductMinutes: 0, changed: false };
  let f = aF, s = aS, baseF = bF;
  if (f < s) f += 1440;
  if (baseF < bS) baseF += 1440;
  let deduct = 0;
  if (s > bS) deduct += s - bS;
  if (f < baseF) deduct += baseF - f;
  deduct = Math.max(0, Math.min(base, deduct));
  return { hours: (base - deduct) / 60, deductMinutes: deduct, changed: deduct > 0 };
}

function handleBankHolidayDutyReload() {
  const i = state.currentDayIndex;
  if (i === null || !el.dutySelect || !el.bankHolidaySelect) return;

  const canBH = isBankHolidayDay(i);
  if (!canBH) {
    el.bankHolidaySelect.value = 'false';
    el.bankHolidaySelect.disabled = true;
    setStatus('Bank Holiday can only be used on Monday or Friday');
  } else {
    el.bankHolidaySelect.disabled = false;
  }

  const bh = canBH && el.bankHolidaySelect.value === 'true';
  const currentDuty = el.dutySelect.value;
  populateDutySelect(i, bh);

  if ([...el.dutySelect.options].some(opt => opt.value === currentDuty)) {
    el.dutySelect.value = currentDuty;
  } else {
    el.dutySelect.value = '';
  }

  if (el.workedSelect) el.workedSelect.value = el.dutySelect.value ? 'true' : 'false';

  const adjustStart = document.getElementById('adjustStartInput');
  const adjustFinish = document.getElementById('adjustFinishInput');
  const duty = findDuty(i, el.dutySelect.value, bh);
  if (adjustStart) adjustStart.value = duty ? duty.start : '';
  if (adjustFinish) adjustFinish.value = duty ? duty.finish : '';
  if (document.getElementById('paidAdjustSection')) {
    document.getElementById('paidAdjustSection').style.display = duty ? 'grid' : 'none';
  }

  updateDayPreview();
}

function openDayModal(i) {
  state.currentDayIndex = i;
  const e = state.days[i];
  const d = dateFor(i);
  const canBH = isBankHolidayDay(i);
  const bh = canBH && !!e.bankHoliday;

  if (el.modalDateLabel) el.modalDateLabel.textContent = `${DAYS[i].name}, ${fmtDate(d)}`;
  if (el.workedSelect) el.workedSelect.value = String(e.worked);
  if (el.otMinutesInput) el.otMinutesInput.value = e.otMinutes ? String(e.otMinutes) : '';
  if (el.manualMinutesInput) el.manualMinutesInput.value = e.manualMinutes ? moneyHours(e.manualMinutes / 60) : '';
  if (el.bankHolidaySelect) {
    el.bankHolidaySelect.value = String(bh);
    el.bankHolidaySelect.disabled = !canBH;
    el.bankHolidaySelect.title = canBH ? 'Bank Holiday duty list uses Sunday duties' : 'Bank Holiday is only available on Monday and Friday';
  }
  if (el.sickSelect) el.sickSelect.value = String(e.sick);
  if (el.payInInput) el.payInInput.value = e.payIn || '';

  populateDutySelect(i, bh);
  if (e.dutyId) el.dutySelect.value = e.dutyId;

  if (document.getElementById('adjustStartInput')) document.getElementById('adjustStartInput').value = e.adjustStart || (e.duty ? e.duty.start : '');
  if (document.getElementById('adjustFinishInput')) document.getElementById('adjustFinishInput').value = e.adjustFinish || (e.duty ? e.duty.finish : '');
  if (document.getElementById('paidAdjustSection')) document.getElementById('paidAdjustSection').style.display = e.duty ? 'grid' : 'none';

  updateDayPreview();
  el.modalBackdrop.classList.add('open');
  el.modalBackdrop.setAttribute('aria-hidden', 'false');
}

function closeDayModal() {
  state.currentDayIndex = null;
  el.modalBackdrop.classList.remove('open');
  el.modalBackdrop.setAttribute('aria-hidden', 'true');
}

function updateDayPreview() {
  const i = state.currentDayIndex;
  if (i === null) return;

  const bh = isBankHolidayDay(i) && el.bankHolidaySelect && el.bankHolidaySelect.value === 'true';
  const duty = el.dutySelect ? findDuty(i, el.dutySelect.value, bh) : null;
  const ot = parseTime(el.otMinutesInput?.value || '');
  const man = parseTime(el.manualMinutesInput?.value || '');
  const adjStart = document.getElementById('adjustStartInput')?.value || (duty ? duty.start : '');
  const adjFinish = document.getElementById('adjustFinishInput')?.value || (duty ? duty.finish : '');
  const adj = adjustedDutyHours(duty, adjStart, adjFinish);
  const dutyHours = duty ? adj.hours : 0;
  const info = document.getElementById('modalDutyInfo');
  const pay = document.getElementById('modalDutyPay');
  const total = document.getElementById('modalDayTotal');
  const preview = document.getElementById('adjustPreview');

  if (info) {
    info.textContent = duty
      ? `${bh ? 'Bank Holiday Sunday duty' : 'Duty'} ${duty.code} • 🕒 ${adjStart}–${adjFinish} • Paid ${moneyHours(dutyHours)}`
      : 'RD selected.';
  }

  if (pay) {
    pay.textContent = duty
      ? `Duty pay: ${money(dutyHours * (bh ? state.rates.basic * 2 : i === 6 ? state.rates.sunday : state.rates.basic))}`
      : 'Duty pay: £0.00';
  }

  if (total) {
    const temp = {
      worked: !!duty,
      duty,
      hours: dutyHours,
      otMinutes: ot.ok ? ot.minutes : 0,
      manualMinutes: man.ok ? man.minutes : 0,
      bankHoliday: bh,
      sick: false,
      payIn: 0
    };
    total.textContent = money(dayPay(i, temp));
  }

  if (preview && duty) {
    preview.className = 'adjust-preview ' + (adj.deductMinutes ? 'deducting' : 'ok');
    preview.textContent = adj.deductMinutes ? `Deducting ${moneyHours(adj.deductMinutes / 60)} from paid duty time.` : 'No paid time deduction.';
  }
}

function saveDayModal() {
  const i = state.currentDayIndex;
  if (i === null) return;

  const e = state.days[i];
  const bh = isBankHolidayDay(i) && el.bankHolidaySelect.value === 'true';
  const sick = el.sickSelect.value === 'true';
  const ot = parseTime(el.otMinutesInput.value || '');
  const man = parseTime(el.manualMinutesInput.value || '');
  if (!ot.ok) return setStatus(ot.message);
  if (!man.ok) return setStatus(man.message);

  const dutyId = el.dutySelect.value || '';
  const duty = dutyId ? findDuty(i, dutyId, bh) : null;
  const adjStart = document.getElementById('adjustStartInput')?.value || (duty ? duty.start : '');
  const adjFinish = document.getElementById('adjustFinishInput')?.value || (duty ? duty.finish : '');
  const adj = adjustedDutyHours(duty, adjStart, adjFinish);

  e.worked = !!duty;
  e.dutyId = duty ? dutyId : '';
  e.duty = duty;
  e.dutyCode = duty ? duty.code : '';
  e.hours = duty ? adj.hours : 0;
  e.adjustStart = adjStart;
  e.adjustFinish = adjFinish;
  e.deductMinutes = adj.deductMinutes;
  e.otMinutes = ot.minutes;
  e.manualMinutes = man.minutes;
  e.bankHoliday = bh;
  e.sick = sick;
  e.payIn = Number(el.payInInput.value || 0);

  if (e.payIn <= 0) {
    const paidMap = getPayInPaidMap();
    delete paidMap[i];
  }

  if (sick) {
    e.worked = false;
    e.dutyId = '';
    e.duty = null;
    e.dutyCode = '';
    e.hours = 0;
    e.otMinutes = 0;
    e.manualMinutes = 0;
    e.bankHoliday = false;
    e.payIn = 0;
    const paidMap = getPayInPaidMap();
    delete paidMap[i];
  }

  if (state.annualLeaveDates.includes(dateToISO(dateFor(i)))) {
    e.worked = false;
  }

  saveState();
  render();
  closeDayModal();
}

function serializeState() {
  return {
    weekStartDate: dateToISO(state.weekStartDate),
    days: state.days,
    rates: state.rates,
    savedWeeks: state.savedWeeks,
    sickDates: state.sickDates,
    annualLeaveDates: state.annualLeaveDates,
    payInPaidByWeek: state.payInPaidByWeek
  };
}

function saveState(silent) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState()));
  if (!silent) setStatus('Saved');
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    if (data.weekStartDate) state.weekStartDate = getMonday(isoToDate(data.weekStartDate));
    if (Array.isArray(data.days)) state.days = data.days;
    if (data.rates) state.rates = data.rates;
    if (data.savedWeeks) state.savedWeeks = data.savedWeeks;
    if (data.sickDates) state.sickDates = data.sickDates;
    if (data.annualLeaveDates) state.annualLeaveDates = data.annualLeaveDates;
    if (data.payInPaidByWeek) state.payInPaidByWeek = data.payInPaidByWeek;
    normalizeStateDays();
  } catch {}
}

function saveWeekSnapshot() {
  const key = dateToISO(state.weekStartDate);
  state.savedWeeks[key] = JSON.parse(JSON.stringify(serializeState()));
  saveState(true);
  renderLoadOptions();
  setStatus('Week saved');
}

function loadWeekSnapshot(key) {
  const s = state.savedWeeks[key];
  if (!s) return;
  if (s.weekStartDate) state.weekStartDate = getMonday(isoToDate(s.weekStartDate));
  if (Array.isArray(s.days)) state.days = s.days;
  if (s.rates) state.rates = s.rates;
  if (s.sickDates) state.sickDates = s.sickDates;
  if (s.annualLeaveDates) state.annualLeaveDates = s.annualLeaveDates;
  if (s.payInPaidByWeek) state.payInPaidByWeek = s.payInPaidByWeek;
  normalizeStateDays();
  saveState(true);
  render();
  setStatus('Snapshot loaded');
}

function shiftWeek(n) {
  const d = new Date(state.weekStartDate);
  d.setDate(d.getDate() + n);
  state.weekStartDate = getMonday(d);
  saveState(true);
  render();
}

function bindEvents() {
  if (el.weekStartInput) el.weekStartInput.addEventListener('change', () => {
    state.weekStartDate = getMonday(isoToDate(el.weekStartInput.value));
    saveState(true);
    render();
  });
  if (el.prevWeekBtn) el.prevWeekBtn.addEventListener('click', () => shiftWeek(-7));
  if (el.nextWeekBtn) el.nextWeekBtn.addEventListener('click', () => shiftWeek(7));
  if (el.saveWeekBtn) el.saveWeekBtn.addEventListener('click', saveWeekSnapshot);
  if (el.loadWeekBtn) el.loadWeekBtn.addEventListener('click', () => el.savedWeeksSelect.value && loadWeekSnapshot(el.savedWeeksSelect.value));
  if (el.menuBtn) el.menuBtn.addEventListener('click', () => el.menuPanel.classList.toggle('hidden'));
  if (el.learnBtn) el.learnBtn.addEventListener('click', () => openLearn('home'));
  if (el.closeModalBtn) el.closeModalBtn.addEventListener('click', closeDayModal);
  if (el.cancelEditBtn) el.cancelEditBtn.addEventListener('click', closeDayModal);
  if (el.saveEditBtn) el.saveEditBtn.addEventListener('click', saveDayModal);
  if (el.closeLearnBtn) el.closeLearnBtn.addEventListener('click', closeLearn);
  if (el.closeTrackerModalBtn) el.closeTrackerModalBtn.addEventListener('click', closeTracker);
  if (el.closeRatesModalBtn) el.closeRatesModalBtn.addEventListener('click', closeRates);
  if (el.closeRateModalBtn) el.closeRateModalBtn.addEventListener('click', closeRateModal);
  if (el.saveRateBtn) el.saveRateBtn.addEventListener('click', saveRate);

  if (el.bankHolidaySelect) el.bankHolidaySelect.addEventListener('change', handleBankHolidayDutyReload);
  if (el.trackerModalContent) el.trackerModalContent.addEventListener('click', handlePayInTrackerClick);

  document.addEventListener('click', interceptInsightMenu, true);

  if (el.modalBackdrop) el.modalBackdrop.addEventListener('click', e => { if (e.target === el.modalBackdrop) closeDayModal(); });
  if (el.learnModal) el.learnModal.addEventListener('click', e => { if (e.target === el.learnModal) closeLearn(); });
  if (el.trackerModalBackdrop) el.trackerModalBackdrop.addEventListener('click', e => { if (e.target === el.trackerModalBackdrop) closeTracker(); });
  if (el.ratesModalBackdrop) el.ratesModalBackdrop.addEventListener('click', e => { if (e.target === el.ratesModalBackdrop) closeRates(); });
  if (el.rateModalBackdrop) el.rateModalBackdrop.addEventListener('click', e => { if (e.target === el.rateModalBackdrop) closeRateModal(); });
  window.addEventListener('beforeunload', () => saveState(true));
}

function moneyHours(hours) {
  return String(Math.floor(hours)).padStart(2, '0') + ':' + String(Math.round((hours % 1) * 60)).padStart(2, '0');
}

function renderGrid() {
  if (el.weekStartInput) el.weekStartInput.value = dateToISO(state.weekStartDate);
  if (!el.grid) return;
  el.grid.innerHTML = '';
  const todayISO = dateToISO(new Date());

  DAYS.forEach((day, i) => {
    const e = state.days[i];
    const d = dateFor(i);
    const iso = dateToISO(d);
    const duty = e.duty;
    const sick = e.sick || state.sickDates.includes(iso);
    const al = state.annualLeaveDates.includes(iso);
    const tile = document.createElement('div');
    tile.className = 'tile';
    if (sick) tile.classList.add('sick');
    else if (al) tile.classList.add('leave');
    tile.classList.add(e.worked && duty ? 'active' : 'rest');
    if (e.manualMinutes) tile.classList.add('manual');
    if (e.bankHoliday) tile.classList.add('bank-holiday');
    if (iso === todayISO) tile.classList.add('today');

    const energyHours = Number(e.hours || 0) + (Number(e.otMinutes || 0) / 60) + (Number(e.manualMinutes || 0) / 60);
    tile.style.setProperty('--hours-intensity', Math.max(.35, Math.min(1.85, energyHours / 8)).toFixed(2));
    tile.style.setProperty('--energy-blur', `${Math.round(16 + energyHours * 2.4)}px`);
    if (energyHours > 0) tile.classList.add('has-data');
    if ((Number(e.otMinutes) || 0) > 0) tile.classList.add('overtime');

    let body = '';
    if (sick) {
      body = `<span class="sk-badge">💙 Sick Day</span><span class="sk-code">SK</span>`;
    } else if (al) {
      body = `<span class="al-badge">🌴 Annual Leave</span><span class="al-code">AL</span>`;
    } else if (duty) {
      body = `
        ${e.bankHoliday ? `<span class="bh-badge">🏦 Bank Holiday</span>` : ''}
        <span class="duty-label">Duty <span class="duty-number">${duty.code}</span></span>
        <span class="duty-time">🕒 ${duty.start}–${duty.finish}</span>
        <span class="duty-paid">Paid ${moneyHours(e.hours || duty.paid)}</span>
        ${e.deductMinutes ? `<span class="paid-adjust-badge">⏱ Deducted ${moneyHours(e.deductMinutes / 60)}</span>` : ''}
        ${e.otMinutes ? `<span class="ot-badge">🔥 ${moneyHours(e.otMinutes / 60)}</span>` : ''}
        ${e.manualMinutes ? `<span class="manual-badge">🛠 ${moneyHours(e.manualMinutes / 60)}</span>` : ''}
        ${e.payIn ? `<span class="payin-badge ${getPayInPaidMap()[i] ? 'paid' : ''}">💷 Pay-in ${money(e.payIn)}${getPayInPaidMap()[i] ? ' <span class="tick">✓</span>' : ''}</span>` : ''}
      `;
    } else {
      body = `
        <span class="rd-badge">RD</span>
        <span class="muted">Day off</span>
        ${e.otMinutes ? `<span class="ot-badge">🔥 ${moneyHours(e.otMinutes / 60)}</span>` : ''}
        ${e.manualMinutes ? `<span class="manual-badge">🛠 ${moneyHours(e.manualMinutes / 60)}</span>` : ''}
        ${e.payIn ? `<span class="payin-badge ${getPayInPaidMap()[i] ? 'paid' : ''}">💷 Pay-in ${money(e.payIn)}${getPayInPaidMap()[i] ? ' <span class="tick">✓</span>' : ''}</span>` : ''}
      `;
    }

    const dayPayText = money(dayPay(i, e));
    tile.innerHTML = `
      <div class="day-top">
        <div class="day-name">${day.name}<span class="day-date">${fmtDate(d)}</span></div>
        <div class="badge">${e.bankHoliday ? 'bank holiday' : day.type}</div>
      </div>
      <div class="duty-info">${body}</div>
      <div class="day-pay ${dayPayText === '£0.00' ? 'rest-pay' : ''}">Gross ${dayPayText}</div>
    `;
    tile.addEventListener('click', () => openDayModal(i));
    el.grid.appendChild(tile);
  });

  renderSummary();
}

function render() {
  renderGrid();
}

function openSummary() {
  const s = calcSummary();
  const box = document.getElementById('summaryContent');
  if (box) {
    box.innerHTML = `
      <div class="summary-line"><span>Week</span><strong>${weekName()}</strong></div>
      <div class="summary-line"><span>Total hours</span><strong>${s.totalHours.toFixed(2)}</strong></div>
      <div class="summary-line"><span>Gross pay</span><strong>${money(s.grossPay)}</strong></div>
      <div class="summary-line"><span>Net pay</span><strong>${money(s.netPay)}</strong></div>
      <div class="summary-line"><span>Pay-in / fares</span><strong>${money(s.payInTotal)}</strong></div>
    `;
  }
  document.getElementById('summaryModal')?.classList.add('show');
}
function closeSummary() { document.getElementById('summaryModal')?.classList.remove('show'); }

function init() {
  loadState();
  bindEvents();
  render();
}

init();