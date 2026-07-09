'use strict';

(function initEliteKeypadLock() {
  if (window.__eliteKeypadLockStableLoaded) return;
  window.__eliteKeypadLockStableLoaded = true;

  const ELITE_PASSKEY = '74563';
  const ELITE_EVER_UNLOCKED_KEY = 'memberElitePortalEverUnlocked';
  const ELITE_OPEN_COUNT_KEY = 'memberElitePortalOpenCount';

  let pendingAction = null;
  let pendingOpenCount = 0;
  let pinInput = '';

  function hasEverUnlocked() {
    return localStorage.getItem(ELITE_EVER_UNLOCKED_KEY) === 'true';
  }

  function getEliteOpenCount() {
    return Math.max(0, Number.parseInt(localStorage.getItem(ELITE_OPEN_COUNT_KEY) || '0', 10) || 0);
  }

  function markEliteOpen(count) {
    localStorage.setItem(ELITE_OPEN_COUNT_KEY, String(Math.max(1, count)));
    document.documentElement.classList.add('elite-unlocked');
    document.documentElement.classList.remove('elite-locked');
  }

  function shouldAskForPin(nextCount) {
    return !hasEverUnlocked() || nextCount === 1 || nextCount % 5 === 0;
  }

  function addStyle() {
    if (document.getElementById('eliteKeypadLockStyles')) return;

    const style = document.createElement('style');
    style.id = 'eliteKeypadLockStyles';
    style.textContent = `
      .elite-lock-backdrop {
        background: rgba(0, 0, 0, .78) !important;
        z-index: 120 !important;
      }

      .elite-lock-modal {
        width: min(420px, 100%);
        border-radius: 26px !important;
        padding: 16px !important;
        background: linear-gradient(180deg, #07101f, #020817) !important;
        border: 1px solid rgba(147,197,253,.42) !important;
        box-shadow: 0 18px 52px rgba(0,0,0,.62) !important;
      }

      .elite-lock-hero {
        display: grid;
        gap: 10px;
        padding: 12px;
        border-radius: 20px;
        background: rgba(15,23,42,.74);
        border: 1px solid rgba(147,197,253,.22);
      }

      .elite-lock-brand-row {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 11px;
        align-items: center;
      }

      .elite-lock-emblem {
        width: 54px;
        height: 54px;
        display: grid;
        place-items: center;
        border-radius: 18px;
        background: #020617;
        border: 1px solid rgba(147,197,253,.32);
        color: #facc15;
        font-size: 25px;
        font-weight: 1000;
      }

      .elite-lock-title {
        color: #f8fafc;
        font-size: 1.22rem;
        font-weight: 1000;
      }

      .elite-lock-sub {
        margin-top: 4px;
        color: #bfdbfe;
        font-size: .76rem;
        font-weight: 850;
        line-height: 1.35;
      }

      .elite-lock-display {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 8px;
        padding: 11px;
        border-radius: 18px;
        background: rgba(2,6,23,.58);
        border: 1px solid rgba(147,197,253,.24);
      }

      .elite-lock-dot {
        height: 16px;
        border-radius: 999px;
        background: #111827;
        border: 1px solid rgba(148,163,184,.22);
      }

      .elite-lock-dot.filled {
        background: linear-gradient(90deg, #2563eb, #93c5fd);
        border-color: rgba(191,219,254,.76);
      }

      .elite-lock-status {
        min-height: 30px;
        display: grid;
        place-items: center;
        padding: 8px 10px;
        border-radius: 999px;
        background: rgba(15,23,42,.64);
        border: 1px solid rgba(147,197,253,.18);
        color: #93c5fd;
        font-size: .72rem;
        font-weight: 1000;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: .06em;
      }

      .elite-lock-status.error {
        color: #fecaca;
        border-color: rgba(248,113,113,.32);
        background: rgba(127,29,29,.22);
      }

      .elite-lock-status.success {
        color: #bbf7d0;
        border-color: rgba(134,239,172,.34);
        background: rgba(22,101,52,.22);
      }

      .elite-lock-pad {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }

      .elite-lock-pad button,
      #eliteLockCancelBtn {
        min-height: 56px;
        display: grid;
        place-items: center;
        gap: 2px;
        padding: 7px;
        border-radius: 17px;
        border: 1px solid rgba(147,197,253,.24);
        background: #0f172a;
        color: #f8fafc;
        font-weight: 1000;
        cursor: pointer;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }

      .elite-lock-pad button b {
        font-size: 1.22rem;
        line-height: 1;
      }

      .elite-lock-pad button small {
        color: #94a3b8;
        font-size: .48rem;
        line-height: 1;
        font-weight: 1000;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .elite-lock-pad button:active,
      .elite-lock-pad button.elite-hit {
        transform: scale(.96);
        filter: brightness(1.18);
      }

      .elite-lock-pad button[data-elite-submit] {
        border-color: rgba(134,239,172,.38);
        background: rgba(20,83,45,.78);
      }

      .elite-lock-pad button[data-elite-backspace] b {
        color: #fecaca;
      }

      #eliteLockCancelBtn {
        min-height: 44px;
        color: #dbeafe;
        font-size: .82rem;
      }

      .elite-lock-modal.wrong {
        animation: eliteWrongLite .22s linear;
      }

      @keyframes eliteWrongLite {
        0%, 100% { transform: translateX(0); }
        33% { transform: translateX(-6px); }
        66% { transform: translateX(6px); }
      }

      @media (max-width: 680px) {
        .elite-lock-backdrop {
          align-items: flex-end;
          padding: 0;
        }

        .elite-lock-modal {
          width: 100%;
          border-radius: 26px 26px 0 0 !important;
          border-left: 0 !important;
          border-right: 0 !important;
          border-bottom: 0 !important;
          padding-bottom: calc(16px + env(safe-area-inset-bottom)) !important;
        }

        .elite-lock-pad button {
          min-height: 54px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureModal() {
    addStyle();

    if (document.getElementById('eliteLockBackdrop')) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'eliteLockBackdrop';
    backdrop.className = 'modal-backdrop elite-lock-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.innerHTML = `
      <div class="modal elite-lock-modal" role="dialog" aria-modal="true" aria-labelledby="eliteLockTitle">
        <div class="elite-lock-hero">
          <div class="elite-lock-brand-row">
            <div class="elite-lock-emblem" aria-hidden="true">◆</div>
            <div>
              <div class="elite-lock-title" id="eliteLockTitle">Union Elite Access</div>
              <div class="elite-lock-sub">Enter the Elite passkey to open protected tools.</div>
            </div>
          </div>
        </div>

        <div class="elite-lock-display" id="eliteLockDisplay" aria-live="polite">
          <span class="elite-lock-dot"></span>
          <span class="elite-lock-dot"></span>
          <span class="elite-lock-dot"></span>
          <span class="elite-lock-dot"></span>
          <span class="elite-lock-dot"></span>
        </div>

        <div class="elite-lock-status" id="eliteLockStatus">Enter 5-digit passkey</div>

        <div class="elite-lock-pad" aria-label="Elite keypad">
          <button type="button" data-elite-pin="1"><small>Alpha</small><b>1</b></button>
          <button type="button" data-elite-pin="2"><small>Bravo</small><b>2</b></button>
          <button type="button" data-elite-pin="3"><small>Charlie</small><b>3</b></button>
          <button type="button" data-elite-pin="4"><small>Delta</small><b>4</b></button>
          <button type="button" data-elite-pin="5"><small>Echo</small><b>5</b></button>
          <button type="button" data-elite-pin="6"><small>Foxtrot</small><b>6</b></button>
          <button type="button" data-elite-pin="7"><small>Elite</small><b>7</b></button>
          <button type="button" data-elite-pin="8"><small>Night</small><b>8</b></button>
          <button type="button" data-elite-pin="9"><small>Ops</small><b>9</b></button>
          <button type="button" data-elite-backspace><small>Back</small><b>⌫</b></button>
          <button type="button" data-elite-pin="0"><small>Zero</small><b>0</b></button>
          <button type="button" data-elite-submit><small>Unlock</small><b>✔</b></button>
        </div>

        <button id="eliteLockCancelBtn" type="button">Cancel access</button>
      </div>
    `;

    document.body.appendChild(backdrop);

    backdrop.addEventListener('click', event => {
      if (event.target === backdrop) {
        closeEliteKeypad();
        return;
      }

      const pinButton = event.target.closest?.('[data-elite-pin]');
      if (pinButton) {
        hitButton(pinButton);
        addPinDigit(pinButton.dataset.elitePin);
        return;
      }

      const backspace = event.target.closest?.('[data-elite-backspace]');
      if (backspace) {
        hitButton(backspace);
        pinInput = pinInput.slice(0, -1);
        updateDisplay();
        return;
      }

      const submit = event.target.closest?.('[data-elite-submit]');
      if (submit) {
        hitButton(submit);
        submitPin();
      }
    });

    document.getElementById('eliteLockCancelBtn')?.addEventListener('click', closeEliteKeypad);
  }

  function hitButton(button) {
    button.classList.remove('elite-hit');
    void button.offsetWidth;
    button.classList.add('elite-hit');
    setTimeout(() => button.classList.remove('elite-hit'), 90);
  }

  function updateDisplay() {
    document.querySelectorAll('#eliteLockDisplay .elite-lock-dot').forEach((dot, index) => {
      dot.classList.toggle('filled', index < pinInput.length);
    });

    const status = document.getElementById('eliteLockStatus');
    if (status) {
      status.className = 'elite-lock-status';
      status.textContent = pinInput.length ? `${5 - pinInput.length} digits remaining` : 'Enter 5-digit passkey';
    }
  }

  function addPinDigit(value) {
    if (pinInput.length >= 5) return;

    pinInput += String(value);
    updateDisplay();

    try {
      navigator.vibrate?.(5);
    } catch {}

    if (pinInput.length === 5) setTimeout(submitPin, 70);
  }

  function submitPin() {
    const status = document.getElementById('eliteLockStatus');
    const modal = document.querySelector('.elite-lock-modal');

    if (pinInput !== ELITE_PASSKEY) {
      if (status) {
        status.className = 'elite-lock-status error';
        status.textContent = 'Access denied — try again';
      }

      modal?.classList.remove('wrong');
      void modal?.offsetWidth;
      modal?.classList.add('wrong');
      setTimeout(() => modal?.classList.remove('wrong'), 240);

      pinInput = '';
      setTimeout(updateDisplay, 360);
      return;
    }

    if (status) {
      status.className = 'elite-lock-status success';
      status.textContent = 'Access granted';
    }

    localStorage.setItem(ELITE_EVER_UNLOCKED_KEY, 'true');
    markEliteOpen(pendingOpenCount || getEliteOpenCount() + 1);

    const run = pendingAction;
    pendingAction = null;
    pendingOpenCount = 0;

    try {
      navigator.vibrate?.(14);
    } catch {}

    setTimeout(() => {
      closeEliteKeypad();
      if (typeof window.showEliteWelcomeSplash === 'function') window.showEliteWelcomeSplash();
      if (typeof run === 'function') run();
    }, 180);
  }

  function requestEliteAccess(onSuccess) {
    const nextCount = getEliteOpenCount() + 1;

    if (shouldAskForPin(nextCount)) {
      openEliteKeypad(onSuccess, nextCount);
      return false;
    }

    markEliteOpen(nextCount);
    if (typeof onSuccess === 'function') onSuccess();
    return true;
  }

  function openEliteKeypad(onSuccess, openCount) {
    ensureModal();

    pendingAction = typeof onSuccess === 'function' ? onSuccess : null;
    pendingOpenCount = openCount || getEliteOpenCount() + 1;
    pinInput = '';
    updateDisplay();

    const backdrop = document.getElementById('eliteLockBackdrop');
    if (!backdrop) return false;

    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    return false;
  }

  function closeEliteKeypad() {
    const backdrop = document.getElementById('eliteLockBackdrop');
    if (!backdrop) return;

    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');

    pinInput = '';
    pendingOpenCount = 0;
    document.querySelector('.elite-lock-modal')?.classList.remove('wrong');
    updateDisplay();
  }

  function rerunClick(target) {
    window.__eliteAllowNextProtectedClick = true;

    setTimeout(() => {
      target.click();
      setTimeout(() => {
        window.__eliteAllowNextProtectedClick = false;
      }, 80);
    }, 0);
  }

  function protectedClickHandler(event) {
    const target = event.target.closest?.('#appBrandBtn, #exportWeekCalendarBtn, #allDaysQuickTile');
    if (!target) return;

    if (window.__eliteAllowNextProtectedClick) {
      window.__eliteAllowNextProtectedClick = false;
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    requestEliteAccess(() => rerunClick(target));
  }

  function closeShellMenuSafe() {
    const shell = document.getElementById('shellMenuBackdrop');
    if (!shell) return;

    shell.classList.remove('open');
    shell.setAttribute('aria-hidden', 'true');
  }

  function bindShellSafety() {
    if (window.__eliteShellSafetyBound) return;
    window.__eliteShellSafetyBound = true;

    document.addEventListener('click', event => {
      if (event.target.closest?.('#closeShellMenuBtn, #shellCloseBottomBtn')) {
        closeShellMenuSafe();
      }

      const shell = document.getElementById('shellMenuBackdrop');
      if (shell && event.target === shell) closeShellMenuSafe();
    }, true);

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeShellMenuSafe();
    });
  }

  function bindKeyboard() {
    if (window.__eliteStableKeyboardBound) return;
    window.__eliteStableKeyboardBound = true;

    document.addEventListener('keydown', event => {
      if (!document.getElementById('eliteLockBackdrop')?.classList.contains('open')) return;

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        addPinDigit(event.key);
      }

      if (event.key === 'Backspace') {
        event.preventDefault();
        pinInput = pinInput.slice(0, -1);
        updateDisplay();
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        submitPin();
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeEliteKeypad();
      }
    });
  }

  function setEliteLockedClass() {
    document.documentElement.classList.toggle('elite-unlocked', hasEverUnlocked());
    document.documentElement.classList.toggle('elite-locked', !hasEverUnlocked());
  }

  function init() {
    setEliteLockedClass();
    ensureModal();
    bindKeyboard();
    bindShellSafety();

    if (!window.__eliteStableProtectedClickBound) {
      window.__eliteStableProtectedClickBound = true;
      document.addEventListener('click', protectedClickHandler, true);
    }
  }

  window.requireEliteAccess = requestEliteAccess;
  window.isEliteAccessUnlocked = hasEverUnlocked;
  window.getEliteAccessOpenCount = getEliteOpenCount;
  window.openEliteKeypad = openEliteKeypad;
  window.closeEliteKeypad = closeEliteKeypad;

  window.lockEliteAccess = function lockEliteAccess() {
    localStorage.removeItem(ELITE_EVER_UNLOCKED_KEY);
    localStorage.removeItem(ELITE_OPEN_COUNT_KEY);
    setEliteLockedClass();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
})();