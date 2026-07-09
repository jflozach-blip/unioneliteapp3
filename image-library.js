'use strict';

(function initImageLibraryViewer() {
  if (window.__imageLibraryViewerLoaded) return;
  window.__imageLibraryViewerLoaded = true;

  const GALLERY_JSON = 'images/gallery.json';

  let images = [];
  let selectedIndex = 0;
  let zoom = 1;

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function addStyle() {
    if (document.getElementById('imageLibraryStyles')) return;

    const style = document.createElement('style');
    style.id = 'imageLibraryStyles';
    style.textContent = `
      .image-library-modal {
        width: min(1120px, 100%);
        height: min(94dvh, 900px);
        background:
          radial-gradient(circle at 12% 0%, rgba(96,165,250,.24), transparent 36%),
          linear-gradient(180deg, #07101f, #020817) !important;
        border: 1px solid rgba(147,197,253,.38) !important;
      }

      .image-library-body {
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: 12px;
        height: 100%;
        min-height: 0;
      }

      .image-library-list,
      .image-library-view {
        min-height: 0;
        border-radius: 18px;
        background: rgba(15,23,42,.72);
        border: 1px solid rgba(147,197,253,.18);
        overflow: hidden;
      }

      .image-library-list {
        display: grid;
        align-content: start;
        gap: 9px;
        padding: 10px;
        overflow: auto;
      }

      .image-library-item {
        display: grid;
        grid-template-columns: 58px 1fr;
        gap: 10px;
        align-items: center;
        min-height: 70px;
        padding: 8px;
        border-radius: 14px;
        border: 1px solid rgba(147,197,253,.24);
        background: #071225;
        color: #f8fafc;
        font-weight: 1000;
        text-align: left;
        cursor: pointer;
      }

      .image-library-item.active {
        border-color: rgba(34,197,94,.55);
        background: rgba(20,83,45,.35);
      }

      .image-thumb {
        width: 58px;
        height: 52px;
        object-fit: cover;
        border-radius: 10px;
        background: #020617;
        border: 1px solid rgba(147,197,253,.16);
      }

      .image-library-view {
        display: grid;
        grid-template-rows: auto auto 1fr;
      }

      .image-toolbar {
        display: grid;
        grid-template-columns: 1fr auto auto auto auto auto auto;
        gap: 8px;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid rgba(147,197,253,.16);
      }

      .image-title {
        color: #dbeafe;
        font-weight: 1000;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .image-toolbar button,
      .image-toolbar a {
        min-height: 40px;
        display: grid;
        place-items: center;
        border-radius: 12px;
        border: 1px solid rgba(147,197,253,.30);
        background: rgba(37,99,235,.28);
        color: #dbeafe;
        font-weight: 1000;
        padding: 9px 12px;
        text-decoration: none;
        cursor: pointer;
      }

      #imageOpenLink {
        border-color: rgba(34,197,94,.42);
        background: linear-gradient(180deg, rgba(34,197,94,.34), rgba(20,83,45,.84));
        color: #dcfce7;
      }

      .image-statusbar {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        padding: 8px 12px;
        color: #93c5fd;
        font-size: .78rem;
        font-weight: 900;
        border-bottom: 1px solid rgba(147,197,253,.12);
        background: rgba(2,6,23,.35);
      }

      .image-canvas-wrap {
        height: 100%;
        min-height: 0;
        overflow: auto;
        padding: 14px;
        display: grid;
        align-content: center;
        justify-items: center;
        background: #020617;
        -webkit-overflow-scrolling: touch;
      }

      #libraryImage {
        width: 100%;
        max-width: 100%;
        height: auto;
        object-fit: contain;
        border-radius: 16px;
        background: #000;
        box-shadow: 0 16px 34px rgba(0,0,0,.42);
      }

      .image-message {
        min-height: 55dvh;
        display: grid;
        place-items: center;
        text-align: center;
        color: #bfdbfe;
        font-weight: 1000;
        line-height: 1.45;
        padding: 18px;
      }

      .image-error {
        color: #fecaca;
      }

      @media (max-width: 760px) {
        #imageLibraryBackdrop {
          align-items: flex-end;
          padding: 0;
        }

        .image-library-modal {
          width: 100%;
          height: 94dvh;
          border-radius: 26px 26px 0 0 !important;
          border-left: 0 !important;
          border-right: 0 !important;
          border-bottom: 0 !important;
        }

        .image-library-body {
          grid-template-columns: 1fr;
          grid-template-rows: auto 1fr;
        }

        .image-library-list {
          grid-auto-flow: column;
          grid-auto-columns: minmax(180px, 1fr);
          overflow-x: auto;
          overflow-y: hidden;
        }

        .image-toolbar {
          grid-template-columns: 1fr auto auto auto;
        }

        #imageOpenLink,
        #imageDownloadLink {
          grid-column: span 2;
        }
      }
    `;

    document.head.appendChild(style);
  }

  async function loadGallery() {
    try {
      const response = await fetch(GALLERY_JSON, { cache: 'no-store' });
      if (!response.ok) throw new Error('Gallery JSON not found');

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Gallery JSON must be an array');

      images = data
        .filter(item => item && item.file)
        .map((item, index) => ({
          title: item.title || `Image ${index + 1}`,
          file: item.file
        }));
    } catch {
      images = [];
    }

    selectedIndex = Math.max(0, Math.min(selectedIndex, Math.max(0, images.length - 1)));
  }

  function ensureModal() {
    addStyle();

    if (document.getElementById('imageLibraryBackdrop')) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'imageLibraryBackdrop';
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.innerHTML = `
      <div class="modal image-library-modal" role="dialog" aria-modal="true" aria-labelledby="imageLibraryTitle">
        <div class="modal-head">
          <div class="modal-title" id="imageLibraryTitle">Image Library</div>
          <button id="closeImageLibraryBtn" type="button">✕</button>
        </div>

        <div class="image-library-body">
          <div class="image-library-list" id="imageLibraryList"></div>

          <div class="image-library-view">
            <div class="image-toolbar">
              <div class="image-title" id="imageCurrentTitle">Select an image</div>
              <button id="imagePrevBtn" type="button">Prev</button>
              <button id="imageNextBtn" type="button">Next</button>
              <button id="imageZoomOutBtn" type="button">−</button>
              <button id="imageZoomInBtn" type="button">+</button>
              <a id="imageOpenLink" href="#" target="_blank" rel="noopener">Open</a>
              <a id="imageDownloadLink" href="#" download>Download</a>
            </div>

            <div class="image-statusbar">
              <span id="imageCountStatus">Image —</span>
              <span id="imageZoomStatus">100%</span>
            </div>

            <div id="imageCanvasWrap" class="image-canvas-wrap">
              <div class="image-message">No images are currently listed.</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    document.getElementById('closeImageLibraryBtn')?.addEventListener('click', closeImageLibrary);
    document.getElementById('imagePrevBtn')?.addEventListener('click', () => changeImage(-1));
    document.getElementById('imageNextBtn')?.addEventListener('click', () => changeImage(1));
    document.getElementById('imageZoomOutBtn')?.addEventListener('click', () => changeZoom(-0.15));
    document.getElementById('imageZoomInBtn')?.addEventListener('click', () => changeZoom(0.15));

    backdrop.addEventListener('click', event => {
      if (event.target === backdrop) closeImageLibrary();
    });
  }

  function renderList() {
    const list = document.getElementById('imageLibraryList');
    if (!list) return;

    if (!images.length) {
      list.innerHTML = '<div class="image-message">No images added yet.</div>';
      return;
    }

    list.innerHTML = images.map((image, index) => `
      <button class="image-library-item ${index === selectedIndex ? 'active' : ''}" type="button" data-image-index="${index}">
        <img class="image-thumb" src="${escapeHtml(image.file)}" alt="">
        <span>${escapeHtml(image.title)}</span>
      </button>
    `).join('');

    list.querySelectorAll('[data-image-index]').forEach(button => {
      button.addEventListener('click', () => {
        selectedIndex = Number(button.dataset.imageIndex);
        zoom = 1;
        renderList();
        renderCurrentImage();
      });
    });
  }

  function renderCurrentImage() {
    const wrap = document.getElementById('imageCanvasWrap');
    const title = document.getElementById('imageCurrentTitle');
    const openLink = document.getElementById('imageOpenLink');
    const downloadLink = document.getElementById('imageDownloadLink');

    if (!wrap) return;

    if (!images.length) {
      if (title) title.textContent = 'No images';
      if (openLink) openLink.href = '#';
      if (downloadLink) downloadLink.href = '#';
      wrap.innerHTML = `
        <div class="image-message">
          No images are currently listed.<br>
          Add files in <strong>images/gallery.json</strong> to show them here.
        </div>
      `;
      updateStatus();
      return;
    }

    const image = images[selectedIndex];
    if (!image) return;

    if (title) title.textContent = image.title;
    if (openLink) openLink.href = image.file;
    if (downloadLink) {
      downloadLink.href = image.file;
      downloadLink.download = image.file.split('/').pop() || 'image';
    }

    wrap.innerHTML = `<img id="libraryImage" src="${escapeHtml(image.file)}" alt="${escapeHtml(image.title)}">`;

    const img = document.getElementById('libraryImage');
    if (img) {
      img.style.width = `${Math.round(zoom * 100)}%`;
      img.style.maxWidth = zoom <= 1 ? '100%' : 'none';

      img.onerror = () => {
        wrap.innerHTML = `
          <div class="image-message image-error">
            Could not load this image.<br><br>
            Checked file:<br>
            <strong>${escapeHtml(image.file)}</strong><br><br>
            Make sure the file exists in your project.
          </div>
        `;
      };
    }

    updateStatus();
  }

  function updateStatus() {
    const count = document.getElementById('imageCountStatus');
    const zoomStatus = document.getElementById('imageZoomStatus');

    if (count) count.textContent = images.length ? `Image ${selectedIndex + 1} of ${images.length}` : 'Image —';
    if (zoomStatus) zoomStatus.textContent = `${Math.round(zoom * 100)}%`;
  }

  function changeImage(delta) {
    if (!images.length) return;
    selectedIndex = (selectedIndex + delta + images.length) % images.length;
    zoom = 1;
    renderList();
    renderCurrentImage();
  }

  function changeZoom(delta) {
    if (!images.length) return;
    zoom = Math.max(0.4, Math.min(2.5, zoom + delta));
    renderCurrentImage();
  }

  async function openImageLibrary() {
    ensureModal();
    await loadGallery();

    document.getElementById('shellMenuBackdrop')?.classList.remove('open');

    const backdrop = document.getElementById('imageLibraryBackdrop');
    if (!backdrop) return;

    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');

    renderList();
    renderCurrentImage();
  }

  function closeImageLibrary() {
    const backdrop = document.getElementById('imageLibraryBackdrop');
    if (!backdrop) return;

    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
  }

  function addMenuButton() {
    addStyle();

    const shellGrid = document.querySelector('#shellHomeView .shell-grid');
    if (!shellGrid) return;

    let button = document.getElementById('openImageLibraryBtn');

    if (!button) {
      button = document.createElement('button');
      button.id = 'openImageLibraryBtn';
      button.className = 'shell-action';
      button.type = 'button';
      button.addEventListener('click', openImageLibrary);
    }

    button.innerHTML = `
      <span class="shell-icon">🖼️</span>
      <span class="shell-label">Image Library</span>
      <span class="shell-note">Browse uploaded image repository</span>
    `;

    const repButton = document.getElementById('openRepOnDemandBtn');
    const rotaButton = document.getElementById('openRotaPopupBtn');

    if (repButton?.parentElement === shellGrid) {
      repButton.insertAdjacentElement('afterend', button);
    } else if (rotaButton?.parentElement === shellGrid) {
      rotaButton.insertAdjacentElement('afterend', button);
    } else {
      shellGrid.prepend(button);
    }
  }

  function init() {
    ensureModal();
    addMenuButton();

    setTimeout(addMenuButton, 250);
    setTimeout(addMenuButton, 750);
    setTimeout(addMenuButton, 1200);
  }

  window.openImageLibrary = openImageLibrary;
  window.closeImageLibrary = closeImageLibrary;

  document.addEventListener('keydown', event => {
    if (!document.getElementById('imageLibraryBackdrop')?.classList.contains('open')) return;

    if (event.key === 'Escape') closeImageLibrary();
    if (event.key === 'ArrowLeft') changeImage(-1);
    if (event.key === 'ArrowRight') changeImage(1);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
})();