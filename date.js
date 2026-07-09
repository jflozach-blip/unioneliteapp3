// Returns the Monday for a given date.
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Formats a date as YYYY-MM-DD for inputs and storage.
function dateToISO(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Converts an ISO string back into a Date object.
function isoToDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Short UK-friendly date label.
function fmtDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}