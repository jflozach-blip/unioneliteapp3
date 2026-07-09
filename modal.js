'use strict';

(function loadModalHelpers() {
  function loadFlatFallbackScripts() {
    if (typeof getMonday !== 'function') {
      document.write('<script src="date.js"><\/script>');
    }

    if (typeof DUTY_SETS === 'undefined') {
      document.write('<script src="duties.js"><\/script>');
    }
  }

  loadFlatFallbackScripts();

  function hideMainDayTiles() {
    if (document.getElementById('hideMainDayTilesStyles')) return;

    const style = document.createElement('style');
    style.id = 'hideMainDayTilesStyles';
    style.textContent = `
      .wrap {
        display: none !important;
      }

      .header {
        margin-bottom: 0 !important;
      }
    `;
    document.head.appendChild(style);
  }

  hideMainDayTiles();

  function eliteWeekToolsButtons() {
    if (document.getElementById('eliteWeekToolsButtonsStyles')) return;

    const style = document.createElement('style');
    style.id = 'eliteWeekToolsButtonsStyles';
    style.textContent = `
      .week-tools-tile {
        position: relative;
        overflow: hidden;
        border-color: rgba(191, 219, 254, .36) !important;
        background:
          radial-gradient(circle at 12% 0%, rgba(96, 165, 250, .28), transparent 38%),
          radial-gradient(circle at 92% 8%, rgba(250, 204, 21, .14), transparent 34%),
          linear-gradient(180deg, rgba(7, 16, 31, .98), rgba(2, 6, 23, .90)) !important;
        box-shadow:
          0 18px 42px rgba(0, 0, 0, .28),
          0 0 34px rgba(37, 99, 235, .18),
          inset 0 1px 0 rgba(255, 255, 255, .10) !important;
      }

      .week-tools-tile::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(120deg, transparent 0%, rgba(147, 197, 253, .10) 42%, transparent 70%);
      }

      .week-tools-head,
      .week-tools-grid {
        position: relative;
        z-index: 1;
      }

      .week-tools-grid {
        gap: 9px !important;
      }

      .week-tools-grid input,
      .week-tools-grid select,
      .week-tools-grid button {
        min-height: 46px !important;
        border-radius: 17px !important;
        border: 1px solid rgba(147, 197, 253, .30) !important;
        background:
          linear-gradient(180deg, rgba(2, 6, 23, .96), rgba(2, 6, 23, .76)) !important;
        color: #f8fafc !important;
        font-weight: 1000 !important;
        letter-spacing: -.01em;
        box-shadow:
          0 0 0 1px rgba(147, 197, 253, .10),
          0 0 18px rgba(37, 99, 235, .12),
          inset 0 1px 0 rgba(255, 255, 255, .08) !important;
        transition: transform .16s ease, filter .16s ease, border-color .16s ease, box-shadow .16s ease;
      }

      .week-tools-grid button {
        position: relative;
        overflow: hidden;
        isolation: isolate;
      }

      .week-tools-grid button::after {
        content: '';
        position: absolute;
        inset: 1px;
        border-radius: inherit;
        pointer-events: none;
        background: linear-gradient(180deg, rgba(255, 255, 255, .055), transparent 46%);
        z-index: -1;
      }

      .week-tools-grid input:focus,
      .week-tools-grid select:focus,
      .week-tools-grid button:focus {
        outline: 1px solid rgba(96, 165, 250, .78);
        box-shadow:
          0 0 0 1px rgba(147, 197, 253, .24),
          0 0 22px rgba(37, 99, 235, .28),
          inset 0 1px 0 rgba(255, 255, 255, .10) !important;
      }

      .week-tools-grid button:hover {
        transform: translateY(-2px);
        filter: brightness(1.12) saturate(1.08);
      }

      #weekStartInput {
        color: #dbeafe !important;
        text-shadow: 0 0 10px rgba(96, 165, 250, .26);
      }

      #savedWeeksSelect {
        color: #fde68a !important;
        border-color: rgba(250, 204, 21, .38) !important;
        box-shadow:
          0 0 0 1px rgba(250, 204, 21, .14),
          0 0 18px rgba(250, 204, 21, .12),
          inset 0 1px 0 rgba(255, 255, 255, .08) !important;
      }

      #saveWeekBtn {
        border-color: rgba(134, 239, 172, .62) !important;
        background:
          linear-gradient(180deg, rgba(2, 6, 23, .97), rgba(2, 6, 23, .78)) !important;
        color: #dcfce7 !important;
        text-shadow: 0 0 12px rgba(34, 197, 94, .46);
        box-shadow:
          0 0 0 1px rgba(134, 239, 172, .20),
          0 0 18px rgba(34, 197, 94, .28),
          0 0 38px rgba(34, 197, 94, .12),
          inset 0 1px 0 rgba(255, 255, 255, .12) !important;
      }

      #saveWeekBtn::before {
        content: '💾 ';
      }

      #loadWeekBtn {
        border-color: rgba(253, 230, 138, .62) !important;
        background:
          linear-gradient(180deg, rgba(2, 6, 23, .97), rgba(2, 6, 23, .78)) !important;
        color: #fef3c7 !important;
        text-shadow: 0 0 12px rgba(250, 204, 21, .38);
        box-shadow:
          0 0 0 1px rgba(250, 204, 21, .20),
          0 0 18px rgba(250, 204, 21, .26),
          0 0 38px rgba(250, 204, 21, .11),
          inset 0 1px 0 rgba(255, 255, 255, .12) !important;
      }

      #loadWeekBtn::before {
        content: '📂 ';
      }

      #exportWeekCalendarBtn {
        border-color: rgba(147, 197, 253, .66) !important;
        background:
          linear-gradient(180deg, rgba(2, 6, 23, .97), rgba(2, 6, 23, .78)) !important;
        color: #dbeafe !important;
        text-shadow: 0 0 12px rgba(96, 165, 250, .46);
        box-shadow:
          0 0 0 1px rgba(147, 197, 253, .20),
          0 0 18px rgba(37, 99, 235, .30),
          0 0 38px rgba(37, 99, 235, .14),
          inset 0 1px 0 rgba(255, 255, 255, .12) !important;
      }

      #exportWeekCalendarBtn::before {
        content: '📅 ';
      }

      #resetWeekBtn {
        border-color: rgba(248, 113, 113, .66) !important;
        background:
          linear-gradient(180deg, rgba(2, 6, 23, .97), rgba(2, 6, 23, .78)) !important;
        color: #fee2e2 !important;
        text-shadow: 0 0 12px rgba(248, 113, 113, .44);
        box-shadow:
          0 0 0 1px rgba(248, 113, 113, .20),
          0 0 18px rgba(220, 38, 38, .28),
          0 0 38px rgba(220, 38, 38, .12),
          inset 0 1px 0 rgba(255, 255, 255, .12) !important;
      }

      #resetWeekBtn::before {
        content: '↻ ';
      }

      .week-tools-pill {
        border-color: rgba(147, 197, 253, .38) !important;
        background: rgba(2, 6, 23, .40) !important;
        color: #dbeafe !important;
        box-shadow:
          0 0 0 1px rgba(147, 197, 253, .10),
          0 0 16px rgba(37, 99, 235, .18);
      }

      @media (max-width: 620px) {
        .week-tools-grid {
          gap: 10px !important;
        }

        .week-tools-grid input,
        .week-tools-grid select,
        .week-tools-grid button {
          min-height: 48px !important;
          width: 100% !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  eliteWeekToolsButtons();

  function removeWeekNavigationButtons() {
    const style = document.createElement('style');
    style.id = 'removeWeekNavigationStyles';
    style.textContent = `
      #prevWeekBtn,
      #nextWeekBtn {
        display: none !important;
      }

      .week-tools-grid {
        grid-template-columns: 1.3fr auto 1fr auto auto auto !important;
      }

      @media (max-width: 620px) {
        .week-tools-grid {
          grid-template-columns: 1fr !important;
        }
      }
    `;
    document.head.appendChild(style);

    document.getElementById('prevWeekBtn')?.remove();
    document.getElementById('nextWeekBtn')?.remove();
  }

  removeWeekNavigationButtons();

  const pwaInstallScript = document.createElement('script');
  pwaInstallScript.src = 'pwa-install.js';
  document.head.appendChild(pwaInstallScript);

  const pwaNotificationsScript = document.createElement('script');
  pwaNotificationsScript.src = 'pwa-notifications.js';
  document.head.appendChild(pwaNotificationsScript);

  const eliteToolsStyle = document.createElement('link');
  eliteToolsStyle.rel = 'stylesheet';
  eliteToolsStyle.href = 'elite-tools.css';
  document.head.appendChild(eliteToolsStyle);

  const eliteLockScript = document.createElement('script');
  eliteLockScript.src = 'elite-lock.js';
  document.head.appendChild(eliteLockScript);

  const eliteSplashScript = document.createElement('script');
  eliteSplashScript.src = 'elite-splash.js';
  document.head.appendChild(eliteSplashScript);

  const localWeekStorageScript = document.createElement('script');
  localWeekStorageScript.src = 'local-week-storage.js';
  localWeekStorageScript.async = false;
  document.head.appendChild(localWeekStorageScript);

  const weeklyTotalsActionsScript = document.createElement('script');
  weeklyTotalsActionsScript.src = 'weekly-totals-actions.js';
  weeklyTotalsActionsScript.async = false;
  document.head.appendChild(weeklyTotalsActionsScript);

  const modalScript = document.createElement('script');
  modalScript.src = 'modals.js';
  modalScript.async = false;
  document.head.appendChild(modalScript);

  const allDaysEliteScript = document.createElement('script');
  allDaysEliteScript.src = 'all-days-elite.js';
  allDaysEliteScript.async = false;
  document.head.appendChild(allDaysEliteScript);

  const summaryImageScript = document.createElement('script');
  summaryImageScript.src = 'summary-image.js';
  document.head.appendChild(summaryImageScript);

  const rotaPopupScript = document.createElement('script');
  rotaPopupScript.src = 'rota-popup.js';
  document.head.appendChild(rotaPopupScript);

  const rotaEliteScript = document.createElement('script');
  rotaEliteScript.src = 'rota-elite.js';
  document.head.appendChild(rotaEliteScript);

  const dayModalEliteScript = document.createElement('script');
  dayModalEliteScript.src = 'day-modal-elite.js';
  document.head.appendChild(dayModalEliteScript);

  const payInFilterScript = document.createElement('script');
  payInFilterScript.src = 'payin-modal-filter.js';
  document.head.appendChild(payInFilterScript);

  const repOnDemandScript = document.createElement('script');
  repOnDemandScript.src = 'rep-on-demand.js';
  document.head.appendChild(repOnDemandScript);

  const pdfLibraryScript = document.createElement('script');
  pdfLibraryScript.src = 'pdf-library.js';
  document.head.appendChild(pdfLibraryScript);
})();