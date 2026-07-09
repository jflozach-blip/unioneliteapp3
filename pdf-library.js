'use strict';

(function initMobileFriendlyPdfLibrary() {
  if (window.__mobileFriendlyPdfLibraryLoaded) return;
  window.__mobileFriendlyPdfLibraryLoaded = true;

  const PDF_DOCUMENTS = [
    { title: 'Driver Handbook', file: 'driver-handbook.pdf' },
    { title: 'Pay Notes', file: 'pay-notes.pdf' }
  ];

  let selectedIndex = 0;

  function isMobile() {
    return window.matchMedia('(max-width: 760px)').matches ||
      /iphone|ipad|ipod|android/i.test(navigator.userAgent || '');
  }

  function pdfUrl(doc) {
    return new URL(doc.file, window.location.href).href;
  }

  function viewerUrl(doc) {
    const url = pdfUrl(doc);

    if (isMobile()) {
      return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`;
    }

    return `${url}#toolbar=1&navpanes=0`;
  }

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
    if (document.getElementById('pdfLibraryMobileStyles')) return;

    const style = document.createElement('style');
    style.id = 'pdfLibraryMobileStyles';
    style.textContent = `
      .pdf-library-modal {
        width: min(1120px, 100%);
        height: min(94dvh, 900px);
        background:
          radial-gradient(circle at 12% 0%, rgba(96,165,250,.24), transparent 36%),
          linear-gradient(180deg, #07101f, #020817) !important;
        border: 1px solid rgba(147,197,253,.38) !important;
      }

      .pdf-library-body {
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: 12px;
        height: 100%;
        min-height: 0;
      }

      .pdf-library-list,
      .pdf-library-view {
        min-height: 0;
        border-radius: 18px;
        background: rgba(15,23,42,.72);
        border: 1px solid rgba(147,197,253,.18);
        overflow: hidden;
      }

      .pdf-library-list {
        display: grid;
        align-content: start;
        gap: 8px;
        padding: 10px;
        overflow: auto;
      }

      .pdf-library-item {
        min-height: 60px;
        padding: 12px;
        border-radius: 14px;
        border: 1px solid rgba(147,197,253,.24);
        background: #071225;
        color: #f8fafc;
        font-weight: 1000;
        text-align: left;
        cursor: pointer;
      }

      .pdf-library-item.active {
        border-color: rgba(34,197,94,.55);
        background: rgba(20,83,45,.35);
      }

      .pdf-library-view {
        display: grid;
        grid-template-rows: auto auto 1fr;
      }

      .pdf-library-toolbar {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 8px;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid rgba(147,197,253,.16);
      }

      .pdf-library-title {
        color: #dbeafe;
        font-weight: 1000;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .pdf-library-toolbar a {
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
      }

      #pdfOpenLink {
        border-color: rgba(34,197,94,.42);
        background: linear-gradient(180deg, rgba(34,197,94,.34), rgba(20,83,45,.84));
        color: #dcfce7;
      }

      .pdf-mobile-note {
        display: none;
        padding: 10px 12px;
        color: #fde68a;
        background: rgba(250,204,21,.10);
        border-bottom: 1px solid rgba(250,204,21,.22);
        font-size: .78rem;
        font-weight: 900;
        line-height: 1.4;
      }

      .pdf-frame-wrap {
        min-height: 0;
        height: 100%;
        background: #111827;
      }

      .pdf-frame {
        width: 100%;
        height: 100%;
        min-height: 640px;
        border: 0;
        background: #111827;
      }

      @media (max-width: 760px) {
        #pdfLibraryBackdrop {
          align-items: flex-end;
          padding: 0;
        }

        .pdf-library-modal {
          width: 100%;
          height: 94dvh;
          border-radius: 26px 26px 0 0 !important;
          border-left: 0 !important;
          border-right: 0 !important;
          border-bottom: 0 !important;
        }

        .pdf-library-body {
          grid-template-columns: 1fr;
          grid-template-rows: auto 1fr;
        }

        .pdf-library-list {
          grid-auto-flow: column;
          grid-auto-columns: minmax(175px, 1fr);
          overflow-x: auto;
          overflow-y: hidden;
        }

        .pdf-library-toolbar {
          grid-template-columns: 1fr;
        }

        .pdf-mobile-note {
          display: block;
        }

        .pdf-frame {
          min-height: 62dvh;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function ensureModal() {
    addStyle();

    if (document.getElementById('pdfLibraryBackdrop')) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'pdfLibraryBackdrop';
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.innerHTML = `
      <div class="modal pdf-library-modal" role="dialog" aria-modal="true" aria-labelledby="pdfLibraryTitle">
        <div class="modal-head">
          <div class="modal-title" id="pdfLibraryTitle">PDF Library</div>
          <button id="closePdfLibraryBtn" type="button">✕</button>
        </div>

        <div class="pdf-library-body">
          <div class="pdf-library-list" id="pdfLibraryList"></div>

          <div class="pdf-library-view">
            <div class="pdf-library-toolbar">
              <div class="pdf-library-title" id="pdfCurrentTitle">Select a PDF</div>
              <a id="pdfOpenLink" href="#" target="_blank" rel="noopener">Open PDF</a>
              <a id="pdfDownloadLink" href="#" download>Download</a>
            </div>

            <div class="pdf-mobile-note">
              Mobile uses a web PDF viewer. If the viewer stays blank, tap <strong>Open PDF</strong>.
            </div>

            <div class="pdf-frame-wrap">
              <iframe id="pdfFrame" class="pdf-frame" title="PDF viewer"></iframe>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    document.getElementById('closePdfLibraryBtn')?.addEventListener('click', closePdfLibrary);

    backdrop.addEventListener('click', event => {
      if (event.target === backdrop) closePdfLibrary();
    });
  }

  function renderList() {
    const list = document.getElementById('pdfLibraryList');
    if (!list) return;

    list.innerHTML = PDF_DOCUMENTS.map((doc, index) => `
      <button class="pdf-library-item ${index === selectedIndex ? 'active' : ''}" type="button" data-pdf-index="${index}">
        ${escapeHtml(doc.title)}
      </button>
    `).join('');

    list.querySelectorAll('[data-pdf-index]').forEach(button => {
      button.addEventListener('click', () => {
        selectedIndex = Number(button.dataset.pdfIndex);
        renderList();
        showSelectedPdf();
      });
    });
  }

  function showSelectedPdf() {
    const doc = PDF_DOCUMENTS[selectedIndex];
    if (!doc) return;

    const directUrl = pdfUrl(doc);
    const frameUrl = viewerUrl(doc);

    const title = document.getElementById('pdfCurrentTitle');
    const openLink = document.getElementById('pdfOpenLink');
    const downloadLink = document.getElementById('pdfDownloadLink');
    const frame = document.getElementById('pdfFrame');

    if (title) title.textContent = doc.title;

    if (openLink) openLink.href = directUrl;

    if (downloadLink) {
      downloadLink.href = directUrl;
      downloadLink.download = doc.file;
    }

    if (frame) frame.src = frameUrl;
  }

  function openPdfLibrary() {
    ensureModal();

    document.getElementById('shellMenuBackdrop')?.classList.remove('open');

    const backdrop = document.getElementById('pdfLibraryBackdrop');
    if (!backdrop) return;

    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');

    renderList();
    showSelectedPdf();
  }

  function closePdfLibrary() {
    const backdrop = document.getElementById('pdfLibraryBackdrop');
    if (!backdrop) return;

    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
  }

  function addMenuButton() {
    addStyle();

    const shellGrid = document.querySelector('#shellHomeView .shell-grid');
    if (!shellGrid) return;

    let button = document.getElementById('openPdfLibraryBtn');

    if (!button) {
      button = document.createElement('button');
      button.id = 'openPdfLibraryBtn';
      button.className = 'shell-action';
      button.type = 'button';
      button.innerHTML = `
        <span class="shell-icon">📄</span>
        <span class="shell-label">PDF Library</span>
        <span class="shell-note">View PDFs from main directory</span>
      `;
      button.addEventListener('click', openPdfLibrary);
    }

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

  window.openPdfLibrary = openPdfLibrary;
  window.closePdfLibrary = closePdfLibrary;

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closePdfLibrary();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('load', init);
})();