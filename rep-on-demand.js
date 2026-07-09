'use strict';

(function initRepOnDemand() {
  if (window.__repOnDemandLoaded) return;
  window.__repOnDemandLoaded = true;

  const REP_NUMBER = '447797735129';

  function addStyle() {
    if (document.getElementById('repOnDemandStyles')) return;

    const style = document.createElement('style');
    style.id = 'repOnDemandStyles';
    style.textContent = `
      .rep-demand-modal {
        width: min(560px, 100%);
        background:
          radial-gradient(circle at 12% 0%, rgba(248, 113, 113, .22), transparent 38%),
          radial-gradient(circle at 92% 8%, rgba(250, 204, 21, .12), transparent 32%),
          linear-gradient(180deg, #07101f, #020817) !important;
        border: 1px solid rgba(248, 113, 113, .34) !important;
        box-shadow: 0 0 44px rgba(220, 38, 38, .22), inset 0 1px 0 rgba(255,255,255,.08) !important;
      }

      .rep-demand-hero,
      .rep-demand-help,
      .rep-demand-field {
        display: grid;
        gap: 8px;
        padding: 12px;
        border-radius: 20px;
        background: rgba(15, 23, 42, .72);
        border: 1px solid rgba(248, 113, 113, .18);
      }

      .rep-demand-title {
        color: #fecaca;
        font-weight: 1000;
        font-size: 1.15rem;
        text-shadow: 0 0 14px rgba(248, 113, 113, .46);
      }

      .rep-demand-sub,
      .rep-demand-help {
        color: #dbeafe;
        font-size: .82rem;
        font-weight: 850;
        line-height: 1.45;
      }

      .rep-demand-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .rep-demand-preset {
        min-height: 74px;
        border-radius: 18px;
        border: 1px solid rgba(248, 113, 113, .26);
        background:
          radial-gradient(circle at 20% 0%, rgba(248, 113, 113, .15), transparent 42%),
          linear-gradient(180deg, rgba(15, 23, 42, .96), rgba(2, 6, 23, .9));
        color: #f8fafc;
        font-weight: 1000;
        cursor: pointer;
      }

      .rep-demand-textarea {
        width: 100%;
        min-height: 110px;
        border-radius: 16px;
        border: 1px solid rgba(147, 197, 253, .28);
        background: #071225;
        color: #f8fafc;
        padding: 11px 12px;
        font-weight: 850;
        resize: vertical;
      }

      .rep-demand-actions {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 10px;
      }

      .rep-demand-actions button,
      #closeRepDemandBtn {
        min-height: 42px;
        border-radius: 14px;
        border: 1px solid rgba(147, 197, 253, .24);
        background: rgba(15, 23, 42, .82);
        color: #f8fafc;
        font-weight: 1000;
        cursor: pointer;
      }

      #sendRepDemandCustomBtn {
        border-color: rgba(34, 197, 94, .42);
        background: linear-gradient(180deg, rgba(34, 197, 94, .34), rgba(20, 83, 45, .84));
        color: #dcfce7;
      }

      #openRepOnDemandBtn {
        border-color: rgba(248, 113, 113, .36) !important;
      }

      #openRepOnDemandBtn .shell-icon {
        background: rgba(220, 38, 38, .18) !important;
        border-color: rgba(248, 113, 113, .34) !important;
        box-shadow: 0 0 18px rgba(248, 113, 113, .22) !important;
      }

      @media (max-width: 680px) {
        .rep-demand-grid,
        .rep-demand-actions {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureRepModal() {
    addStyle();

    if (document.getElementById('repDemandBackdrop')) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'repDemandBackdrop';
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.innerHTML = `
      <div class="modal rep-demand-modal" role="dialog" aria-modal="true" aria-labelledby="repDemandTitle">
        <div class="modal-head">
          <div class="modal-title" id="repDemandTitle">Rep On Demand</div>
          <button id="closeRepDemandBtn" type="button">✕</button>
        </div>

        <div class="rep-demand-hero">
          <div class="rep-demand-title">🚨 Contact a union rep</div>
          <div class="rep-demand-sub">Choose a quick message or write your own. A date and time stamp is added automatically.</div>
        </div>

        <div class="rep-demand-help">
          WhatsApp is required. The destination number is not shown in the app.
        </div>

        <div class="rep-demand-grid">
          <button class="rep-demand-preset" type="button" data-rep-message="I need help with a disciplinary, can you help?">⚖️ Disciplinary</button>
          <button class="rep-demand-preset" type="button" data-rep-message="I need urgent workplace support.">🆘 Urgent help</button>
          <button class="rep-demand-preset" type="button" data-rep-message="I have an issue with pay.">💷 Pay issue</button>
          <button class="rep-demand-preset" type="button" data-rep-message="I need advice about overtime or rota hours.">⏱️ Overtime / rota</button>
        </div>

        <div class="rep-demand-field">
          <label for="repDemandMessage">Custom message</label>
          <textarea id="repDemandMessage" class="rep-demand-textarea" placeholder="Type your message here..."></textarea>
        </div>

        <div class="rep-demand-actions">
          <button id="sendRepDemandCustomBtn" type="button">Send custom via WhatsApp</button>
          <button id="cancelRepDemandBtn" type="button">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    backdrop.addEventListener('click', event => {
      if (event.target === backdrop) closeRepOnDemand();
    });

    document.getElementById('closeRepDemandBtn')?.addEventListener('click', closeRepOnDemand);
    document.getElementById('cancelRepDemandBtn')?.addEventListener('click', closeRepOnDemand);

    document.getElementById('sendRepDemandCustomBtn')?.addEventListener('click', () => {
      const textarea = document.getElementById('repDemandMessage');
      const message = String(textarea?.value || '').trim();

      if (!message) {
        if (typeof setStatus === 'function') setStatus('Enter a message first');
        else alert('Enter a message first');
        return;
      }

      sendRepMessage(message);
    });

    backdrop.querySelectorAll('[data-rep-message]').forEach(button => {
      button.addEventListener('click', () => sendRepMessage(button.dataset.repMessage));
    });
  }

  function buildRepMessage(text) {
    const stamp = new Date().toLocaleString('en-GB');
    return `${text}\n\nSent from Member Elite Portal\n${stamp}`;
  }

  function sendRepMessage(text) {
    const url = `https://wa.me/${REP_NUMBER}?text=${encodeURIComponent(buildRepMessage(text))}`;
    const opened = window.open(url, '_blank', 'noopener,noreferrer');

    if (!opened) window.location.href = url;

    closeRepOnDemand();

    if (typeof setStatus === 'function') setStatus('Opening WhatsApp for rep support');
  }

  function openRepOnDemand() {
    ensureRepModal();

    document.getElementById('shellMenuBackdrop')?.classList.remove('open');

    const backdrop = document.getElementById('repDemandBackdrop');
    if (!backdrop) return;

    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
  }

  function closeRepOnDemand() {
    const backdrop = document.getElementById('repDemandBackdrop');
    if (!backdrop) return;

    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');

    const textarea = document.getElementById('repDemandMessage');
    if (textarea) textarea.value = '';
  }

  function placeRepButton(button, shellGrid) {
    const rotaButton = document.getElementById('openRotaPopupBtn');
    const insightButton = shellGrid.querySelector('[data-shell-action="insight"]');

    if (rotaButton?.parentElement === shellGrid) {
      rotaButton.insertAdjacentElement('afterend', button);
      return;
    }

    if (insightButton?.parentElement === shellGrid) {
      insightButton.insertAdjacentElement('beforebegin', button);
      return;
    }

    shellGrid.prepend(button);
  }

  function addRepMenuButton() {
    addStyle();

    const shellGrid = document.querySelector('#shellHomeView .shell-grid');
    if (!shellGrid) return;

    let button = document.getElementById('openRepOnDemandBtn');

    if (!button) {
      button = document.createElement('button');
      button.id = 'openRepOnDemandBtn';
      button.className = 'shell-action';
      button.type = 'button';
      button.innerHTML = `
        <span class="shell-icon">🚨</span>
        <span class="shell-label">Rep On Demand</span>
        <span class="shell-note">Quick WhatsApp support message</span>
      `;

      button.addEventListener('click', openRepOnDemand);
    }

    placeRepButton(button, shellGrid);
  }

  function init() {
    ensureRepModal();
    addRepMenuButton();

    setTimeout(addRepMenuButton, 250);
    setTimeout(addRepMenuButton, 750);
    setTimeout(addRepMenuButton, 1200);
  }

  window.openRepOnDemand = openRepOnDemand;
  window.closeRepOnDemand = closeRepOnDemand;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
})();
