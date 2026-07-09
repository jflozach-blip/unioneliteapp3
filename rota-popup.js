'use strict';

function ensureRotaPopupStyles() {
  if (document.getElementById('rotaPopupStyles')) return;

  const style = document.createElement('style');
  style.id = 'rotaPopupStyles';
  style.textContent = `
    .rota-popup-modal {
      width: min(1180px, 100%);
      height: min(94dvh, 920px);
      background: #020817;
    }

    .rota-popup-frame {
      width: 100%;
      height: 100%;
      min-height: 70dvh;
      border: 0;
      border-radius: 16px;
      background: #fff;
    }

    .rota-popup-body {
      display: grid;
      grid-template-rows: auto 1fr;
      gap: 10px;
      height: 100%;
    }

    #exportWeekCalendarBtn {
      border-color: rgba(96, 165, 250, .46) !important;
      background: linear-gradient(180deg, rgba(96, 165, 250, .34), rgba(30, 64, 175, .82)) !important;
      color: #dbeafe !important;
    }

    #annualLeaveSelect {
      border-color: rgba(250, 204, 21, .38) !important;
      background: #071225 !important;
      color: #fef3c7 !important;
    }

    .annual-leave-modal-note {
      color: #fef3c7;
      font-weight: 900;
    }

    @media (max-width: 680px) {
      #rotaPopupBackdrop {
        align-items: stretch;
        padding: 0;
      }

      .rota-popup-modal {
        width: 100%;
        height: 100dvh;
        border-radius: 0;
      }

      .rota-popup-frame {
        min-height: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

function padCalendarNumber(value) {
  return String(value).padStart(2, '0');
}

function calendarDateStamp(date) {
  return [
    date.getFullYear(),
    padCalendarNumber(date.getMonth() + 1),
    padCalendarNumber(date.getDate())
  ].join('');
}

function calendarDateTimeStamp(date) {
  return `${calendarDateStamp(date)}T${padCalendarNumber(date.getHours())}${padCalendarNumber(date.getMinutes())}${padCalendarNumber(date.getSeconds())}`;
}

function calendarEscape(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function calendarMoney(value) {
  return typeof money === 'function' ? money(value) : `£${Number(value || 0).toFixed(2)}`;
}

function calendarHoursFromMinutes(minutes) {
  const total = Number(minutes || 0);
  const h = Math.floor(total / 60);
  const m = Math.round(total % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function getCalendarDateForDay(index) {
  if (typeof dateFor === 'function') return dateFor(index);

  const base = new Date(state.weekStartDate);
  base.setDate(base.getDate() + index);
  return base;
}

function getCalendarISO(date) {
  if (typeof dateToISO === 'function') return dateToISO(date);

  return [
    date.getFullYear(),
    padCalendarNumber(date.getMonth() + 1),
    padCalendarNumber(date.getDate())
  ].join('-');
}

function buildWeekCalendarFile() {
  if (typeof state === 'undefined' || !Array.isArray(state.days)) return '';

  const now = new Date();
  const stamp = calendarDateTimeStamp(now);
  const weekStart = new Date(state.weekStartDate);
  const weekTitle = typeof weekName === 'function'
    ? weekName()
    : `Week of ${weekStart.toLocaleDateString('en-GB')}`;

  const events = state.days.map((entry, index) => {
    const date = getCalendarDateForDay(index);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const iso = getCalendarISO(date);
    const dayName = typeof DAYS !== 'undefined' && DAYS[index] ? DAYS[index].name : `Day ${index + 1}`;
    const sick = !!entry.sick || (Array.isArray(state.sickDates) && state.sickDates.includes(iso));
    const annualLeave = Array.isArray(state.annualLeaveDates) && state.annualLeaveDates.includes(iso);
    const duty = entry.duty;
    const gross = typeof dayPay === 'function' ? dayPay(index, entry) : 0;

    let title = `${dayName} - Rest day`;
    const notes = [
      'Exported from Driver Pay Tracker',
      weekTitle,
      `${dayName} ${date.toLocaleDateString('en-GB')}`
    ];

    if (sick) {
      title = `${dayName} - Sick day`;
      notes.push('Status: Sick day');
    } else if (annualLeave) {
      title = `${dayName} - Annual leave`;
      notes.push('Status: Annual leave');
    } else if (duty) {
      title = `${dayName} - Duty ${duty.code}`;
      notes.push(`Duty: ${duty.code}`);
      notes.push(`Time: ${entry.adjustStart || duty.start || ''} - ${entry.adjustFinish || duty.finish || ''}`);
      notes.push(`Paid time: ${typeof moneyHours === 'function' ? moneyHours(Number(entry.hours || duty.paid || 0)) : Number(entry.hours || duty.paid || 0).toFixed(2) + 'h'}`);
    } else {
      notes.push('Status: Rest day');
    }

    if (entry.bankHoliday) notes.push('Bank holiday: Yes');
    if (Number(entry.otMinutes || 0) > 0) notes.push(`Overtime: ${calendarHoursFromMinutes(entry.otMinutes)}`);
    if (Number(entry.manualMinutes || 0) > 0) notes.push(`Manual paid time: ${calendarHoursFromMinutes(entry.manualMinutes)}`);
    if (Number(entry.payIn || 0) > 0) notes.push(`Pay-in / fares: ${calendarMoney(entry.payIn)}`);
    notes.push(`Estimated gross: ${calendarMoney(gross)}`);

    return [
      'BEGIN:VEVENT',
      `UID:driver-pay-${iso}-${index}@onecompiler`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${calendarDateStamp(date)}`,
      `DTEND;VALUE=DATE:${calendarDateStamp(nextDate)}`,
      `SUMMARY:${calendarEscape(title)}`,
      `DESCRIPTION:${calendarEscape(notes.join('\\n'))}`,
      'END:VEVENT'
    ].join('\r\n');
  }).join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Driver Pay Tracker//Week Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarEscape(weekTitle)}`,
    events,
    'END:VCALENDAR'
  ].join('\r\n');
}

