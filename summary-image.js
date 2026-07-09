'use strict';

const WEEKLY_SUMMARY_IMAGE_URL = 'https://uploads.onecompiler.io/44uengjdp/44ujj4brz/Lottery%20Poster%202%20info.png';

function ensureWeeklySummaryImageStyles() {
  if (document.getElementById('weeklySummaryImageStyles')) return;

  const style = document.createElement('style');
  style.id = 'weeklySummaryImageStyles';
  style.textContent = `
    .summary-image-card {
      min-height: 140px;
      overflow: hidden;
      padding: 0 !important;
      border-radius: 18px;
      border: 1px solid rgba(147,197,253,.32);
      background: #020817;
    }

    .summary-image-card img {
      width: 100%;
      height: 105px;
      object-fit: cover;
      display: block;
    }

    .summary-image-card-body {
      display: grid;
      gap: 3px;
      padding: 10px;
      text-align: center;
    }

    .summary-image-card-body strong {
      color: #f8fafc;
      font-weight: 1000;
    }

    .summary-image-card-body span {
      color: #93c5fd;
      font-size: .72rem;
      font-weight: 850;
    }

    .summary-image-modal {
      width: min(760px, 100%);
      background: #020817;
    }

    .summary-image-modal img {
      width: 100%;
      max-height: 75dvh;
      object-fit: contain;
      border-radius: 16px;
      background: #000;
    }
  `;
  document.head.appendChild(style);
}

function ensureWeeklySummaryImageModal() {
  if (document.getElementById('weeklySummaryImageBackdrop')) return;

  const backdrop = document.createElement('div');
  backdrop.id = 'weeklySummaryImageBackdrop';
  backdrop.className = 'modal-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.innerHTML = `
    <div class="modal summary-image-modal" role="dialog" aria-modal="true" aria-labelledby="weeklySummaryImageTitle">
      <div class="modal-head">
        <div class="modal-title" id="weeklySummaryImageTitle">Weekly summary image</div>
        <button id="closeWeeklySummaryImageBtn" type="button">✕</button>
      </div>
      <img src="${WEEKLY_SUMMARY_IMAGE_URL}" alt="Weekly summary hosted image">
    </div>
  `;

  document.body.appendChild(backdrop);

  backdrop.addEventListener('click', event => {
    if (event.target === backdrop) closeWeeklySummaryImage();
  });

  document.getElementById('closeWeeklySummaryImageBtn')?.addEventListener('click', closeWeeklySummaryImage);
}

function openWeeklySummaryImage() {
  ensureWeeklySummaryImageModal();

  const backdrop = document.getElementById('weeklySummaryImageBackdrop');
  if (!backdrop) return;

  backdrop.classList.add('open');
  backdrop.setAttribute('aria-hidden', 'false');
}

function closeWeeklySummaryImage() {
  const backdrop = document.getElementById('weeklySummaryImageBackdrop');
  if (!backdrop) return;

  backdrop.classList.remove('open');
  backdrop.setAttribute('aria-hidden', 'true');
}

function patchWeeklySummaryMenuImage() {
  ensureWeeklySummaryImageStyles();

  const button = document.querySelector('[data-shell-action="tracker"]');
  if (!button || button.dataset.imagePatched === 'true') return;

  button.dataset.imagePatched = 'true';
  button.classList.add('summary-image-card');
  button.innerHTML = `
    <img src="${WEEKLY_SUMMARY_IMAGE_URL}" alt="Weekly summary">
    <span class="summary-image-card-body">
      <strong>Weekly summary</strong>
      <span>Open hosted image</span>
    </span>
  `;

  button.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    document.getElementById('shellMenuBackdrop')?.classList.remove('open');
    openWeeklySummaryImage();
  }, true);
}

function initWeeklySummaryImagePatch() {
  patchWeeklySummaryMenuImage();
  setTimeout(patchWeeklySummaryMenuImage, 250);
  setTimeout(patchWeeklySummaryMenuImage, 750);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWeeklySummaryImagePatch);
} else {
  initWeeklySummaryImagePatch();
}

window.addEventListener('load', initWeeklySummaryImagePatch);