const choices = [...document.querySelectorAll('.guide-toggle')];
const narrow = window.matchMedia('(max-width:760px)');
function selectedFromURL() {
  const key = new URL(location.href).searchParams.get('technique');
  return choices.find(button => button.id === 'choose-' + key) || choices[0];
}
function openGuide(selected) {
  for (const button of choices) {
    const open = button === selected;
    button.setAttribute('aria-expanded', String(open));
    document.getElementById(button.getAttribute('aria-controls')).hidden = !open;
  }
}
for (const button of choices) {
  button.addEventListener('click', () => {
    if (narrow.matches && button.getAttribute('aria-expanded') === 'true') {
      openGuide(null);
      return;
    }
    const url = new URL(location.href);
    url.searchParams.set('technique', button.id.replace('choose-', ''));
    history.replaceState(null, '', url);
    openGuide(button);
  });
}
narrow.addEventListener('change', () => openGuide(selectedFromURL()));
openGuide(selectedFromURL());
