'use strict';

(function initWeeklyTotalsActions() {
  if (window.__weeklyTotalsActionsLoaded) return;
  window.__weeklyTotalsActionsLoaded = true;

  function ready() {
    return typeof renderSummary === 'function' &&
      typeof calcSummary === 'function' &&
      typeof money === 'function' &&
      typeof totalPayIn === 'function' &&
      typeof state !== 'undefined' &&
      typeof DAYS !== 'undefined';
  }

  function addStyle() {
    if (document.getElementById('weeklyTotalsActionsStyles')) return;

    const style = document.createElement('style');
    style.id = 'weeklyTotalsActionsStyles';
    style.textContent = `
      .weekly-total-action {
        cursor: pointer;
        border-color: rgba(96, 165, 250, .38) !important;
        transition: transform .16s ease, filter .16s ease, border-color .16s ease, box-shadow .16s ease;
      }

      .weekly-total-action:hover,
      .weekly-total-action:focus {
        transform: translateY(-2px);
        filter: brightness(1.1);
        border-color: rgba(191, 219, 254, .62) !important;
        outline: none;
      }

      .weekly-total-action .summary-label::after {
        content: '  ↗';
        color: #93c5fd;
      }

      .weekly-total-action[data-weekly-action="rates"] .summary-value {
        color: #dcfce7 !important;
        text-shadow: 0 0 14px rgba(34, 197, 94, .42) !important;
      }

      .weekly-best-summary {
        border-color: rgba(34, 197, 94, .28) !important;
      }

      .weekly-best-summary .summary-value {
        color: #bbf7d0 !important;
        text-shadow: 0 0 14px rgba(34, 197, 94, .34) !important;
      }

      .weekly-total-note {
        color: #93c5fd;
        font-size: .66rem;
        font-weight: 900;
        line-height: 1.25;
      }

      .weekly-payin-safe {
        border-color: rgba(34, 197, 94, .42) !important;
        background:
          radial-gradient(circle at 18% 0%, rgba(34, 197, 94, .22), transparent 44%),
          linear-gradient(180deg, rgba(20, 83, 45, .58), rgba(2, 6, 23, .78)) !important;
      }

      .weekly-payin-safe .summary-value,
      .weekly-payin-safe .weekly-total-note {
        color: #bbf7d0 !important;
        text-shadow: 0 0 14px rgba(34, 197, 94, .36) !important;
      }

      .weekly-payin-watch {
        border-color: rgba(250, 204, 21, .46) !important;
        background:
          radial-gradient(circle at 18% 0%, rgba(250, 204, 21, .22), transparent 44%),
          linear-gradient(180deg, rgba(113, 63, 18, .48), rgba(2, 6, 23, .78)) !important;
      }

      .weekly-payin-watch .summary-value,
      .weekly-payin-watch .weekly-total-note {
        color: #fde68a !important;
        text-shadow: 0 0 14px rgba(250, 204, 21, .34) !important;
      }

      .weekly-payin-close {
        border-color: rgba(251, 146, 60, .58) !important;
        background:
          radial-gradient(circle at 18% 0%, rgba(251, 146, 60, .28), transparent 44%),
          linear-gradient(180deg, rgba(154, 52, 18, .58), rgba(2, 6, 23, .80)) !important;
        box-shadow: 0 0 22px rgba(251, 146, 60, .18) !important;
      }

      .weekly-payin-close .summary-value,
      .weekly-payin-close .weekly-total-note {
        color: #fed7aa !important;
        text-shadow: 0 0 16px rgba(251, 146, 60, .42) !important;
      }

      .weekly-payin-urgent {
        border-color: rgba(248, 113, 113, .72) !important;
        background:
          radial-gradient(circle at 18% 0%, rgba(248, 113, 113, .34), transparent 44%),
          linear-gradient(180deg, rgba(127, 29, 29, .72), rgba(2, 6, 23, .84)) !important;
        box-shadow:
          0 0 18px rgba(248, 113, 113, .28),
          0 0 42px rgba(220, 38, 38, .20) !important;
        animation: payInUrgentPulse 1.4s ease-in-out infinite;
      }

      .weekly-payin-urgent .summary-value,
      .weekly-payin-urgent .weekly-total-note {
        color: #fecaca !important;
        text-shadow:
          0 0 16px rgba(248, 113, 113, .64),
          0 0 34px rgba(220, 38, 38, .36) !important;
      }

      @keyframes payInUrgentPulse {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.18) saturate(1.18); }
      }
    `;
    document.head.appendChild(style);
  }

  function setLabel(valueId, text) {
    const value = document.getElementById(valueId);
    const label = value?.closest('.summary-item')?.querySelector('.summary-label');
    if (label) label.textContent = text;
  }

  function setNote(valueId, text) {
    const value = document.getElementById(valueId);
    const tile = value?.closest('.summary-item');
    if (!tile) return;

    let note = tile.querySelector('.weekly-total-note');
    if (!note) {
      note = document.createElement('div');
      note.className = 'weekly-total-note';
      tile.appendChild(note);
    }

    note.textContent = text;
  }

  function startOfDay(date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  function getPayInStatus() {
    const totals = typeof getPayInTotals === 'function'
      ? getPayInTotals()
      : { total: totalPayIn(), deducted: 0, remaining: totalPayIn() };

    const total = Number(totals.total || 0);
    const remaining = Number((totals.remaining ?? total) || 0);

    if (total <= 0) {
      return {
        amount: 0,
        className: 'weekly-payin-safe',
        note: 'No pay-in recorded'
      };
    }

    if (remaining <= 0) {
      return {
        amount: 0,
        className: 'weekly-payin-safe',
        note: 'All pay-in cleared'
      };
    }

    const today = startOfDay(new Date());
    const monday = typeof dateFor === 'function' ? startOfDay(dateFor(0)) : today;
    const sunday = typeof dateFor === 'function' ? startOfDay(dateFor(6)) : today;

    if (today < monday) {
      return {
        amount: remaining,
        className: 'weekly-payin-watch',
        note: 'Due Sunday of selected week'
      };
    }

    if (today > sunday) {
      return {
        amount: remaining,
        className: 'weekly-payin-urgent',
        note: 'Past Sunday deadline'
      };
    }

    const daysToSunday = Math.max(0, Math.ceil((sunday - today) / 86400000));

    if (daysToSunday <= 0) {
      return {
        amount: remaining,
        className: 'weekly-payin-urgent',
        note: 'Due by end of business today'
      };
    }

    if (daysToSunday <= 1) {
      return {
        amount: remaining,
        className: 'weekly-payin-urgent',
        note: 'Sunday deadline very close'
      };
    }

    if (daysToSunday <= 3) {
      return {
        amount: remaining,
        className: 'weekly-payin-close',
        note: `${daysToSunday} days until Sunday deadline`
      };
    }

    return {
      amount: remaining,
      className: 'weekly-payin-watch',
      note: `${daysToSunday} days until Sunday deadline`
    };
  }

  function decoratePayInTile() {
    const payInTile = document.getElementById('summaryPayIn')?.closest('.summary-item');
    if (!payInTile) return;

    payInTile.classList.remove(
      'weekly-payin-safe',
      'weekly-payin-watch',
      'weekly-payin-close',
      'weekly-payin-urgent'
    );

    const status = getPayInStatus();
    payInTile.classList.add(status.className);
    setNote('summaryPayIn', status.note);
  }

  function decorateActions() {
    const total = document.getElementById('summaryTotal')?.closest('.summary-item');
    const best = document.getElementById('summaryWorked')?.closest('.summary-item');
    const payIn = document.getElementById('summaryPayIn')?.closest('.summary-item');

    if (total) {
      total.classList.add('weekly-total-action');
      total.dataset.weeklyAction = 'rates';
      total.setAttribute('role', 'button');
      total.setAttribute('tabindex', '0');
      total.setAttribute('title', 'Open rates and net pay estimate');
    }

    if (best) {
      best.classList.add('weekly-best-summary');
      best.removeAttribute('data-weekly-action');
      best.removeAttribute('role');
      best.removeAttribute('tabindex');
      best.setAttribute('title', 'Best paid day, lowest paid day and average day estimate');
    }

    if (payIn) {
      payIn.classList.add('weekly-total-action');
      payIn.dataset.weeklyAction = 'payin';
      payIn.setAttribute('role', 'button');
      payIn.setAttribute('tabindex', '0');
      payIn.setAttribute('title', 'Open pay-in tracker');
    }

    setLabel('summaryTotal', 'Net estimate');
    setLabel('summaryWorked', 'Best paid day');
    setLabel('summaryPayIn', 'Pay-in outstanding');
    decoratePayInTile();
  }

  function renderBestDaySummary(summary) {
    const best = document.getElementById('summaryWorked');
    if (!best) return;

    if (!summary.bestDay || Number(summary.bestPay || 0) <= 0) {
      best.textContent = '—';
      setNote('summaryWorked', 'No paid days yet');
      return;
    }

    best.textContent = `${summary.bestDay} ${money(summary.bestPay)}`;

    const lowText = summary.lowestDay
      ? `Low ${summary.lowestDay} ${money(summary.lowestPay)}`
      : 'Low —';

    setNote('summaryWorked', `Avg ${money(summary.averagePerWorkedDay)} • ${lowText}`);
  }

  function renderNetWeeklySummary() {
    const summary = calcSummary();
    const payInStatus = getPayInStatus();

    const total = document.getElementById('summaryTotal');
    const payIn = document.getElementById('summaryPayIn');

    if (total) total.textContent = money(summary.netPay);
    renderBestDaySummary(summary);
    if (payIn) payIn.textContent = money(payInStatus.amount);

    decorateActions();
  }

  function patchRenderSummary() {
    if (window.__weeklyTotalsRenderSummaryPatched) return;
    window.__weeklyTotalsRenderSummaryPatched = true;

    renderSummary = function renderSummaryNetEstimate() {
      renderNetWeeklySummary();
    };

    renderNetWeeklySummary();
  }

  function openProtected(action) {
    if (typeof action !== 'function') return;

    if (typeof window.requireEliteAccess === 'function') {
      window.requireEliteAccess(action);
      return;
    }

    action();
  }

  function openWeeklyAction(action) {
    if (action === 'rates') {
      openProtected(() => {
        if (typeof openRates === 'function') openRates();
      });
      return;
    }

    if (action === 'payin') {
      openProtected(() => {
        if (typeof openPayInTracker === 'function') openPayInTracker();
      });
    }
  }

  function bindActions() {
    if (window.__weeklyTotalsActionClicksBound) return;
    window.__weeklyTotalsActionClicksBound = true;

    document.addEventListener('click', event => {
      const tile = event.target.closest?.('[data-weekly-action]');
      if (!tile) return;

      event.preventDefault();
      openWeeklyAction(tile.dataset.weeklyAction);
    });

    document.addEventListener('keydown', event => {
      const tile = event.target.closest?.('[data-weekly-action]');
      if (!tile || (event.key !== 'Enter' && event.key !== ' ')) return;

      event.preventDefault();
      openWeeklyAction(tile.dataset.weeklyAction);
    });
  }

  function init() {
    if (!ready()) {
      setTimeout(init, 80);
      return;
    }

    addStyle();
    bindActions();
    patchRenderSummary();
    decorateActions();

    if (typeof render === 'function') render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
})();