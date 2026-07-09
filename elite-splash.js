'use strict';

(function initEliteWelcomeSplash() {
  if (window.__eliteWelcomeSplashLoadedLite) return;
  window.__eliteWelcomeSplashLoadedLite = true;

  let lastSplashAt = 0;
  let hideTimer = null;

  function addStyle() {
    if (document.getElementById('eliteWelcomeSplashStyles')) return;

    const style = document.createElement('style');
    style.id = 'eliteWelcomeSplashStyles';
    style.textContent = `
      body.elite-splash-active {
        overflow: hidden !important;
      }

      .elite-welcome-splash {
        position: fixed;
        inset: 0;
        z-index: 99999;
        min-height: 100dvh;
        display: none;
        place-items: center;
        padding:
          max(18px, env(safe-area-inset-top))
          max(16px, env(safe-area-inset-right))
          max(18px, env(safe-area-inset-bottom))
          max(16px, env(safe-area-inset-left));
        pointer-events: none;
        opacity: 0;
        background:
          radial-gradient(circle at 50% 22%, rgba(96, 165, 250, .34), transparent 32%),
          radial-gradient(circle at 50% 70%, rgba(250, 204, 21, .10), transparent 34%),
          linear-gradient(180deg, rgba(2, 6, 23, .98), rgba(0, 0, 0, .98));
        color: #f8fafc;
        overflow: hidden;
      }

      .elite-welcome-splash.show {
        display: grid;
        animation: eliteSplashFade 1.55s ease-out both;
      }

      .elite-splash-orbit {
        position: absolute;
        width: min(74vw, 340px);
        aspect-ratio: 1;
        border-radius: 999px;
        border: 1px solid rgba(147, 197, 253, .24);
        box-shadow:
          0 0 26px rgba(96, 165, 250, .22),
          inset 0 0 28px rgba(96, 165, 250, .10);
        animation: eliteOrbitPulse 1.55s ease-out both;
      }

      .elite-splash-orbit::before,
      .elite-splash-orbit::after {
        content: '';
        position: absolute;
        inset: 10%;
        border-radius: inherit;
        border: 1px solid rgba(250, 204, 21, .20);
      }

      .elite-splash-orbit::after {
        inset: 22%;
        border-color: rgba(34, 197, 94, .22);
      }

      .elite-splash-core {
        position: relative;
        z-index: 1;
        width: min(92vw, 430px);
        display: grid;
        place-items: center;
        gap: 14px;
        text-align: center;
        transform: translateY(10px) scale(.96);
        animation: eliteCoreRise 1.2s cubic-bezier(.16, .84, .24, 1) both;
      }

      .elite-splash-badge {
        width: clamp(88px, 24vw, 128px);
        height: clamp(88px, 24vw, 128px);
        display: grid;
        place-items: center;
        border-radius: 32px;
        background:
          linear-gradient(145deg, rgba(255, 255, 255, .12), transparent 34%),
          linear-gradient(180deg, #0f172a, #020617);
        border: 1px solid rgba(191, 219, 254, .42);
        box-shadow:
          0 0 30px rgba(96, 165, 250, .30),
          0 0 76px rgba(37, 99, 235, .18),
          inset 0 1px 0 rgba(255, 255, 255, .14);
        overflow: hidden;
      }

      .elite-splash-icon {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        filter:
          drop-shadow(0 0 14px rgba(96, 165, 250, .55))
          drop-shadow(0 0 24px rgba(250, 204, 21, .22));
      }

      .elite-splash-title {
        display: grid;
        gap: 4px;
        font-size: clamp(2.35rem, 13vw, 5rem);
        line-height: .86;
        font-weight: 1000;
        letter-spacing: -.07em;
        text-transform: uppercase;
        text-shadow:
          0 0 18px rgba(96, 165, 250, .82),
          0 0 46px rgba(37, 99, 235, .42);
      }

      .elite-splash-title span {
        color: #93c5fd;
        font-size: .30em;
        letter-spacing: .38em;
        text-indent: .38em;
      }

      .elite-splash-status {
        width: max-content;
        max-width: 100%;
        padding: 9px 14px;
        border-radius: 999px;
        border: 1px solid rgba(134, 239, 172, .42);
        background: rgba(22, 101, 52, .24);
        color: #bbf7d0;
        font-size: clamp(.68rem, 3vw, .78rem);
        font-weight: 1000;
        text-transform: uppercase;
        letter-spacing: .12em;
        box-shadow: 0 0 20px rgba(34, 197, 94, .18);
      }

      .elite-splash-scan {
        position: absolute;
        left: -20%;
        right: -20%;
        top: 45%;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(147, 197, 253, .85), transparent);
        opacity: 0;
        filter: blur(.4px);
        animation: eliteScanLine 1.25s ease-out both;
      }

      @keyframes eliteSplashFade {
        0% { opacity: 0; }
        12%, 78% { opacity: 1; }
        100% { opacity: 0; }
      }

      @keyframes eliteCoreRise {
        0% {
          opacity: 0;
          transform: translateY(18px) scale(.9);
          filter: blur(10px);
        }
        45% {
          opacity: 1;
          transform: translateY(0) scale(1.02);
          filter: blur(0);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      }

      @keyframes eliteOrbitPulse {
        0% {
          opacity: 0;
          transform: scale(.72);
        }
        28% {
          opacity: 1;
        }
        100% {
          opacity: 0;
          transform: scale(1.18);
        }
      }

      @keyframes eliteScanLine {
        0% {
          opacity: 0;
          transform: translateY(-120px) scaleX(.4);
        }
        34% {
          opacity: .9;
        }
        100% {
          opacity: 0;
          transform: translateY(130px) scaleX(1);
        }
      }

      @media (max-width: 680px) {
        .elite-welcome-splash {
          align-items: center;
          background:
            radial-gradient(circle at 50% 20%, rgba(96, 165, 250, .30), transparent 34%),
            linear-gradient(180deg, #020617, #000);
        }

        .elite-splash-core {
          gap: 12px;
        }

        .elite-splash-badge {
          border-radius: 28px;
        }

        .elite-splash-status {
          white-space: normal;
          line-height: 1.25;
        }
      }

      @media (max-width: 380px) {
        .elite-splash-title {
          font-size: clamp(2rem, 14vw, 3rem);
        }

        .elite-splash-title span {
          letter-spacing: .28em;
          text-indent: .28em;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .elite-welcome-splash.show,
        .elite-splash-core,
        .elite-splash-orbit,
        .elite-splash-scan {
          animation: none !important;
        }

        .elite-welcome-splash.show {
          opacity: 1;
        }

        .elite-splash-orbit,
        .elite-splash-scan {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureSplash() {
    addStyle();

    if (document.getElementById('eliteWelcomeSplash')) return;

    const splash = document.createElement('div');
    splash.id = 'eliteWelcomeSplash';
    splash.className = 'elite-welcome-splash';
    splash.setAttribute('aria-hidden', 'true');
    splash.innerHTML = `
      <div class="elite-splash-orbit" aria-hidden="true"></div>
      <div class="elite-splash-scan" aria-hidden="true"></div>

      <div class="elite-splash-core">
        <div class="elite-splash-badge" aria-hidden="true">
          <img class="elite-splash-icon" src="maskable-icon.svg" alt="">
        </div>

        <div class="elite-splash-title">
          Member
          <span>Elite</span>
        </div>

        <div class="elite-splash-status">Access granted</div>
      </div>
    `;

    document.body.appendChild(splash);
  }

  function playEliteWelcomeSplash() {
    const now = Date.now();
    if (now - lastSplashAt < 1700) return;

    lastSplashAt = now;
    ensureSplash();

    const splash = document.getElementById('eliteWelcomeSplash');
    if (!splash) return;

    clearTimeout(hideTimer);

    document.body.classList.add('elite-splash-active');
    splash.classList.remove('show');
    void splash.offsetWidth;
    splash.classList.add('show');
    splash.setAttribute('aria-hidden', 'false');

    hideTimer = setTimeout(() => {
      splash.classList.remove('show');
      splash.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('elite-splash-active');
    }, 1600);
  }

  function observeEliteUnlock() {
    if (window.__eliteWelcomeObserverLiteBound) return;
    window.__eliteWelcomeObserverLiteBound = true;

    const observer = new MutationObserver(() => {
      const status = document.getElementById('eliteLockStatus');
      if (status?.classList.contains('success')) playEliteWelcomeSplash();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  }

  function init() {
    ensureSplash();
    observeEliteUnlock();
  }

  window.showEliteWelcomeSplash = playEliteWelcomeSplash;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
})();