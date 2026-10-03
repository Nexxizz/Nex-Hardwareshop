// Start: entscheidet zwischen 3D-Rundgang und einfacher Ansicht.
// Lädt die 3D-Teile erst bei Bedarf, damit die einfache Ansicht auch ohne 3D-Bibliothek funktioniert.
import { showStatic, hideStatic } from './static.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let tour = null;

async function show3d() {
  hideStatic();
  if (tour) {
    tour.resume();
    return;
  }
  try {
    const { start } = await import('./main.js');
    tour = await start();
    if (!tour) showStatic('webgl', { canUse3d: false });
  } catch (err) {
    console.warn('3D-Ansicht konnte nicht geladen werden:', err);
    showStatic('error', { canUse3d: false });
  }
}

document.getElementById('static-3d').addEventListener('click', show3d);
document.getElementById('to-static').addEventListener('click', () => {
  tour?.pause();
  showStatic('choice', { canUse3d: true });
});

if (reducedMotion) showStatic('motion', { canUse3d: true });
else show3d();
