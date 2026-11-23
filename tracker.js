import {addDays, element, fromDateKey, loadEntries, localDate, mondayOf, newId, saveEntry, techniqueNames, validDate, weekView} from './common.js';

const form = document.querySelector('#manual-form');
const dateField = document.querySelector('#log-date');
const technique = document.querySelector('#log-technique');
const minutes = document.querySelector('#log-minutes');
const message = document.querySelector('#form-message');
const table = document.querySelector('#history');
const shortDate = date => date.toLocaleDateString('en-GB',{day:'numeric',month:'short'});
let monday = mondayOf(new Date());
function refresh() {
  dateField.max = localDate();
  const end = addDays(monday, 6);
  document.querySelector('#week-range').textContent = shortDate(monday) + ' – ' + shortDate(end) + ' ' + end.getFullYear();
  document.querySelector('#next-week').disabled = localDate(monday) >= localDate(mondayOf(new Date()));
  try {
    const week = weekView(document.querySelector('#tracker-week'), loadEntries(), monday);
    document.querySelector('#total-minutes').textContent = week.minutes + (week.minutes === 1 ? ' minute' : ' minutes');
    document.querySelector('#total-days').textContent = week.days + (week.days === 1 ? ' day practised' : ' days practised');
    const rows = week.items.map(item => {
      const row = element('tr');
      row.append(element('td','',shortDate(fromDateKey(item.date))),element('td','',item.title),
        element('td','',item.minutes + ' min'));
      return row;
    });
    table.tBodies[0].replaceChildren(...rows);
    table.hidden = !rows.length;
    document.querySelector('#history-empty').hidden = Boolean(rows.length);
  } catch {
    message.textContent = 'Your browser could not open your saved practice history.';
  }
}
document.querySelector('#previous-week').addEventListener('click', () => { monday = addDays(monday,-7); refresh(); });
document.querySelector('#next-week').addEventListener('click', () => { monday = addDays(monday,7); refresh(); });
document.querySelector('.form-toggle').addEventListener('click', event => {
  event.currentTarget.setAttribute('aria-expanded', String(document.querySelector('.form-card').classList.toggle('open')));
});
form.addEventListener('input', () => { dateField.setCustomValidity(''); message.textContent = ''; });
form.addEventListener('submit', event => {
  event.preventDefault();
  dateField.setCustomValidity(validDate(dateField.value) ? '' : 'Choose today or an earlier date.');
  if (!form.reportValidity() || !Object.hasOwn(techniqueNames,technique.value)) return;
  try {
    saveEntry({id:newId(), date:dateField.value, title:techniqueNames[technique.value],
      minutes:minutes.valueAsNumber, created:Date.now()});
    monday = mondayOf(fromDateKey(dateField.value));
    form.reset();
    dateField.value = localDate();
    refresh();
    message.textContent = 'Practice saved to your tracker.';
  } catch {
    message.textContent = 'Your practice could not be saved. Check that your browser allows local storage.';
  }
});
dateField.value = localDate();
refresh();
window.addEventListener('storage',refresh);
window.addEventListener('pageshow',refresh);
