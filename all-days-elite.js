'use strict';

(function initAllDaysEliteMakeover() {
  if (window.__allDaysEliteMakeoverLoaded) return;
  window.__allDaysEliteMakeoverLoaded = true;

  function addStyle() {
    if (document.getElementById('allDaysEliteStyles')) return;

    const style = document.createElement('style');
    style.id = 'allDaysEliteStyles';
    style.textContent = `
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

      #allDaysQuickModalBackdrop .all-days-modal::before {
        content: '';
        position: absolute;
        inset: -2px;
        pointer-events: none;
        background:
          linear-gradient(120deg, transparent 0%, rgba(147, 197, 253, .16) 36%, transparent 66%),
          radial-gradient(circle at 50% -10%, rgba(255, 255, 255, .14), transparent 30%);
        animation: allDaysEliteGlow 5s ease-in-out infinite;
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
        text-shadow:
          0 0 16px rgba(96, 165, 250, .78),
          0 0 32px rgba(37, 99, 235, .38);
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

      #allDaysQuickModalGrid .tile:hover,
      #allDaysQuickModalGrid .tile:focus {
        transform: translateY(-3px);
        filter: brightness(1.1) saturate(1.08);
        border-color: rgba(191, 219, 254, .58) !important;
        box-shadow:
          0 20px 42px rgba(0, 0, 0, .36),
          0 0 28px rgba(37, 99, 235, .24),
          inset 0 1px 0 rgba(255, 255, 255, .12) !important;
        outline: none;
      }

      #allDaysQuickModalGrid .tile.active {
        border-color: rgba(34, 197, 94, .54) !important;
        background:
          radial-gradient(circle at 16% 0%, rgba(34, 197, 94, .20), transparent 42%),
          linear-gradient(180deg, rgba(20, 83, 45, .38), rgba(2, 6, 23, .84)) !important;
      }

      #allDaysQuickModalGrid .tile.rest {
        border-color: rgba(248, 113, 113, .34) !important;
        background:
          radial-gradient(circle at 16% 0%, rgba(248, 113, 113, .14), transparent 42%),
          linear-gradient(180deg, rgba(127, 29, 29, .24), rgba(2, 6, 23, .84)) !important;
      }

      #allDaysQuickModalGrid .tile.today {
        outline: 1px solid rgba(96, 165, 250, .82) !important;
        box-shadow:
          0 0 0 1px rgba(96, 165, 250, .24),
          0 0 28px rgba(96, 165, 250, .24),
          inset 0 1px 0 rgba(255, 255, 255, .08) !important;
      }

      #allDaysQuickModalGrid .day-pay {
        box-shadow:
          0 0 16px rgba(34, 197, 94, .30),
          0 0 34px rgba(34, 197, 94, .16),
          inset 0 1px 0 rgba(255, 255, 255, .12) !important;
      }

      @keyframes allDaysEliteGlow {
        0%, 100% {
          opacity: .55;
          transform: translateX(-2%);
        }
        50% {
          opacity: 1;
          transform: translateX(2%);
        }
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

  function init() {
    addStyle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
})();