'use strict';

(function initModalHelpersOnce() {
  if (window.__modalHelpersLoaded) return;
  window.__modalHelpersLoaded = true;

  let reopenAllDaysQuickAfterDaySave = false;

  function addStyle(id, css) {
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  }

  function ensureUnifiedPageScrollStyles() {
    addStyle('unifiedPageScrollStyles', `
      html, body {
        height: auto !important;
        min-height: 100% !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
      }

      body, .header, .wrap, main, #grid {
        position: static !important;
        overflow: visible !important;
      }

      .header {
        top: auto !important;
        z-index: auto !important;
      }
    `);
  }

  function ensureAllDaysQuickViewStyles() {
    addStyle('allDaysQuickViewStyles', `
      .all-days-quick-tile {
        max-width: 720px;
        width: 100%;
        margin-inline: auto;
        padding: 12px;
        border-radius: 24px;
        border: 1px solid rgba(147, 197, 253, .28);
        background:
          radial-gradient(circle at 12% 0%, rgba(96, 165, 250, .20), transparent 38%),
          radial-gradient(circle at 92% 10%, rgba(250, 204, 21, .12), transparent 34%),
          linear-gradient(180deg, rgba(15, 23, 42, .96), rgba(2, 6, 23, .88));
        color: #f8fafc;
        cursor: pointer;
        display: grid;
        gap: 10px;
        text-align: left;
        box-shadow: 0 18px 38px rgba(0, 0, 0, .22);
      }

      .all-days-quick-head {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        align-items: center;
      }

      .all-days-quick-title {
        display: grid;
        gap: 3px;
      }

      .all-days-quick-title strong {
        color: #dbeafe;
        font-size: .9rem;
        font-weight: 1000;
        text-transform: uppercase;
        letter-spacing: .08em;
      }

      .all-days-quick-title span {
        color: #93c5fd;
        font-size: .74rem;
        font-weight: 850;
      }

      .all-days-quick-pill {
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(250, 204, 21, .12);
        border: 1px solid rgba(253, 230, 138, .34);
        color: #fde68a;
        font-size: .68rem;
        font-weight: 1000;
        text-transform: uppercase;
        white-space: nowrap;
      }

      .all-days-mini-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 7px;
      }

      .all-days-mini-day {
        min-height: 54px;
        display: grid;
        align-content: center;
        gap: 3px;
        padding: 8px;
        border-radius: 15px;
        background: rgba(15, 23, 42, .84);
        border: 1px solid rgba(148, 163, 184, .18);
        text-align: center;
      }

      .all-days-mini-day.active {
        border-color: rgba(34, 197, 94, .52);
        background: rgba(20, 83, 45, .22);
      }

      .all-days-mini-day.rest {
        border-color: rgba(239, 68, 68, .34);
        background: rgba(127, 29, 29, .16);
      }

      .all-days-mini-day strong {
        font-size: .74rem;
        color: #dbeafe;
        font-weight: 1000;
      }

      .all-days-mini-day span {
        font-size: .72rem;
        color: #f8fafc;
        font-weight: 1000;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .all-days-mini-day small {
        font-size: .64rem;
        color: #94a3b8;
        font-weight: 850;
      }

      .all-days-modal {
        width: min(980px, 100%);
        max-height: min(92dvh, 900px);
        overflow: auto;
      }

      .all-days-modal-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .all-days-modal-grid .tile {
        cursor: pointer;
        min-height: 165px;
      }

      .all-days-modal-note {
        color: #bfdbfe;
        font-size: .82rem;
        font-weight: 850;
        line-height: 1.4;
        padding: 10px 12px;
        border-radius: 16px;
        background: rgba(37, 99, 235, .12);
        border: 1px solid rgba(147, 197, 253, .18);
      }

      .payin-guidance {
        display: grid;
        gap: 10px;
        padding: 14px;
        border-radius: 22px;
        background:
          radial-gradient(circle at 12% 0%, rgba(250, 204, 21, .13), transparent 38%),
          linear-gradient(180deg, rgba(15, 23, 42, .92), rgba(2, 6, 23, .78));
        border: 1px solid rgba(250, 204, 21, .24);
      }

      .payin-guidance-title {
        color: #fde68a;
        font-size: .92rem;
        font-weight: 1000;
        text-transform: uppercase;
        letter-spacing: .06em;
      }

      .payin-warning-strip {
        padding: 10px 12px;
        border-radius: 16px;
        background: rgba(127, 29, 29, .22);
        border: 1px solid rgba(248, 113, 113, .26);
        color: #fecaca;
        font-weight: 900;
        line-height: 1.4;
      }

      .payin-guidance-list {
        margin: 0;
        padding-left: 18px;
        display: grid;
        gap: 7px;
        color: #dbeafe;
        font-weight: 800;
        line-height: 1.42;
      }

      .payin-complete {
        display: grid;
        gap: 8px;
        padding: 18px;
        border-radius: 24px;
        background:
          radial-gradient(circle at 16% 0%, rgba(134, 239, 172, .28), transparent 42%),
          linear-gradient(180deg, rgba(20, 83, 45, .72), rgba(2, 6, 23, .82));
        border: 1px solid rgba(134, 239, 172, .55);
        text-align: center;
      }

      .payin-complete-title {
        font-size: clamp(1.35rem, 6vw, 2rem);
        font-weight: 1000;
        color: #dcfce7;
      }

      .payin-complete-sub {
        color: #bbf7d0;
        font-weight: 900;
        line-height: 1.45;
      }

      @media (max-width: 680px) {
        .all-days-quick-tile {
          max-width: 100%;
          margin-inline: 0;
        }

        .all-days-mini-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .all-days-modal-grid {
          grid-template-columns: 1fr;
        }

        #allDaysQuickModalBackdrop {
          align-items: flex-end;
          padding: 0;
        }

        #allDaysQuickModalBackdrop .all-days-modal {
          width: 100%;
          max-height: 92dvh;
          border-radius: 26px 26px 0 0;
          border-left: 0;
          border-right: 0;
          border-bottom: 0;
          padding-bottom: calc(16px + env(safe-area-inset-bottom));
        }
      }
    `);
  }

  function ensureAllDaysQuickViewTile() {
    ensureAllDaysQuickViewStyles();

    if (!document.getElementById('allDaysQuickTile')) {
      const tile = document.createElement('button');
      tile.id = 'allDaysQuickTile';
      tile.className = 'all-days-quick-tile';
      tile.type = 'button';
      tile.innerHTML = `
        <div class="all-days-quick-head">
          <div class="all-days-quick-title">
            <strong>All days quick view</strong>
            <span id="allDaysQuickWeek">Open all day tiles in one popup</span>
          </div>
          <div class="all-days-quick-pill">Open tiles</div>
        </div>
        <div class="all-days-mini-grid" id="allDaysQuickMini"></div>
      `;

      const weekTools = document.querySelector('.week-tools-tile');
      const header = document.querySelector('.header');

      if (weekTools) weekTools.insertAdjacentElement('beforebegin', tile);
      else if (header) header.prepend(tile);
    }

    if (!document.getElementById('allDaysQuickModalBackdrop')) {
      const backdrop = document.createElement('div');
      backdrop.id = 'allDaysQuickModalBackdrop';
      backdrop.className = 'modal-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      backdrop.innerHTML = `
        <div class="modal large-modal all-days-modal" role="dialog" aria-modal="true" aria-labelledby="allDaysQuickModalTitle">
          <div class="modal-head">
            <div class="modal-title" id="allDaysQuickModalTitle">All day tiles</div>
            <button id="closeAllDaysQuickModalBtn" type="button">✕</button>
          </div>
          <div class="all-days-modal-note">Tap any day tile below to edit that day.</div>
          <div id="allDaysQuickModalGrid" class="all-days-modal-grid"></div>
        </div>
      `;

      document.body.appendChild(backdrop);
    }
  }

  function updateAllDaysQuickViewTile() {
    ensureAllDaysQuickViewTile();

    const mini = document.getElementById('allDaysQuickMini');
    const week = document.getElementById('allDaysQuickWeek');

    if (!mini || typeof state === 'undefined' || typeof DAYS === 'undefined') return;

    if (week) {
      week.textContent = typeof weekName === 'function' ? weekName() : 'Open all day tiles in one popup';
    }

    mini.innerHTML = DAYS.map((day, index) => {
      const entry = state.days[index] || {};
      const iso = typeof dateFor === 'function' && typeof dateToISO === 'function'
        ? dateToISO(dateFor(index))
        : '';

      const isAnnualLeave = Array.isArray(state.annualLeaveDates) && state.annualLeaveDates.includes(iso);
      const isSick = !!entry.sick || (Array.isArray(state.sickDates) && state.sickDates.includes(iso));
      const hasDuty = !!entry.duty;
      const label = isSick ? 'SK' : isAnnualLeave ? 'AL' : hasDuty ? `Duty ${entry.duty.code}` : 'RD';
      const amount = typeof dayPay === 'function' && typeof money === 'function'
        ? money(dayPay(index, entry))
        : '';

      return `
        <div class="all-days-mini-day ${hasDuty ? 'active' : 'rest'}">
          <strong>${day.name}</strong>
          <span>${label}</span>
          <small>${amount}</small>
        </div>
      `;
    }).join('');
  }

  function openAllDaysQuickModal() {
    ensureAllDaysQuickViewTile();
    updateAllDaysQuickViewTile();

    const grid = document.getElementById('allDaysQuickModalGrid');
    const backdrop = document.getElementById('allDaysQuickModalBackdrop');
    if (!grid || !backdrop) return;

    const sourceTiles = [...document.querySelectorAll('#grid .tile')];

    if (!sourceTiles.length) {
      grid.innerHTML = `
        <div class="tracker-row">
          <div class="tracker-row-main">No day tiles found yet</div>
          <div class="tracker-row-mid">—</div>
          <div class="tracker-row-end">Refresh</div>
        </div>
      `;
    } else {
      grid.innerHTML = '';
      sourceTiles.forEach((sourceTile, index) => {
        const clone = sourceTile.cloneNode(true);
        clone.dataset.quickDayIndex = String(index);
        clone.setAttribute('role', 'button');
        clone.setAttribute('tabindex', '0');
        grid.appendChild(clone);
      });
    }

    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
  }

  function closeAllDaysQuickModal() {
    const backdrop = document.getElementById('allDaysQuickModalBackdrop');
    if (!backdrop) return;

    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
  }

  function enhancePayInTrackerModal() {
    const content = document.getElementById('trackerModalContent');
    if (!content || !content.querySelector('.payin-hero')) return;

    ensureAllDaysQuickViewStyles();

    const totals = typeof getPayInTotals === 'function'
      ? getPayInTotals()
      : { total: 0, deducted: 0, remaining: 0 };

    if (!content.querySelector('.payin-guidance')) {
      const guidance = document.createElement('div');
      guidance.className = 'tracker-section payin-guidance';
      guidance.innerHTML = `
        <div class="payin-guidance-title">⚠️ Pay-in rules & reminders</div>
        <div class="payin-warning-strip">
          Pay-in / fares are tracked separately. They are <strong>not wages</strong>.
        </div>
        <ul class="payin-guidance-list">
          <li>Only press <strong>Deduct</strong> after that day’s money has cleared.</li>
          <li>Deducting a day reduces the remaining pay-in total only.</li>
          <li>If a day is cleared by mistake, press <strong>Undo</strong>.</li>
          <li>This tracker is stored locally on this browser/device.</li>
        </ul>
      `;
      content.appendChild(guidance);
    }

    const hasTotal = Number(totals.total || 0) > 0;
    const allCleared = hasTotal && Number(totals.remaining || 0) <= 0;
    const oldComplete = content.querySelector('.payin-complete');

    if (oldComplete && !allCleared) oldComplete.remove();

    if (allCleared && !oldComplete) {
      const complete = document.createElement('div');
      complete.className = 'tracker-section payin-complete';
      complete.innerHTML = `
        <div class="payin-complete-title">🎉 Congratulations!</div>
        <div class="payin-complete-sub">
          All recorded pay-in for this week has been deducted and cleared.<br>
          Total cleared: <strong>${typeof money === 'function' ? money(totals.deducted) : '£' + Number(totals.deducted || 0).toFixed(2)}</strong>
        </div>
      `;
      content.prepend(complete);
    }
  }

  function bindPayInEnhancementObserver() {
    const content = document.getElementById('trackerModalContent');
    if (!content || window.__payInEnhancementObserverBound) return;

    window.__payInEnhancementObserverBound = true;

    const observer = new MutationObserver(() => {
      if (content.querySelector('.payin-hero')) enhancePayInTrackerModal();
    });

    observer.observe(content, { childList: true, subtree: false });

    document.addEventListener('click', event => {
      if (event.target.closest?.('[data-shell-action="insight"], [data-payin-action]')) {
        setTimeout(enhancePayInTrackerModal, 0);
      }
    }, true);
  }

  function bindAutoWeekLoader() {
    if (window.__autoWeekLoaderBound || typeof state === 'undefined' || typeof DAYS === 'undefined') return;
    window.__autoWeekLoaderBound = true;

    function blankDay() {
      return {
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
      };
    }

    function resetCurrentWeekDays() {
      state.days = DAYS.map(() => blankDay());

      const key = typeof weekKey === 'function' ? weekKey() : dateToISO(state.weekStartDate);
      if (state.payInPaidByWeek && state.payInPaidByWeek[key]) delete state.payInPaidByWeek[key];

      if (typeof normalizeStateDays === 'function') normalizeStateDays();
    }

    function selectWeek(date) {
      const monday = getMonday(date);
      const key = dateToISO(monday);

      state.weekStartDate = monday;

      if (state.savedWeeks && state.savedWeeks[key] && typeof loadWeekSnapshot === 'function') {
        loadWeekSnapshot(key);
        if (typeof setStatus === 'function') setStatus('Saved week loaded');
        setTimeout(updateAllDaysQuickViewTile, 0);
        return;
      }

      resetCurrentWeekDays();
      if (typeof saveState === 'function') saveState(true);
      if (typeof render === 'function') render();
      if (typeof renderLoadOptions === 'function') renderLoadOptions();
      if (typeof setStatus === 'function') setStatus('New blank week started');
      setTimeout(updateAllDaysQuickViewTile, 0);
    }

    const weekInput = document.getElementById('weekStartInput');
    const prevBtn = document.getElementById('prevWeekBtn');
    const nextBtn = document.getElementById('nextWeekBtn');

    if (weekInput) {
      weekInput.addEventListener('change', event => {
        event.stopImmediatePropagation();
        if (weekInput.value) selectWeek(isoToDate(weekInput.value));
      }, true);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();

        const d = new Date(state.weekStartDate);
        d.setDate(d.getDate() - 7);
        selectWeek(d);
      }, true);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();

        const d = new Date(state.weekStartDate);
        d.setDate(d.getDate() + 7);
        selectWeek(d);
      }, true);
    }
  }

  function bindDelegatedModalEvents() {
    if (window.__allDaysDelegatedEventsBound) return;
    window.__allDaysDelegatedEventsBound = true;

    document.addEventListener('click', event => {
      if (event.target.closest?.('#saveEditBtn')) {
        const shouldReopen = reopenAllDaysQuickAfterDaySave;

        if (shouldReopen) {
          setTimeout(() => {
            const dayModal = document.getElementById('dayModalBackdrop');
            const dayStillOpen = dayModal?.classList.contains('open');

            if (!dayStillOpen) {
              reopenAllDaysQuickAfterDaySave = false;
              openAllDaysQuickModal();
            }
          }, 140);
        }
      }

      if (event.target.closest?.('#cancelEditBtn, #closeModalBtn')) {
        reopenAllDaysQuickAfterDaySave = false;
      }

      if (event.target.closest?.('#allDaysQuickTile')) {
        openAllDaysQuickModal();
        return;
      }

      if (event.target.closest?.('#closeAllDaysQuickModalBtn')) {
        closeAllDaysQuickModal();
        return;
      }

      const backdrop = document.getElementById('allDaysQuickModalBackdrop');
      if (backdrop && event.target === backdrop) {
        closeAllDaysQuickModal();
        return;
      }

      const quickTile = event.target.closest?.('#allDaysQuickModalGrid .tile');
      if (quickTile) {
        const index = Number(quickTile.dataset.quickDayIndex);
        if (Number.isInteger(index)) {
          reopenAllDaysQuickAfterDaySave = true;
          closeAllDaysQuickModal();
          if (typeof openDayModal === 'function') openDayModal(index);
        }
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        reopenAllDaysQuickAfterDaySave = false;
        closeAllDaysQuickModal();
      }

      const quickTile = event.target.closest?.('#allDaysQuickModalGrid .tile');
      if (quickTile && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        quickTile.click();
      }
    });
  }

  function bindAllDaysQuickView() {
    ensureAllDaysQuickViewTile();
    updateAllDaysQuickViewTile();

    const grid = document.getElementById('grid');

    if (grid && !window.__allDaysQuickViewObserverBound) {
      window.__allDaysQuickViewObserverBound = true;

      const observer = new MutationObserver(() => {
        setTimeout(updateAllDaysQuickViewTile, 0);
      });

      observer.observe(grid, { childList: true, subtree: true });
    }

    setTimeout(updateAllDaysQuickViewTile, 0);
    setTimeout(updateAllDaysQuickViewTile, 250);
    setTimeout(updateAllDaysQuickViewTile, 750);
  }

  window.TrackerModal = window.TrackerModal || {
    open(html = '') {
      const backdrop = document.getElementById('trackerModalBackdrop');
      const content = document.getElementById('trackerModalContent');

      if (content) content.innerHTML = html;
      if (backdrop) {
        backdrop.classList.add('open');
        backdrop.setAttribute('aria-hidden', 'false');
      }
    },
    close() {
      const backdrop = document.getElementById('trackerModalBackdrop');

      if (backdrop) {
        backdrop.classList.remove('open');
        backdrop.setAttribute('aria-hidden', 'true');
      }
    },
    renderSection(title, rowsHtml) {
      return `
        <section class="tracker-section">
          <h3>${title}</h3>
          <div class="tracker-list">${rowsHtml}</div>
        </section>
      `;
    },
    renderRow(left, middle, right, extraClass = '') {
      return `
        <div class="tracker-row ${extraClass}">
          <div class="tracker-row-main">${left}</div>
          <div class="tracker-row-mid">${middle}</div>
          <div class="tracker-row-end">${right}</div>
        </div>
      `;
    }
  };

  function initModalHelpers() {
    ensureUnifiedPageScrollStyles();
    bindDelegatedModalEvents();
    bindPayInEnhancementObserver();
    bindAllDaysQuickView();
    setTimeout(bindAutoWeekLoader, 0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModalHelpers);
  } else {
    initModalHelpers();
  }

  window.addEventListener('load', () => {
    setTimeout(initModalHelpers, 0);
    setTimeout(updateAllDaysQuickViewTile, 300);
  });
})();