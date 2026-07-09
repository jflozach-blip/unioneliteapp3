'use strict';

(function initDayModalEliteMakeover() {
  if (window.__dayModalEliteMakeoverLoaded) return;
  window.__dayModalEliteMakeoverLoaded = true;

  function addStyle() {
    if (document.getElementById('dayModalEliteStyles')) return;

    const style = document.createElement('style');
    style.id = 'dayModalEliteStyles';
    style.textContent = `
      #dayModalBackdrop {
        background:
          radial-gradient(circle at 50% 10%, rgba(96, 165, 250, .22), transparent 34%),
          radial-gradient(circle at 12% 88%, rgba(34, 197, 94, .10), transparent 30%),
          rgba(0, 0, 0, .74) !important;
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
      }

      #dayModalBackdrop .day-entry-modal {
        position: relative;
        overflow: auto;
        border-radius: 30px !important;
        padding: 18px !important;
        background:
          radial-gradient(circle at 12% 0%, rgba(96, 165, 250, .30), transparent 36%),
          radial-gradient(circle at 90% 8%, rgba(250, 204, 21, .14), transparent 34%),
          linear-gradient(180deg, rgba(7, 16, 31, .98), rgba(2, 6, 23, .96)) !important;
        border: 1px solid rgba(191, 219, 254, .42) !important;
        box-shadow:
          0 0 58px rgba(37, 99, 235, .34),
          0 26px 80px rgba(0, 0, 0, .58),
          inset 0 1px 0 rgba(255, 255, 255, .12) !important;
      }

      #dayModalBackdrop .day-entry-modal::before {
        content: '';
        position: absolute;
        inset: -2px;
        pointer-events: none;
        background:
          linear-gradient(120deg, transparent 0%, rgba(147, 197, 253, .16) 36%, transparent 66%),
          radial-gradient(circle at 50% -10%, rgba(255, 255, 255, .14), transparent 30%);
        animation: dayEliteGlow 5s ease-in-out infinite;
      }

      #dayModalBackdrop .modal-head,
      #dayModalBackdrop .day-entry-hero,
      #dayModalBackdrop .day-entry-preview,
      #dayModalBackdrop .day-entry-field {
        position: relative;
        z-index: 1;
        border-radius: 22px !important;
        background:
          radial-gradient(circle at 14% 0%, rgba(147, 197, 253, .16), transparent 42%),
          linear-gradient(180deg, rgba(15, 23, 42, .90), rgba(2, 6, 23, .68)) !important;
        border: 1px solid rgba(147, 197, 253, .22) !important;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, .07);
      }

      #dayModalBackdrop .modal-head {
        padding: 13px 14px;
      }

      #dayModalTitle {
        color: #f8fafc;
        font-weight: 1000;
        font-size: 1.25rem;
        text-shadow:
          0 0 16px rgba(96, 165, 250, .78),
          0 0 32px rgba(37, 99, 235, .38);
      }

      #closeModalBtn {
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

      .day-entry-title strong {
        color: #dbeafe;
        font-size: .9rem;
        font-weight: 1000;
        text-transform: uppercase;
        letter-spacing: .08em;
        text-shadow: 0 0 12px rgba(96, 165, 250, .58);
      }

      .day-entry-title span,
      #modalDutyInfo,
      #modalDutyPay,
      .adjust-preview,
      .field-label,
      #dayModalBackdrop label {
        color: #bfdbfe;
        font-weight: 900;
      }

      .modal-date-chip {
        width: max-content;
        padding: 7px 11px;
        border-radius: 999px;
        color: #fde68a;
        background: rgba(250, 204, 21, .12);
        border: 1px solid rgba(253, 230, 138, .34);
        font-weight: 1000;
        font-size: .75rem;
      }

      #modalDayTotal {
        display: inline-flex;
        width: max-content;
        align-items: center;
        justify-content: center;
        padding: 8px 13px;
        border-radius: 999px;
        color: #dcfce7;
        background: linear-gradient(180deg, rgba(34, 197, 94, .25), rgba(20, 83, 45, .42));
        border: 1px solid rgba(134, 239, 172, .46);
        font-size: clamp(1.2rem, 5vw, 1.65rem);
        font-weight: 1000;
        text-shadow: 0 0 16px rgba(34, 197, 94, .54);
        box-shadow: 0 0 24px rgba(34, 197, 94, .18);
      }

      #modalDayTotal::before {
        content: '💷';
        margin-right: 7px;
        font-size: .9em;
      }

      #dayModalBackdrop .day-entry-input,
      #dayModalBackdrop input,
      #dayModalBackdrop select {
        min-height: 46px;
        border-radius: 16px !important;
        border: 1px solid rgba(147, 197, 253, .30) !important;
        background: linear-gradient(180deg, #08172c, #051022) !important;
        color: #f8fafc !important;
        font-weight: 1000;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, .05);
      }

      #dayModalBackdrop input:focus,
      #dayModalBackdrop select:focus {
        outline: 1px solid rgba(96, 165, 250, .76);
        box-shadow:
          0 0 18px rgba(37, 99, 235, .22),
          inset 0 1px 0 rgba(255, 255, 255, .06);
      }

      #paidAdjustSection {
        background:
          radial-gradient(circle at 16% 0%, rgba(167, 139, 250, .18), transparent 42%),
          linear-gradient(180deg, rgba(76, 29, 149, .22), rgba(2, 6, 23, .66)) !important;
        border-color: rgba(196, 181, 253, .34) !important;
      }

      #paidAdjustSection label,
      #paidAdjustSection .field-label {
        color: #ddd6fe !important;
      }

      .adjust-preview {
        padding: 9px 11px;
        border-radius: 15px;
        background: rgba(76, 29, 149, .24);
        border: 1px solid rgba(196, 181, 253, .26);
        color: #ede9fe;
        line-height: 1.35;
      }

      .adjust-preview.ok {
        background: rgba(22, 101, 52, .22);
        border-color: rgba(134, 239, 172, .34);
        color: #dcfce7;
      }

      .adjust-preview.deducting {
        background: rgba(146, 64, 14, .24);
        border-color: rgba(253, 230, 138, .36);
        color: #fff2bf;
      }

      #dayModalBackdrop .day-entry-field:has(#otMinutesInput) {
        background:
          radial-gradient(circle at 16% 0%, rgba(251, 146, 60, .16), transparent 42%),
          linear-gradient(180deg, rgba(194, 65, 12, .18), rgba(2, 6, 23, .66)) !important;
        border-color: rgba(251, 146, 60, .30) !important;
      }

      #dayModalBackdrop .day-entry-field:has(#manualMinutesInput) {
        background:
          radial-gradient(circle at 16% 0%, rgba(52, 211, 153, .14), transparent 42%),
          linear-gradient(180deg, rgba(5, 150, 105, .16), rgba(2, 6, 23, .66)) !important;
        border-color: rgba(52, 211, 153, .26) !important;
      }

      #dayModalBackdrop .day-entry-field:has(#payInInput) {
        background:
          radial-gradient(circle at 16% 0%, rgba(250, 204, 21, .14), transparent 42%),
          linear-gradient(180deg, rgba(161, 98, 7, .18), rgba(2, 6, 23, .66)) !important;
        border-color: rgba(250, 204, 21, .32) !important;
      }

      #dayModalBackdrop .day-entry-flag {
        display: grid;
        gap: 6px;
      }

      #dayModalBackdrop .modal-actions-day {
        position: relative;
        z-index: 1;
      }

      #cancelEditBtn,
      #saveEditBtn {
        min-height: 48px;
        border-radius: 17px !important;
        font-weight: 1000;
        cursor: pointer;
      }

      #cancelEditBtn {
        border: 1px solid rgba(147, 197, 253, .26);
        background: rgba(15, 23, 42, .82);
        color: #dbeafe;
      }

      #saveEditBtn {
        border: 1px solid rgba(134, 239, 172, .44) !important;
        background: linear-gradient(180deg, rgba(34, 197, 94, .36), rgba(20, 83, 45, .86)) !important;
        color: #dcfce7 !important;
        box-shadow: 0 0 22px rgba(34, 197, 94, .18);
      }

      #saveEditBtn:hover,
      #cancelEditBtn:hover,
      #closeModalBtn:hover {
        filter: brightness(1.12);
      }

      @keyframes dayEliteGlow {
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
        #dayModalBackdrop {
          align-items: flex-end;
          padding: 0;
        }

        #dayModalBackdrop .day-entry-modal {
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