function exportCurrentWeekCalendar() {
  if (typeof state === 'undefined' || !Array.isArray(state.days)) {
    if (typeof setStatus === 'function') setStatus('Calendar export is not ready yet');
    return;
  }

  const ics = buildWeekCalendarFile();
  if (!ics) return;

  const key = typeof weekKey === 'function' ? weekKey() : getCalendarISO(new Date(state.weekStartDate));
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `driver-week-${key}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  if (typeof setStatus === 'function') setStatus('Calendar file exported');
}

function addCalendarExportButton() {
  ensureRotaPopupStyles();

  const toolsGrid = document.querySelector('.week-tools-grid');
  if (!toolsGrid || document.getElementById('exportWeekCalendarBtn')) return;

  const button = document.createElement('button');
  button.id = 'exportWeekCalendarBtn';
  button.type = 'button';
  button.textContent = 'Calendar';
  button.title = 'Export current week as calendar file';

  button.addEventListener('click', exportCurrentWeekCalendar);
  toolsGrid.appendChild(button);

  if (window.matchMedia('(min-width: 621px)').matches) {
    toolsGrid.style.gridTemplateColumns = '1.3fr auto auto auto 1fr auto auto';
  }
}

function getAnnualLeaveISO(index) {
  if (typeof dateFor !== 'function' || typeof dateToISO !== 'function') return '';
  return dateToISO(dateFor(index));
}

function isAnnualLeaveDay(index) {
  const iso = getAnnualLeaveISO(index);
  return !!iso && Array.isArray(state?.annualLeaveDates) && state.annualLeaveDates.includes(iso);
}

function syncAnnualLeaveSelect() {
  const select = document.getElementById('annualLeaveSelect');
  if (!select || typeof state === 'undefined' || state.currentDayIndex === null) return;

  select.value = isAnnualLeaveDay(state.currentDayIndex) ? 'true' : 'false';
  updateAnnualLeaveModalPreview();
}

function updateAnnualLeaveModalPreview() {
  const select = document.getElementById('annualLeaveSelect');
  if (!select) return;

  const isLeave = select.value === 'true';
  const sickSelect = document.getElementById('sickSelect');
  const info = document.getElementById('modalDutyInfo');
  const pay = document.getElementById('modalDutyPay');
  const total = document.getElementById('modalDayTotal');

  if (isLeave && sickSelect) sickSelect.value = 'false';

  if (isLeave) {
    if (info) {
      info.innerHTML = '<span class="annual-leave-modal-note">🌴 Annual leave selected. This day will show as AL.</span>';
    }
    if (pay) pay.textContent = 'Duty pay: £0.00';
    if (total) total.textContent = '£0.00';
    return;
  }

  if (typeof updateDayPreview === 'function') updateDayPreview();
}

function ensureAnnualLeaveDayControl() {
  ensureRotaPopupStyles();

  const flagsRow = document.querySelector('.day-entry-toggle-row');
  if (!flagsRow) return;

  let leaveWrap = document.getElementById('annualLeaveSelect')?.closest('.day-entry-flag');

  if (!leaveWrap) {
    const flagBlocks = [...flagsRow.querySelectorAll('.day-entry-flag')];
    leaveWrap = flagBlocks.find(block => block.textContent.includes('Type')) || document.createElement('div');
    leaveWrap.className = 'day-entry-flag';
    leaveWrap.innerHTML = `
      <label for="annualLeaveSelect">Annual leave</label>
      <select id="annualLeaveSelect" class="day-entry-input">
        <option value="false">No</option>
        <option value="true">Yes</option>
      </select>
    `;

    if (!leaveWrap.parentElement) flagsRow.appendChild(leaveWrap);
  }

  const select = document.getElementById('annualLeaveSelect');
  if (select && select.dataset.bound !== 'true') {
    select.dataset.bound = 'true';
    select.addEventListener('change', updateAnnualLeaveModalPreview);
  }

  syncAnnualLeaveSelect();
}

function applyAnnualLeaveSelection(index) {
  const select = document.getElementById('annualLeaveSelect');
  if (!select || typeof state === 'undefined' || !Array.isArray(state.days)) return;

  const dayIndex = Number.isInteger(index) ? index : state.currentDayIndex;
  if (dayIndex === null || !state.days[dayIndex]) return;

  const iso = getAnnualLeaveISO(dayIndex);
  if (!iso) return;

  if (!Array.isArray(state.annualLeaveDates)) state.annualLeaveDates = [];

  const isLeave = select.value === 'true';

  if (isLeave && !state.annualLeaveDates.includes(iso)) {
    state.annualLeaveDates.push(iso);
  }

  if (!isLeave) {
    state.annualLeaveDates = state.annualLeaveDates.filter(date => date !== iso);
  }

  if (isLeave) {
    const entry = state.days[dayIndex];
    entry.worked = false;
    entry.dutyId = '';
    entry.dutyCode = '';
    entry.duty = null;
    entry.hours = 0;
    entry.otMinutes = 0;
    entry.manualMinutes = 0;
    entry.bankHoliday = false;
    entry.sick = false;
    entry.payIn = 0;
    entry.adjustStart = '';
    entry.adjustFinish = '';
    entry.deductMinutes = 0;

    const sickSelect = document.getElementById('sickSelect');
    if (sickSelect) sickSelect.value = 'false';

    if (typeof getPayInPaidMap === 'function') {
      const paidMap = getPayInPaidMap();
      delete paidMap[dayIndex];
    }
  }
}

function bindAnnualLeaveDayModalPatch() {
  if (window.__annualLeaveDayModalPatchBound) return;
  window.__annualLeaveDayModalPatchBound = true;

  document.addEventListener('click', event => {
    if (event.target.closest?.('#grid .tile, #allDaysQuickModalGrid .tile')) {
      setTimeout(ensureAnnualLeaveDayControl, 0);
      setTimeout(syncAnnualLeaveSelect, 30);
    }

    if (event.target.closest?.('#saveEditBtn')) {
      const dayIndex = typeof state !== 'undefined' ? state.currentDayIndex : null;
      applyAnnualLeaveSelection(dayIndex);

      setTimeout(() => {
        if (Number.isInteger(dayIndex)) applyAnnualLeaveSelection(dayIndex);
        if (typeof saveState === 'function') saveState(true);
        if (typeof render === 'function') render();
        if (typeof setStatus === 'function' && isAnnualLeaveDay(dayIndex)) {
          setStatus('Annual leave saved');
        }
      }, 0);
    }
  }, true);

  document.addEventListener('change', event => {
    if (event.target?.id === 'annualLeaveSelect') updateAnnualLeaveModalPreview();
  });

  const dayModal = document.getElementById('dayModalBackdrop');
  if (dayModal && !dayModal.dataset.annualLeaveObserved) {
    dayModal.dataset.annualLeaveObserved = 'true';

    const observer = new MutationObserver(() => {
      if (dayModal.classList.contains('open')) {
        ensureAnnualLeaveDayControl();
        syncAnnualLeaveSelect();
      }
    });

    observer.observe(dayModal, { attributes: true, attributeFilter: ['class'] });
  }

  setTimeout(ensureAnnualLeaveDayControl, 250);
}

function ensureRotaPopupModal() {
  if (document.getElementById('rotaPopupBackdrop')) return;

  const backdrop = document.createElement('div');
  backdrop.id = 'rotaPopupBackdrop';
  backdrop.className = 'modal-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.innerHTML = `
    <div class="modal rota-popup-modal" role="dialog" aria-modal="true" aria-labelledby="rotaPopupTitle">
      <div class="rota-popup-body">
        <div class="modal-head">
          <div class="modal-title" id="rotaPopupTitle">Driver Rota Manager</div>
          <button id="closeRotaPopupBtn" type="button">✕</button>
        </div>
        <iframe class="rota-popup-frame" src="rota.html" title="Driver Rota Manager"></iframe>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  backdrop.addEventListener('click', event => {
    if (event.target === backdrop) closeRotaPopup();
  });

  document.getElementById('closeRotaPopupBtn')?.addEventListener('click', closeRotaPopup);
}

