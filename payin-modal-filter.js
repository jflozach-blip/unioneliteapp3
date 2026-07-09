'use strict';

(function initPayInModalFilterPatch() {
  if (window.__payInModalFilterPatchLoaded) return;
  window.__payInModalFilterPatchLoaded = true;

  const TOOL_BACKDROPS = [
    'trackerModalBackdrop',
    'ratesModalBackdrop',
    'rotaPopupBackdrop',
    'repDemandBackdrop',
    'pdfLibraryBackdrop',
    'weeklySummaryImageBackdrop'
  ];

  let returnToEliteToolsMenu = false;

  function addStyle() {
    if (document.getElementById('payInModalFilterStyles')) return;

    const style = document.createElement('style');
    style.id = 'payInModalFilterStyles';
    style.textContent = `
      .payin-filter-note {
        color: #dbeafe;
        font-weight: 900;
        line-height: 1.45;
        padding: 12px 14px;
        border-radius: 18px;
        background: rgba(37, 99, 235, .11);
        border: 1px solid rgba(147, 197, 253, .22);
      }

      .payin-amount-display {
        min-height: 44px;
        display: grid;
        place-items: center;
        padding: 9px 11px;
        border-radius: 15px;
        background: rgba(2, 6, 23, .46);
        border: 1px solid rgba(250, 204, 21, .28);
        color: #fde68a;
        font-weight: 1000;
        text-align: center;
      }

      .payin-day-row.is-paid .payin-amount-display {
        border-color: rgba(134, 239, 172, .38);
        color: #dcfce7;
      }

      .payin-filtered-actions {
        grid-template-columns: 1fr 1fr !important;
      }

      .payin-edit-day-btn {
        border-color: rgba(147, 197, 253, .34) !important;
        background: linear-gradient(180deg, rgba(37, 99, 235, .30), rgba(15, 23, 42, .86)) !important;
        color: #dbeafe !important;
      }

      .payin-empty-card {
        padding: 16px;
        border-radius: 20px;
        background: rgba(15, 23, 42, .70);
        border: 1px solid rgba(148, 163, 184, .18);
        color: #bfdbfe;
        font-weight: 900;
        line-height: 1.45;
        text-align: center;
      }

      @media (max-width: 680px) {
        .payin-filtered-actions {
          grid-template-columns: 1fr !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function showShellHomeSafe() {
    if (typeof showShellHome === 'function') {
      showShellHome();
      return;
    }

    document.getElementById('shellHomeView')?.classList.remove('hidden');
    document.getElementById('shellLearnView')?.classList.add('hidden');
    document.getElementById('shellLearnPageView')?.classList.add('hidden');
  }

  function openEliteToolsMenu() {
    const shell = document.getElementById('shellMenuBackdrop');
    if (!shell) return;

    showShellHomeSafe();
    shell.classList.add('open');
    shell.setAttribute('aria-hidden', 'false');
  }

  function anyEliteToolOpen() {
    return TOOL_BACKDROPS.some(id => document.getElementById(id)?.classList.contains('open'));
  }

  function returnToMenuAfterClose() {
    if (!returnToEliteToolsMenu) return;

    setTimeout(() => {
      if (anyEliteToolOpen()) return;

      returnToEliteToolsMenu = false;
      openEliteToolsMenu();
    }, 90);
  }

  function bindReturnToToolsMenu() {
    if (window.__returnToEliteToolsMenuBound) return;
    window.__returnToEliteToolsMenuBound = true;

    document.addEventListener('click', event => {
      if (event.target.closest?.(
        '#shellMenuBackdrop [data-shell-action], #openRotaPopupBtn, #openRepOnDemandBtn, #openPdfLibraryBtn'
      )) {
        returnToEliteToolsMenu = true;
      }

      const closeButton = event.target.closest?.(
        '#closeTrackerModalBtn, #closeRatesModalBtn, #closeRotaPopupBtn, #closeRepDemandBtn, #cancelRepDemandBtn, #closePdfLibraryBtn, #closeWeeklySummaryImageBtn'
      );

      if (closeButton) {
        returnToMenuAfterClose();
        return;
      }

      if (TOOL_BACKDROPS.some(id => event.target === document.getElementById(id))) {
        returnToMenuAfterClose();
      }
    }, true);

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && anyEliteToolOpen()) {
        returnToMenuAfterClose();
      }
    }, true);
  }

  function patchPayInModal() {
    if (
      typeof renderPayInTracker !== 'function' ||
      typeof getPayInTotals !== 'function' ||
      typeof state === 'undefined' ||
      typeof el === 'undefined'
    ) {
      setTimeout(patchPayInModal, 100);
      return;
    }

    if (window.__payInModalFilterPatched) return;
    window.__payInModalFilterPatched = true;

    addStyle();
    bindReturnToToolsMenu();

    renderPayInTracker = function renderPayInTrackerFiltered() {
      if (!el.trackerModalContent) return;
      if (typeof ensurePayInTrackerStyles === 'function') ensurePayInTrackerStyles();

      const title = document.getElementById('trackerModalTitle');
      if (title) title.textContent = 'Pay-in tracker';

      const totals = getPayInTotals();
      const activeRows = totals.rows.filter(row => Number(row.amount || 0) > 0);

      const rowsHtml = activeRows.length
        ? activeRows.map(row => `
          <div class="payin-day-row ${row.paid ? 'is-paid' : ''}">
            <div class="payin-day-main">
              <span>${row.day} ${row.date}</span>
              <small>${row.paid ? 'Cleared from remaining total' : 'Added from day tile'}</small>
            </div>

            <div class="payin-amount-display">${money(row.amount)}</div>

            <div class="payin-actions payin-filtered-actions">
              <button
                type="button"
                class="payin-deduct-btn ${row.paid ? 'is-paid' : ''}"
                data-payin-action="toggle"
                data-day="${row.index}"
              >${row.paid ? 'Undo' : 'Deduct'}</button>

              <button
                type="button"
                class="payin-edit-day-btn"
                data-payin-open-day="${row.index}"
              >Edit day</button>
            </div>
          </div>
        `).join('')
        : `
          <div class="payin-empty-card">
            No Pay-in / fares have been added from any day tile yet.<br>
            Open a day tile and enter a Pay-in amount to show it here.
          </div>
        `;

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

          <div class="payin-filter-note">
            Only days with Pay-in / fares entered in a day tile are shown below.
            Use <strong>Edit day</strong> to change the amount.
          </div>
        </div>

        <div class="tracker-section">
          <h3>Recorded pay-in days</h3>
          <div class="tracker-list">${rowsHtml}</div>
        </div>
      `;
    };

    document.addEventListener('click', event => {
      const button = event.target.closest?.('[data-payin-open-day]');
      if (!button) return;

      const index = Number(button.dataset.payinOpenDay);
      if (!Number.isInteger(index)) return;

      el.trackerModalBackdrop?.classList.remove('open');
      el.trackerModalBackdrop?.setAttribute('aria-hidden', 'true');

      if (typeof openDayModal === 'function') openDayModal(index);
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchPayInModal);
  } else {
    patchPayInModal();
  }

  window.addEventListener('load', patchPayInModal);
})();