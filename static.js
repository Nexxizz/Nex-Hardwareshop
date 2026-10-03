// Einfache Ansicht ohne 3D: für Browser ohne WebGL, bei „Bewegung reduzieren“
// oder wenn jemand sie selbst wählt. Inhalte kommen aus den Zonen-Tafeln und products.js.
import { PRODUCTS } from './products.js';

const ZONE_CARDS = {
  smartphones: 'ov-phones',
  tablets: 'ov-tablets',
  pcs: 'ov-pcs',
  accessories: 'ov-accessories',
};

const NOTES = {
  motion: 'Auf deinem Gerät ist „Bewegung reduzieren“ eingeschaltet. Deshalb siehst du die ruhige Ansicht ohne Kamerafahrt.',
  webgl: 'Dein Browser kann die 3D-Ansicht nicht anzeigen. Hier siehst du alle Bereiche als einfache Seite.',
  error: 'Die 3D-Ansicht konnte nicht geladen werden. Hier siehst du alle Bereiche als einfache Seite.',
  choice: '',
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

let rendered = false;

function render() {
  const zones = document.getElementById('static-zones');
  for (const [zone, cardId] of Object.entries(ZONE_CARDS)) {
    const card = document.getElementById(cardId);
    const section = el('section', 'static-zone');
    section.append(
      el('p', 'eyebrow', card.querySelector('.eyebrow').textContent),
      el('h2', '', card.querySelector('h2').textContent),
      el('p', 'static-lead', card.querySelector('h2 + p').textContent),
    );
    const grid = el('ul', 'static-grid');
    for (const p of PRODUCTS.filter((x) => x.zone === zone)) {
      const item = el('li', 'static-card');
      const specs = el('ul', 'specs');
      specs.append(...p.specs.map((s) => el('li', '', s)));
      item.append(el('h3', '', p.name), el('p', 'static-tag', p.tagline), specs);
      grid.append(item);
    }
    section.append(grid);
    zones.append(section);
  }

  const outro = document.getElementById('ov-outro');
  const end = el('section', 'static-zone static-end');
  end.append(el('h2', '', outro.querySelector('h2').textContent), el('p', 'static-lead', outro.querySelector('h2 + p').textContent));
  zones.append(end);
}

// reason: 'motion' | 'webgl' | 'error' | 'choice'
export function showStatic(reason, { canUse3d }) {
  if (!rendered) {
    render();
    rendered = true;
  }
  document.documentElement.classList.add('static-mode');
  document.getElementById('static').hidden = false;
  const note = document.getElementById('static-note');
  note.textContent = NOTES[reason] || '';
  note.hidden = !note.textContent;
  document.getElementById('static-3d').hidden = !canUse3d;
  scrollTo(0, 0);
}

export function hideStatic() {
  document.documentElement.classList.remove('static-mode');
  document.getElementById('static').hidden = true;
}
