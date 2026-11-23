import {loadSessions, localDate, newId, saveEntry} from './common.js';

const room = document.querySelector('.room');
const cue = document.querySelector('#cue');
const completionMark = document.querySelector('.completion-mark');
const phase = document.querySelector('#phase');
const clock = document.querySelector('#clock');
const primary = document.querySelector('#primary-control');
const clockButton = document.querySelector('#clock-control');
const endButton = document.querySelector('#end-control');
const choose = document.querySelector('#choose-session');
const dialog = document.querySelector('#end-dialog');
const message = document.querySelector('#room-message');
const cacheKey = 'stillspace.current-session';
let session;
let state;
let interval;
let resumeOnDismiss = false;
function freshState() {
  return {id:newId(), session:session.id, mode:'ready', remaining:session.minutes * 60000,
    deadline:0, hideClock:false, finished:0};
}
function restore() {
  try {
    const candidate = JSON.parse(sessionStorage.getItem(cacheKey));
    if (candidate && candidate.session === session.id && typeof candidate.id === 'string' &&
        ['ready','running','paused','complete','saved'].includes(candidate.mode) &&
        Number.isFinite(candidate.remaining) && candidate.remaining >= 0 && Number.isFinite(candidate.deadline)) return candidate;
  } catch { /* The timer also works when tab storage is unavailable. */ }
  return freshState();
}
function persist() {
  try { sessionStorage.setItem(cacheKey, JSON.stringify(state)); } catch { /* Keep the timer running in memory. */ }
}
function remainingMs() {
  return state.mode === 'running' ? Math.max(0, state.deadline - Date.now()) : state.remaining;
}
function render() {
  const remaining = remainingMs();
  if (remaining === 0 && state.mode === 'running') {
    state.finished = state.deadline;
    state.mode = 'complete';
    state.remaining = 0;
    clearInterval(interval);
    persist();
  }
  const active = state.mode === 'running' || state.mode === 'paused';
  const finished = state.mode === 'complete' || state.mode === 'saved';
  const elapsed = session.minutes * 60 - Math.ceil(remaining / 1000);
  const current = session.cues.filter(item => item.at <= elapsed).at(-1) || session.cues[0];
  const text = finished ? 'Take a moment to notice how you feel.' : active ? current.text : session.description;
  // Announce new guidance only when the cue changes, never on every clock tick.
  if (cue.textContent !== text) cue.textContent = text;
  room.classList.toggle('is-running', state.mode === 'running');
  room.classList.toggle('is-complete', finished);
  completionMark.hidden = !finished;
  document.body.classList.toggle('in-session', active);
  phase.textContent = finished ? 'Practice complete' : active ?
    (state.mode === 'paused' ? 'Paused' : current.phase) : session.minutes + ' minutes · Text-guided meditation';
  const seconds = Math.ceil(remaining / 1000);
  clock.hidden = !active || state.hideClock;
  clock.textContent = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2,'0') + ' remaining';
  primary.hidden = false;
  primary.textContent = {ready:'Start session',running:'Pause',paused:'Resume',complete:'Save to tracker',saved:'View tracker'}[state.mode];
  clockButton.hidden = endButton.hidden = !active;
  clockButton.textContent = state.hideClock ? 'Show countdown' : 'Hide countdown';
  choose.hidden = active;
}
function start() {
  state.deadline = Date.now() + state.remaining;
  state.mode = 'running';
  persist(); render();
  clearInterval(interval);
  interval = setInterval(render, 250);
}
function pause() {
  render();
  if (state.mode !== 'running') return;
  state.remaining = remainingMs();
  state.mode = 'paused';
  clearInterval(interval);
  persist(); render();
}
primary.addEventListener('click', () => {
  message.textContent = '';
  if (state.mode === 'ready' || state.mode === 'paused') return start();
  if (state.mode === 'running') return pause();
  if (state.mode === 'saved') { location.assign('tracker.html'); return; }
  if (state.mode === 'complete') {
    try {
      saveEntry({id:state.id, title:session.title, date:localDate(new Date(state.finished)),
        minutes:session.minutes, created:state.finished});
      state.mode = 'saved';
      persist(); render();
      message.textContent = 'Saved to your practice history.';
    } catch {
      message.textContent = 'Your session could not be saved. Allow browser storage and try again.';
    }
  }
});
clockButton.addEventListener('click', () => { state.hideClock = !state.hideClock; persist(); render(); });
endButton.addEventListener('click', () => {
  resumeOnDismiss = state.mode === 'running';
  if (resumeOnDismiss) pause();
  if (state.mode === 'paused') dialog.showModal();
});
document.querySelector('#keep-going').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
  if (resumeOnDismiss && state.mode === 'paused') start();
  resumeOnDismiss = false;
});
document.querySelector('#confirm-end').addEventListener('click', () => {
  resumeOnDismiss = false;
  dialog.close();
  state = freshState();
  persist(); render();
  message.textContent = 'Session ended.';
  primary.focus();
});
try {
  const sessions = await loadSessions();
  const url = new URL(location.href);
  let requested = url.searchParams.get('session');
  if (!requested) {
    try {
      const cached = JSON.parse(sessionStorage.getItem(cacheKey));
      if (cached && ['running','paused','complete'].includes(cached.mode)) requested = cached.session;
    } catch { /* No previous session. */ }
  }
  session = sessions.find(item => item.id === requested) || sessions.find(item => item.id === 'pause');
  state = restore();
  const immediate = url.searchParams.get('start') === '1';
  if (state.mode === 'saved' || (state.mode === 'complete' && immediate)) state = freshState();
  url.searchParams.delete('start');
  url.searchParams.set('session', session.id);
  history.replaceState(null,'',url);
  document.querySelector('#session-title').textContent = session.title;
  if (immediate && state.mode === 'ready') start();
  else {
    render();
    if (state.mode === 'running') interval = setInterval(render,250);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  window.addEventListener('pageshow', render);
} catch {
  cue.textContent = 'Your session could not load. Refresh the page to try again.';
}
