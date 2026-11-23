import {loadEntries, mondayOf, weekView} from './common.js';

function refresh() {
  const summary = document.querySelector('#home-summary');
  try {
    const week = weekView(document.querySelector('#home-week'), loadEntries(), mondayOf(new Date()));
    summary.textContent = week.days ? week.minutes + ' minutes across ' + week.days +
      (week.days === 1 ? ' day' : ' days') + ' this week.' : 'Your first practice this week will appear here.';
  } catch {
    summary.textContent = 'Your browser could not open the practice history.';
  }
}
refresh();
window.addEventListener('storage', refresh);
window.addEventListener('pageshow', refresh);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
