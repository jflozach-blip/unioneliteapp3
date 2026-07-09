'use strict';

(function initLocalWeekStorage() {
  if (window.__localWeekStorageLoaded) return;
  window.__localWeekStorageLoaded = true;

  window.__autoWeekLoaderBound = true;

  const WEEK_PREFIX = 'driver-local-week-v2:';
  const LEGACY_IMPORTED_KEY = 'driver-local-week-v2-legacy-imported';

  let controlsBound = false;
  let renderPatched = false;
  let saveTimer = null;
  let loadingWeek = false;
  let activeWeekKey = '';

  function appReady() {
    return typeof state !== 'undefined' &&
      typeof DAYS !== 'undefined' &&
      typeof getMonday === 'function' &&
      typeof isoToDate === 'function' &&
      typeof dateToISO === 'function' &&
      typeof render === 'function';
  }

  function addResetButtonStyle() {
    if (document.getElementById('localWeekResetStyles')) return;

    const style = document.createElement('style');
    style.id = 'localWeekResetStyles';
    style.textContent = `
      #resetWeekBtn {
        border-color: rgba(248,113,113,.42) !important;
        background: linear-gradient(180deg, rgba(239,68,68,.32), rgba(127,29,29,.82)) !important;
        color: #fee2e2 !important;
      }
    `;
    document.head.appendChild(style);
  }

  function ensureResetButton() {
    addResetButtonStyle();

    if (document.getElementById('resetWeekBtn')) return document.getElementById('resetWeekBtn');

    const loadBtn = document.getElementById('loadWeekBtn');
    if (!loadBtn?.parentElement) return null;

    const button = document.createElement('button');
    button.id = 'resetWeekBtn';
    button.type = 'button';
    button.textContent = 'Reset week';
    button.title = 'Clear the currently selected week only';

    loadBtn.insertAdjacentElement('afterend', button);
    return button;
  }

  function blankDay() {
    return {
      worked: false,
      dutyId: '',
      dutyCode: '',
      duty: null,
      hours: 0,
      otMinutes: 0,
      manualMinutes: 0,
      bankHoliday: false,
      sick: false,
      payIn: 0,
      adjustStart: '',
      adjustFinish: '',
      deductMinutes: 0
    };
  }

  function weekKeyFromDate(value) {
    return dateToISO(getMonday(value));
  }

  function currentWeekKey() {
    return weekKeyFromDate(state.weekStartDate);
  }

  function localKey(key) {
    return WEEK_PREFIX + key;
  }

  function weekDates(monday) {
    return DAYS.map((_, index) => {
      const date = new Date(monday);
      date.setDate(date.getDate() + index);
      return dateToISO(date);
    });
  }

  function currentWeekDateSet(monday = state.weekStartDate) {
    return new Set(weekDates(monday));
  }

  function cloneDay(day) {
    return {
      worked: !!day.worked,
      dutyId: day.dutyId || '',
      dutyCode: day.dutyCode || '',
      hours: Number(day.hours || 0),
      otMinutes: Number(day.otMinutes || 0),
      manualMinutes: Number(day.manualMinutes || 0),
      bankHoliday: !!day.bankHoliday,
      sick: !!day.sick,
      payIn: Number(day.payIn || 0),
      adjustStart: day.adjustStart || '',
      adjustFinish: day.adjustFinish || '',
      deductMinutes: Number(day.deductMinutes || 0)
    };
  }

  function hydrateDay(day) {
    return {
      worked: !!day.worked,
      dutyId: day.dutyId || '',
      dutyCode: day.dutyCode || '',
      duty: null,
      hours: Number(day.hours || 0),
      otMinutes: Number(day.otMinutes || 0),
      manualMinutes: Number(day.manualMinutes || 0),
      bankHoliday: !!day.bankHoliday,
      sick: !!day.sick,
      payIn: Number(day.payIn || 0),
      adjustStart: day.adjustStart || '',
      adjustFinish: day.adjustFinish || '',
      deductMinutes: Number(day.deductMinutes || 0)
    };
  }

  function getSavedKeys() {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(WEEK_PREFIX))
      .map(key => key.slice(WEEK_PREFIX.length))
      .sort()
      .reverse();
  }

  function readSnapshot(key) {
    try {
      return JSON.parse(localStorage.getItem(localKey(key)) || 'null');
    } catch {
      return null;
    }
  }

  function clearWeekPlannerDates(monday) {
    const dates = currentWeekDateSet(monday);

    if (!Array.isArray(state.annualLeaveDates)) state.annualLeaveDates = [];
    if (!Array.isArray(state.sickDates)) state.sickDates = [];

    state.annualLeaveDates = state.annualLeaveDates.filter(date => !dates.has(date));
    state.sickDates = state.sickDates.filter(date => !dates.has(date));
  }

  function applySnapshotPlannerDates(snapshot, monday) {
    clearWeekPlannerDates(monday);

    const dates = currentWeekDateSet(monday);

    if (Array.isArray(snapshot?.annualLeaveDates)) {
      snapshot.annualLeaveDates.forEach(date => {
        if (dates.has(date) && !state.annualLeaveDates.includes(date)) {
          state.annualLeaveDates.push(date);
        }
      });
    }

    if (Array.isArray(snapshot?.sickDates)) {
      snapshot.sickDates.forEach(date => {
        if (dates.has(date) && !state.sickDates.includes(date)) {
          state.sickDates.push(date);
        }
      });
    }
  }

  function saveLocalWeek(showStatus = false) {
    if (!appReady() || loadingWeek) return;

    const key = currentWeekKey();
    const dates = currentWeekDateSet();

    const snapshot = {
      version: 2,
      weekStartDate: key,
      savedAt: new Date().toISOString(),
      days: state.days.map(cloneDay),
      rates: { ...(state.rates || {}) },
      annualLeaveDates: Array.isArray(state.annualLeaveDates)
        ? state.annualLeaveDates.filter(date => dates.has(date))
        : [],
      sickDates: Array.isArray(state.sickDates)
        ? state.sickDates.filter(date => dates.has(date))
        : [],
      payInPaid: state.payInPaidByWeek?.[key] || {}
    };

    localStorage.setItem(localKey(key), JSON.stringify(snapshot));
    activeWeekKey = key;
    renderLocalWeekOptions();

    if (showStatus && typeof setStatus === 'function') {
      setStatus('Week saved locally');
    }
  }

  function scheduleSave() {
    if (loadingWeek) return;

    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveLocalWeek(false), 250);
  }

  function resetCurrentWeek() {
    if (!appReady()) return;

    const confirmed = window.confirm('Reset this selected week? This clears duties, overtime, annual leave, sick days and pay-in for this week only.');
    if (!confirmed) return;

    const key = currentWeekKey();

    loadingWeek = true;

    state.days = DAYS.map(() => blankDay());
    clearWeekPlannerDates(state.weekStartDate);

    if (!state.payInPaidByWeek || typeof state.payInPaidByWeek !== 'object') {
      state.payInPaidByWeek = {};
    }

    state.payInPaidByWeek[key] = {};

    if (typeof normalizeStateDays === 'function') normalizeStateDays();

    loadingWeek = false;

    if (typeof saveState === 'function') saveState(true);
    render();
    saveLocalWeek(false);
    renderLocalWeekOptions();

    if (typeof setStatus === 'function') {
      setStatus('Current week reset locally');
    }
  }

  function loadLocalWeek(key, options = {}) {
    if (!key || !appReady()) return;

    const snapshot = readSnapshot(key);
    const monday = getMonday(isoToDate(key));

    loadingWeek = true;

    state.weekStartDate = monday;
    state.days = snapshot?.days?.length
      ? snapshot.days.map(hydrateDay)
      : DAYS.map(() => blankDay());

    if (snapshot?.rates) {
      state.rates = { ...(state.rates || {}), ...snapshot.rates };
    }

    if (!state.payInPaidByWeek || typeof state.payInPaidByWeek !== 'object') {
      state.payInPaidByWeek = {};
    }

    state.payInPaidByWeek[key] = snapshot?.payInPaid || {};
    applySnapshotPlannerDates(snapshot || {}, monday);

    if (typeof normalizeStateDays === 'function') normalizeStateDays();

    activeWeekKey = key;
    loadingWeek = false;

    if (typeof saveState === 'function') saveState(true);
    render();
    renderLocalWeekOptions();

    if (typeof setStatus === 'function') {
      setStatus(snapshot ? 'Saved week loaded' : 'Blank week started');
    }

    if (options.saveBlank && !snapshot) saveLocalWeek(false);
  }

  function selectWeek(value) {
    if (!value || !appReady()) return;

    saveLocalWeek(false);

    const key = weekKeyFromDate(value);
    loadLocalWeek(key, { saveBlank: true });
  }

  function moveWeek(days) {
    const date = new Date(state.weekStartDate);
    date.setDate(date.getDate() + days);
    selectWeek(date);
  }

  function renderLocalWeekOptions() {
    if (!appReady()) return;

    const select = document.getElementById('savedWeeksSelect');
    if (!select) return;

    const keys = getSavedKeys();
    select.innerHTML = '';

    if (!keys.length) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = 'No locally saved weeks';
      select.appendChild(option);
      return;
    }

    keys.forEach(key => {
      const snapshot = readSnapshot(key);
      const option = document.createElement('option');
      option.value = key;

      const labelDate = isoToDate(key).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      option.textContent = snapshot?.savedAt
        ? `${labelDate} • local`
        : labelDate;

      if (key === currentWeekKey()) option.selected = true;
      select.appendChild(option);
    });
  }

  function importLegacyWeeksOnce() {
    if (!appReady()) return;
    if (localStorage.getItem(LEGACY_IMPORTED_KEY) === 'true') return;

    const legacy = state.savedWeeks || {};

    Object.keys(legacy).forEach(key => {
      if (localStorage.getItem(localKey(key))) return;

      const old = legacy[key];
      if (!old || !Array.isArray(old.days)) return;

      const monday = getMonday(isoToDate(key));
      const dates = currentWeekDateSet(monday);

      const snapshot = {
        version: 2,
        weekStartDate: key,
        savedAt: old.savedAt || new Date().toISOString(),
        days: old.days.map(cloneDay),
        rates: old.rates || state.rates || {},
        annualLeaveDates: Array.isArray(old.annualLeaveDates)
          ? old.annualLeaveDates.filter(date => dates.has(date))
          : [],
        sickDates: Array.isArray(old.sickDates)
          ? old.sickDates.filter(date => dates.has(date))
          : [],
        payInPaid: old.payInPaidByWeek?.[key] || {}
      };

      localStorage.setItem(localKey(key), JSON.stringify(snapshot));
    });

    localStorage.setItem(LEGACY_IMPORTED_KEY, 'true');
  }

  function bindControls() {
    if (controlsBound || !appReady()) return;
    controlsBound = true;

    const weekInput = document.getElementById('weekStartInput');
    const prevBtn = document.getElementById('prevWeekBtn');
    const nextBtn = document.getElementById('nextWeekBtn');
    const saveBtn = document.getElementById('saveWeekBtn');
    const loadBtn = document.getElementById('loadWeekBtn');
    const resetBtn = ensureResetButton();
    const select = document.getElementById('savedWeeksSelect');

    if (weekInput) {
      weekInput.addEventListener('change', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (weekInput.value) selectWeek(isoToDate(weekInput.value));
      }, true);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        moveWeek(-7);
      }, true);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        moveWeek(7);
      }, true);
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        saveLocalWeek(true);
      }, true);
    }

    if (loadBtn) {
      loadBtn.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (select?.value) loadLocalWeek(select.value);
      }, true);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        resetCurrentWeek();
      }, true);
    }

    window.addEventListener('beforeunload', () => saveLocalWeek(false));
  }

  function patchRenderAutoSave() {
    if (renderPatched || !appReady()) return;
    renderPatched = true;

    const originalRender = render;

    render = function localWeekRenderWrapper(...args) {
      const result = originalRender.apply(this, args);
      scheduleSave();
      return result;
    };
  }

  function initialise() {
    if (!appReady()) {
      setTimeout(initialise, 80);
      return;
    }

    importLegacyWeeksOnce();

    activeWeekKey = currentWeekKey();

    if (!localStorage.getItem(localKey(activeWeekKey))) {
      saveLocalWeek(false);
    }

    ensureResetButton();
    patchRenderAutoSave();
    bindControls();
    renderLocalWeekOptions();

    if (typeof setStatus === 'function') {
      setStatus('Local week storage ready');
    }
  }

  window.localWeekStorage = {
    save: saveLocalWeek,
    load: loadLocalWeek,
    selectWeek,
    reset: resetCurrentWeek,
    list: getSavedKeys
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialise);
  } else {
    initialise();
  }

  window.addEventListener('load', initialise);
})();