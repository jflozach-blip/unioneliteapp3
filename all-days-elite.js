'use strict';

(function initAllDaysEliteMakeover() {
  if (window.__allDaysEliteMakeoverLoaded) return;
  window.__allDaysEliteMakeoverLoaded = true;

  let suppressNextQuickTileClickUntil = 0;
  let reopenFullWeekModalAfterSave = false;

  function addStyle() {
    if (document.getElementById('allDaysEliteStyles')) return;

    const style = document.createElement('style');
    style.id = 'allDaysEliteStyles';
    style.textContent = `
      #allDaysQuickMini .all-days-mini-day {
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

      #allDaysQuickModalBackdrop {
        background:
          radial-gradient(circle at 50% 10%, rgba(96, 165, 250, .24), transparent 34%),
          radial-gradient(circle at 12% 90%, rgba(250, 204, 21, .10), transparent 30%),
          rgba(0, 0, 0, .76) !important;
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
      }

      #allDaysQuickModalBackdrop .all-days-modal {
        position: relative;
        overflow: auto;
        border-radius: 30px !important;
        padding: 18px !important;
        background:
          radial-gradient(circle at 12% 0%, rgba(96, 165, 250, .32), transparent 36%),
          radial-gradient(circle at 90% 10%, rgba(250, 204, 21, .14), transparent 34%),
          linear-gradient(180deg, rgba(7, 16, 31, .98), rgba(2, 6, 23, .96)) !important;
        border: 1px solid rgba(191, 219, 254, .42) !important;
        box-shadow:
          0 0 58px rgba(37, 99, 235, .34),
          0 26px 80px rgba(0, 0, 0, .58),
          inset 0 1px 0 rgba(255, 255, 255, .12) !important;
      }

      #allDaysQuickModalBackdrop .modal-head,
      #allDaysQuickModalBackdrop .all-days-modal-note {
        position: relative;
        z-index: 1;
        border-radius: 22px !important;
        background:
          radial-gradient(circle at 14% 0%, rgba(147, 197, 253, .16), transparent 42%),
          linear-gradient(180deg, rgba(15, 23, 42, .90), rgba(2, 6, 23, .68)) !important;
        border: 1px solid rgba(147, 197, 253, .22) !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, .07);
      }

      #allDaysQuickModalBackdrop .modal-head {
        padding: 13px 14px;
      }

      #allDaysQuickModalTitle {
        color: #f8fafc;
        font-weight: 1000;
        font-size: 1.25rem;
        text-shadow: 0 0 16px rgba(96, 165, 250, .78), 0 0 32px rgba(37, 99, 235, .38);
      }

      #closeAllDaysQuickModalBtn {
        width: 44px;
        height: 44px;
        border-radius: 999px;
        border: 1px solid rgba(147, 197, 253, .36);
        background: rgba(15, 23, 42, .78);
        color: #dbeafe;
        font-weight: 1000;
        cursor: pointer;
        box-shadow: 0 0 18px rgba(37, 99, 235, .20);
      }

      #allDaysQuickModalBackdrop .all-days-modal-note {
        color: #bfdbfe;
        font-size: .82rem;
        font-weight: 900;
        line-height: 1.45;
        padding: 12px 14px;
      }

      #allDaysQuickModalGrid {
        position: relative;
        z-index: 1;
      }

      #allDaysQuickModalGrid .tile {
        border-radius: 22px !important;
        background:
          radial-gradient(circle at 16% 0%, rgba(147, 197, 253, .16), transparent 42%),
          linear-gradient(180deg, rgba(15, 23, 42, .94), rgba(2, 6, 23, .82)) !important;
        border: 1px solid rgba(147, 197, 253, .24) !important;
        box-shadow:
          0 14px 30px rgba(0, 0, 0, .28),
          inset 0 1px 0 rgba(255, 255, 255, .08) !important;
        transition: transform .16s ease, filter .16s ease, border-color .16s ease, box-shadow .16s ease;
      }

      #allDaysQuickModalGrid .tile.manual {
        border-color: rgba(216, 180, 254, .68) !important;
        background:
          radial-gradient(circle at 16% 0%, rgba(216, 180, 254, .24), transparent 42%),
          radial-gradient(circle at 92% 10%, rgba(250, 204, 21, .10), transparent 34%),
          linear-gradient(180deg, rgba(88, 28, 135, .34), rgba(2, 6, 23, .84)) !important;
      }

      #allDaysQuickModalGrid .tile.sick {
        border-color: rgba(96, 165, 250, .78) !important;
        background:
          radial-gradient(circle at 16% 0%, rgba(147, 197, 253, .28), transparent 42%),
          linear-gradient(180deg, rgba(30, 64, 175, .46), rgba(2, 6, 23, .84)) !important;
        box-shadow:
          0 0 24px rgba(96, 165, 250, .28),
          0 14px 30px rgba(0, 0, 0, .28),
          inset 0 1px 0 rgba(255, 255, 255, .10) !important;
      }

      #allDaysQuickModalGrid .tile.leave {
        border-color: rgba(251, 191, 36, .78) !important;
        background:
          radial-gradient(circle at 18% -4%, rgba(253, 224, 71, .30), transparent 38%),
          radial-gradient(circle at 86% 8%, rgba(251, 146, 60, .20), transparent 38%),
          linear-gradient(180deg, rgba(194, 65, 12, .34), rgba(88, 28, 135, .24), rgba(2, 6, 23, .84)) !important;
        box-shadow:
          0 0 24px rgba(250, 204, 21, .24),
          0 0 36px rgba(251, 146, 60, .14),
          0 14px 30px rgba(0, 0, 0, .28),
          inset 0 1px 0 rgba(255, 255, 255, .10) !important;
      }

      #allDaysQuickModalGrid .tile:hover,
      #allDaysQuickModalGrid .tile:focus {
        transform: translateY(-3px);
        filter: brightness(1.1) saturate(1.08);
        border-color: rgba(191, 219, 254, .58) !important;
        outline: none;
      }

      @media (max-width: 680px) {
        #allDaysQuickModalBackdrop {
          align-items: flex-end;
          padding: 0;
        }

        #allDaysQuickModalBackdrop .all-days-modal {
          width: 100%;
          max-height: 92dvh;
          border-radius: 30px 30px 0 0 !important;
          border-left: 0 !important;
          border-right: 0 !important;
          border-bottom: 0 !important;
          padding-bottom: calc(18px + env(safe-area-inset-bottom)) !important;
        }
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
      sick: !!entry.sick || (Array.isArray(state?.sickDates) && state.sickDates.includes(iso)),
      leave: Array.isArray(state?.annualLeaveDates) && state.annualLeaveDates.includes(iso)
    };
  }

  function decorateQuickViewDays() {
    const days = document.querySelectorAll('#allDaysQuickMini .all-days-mini-day');

    days.forEach((day, index) => {
      const flags = getDayFlags(index);

      day.classList.toggle('manual-time', flags.manual && !flags.sick && !flags.leave);
      day.classList.toggle('sick-day', flags.sick);
      day.classList.toggle('annual-leave', !flags.sick && flags.leave);
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