function openRotaPopup() {
  ensureRotaPopupModal();

  document.getElementById('shellMenuBackdrop')?.classList.remove('open');

  const backdrop = document.getElementById('rotaPopupBackdrop');
  if (!backdrop) return;

  backdrop.classList.add('open');
  backdrop.setAttribute('aria-hidden', 'false');
}

function closeRotaPopup() {
  const backdrop = document.getElementById('rotaPopupBackdrop');
  if (!backdrop) return;

  backdrop.classList.remove('open');
  backdrop.setAttribute('aria-hidden', 'true');
}

function reorderEliteToolsModal() {
  const shellGrid = document.querySelector('#shellHomeView .shell-grid');
  if (!shellGrid) return;

  const orderedTiles = [
    document.getElementById('openRotaPopupBtn'),
    shellGrid.querySelector('[data-shell-action="insight"]'),
    shellGrid.querySelector('[data-shell-action="tracker"]'),
    shellGrid.querySelector('[data-shell-action="rates"]'),
    shellGrid.querySelector('[data-shell-action="learn"]')
  ];

  orderedTiles.filter(Boolean).forEach(tile => shellGrid.appendChild(tile));
}

function addRotaPortalButton() {
  ensureRotaPopupStyles();

  const shellGrid = document.querySelector('#shellHomeView .shell-grid');
  if (!shellGrid) return;

  let button = document.getElementById('openRotaPopupBtn');

  if (!button) {
    button = document.createElement('button');
    button.id = 'openRotaPopupBtn';
    button.className = 'shell-action';
    button.type = 'button';
    button.innerHTML = `
      <span class="shell-icon">🚌</span>
      <span class="shell-label">Rota</span>
      <span class="shell-note">Open rota manager popup</span>
    `;

    button.addEventListener('click', openRotaPopup);
    shellGrid.appendChild(button);
  }

  reorderEliteToolsModal();
}

function initRotaPopupPatch() {
  addRotaPortalButton();
  addCalendarExportButton();
  bindAnnualLeaveDayModalPatch();
  reorderEliteToolsModal();

  setTimeout(addRotaPortalButton, 250);
  setTimeout(addRotaPortalButton, 750);
  setTimeout(addCalendarExportButton, 250);
  setTimeout(addCalendarExportButton, 750);
  setTimeout(ensureAnnualLeaveDayControl, 750);
  setTimeout(reorderEliteToolsModal, 900);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRotaPopupPatch);
} else {
  initRotaPopupPatch();
}

window.addEventListener('load', initRotaPopupPatch);