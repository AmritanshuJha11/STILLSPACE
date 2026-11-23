import {element, icon, loadEntries, loadSessions, mondayOf, techniqueNames, weekView} from './common.js';

const featured = [
  {id: 'sounds', image: 'shore-grass.webp'},
  {id: 'scan', image: 'lake-shore.webp'},
  {id: 'deep', image: 'lake-panorama.webp'}
];

async function renderFeaturedSessions() {
  const list = document.querySelector('#featured-list');
  try {
    const sessions = await loadSessions();
    for (const pick of featured) {
      const session = sessions.find(item => item.id === pick.id);
      if (!session) continue;
      const item = element('li');
      const link = element('a', 'home-session-link');
      link.href = 'practice.html?session=' + encodeURIComponent(session.id);
      const image = element('img', 'home-session-image');
      image.src = 'assets/' + pick.image;
      image.alt = '';
      image.loading = 'lazy';
      const body = element('div', 'home-session-body');
      const meta = element('p', 'session-meta');
      const duration = element('span', 'duration');
      duration.append(icon('clock'), session.minutes + ' min');
      meta.append(duration, element('span', '', techniqueNames[session.techniques[0]]));
      body.append(meta, element('h3', '', session.title), element('p', 'home-session-description', session.description));
      link.append(image, body);
      item.append(link);
      list.append(item);
    }
    if (!list.children.length) throw new Error('No featured sessions');
    list.hidden = false;
  } catch {
    document.querySelector('#featured-error').hidden = false;
  }
}

function refresh() {
  const summary = document.querySelector('#home-summary');
  try {
    const week = weekView(document.querySelector('#home-week'), loadEntries(), mondayOf(new Date()));
    const minutes = week.minutes === 1 ? ' minute' : ' minutes';
    const days = week.days === 1 ? ' day' : ' days';
    summary.textContent = week.days
      ? week.minutes + minutes + ' across ' + week.days + days + ' this week.'
      : 'Finish a guided session or log a practice to start your week.';
  } catch {
    summary.textContent = 'Your browser could not open the practice history.';
  }
}
renderFeaturedSessions();
refresh();
window.addEventListener('storage', refresh);
window.addEventListener('pageshow', refresh);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
