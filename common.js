export const techniqueNames = {
  breath: 'Breath awareness',
  body: 'Body scan',
  listen: 'Mindful listening',
  walk: 'Walking meditation'
};

export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const use = document.createElementNS(svg.namespaceURI, 'use');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('aria-hidden', 'true');
  use.setAttribute('href', 'assets/icons.svg#' + name);
  svg.append(use);
  return svg;
}

// One storage key per practice keeps two tabs from overwriting each other's logs.
const prefix = 'stillspace.practice.';
export function localDate(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')].join('-');
}
export function fromDateKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}
export function validDate(key) {
  return typeof key === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(key) &&
    localDate(fromDateKey(key)) === key && key <= localDate();
}
function validEntry(item) {
  return item && typeof item.title === 'string' && item.title.trim() &&
    validDate(item.date) && Number.isInteger(item.minutes) &&
    item.minutes > 0 && item.minutes <= 1440;
}
export function saveEntry(entry) {
  if (!validEntry(entry) || !entry.id) throw new Error('Check the date and minutes.');
  localStorage.setItem(prefix + entry.id, JSON.stringify(entry));
}
export function loadEntries() {
  const entries = [];
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (!key?.startsWith(prefix)) continue;
    try {
      const item = JSON.parse(localStorage.getItem(key));
      if (validEntry(item)) entries.push(item);
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
    }
  }
  return entries.sort((a, b) => b.date.localeCompare(a.date) || (b.created || 0) - (a.created || 0));
}
export function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}
export function mondayOf(date) {
  return addDays(date, -((date.getDay() + 6) % 7));
}
export function weekView(container, entries, monday) {
  const start = localDate(monday);
  const end = localDate(addDays(monday, 6));
  const items = entries.filter(item => item.date >= start && item.date <= end);
  const dates = new Set(items.map(item => item.date));
  const list = element('ul', 'week-strip');
  list.setAttribute('aria-label', 'Daily practice for the selected week');
  for (let n = 0; n < 7; n++) {
    const date = addDays(monday, n);
    const key = localDate(date);
    const day = date.toLocaleDateString('en-GB', {weekday:'short'});
    const cell = element('li', 'week-day');
    const done = dates.has(key);
    cell.classList.toggle('done', done);
    cell.classList.toggle('today', key === localDate());
    const dot = element('span', 'day-dot');
    if (done) dot.append(icon('check'));
    cell.append(dot, element('span', '', day), element('span', 'sr-only',
      (key === localDate() ? 'Today. ' : '') + (done ? 'Practice logged.' : 'No practice logged.')));
    list.append(cell);
  }
  container.replaceChildren(list);
  return {items, days:dates.size, minutes:items.reduce((sum, item) => sum + item.minutes, 0)};
}

export async function loadSessions() {
  const response = await fetch('sessions.xml');
  if (!response.ok) throw new Error('Session catalogue could not be loaded.');
  const xml = new DOMParser().parseFromString(await response.text(), 'application/xml');
  if (xml.querySelector('parsererror')) throw new Error('Invalid session catalogue.');
  return Array.from(xml.querySelectorAll('sessions > session'), node => ({
    id:node.getAttribute('id'), title:node.querySelector('title').textContent,
    description:node.querySelector('description').textContent,
    minutes:Number(node.getAttribute('minutes')),
    techniques:node.getAttribute('techniques').split(' '),
    cues:Array.from(node.querySelectorAll('cue'), cue => ({
      at:Number(cue.getAttribute('at')), phase:cue.getAttribute('phase'), text:cue.textContent
    }))
  }));
}

export function newId() {
  return globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
}
