'use strict';

(function initAllDaysEliteMakeover() {
  if (window.__allDaysEliteMakeoverLoaded) return;
  window.__allDaysEliteMakeoverLoaded = true;

  let suppressNextQuickTileClickUntil = 0;
  let reopenFullWeekModalAfterSave = false;
  let autoOvertimeSyncing = false;

  function addStyle() {
    if (document.getElementById('allDaysEliteStyles')) return;

    const style = document.createElement('style');
    style.id = 'allDaysEliteStyles';
    style.textContent = `
      #allDaysQuickMini .all-days-mini-day {
        position: relative;
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        transition: transform .16s ease, filter .16s ease, border-color .16s ease, box-shadow .16s ease;
      }

      #allDaysQuickMini .all-days-mini-day:hover,
      #allDaysQuickMini .all-days-mini-day:focus {
        transform: translateY(-2px);
        filter: brightness(1.12);
        border-color: rgba(191, 219, 254, .58) !important;
        box-shadow: 0 0 18px rgba(37, 99, 235, .26);
        outline: none;
      }

      #allDaysQuickMini .all-days-mini-day.overtime-day:not(.sick-day):not(.annual-leave) {
        border-color: rgba(251, 146, 60, .76) !important;
        background:
          radial-gradient(circle at 50% 0%, rgba(251, 146, 60, .26), transparent 54%),
          linear-gradient(180deg, rgba(154, 52, 18, .42), rgba(2, 6, 23, .84)) !important;
        box-shadow:
          0 0 16px rgba(251, 146, 60, .34),
          0 0 30px rgba(250, 204, 21, .12),
          inset 0 1px 0 rgba(255, 255, 255, .10) !important;
      }

      #allDaysQuickMini .quick-ot-symbol {
        position: absolute;
        top: 4px;
        right: 5px;
        font-size: .82rem;
        line-height: 1;
        filter: drop-shadow(0 0 7px rgba(251, 146, 60, .75));
        pointer-events: none;
      }

      #grid .tile.overtime .day-name::after,
      #allDaysQuickModalGrid .tile.overtime .day-name::after {
        content: ' 🔥';
        color: #fb923c;
        font-size: .95em;
        filter: drop-shadow(0 0 8px rgba(251, 146, 60, .72));
      }

      #allDaysQuickMini .all-days-mini-day.manual-time {
        border-color: rgba(216, 180, 254, .72) !important;
        background:
          radial-gradient(circle at 50% 0%, rgba(216, 180, 254, .30), transparent 54%),
          linear-gradient(180deg, rgba(88, 28, 135, .48), rgba(2, 6, 23, .82)) !important;
        box-shadow:
          0 0 16px rgba(168, 85, 247, .34),
          0 0 30px rgba(250, 204, 21, .10),
          inset 0 1px 0 rgba(255, 255, 255, .10) !important;
      }

      #allDaysQuickMini .all-days-mini-day.manual-time strong::after {
        content: ' 🛠';
        color: #fde68a;
      }

      #allDaysQuickMini .all-days-mini-day.sick-day {
        border-color: rgba(96, 165, 250, .82) !important;
        background:
          radial-gradient(circle at 50% 0%, rgba(147, 197, 253, .34), transparent 56%),
          linear-gradient(180deg, rgba(30, 64, 175, .62), rgba(2, 6, 23, .86)) !important;
        box-shadow:
          0 0 18px rgba(96, 165, 250, .42),
          0 0 34px rgba(37, 99, 235, .20),
          inset 0 1px 0 rgba(255, 255, 255, .12) !important;
      }

      #allDaysQuickMini .all-days-mini-day.sick-day strong::after {
        content: ' 💙';
      }

      #allDaysQuickMini .all-days-mini-day.annual-leave {
        border-color: rgba(251, 191, 36, .84) !important;
        background:
          radial-gradient(circle at 50% -10%, rgba(253, 224, 71, .42), transparent 42%),
          radial-gradient(circle at 50% 30%, rgba(251, 146, 60, .28), transparent 52%),
          linear-gradient(180deg, rgba(194, 65, 12, .56), rgba(88, 28, 135, .42), rgba(2, 6, 23, .84)) !important;
        box-shadow:
          0 0 18px rgba(250, 204, 21, .36),
          0 0 34px rgba(251, 146, 60, .18),
          inset 0 1px 0 rgba(255, 255, 255, .14) !important;
      }

      #allDaysQuickMini .all-days-mini-day.annual-leave strong::after {
        content: ' 🌅';
      }

      #otMinutesInput.auto-adjusted {
        border-color: rgba(251, 146, 60, .62) !important;
        box-shadow:
          0 0 18px rgba(251, 146, 60, .24),
          inset 0 1px 0 rgba(255, 255, 255, .08) !important;
      }

      .auto-ot-note {
        display: block;
        margin-top: 6px;
        color: #fed7aa;
        font-weight: 1000;
      }

      #allDaysQuickModalBackdrop {
        background:
          radial-gradient(circle at 50% 10%, rgba(96, 165, 250, .24), transparent 34%),
          radial-gradient(circle at 12% 90%, rgba(250, 204, 21, .10), transparent 30%),
          rgba(0, 0, 0, .76) !important;
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
      }

      #allDaysQuickModalGrid .tile.overtime {
        border-color: rgba(251, 146, 60, .72) !important;
        box-shadow:
          0 0 22px rgba(251, 146, 60, .24),
          0 14px 30px rgba(0, 0, 0, .28),
          inset 0 1px 0 rgba(255, 255, 255, .10) !important;
      }
    `;

    document.head.appendChild(style);
  }

  function getDayIso(index) {
    if (typeof dateFor === 'function' && typeof dateToISO === 'function') {
      return dateToISO(dateFor(index));
    }
    return '';
  }

  function getDayFlags(index) {
    const entry = state?.days?.[index] || {};
    const iso = getDayIso(index);

    return {
      manual: Number(entry.manualMinutes || 0) > 0,
      overtime: Number(entry.otMinutes || 0) > 0,
      sick: !!entry.sick || (Array.isArray(state?.sickDates) && state.sickDates.includes(iso)),
      leave: Array.isArray(state?.annualLeaveDates) && state.annualLeaveDates.includes(iso)
    };
  }

  function parseClockMinutes(value) {
    const match = String(value || '').match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes) || minutes >= 60) return null;
    return hours * 60 + minutes;
  }

  function formatOvertimeMinutes(minutes) {
    const total = Math.max(0, Math.round(Number(minutes || 0)));
    if (!total) return '';

    const hours = Math.floor(total / 60);
    const mins = total % 60;

    return `${hours}:${String(mins).padStart(2, '0')}`;
  }

  function calculateAdjustExtraOvertimeMinutes() {
    const dayIndex = state?.currentDayIndex;
    const dutySelect = document.getElementById('dutySelect');
    const bankHolidaySelect = document.getElementById('bankHolidaySelect');
    const adjustStartInput = document.getElementById('adjustStartInput');
    const adjustFinishInput = document.getElementById('adjustFinishInput');

    if (!Number.isInteger(dayIndex) || !dutySelect?.value || typeof findDuty !== 'function') return 0;

    const isBankHoliday = typeof isBankHolidayDay === 'function' &&
      isBankHolidayDay(dayIndex) &&
      bankHolidaySelect?.value === 'true';

    const duty = findDuty(dayIndex, dutySelect.value, isBankHoliday);
    if (!duty) return 0;

    const dutyStart = parseClockMinutes(duty.start);
    let dutyFinish = parseClockMinutes(duty.finish);
    let actualStart = parseClockMinutes(adjustStartInput?.value || duty.start);
    let actualFinish = parseClockMinutes(adjustFinishInput?.value || duty.finish);

    if (dutyStart == null || dutyFinish == null || actualStart == null || actualFinish == null) return 0;

    if (dutyFinish < dutyStart) dutyFinish += 1440;
    if (actualFinish < actualStart || actualFinish < dutyStart) actualFinish += 1440;

    const earlyStartMinutes = Math.max(0, dutyStart - actualStart);
    const lateFinishMinutes = Math.max(0, actualFinish - dutyFinish);

    return earlyStartMinutes + lateFinishMinutes;
  }

  function writeAutoOvertimeNote(extraMinutes) {
    const preview = document.getElementById('adjustPreview');
    if (!preview) return;

    preview.querySelector('.auto-ot-note')?.remove();

    if (extraMinutes <= 0) return;

    const note = document.createElement('span');
    note.className = 'auto-ot-note';
    note.textContent = `🔥 Auto-added ${formatOvertimeMinutes(extraMinutes)} to overtime for early start / late finish.`;
    preview.appendChild(note);
  }

  function syncAutoOvertimeFromPaidAdjustment() {
    if (autoOvertimeSyncing) return;

    const otInput = document.getElementById('otMinutesInput');
    if (!otInput || typeof parseTime !== 'function') return;

    const extraMinutes = calculateAdjustExtraOvertimeMinutes();
    const previousAuto = Number(otInput.dataset.adjustAutoOvertimeMinutes || 0);
    const parsedCurrent = parseTime(otInput.value || '');

    if (!parsedCurrent.ok) return;

    const userOvertimeMinutes = Math.max(0, Number(parsedCurrent.minutes || 0) - previousAuto);
    const nextTotal = userOvertimeMinutes + extraMinutes;

    autoOvertimeSyncing = true;
    otInput.value = formatOvertimeMinutes(nextTotal);
    otInput.dataset.adjustAutoOvertimeMinutes = String(extraMinutes);
    otInput.classList.toggle('auto-adjusted', extraMinutes > 0);
    autoOvertimeSyncing = false;

    setTimeout(() => writeAutoOvertimeNote(extraMinutes), 0);
    if (typeof updateDayPreview === 'function') setTimeout(updateDayPreview, 0);
  }

  function bindAutoOvertimeFromPaidAdjustment() {
    if (window.__autoOvertimeFromPaidAdjustmentBound) return;
    window.__autoOvertimeFromPaidAdjustmentBound = true;

    document.addEventListener('input', event => {
      if (event.target?.id === 'otMinutesInput' && !autoOvertimeSyncing) {
        event.target.dataset.adjustAutoOvertimeMinutes = '0';
        setTimeout(syncAutoOvertimeFromPaidAdjustment, 0);
        return;
      }

      if (event.target?.id === 'adjustStartInput' || event.target?.id === 'adjustFinishInput') {
        setTimeout(syncAutoOvertimeFromPaidAdjustment, 0);
      }
    }, true);

    document.addEventListener('change', event => {
      if (
        event.target?.id === 'adjustStartInput' ||
        event.target?.id === 'adjustFinishInput' ||
        event.target?.id === 'dutySelect' ||
        event.target?.id === 'bankHolidaySelect'
      ) {
        setTimeout(syncAutoOvertimeFromPaidAdjustment, 0);
      }
    }, true);

    document.addEventListener('click', event => {
      if (event.target.closest?.('#saveEditBtn')) syncAutoOvertimeFromPaidAdjustment();

      if (event.target.closest?.('#grid .tile, #allDaysQuickModalGrid .tile, #allDaysQuickMini .all-days-mini-day')) {
        setTimeout(syncAutoOvertimeFromPaidAdjustment, 120);
      }
    }, true);
  }

  function decorateQuickViewDays() {
    const days = document.querySelectorAll('#allDaysQuickMini .all-days-mini-day');

    days.forEach((day, index) => {
      const flags = getDayFlags(index);

      day.classList.toggle('manual-time', flags.manual && !flags.sick && !flags.leave);
      day.classList.toggle('overtime-day', flags.overtime);
      day.classList.toggle('sick-day', flags.sick);
      day.classList.toggle('annual-leave', !flags.sick && flags.leave);

      let symbol = day.querySelector('.quick-ot-symbol');
      if (flags.overtime && !symbol) {
        symbol = document.createElement('span');
        symbol.className = 'quick-ot-symbol';
        symbol.textContent = '🔥';
        symbol.setAttribute('aria-hidden', 'true');
        day.appendChild(symbol);
      }

      if (!flags.overtime && symbol) symbol.remove();

      day.dataset.quickDayIndex = String(index);
      day.setAttribute('role', 'button');
      day.setAttribute('tabindex', '0');
      day.setAttribute('title', `Open ${day.querySelector('strong')?.textContent || 'day'} editor`);
      day.setAttribute('aria-label', `Open ${day.querySelector('strong')?.textContent || 'day'} editor`);
    });
  }

  function openFullWeekModal() {
    const quickTile = document.getElementById('allDaysQuickTile');
    if (!quickTile) return;

    window.__eliteAllowNextProtectedClick = true;
    quickTile.click();

    setTimeout(() => {
      window.__eliteAllowNextProtectedClick = false;
      decorateQuickViewDays();
    }, 120);
  }

  function openQuickViewDay(index) {
    if (!Number.isInteger(index) || index < 0 || index > 6) return;

    reopenFullWeekModalAfterSave = true;

    const modal = document.getElementById('allDaysQuickModalBackdrop');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }

    if (typeof openDayModal === 'function') {
      openDayModal(index);
      return;
    }

    const sourceTile = document.querySelectorAll('#grid .tile')[index];
    if (sourceTile) sourceTile.click();
  }

  function handleMiniDayActivation(event) {
    const miniDay = event.target.closest?.('#allDaysQuickMini .all-days-mini-day');
    if (!miniDay) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    suppressNextQuickTileClickUntil = Date.now() + 700;
    openQuickViewDay(Number(miniDay.dataset.quickDayIndex));
  }

  function handleDaySaveReturn() {
    if (!reopenFullWeekModalAfterSave) return;

    setTimeout(() => {
      const dayModal = document.getElementById('dayModalBackdrop');
      const dayStillOpen = dayModal?.classList.contains('open');

      if (dayStillOpen) return;

      reopenFullWeekModalAfterSave = false;
      decorateQuickViewDays();
      openFullWeekModal();
    }, 180);
  }

  function bindQuickViewDayClicks() {
    if (window.__quickViewIndividualDayClicksBound) return;
    window.__quickViewIndividualDayClicksBound = true;

    document.addEventListener('pointerdown', handleMiniDayActivation, true);
    document.addEventListener('touchstart', handleMiniDayActivation, true);

    document.addEventListener('click', event => {
      const miniDay = event.target.closest?.('#allDaysQuickMini .all-days-mini-day');

      if (miniDay) {
        handleMiniDayActivation(event);
        return;
      }

      if (event.target.closest?.('#saveEditBtn')) {
        handleDaySaveReturn();
        return;
      }

      if (event.target.closest?.('#cancelEditBtn, #closeModalBtn')) {
        reopenFullWeekModalAfterSave = false;
        return;
      }

      const quickTile = event.target.closest?.('#allDaysQuickTile');
      if (quickTile && Date.now() < suppressNextQuickTileClickUntil) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
    }, true);

    document.addEventListener('keydown', event => {
      const miniDay = event.target.closest?.('#allDaysQuickMini .all-days-mini-day');
      if (!miniDay || (event.key !== 'Enter' && event.key !== ' ')) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      suppressNextQuickTileClickUntil = Date.now() + 700;
      openQuickViewDay(Number(miniDay.dataset.quickDayIndex));
    }, true);
  }

  function observeQuickViewMiniGrid() {
    if (window.__quickViewMiniObserverBound) return;
    window.__quickViewMiniObserverBound = true;

    const observer = new MutationObserver(() => decorateQuickViewDays());
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    addStyle();
    bindQuickViewDayClicks();
    bindAutoOvertimeFromPaidAdjustment();
    observeQuickViewMiniGrid();
    decorateQuickViewDays();

    setTimeout(decorateQuickViewDays, 100);
    setTimeout(decorateQuickViewDays, 350);
    setTimeout(decorateQuickViewDays, 900);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
})();
