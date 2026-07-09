'use strict';

(function initPwaInstall() {
  if (window.__pwaInstallLoaded) return;
  window.__pwaInstallLoaded = true;

  let deferredInstallPrompt = null;

  function addHeadLinks() {
    if (!document.querySelector('link[rel="manifest"]')) {
      const manifest = document.createElement('link');
      manifest.rel = 'manifest';
      manifest.href = 'manifest.json';
      document.head.appendChild(manifest);
    }

    if (!document.querySelector('meta[name="theme-color"]')) {
      const theme = document.createElement('meta');
      theme.name = 'theme-color';
      theme.content = '#020617';
      document.head.appendChild(theme);
    }

    const appleCapable = document.createElement('meta');
    appleCapable.name = 'apple-mobile-web-app-capable';
    appleCapable.content = 'yes';
    document.head.appendChild(appleCapable);

    const appleTitle = document.createElement('meta');
    appleTitle.name = 'apple-mobile-web-app-title';
    appleTitle.content = 'Member Elite';
    document.head.appendChild(appleTitle);

    const appleStatus = document.createElement('meta');
    appleStatus.name = 'apple-mobile-web-app-status-bar-style';
    appleStatus.content = 'black-translucent';
    document.head.appendChild(appleStatus);

    if (!document.querySelector('link[rel="apple-touch-icon"]')) {
      const appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      appleIcon.href = 'icon.svg';
      document.head.appendChild(appleIcon);
    }
  }

  function addStyle() {
    if (document.getElementById('pwaInstallStyles')) return;

    const style = document.createElement('style');
    style.id = 'pwaInstallStyles';
    style.textContent = `
      .pwa-install-card {
        max-width: 720px;
        width: 100%;
        margin-inline: auto;
        display: none;
        gap: 10px;
        padding: 12px;
        border-radius: 24px;
        background:
          radial-gradient(circle at 12% 0%, rgba(96, 165, 250, .22), transparent 38%),
          radial-gradient(circle at 92% 10%, rgba(250, 204, 21, .12), transparent 34%),
          linear-gradient(180deg, rgba(15, 23, 42, .96), rgba(2, 6, 23, .88));
        border: 1px solid rgba(147, 197, 253, .28);
        box-shadow: 0 18px 38px rgba(0, 0, 0, .22), 0 0 26px rgba(37, 99, 235, .14), inset 0 1px 0 rgba(255, 255, 255, .08);
      }

      .pwa-install-card.show {
        display: grid;
      }

      .pwa-install-head {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        align-items: center;
      }

      .pwa-install-title {
        display: grid;
        gap: 3px;
      }

      .pwa-install-title strong {
        color: #dbeafe;
        font-size: .9rem;
        font-weight: 1000;
        text-transform: uppercase;
        letter-spacing: .08em;
        text-shadow: 0 0 12px rgba(96, 165, 250, .65);
      }

      .pwa-install-title span {
        color: #93c5fd;
        font-size: .74rem;
        font-weight: 850;
      }

      .pwa-install-actions {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
      }

      .pwa-install-actions button {
        min-height: 42px;
        border-radius: 14px;
        border: 1px solid rgba(147,197,253,.24);
        background: linear-gradient(180deg, rgba(37, 99, 235, .34), rgba(15, 23, 42, .9));
        color: #f8fafc;
        font-weight: 1000;
        cursor: pointer;
      }

      #pwaInstallBtn {
        border-color: rgba(34,197,94,.42);
        background: linear-gradient(180deg, rgba(34,197,94,.34), rgba(20,83,45,.84));
        color: #dcfce7;
      }

      #pwaDismissBtn {
        width: 44px;
        color: #dbeafe;
      }

      .pwa-ios-help {
        display: none;
        color: #fde68a;
        font-size: .76rem;
        font-weight: 900;
        line-height: 1.4;
        padding: 9px 11px;
        border-radius: 15px;
        background: rgba(250, 204, 21, .10);
        border: 1px solid rgba(250, 204, 21, .24);
      }

      .pwa-ios-help.show {
        display: block;
      }

      @media (max-width: 620px) {
        .pwa-install-head {
          align-items: flex-start;
          flex-direction: column;
        }

        .pwa-install-actions {
          grid-template-columns: 1fr;
        }

        #pwaDismissBtn {
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function isIos() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent || '');
  }

  function ensureInstallCard() {
    addStyle();

    if (document.getElementById('pwaInstallCard')) return;

    const card = document.createElement('section');
    card.id = 'pwaInstallCard';
    card.className = 'pwa-install-card';
    card.setAttribute('aria-label', 'Install app');
    card.innerHTML = `
      <div class="pwa-install-head">
        <div class="pwa-install-title">
          <strong>Install Member Elite</strong>
          <span>Add this tracker to your home screen for quick access.</span>
        </div>
      </div>

      <div class="pwa-ios-help" id="pwaIosHelp">
        On iPhone/iPad: tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.
      </div>

      <div class="pwa-install-actions">
        <button id="pwaInstallBtn" type="button">Install app</button>
        <button id="pwaDismissBtn" type="button" aria-label="Dismiss install prompt">✕</button>
      </div>
    `;

    const disclaimer = document.querySelector('.app-disclaimer');
    const header = document.querySelector('.header');

    if (disclaimer) disclaimer.insertAdjacentElement('afterend', card);
    else if (header) header.appendChild(card);
    else document.body.prepend(card);

    document.getElementById('pwaInstallBtn')?.addEventListener('click', installApp);
    document.getElementById('pwaDismissBtn')?.addEventListener('click', dismissInstall);
  }

  function showInstallCard() {
    if (isStandalone() || localStorage.getItem('memberEliteInstallDismissed') === 'true') return;

    ensureInstallCard();

    const card = document.getElementById('pwaInstallCard');
    const iosHelp = document.getElementById('pwaIosHelp');
    const installBtn = document.getElementById('pwaInstallBtn');

    card?.classList.add('show');

    if (isIos() && !deferredInstallPrompt) {
      iosHelp?.classList.add('show');
      if (installBtn) installBtn.textContent = 'Show install help';
    }
  }

  function dismissInstall() {
    localStorage.setItem('memberEliteInstallDismissed', 'true');
    document.getElementById('pwaInstallCard')?.classList.remove('show');
  }

  async function installApp() {
    if (isIos() && !deferredInstallPrompt) {
      document.getElementById('pwaIosHelp')?.classList.add('show');
      return;
    }

    if (!deferredInstallPrompt) {
      showInstallCard();
      return;
    }

    deferredInstallPrompt.prompt();

    try {
      const choice = await deferredInstallPrompt.userChoice;
      if (choice?.outcome === 'accepted') dismissInstall();
    } catch {}

    deferredInstallPrompt = null;
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {
        if (typeof setStatus === 'function') setStatus('Install service worker not available');
      });
    });
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    showInstallCard();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    dismissInstall();
    if (typeof setStatus === 'function') setStatus('Member Elite installed');
  });

  function init() {
    addHeadLinks();
    ensureInstallCard();
    registerServiceWorker();

    if (isIos() && !isStandalone()) {
      setTimeout(showInstallCard, 900);
    }
  }

  window.installMemberEliteApp = installApp;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();