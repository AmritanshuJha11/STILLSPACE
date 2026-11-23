import {element, icon, loadSessions, techniqueNames} from './common.js';

const duration = document.querySelector('#duration');
const technique = document.querySelector('#technique');
const catalogue = document.querySelector('#catalogue');
const filters = document.querySelector('#filters');
const toggle = document.querySelector('.filter-toggle');
const query = new URL(location.href).searchParams;
if (Object.hasOwn(techniqueNames, query.get('technique'))) technique.value = query.get('technique');
if (['short','mid','long'].includes(query.get('duration'))) duration.value = query.get('duration');
let sessions = [];

function sessionDetails(session) {
  const details = element('div','session-meta');
  const duration = element('span','duration');
  duration.append(icon('clock'), session.minutes + ' min');
  const techniques = session.techniques.map(id => techniqueNames[id]).join(' · ');
  details.append(duration, element('span','',techniques));
  return details;
}
function sessionCard(session) {
  const destination = 'practice.html?session=' + encodeURIComponent(session.id);
  if (session.id === 'deep') {
    const feature = element('article','feature-session');
    const content = element('div');
    const link = element('a','button light','Open session');
    link.href = destination;
    content.append(sessionDetails(session), element('h2','',session.title),
      element('p','',session.description), link);
    feature.append(content);
    return feature;
  }
  const link = element('a','session-card');
  link.href = destination;
  link.append(element('h3','',session.title), sessionDetails(session), element('p','',session.description));
  return link;
}
function render() {
  const matches = sessions.filter(session => {
    const minutes = session.minutes;
    const range = minutes <= 5 ? 'short' : minutes <= 10 ? 'mid' : 'long';
    return (!technique.value || session.techniques.includes(technique.value)) &&
      (!duration.value || range === duration.value);
  });
  const feature = matches.find(item => item.id === 'deep');
  const grid = element('div','session-grid');
  const output = document.createDocumentFragment();
  if (feature) output.append(sessionCard(feature));
  for (const session of matches) if (session !== feature) grid.append(sessionCard(session));
  output.append(grid);
  if (!matches.length) {
    const empty = element('div','empty');
    const reset = element('button','secondary','Clear filters');
    reset.type = 'button';
    reset.addEventListener('click', () => {
      technique.value = ''; duration.value = ''; applyFilters();
    });
    empty.append(element('p','','No sessions match these filters.'), reset);
    output.append(empty);
  }
  catalogue.replaceChildren(output);
  toggle.replaceChildren(icon('filter'), (duration.value || technique.value) ? 'Filters applied' : 'Filters');
  document.querySelector('#result-status').textContent = matches.length +
    (matches.length === 1 ? ' session' : ' sessions') + ' available.';
}
function applyFilters() {
  const url = new URL(location.href);
  for (const select of [technique,duration]) {
    if (select.value) url.searchParams.set(select.id,select.value);
    else url.searchParams.delete(select.id);
  }
  history.replaceState(null,'',url);
  render();
}
toggle.addEventListener('click', () => toggle.setAttribute('aria-expanded',String(filters.classList.toggle('open'))));
duration.addEventListener('change',applyFilters);
technique.addEventListener('change',applyFilters);
try {
  sessions = await loadSessions();
  render();
} catch {
  catalogue.textContent = 'The session library could not load. Refresh the page to try again.';
} finally {
  catalogue.setAttribute('aria-busy','false');
}
