// Interaktion mit den Geräten: Hover (Maus) bzw. Tippen (Touch) hebt ein Gerät an
// und zeigt eine Info-Karte. Zusätzlich gibt es in jeder Zonen-Tafel Buttons für alle Geräte.
import * as THREE from 'three';
import { PRODUCTS, ZONES } from './products.js';

export function setupInteraction({ camera, products, isTouch, reducedMotion }) {
  const byId = new Map(PRODUCTS.map((p) => [p.id, p]));
  for (const p of products) p.data = byId.get(p.id);

  const info = document.getElementById('info');
  const infoZone = document.getElementById('info-zone');
  const infoName = document.getElementById('info-name');
  const infoTag = document.getElementById('info-tag');
  const infoSpecs = document.getElementById('info-specs');
  const infoClose = document.getElementById('info-close');

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const corner = new THREE.Vector3();

  let zone = null;
  let hovered = null;
  let pinned = null;
  let shown = null;

  // Auswahl-Buttons in den Zonen-Tafeln
  const chips = new Map();
  for (const container of document.querySelectorAll('[data-chips]')) {
    const zoneId = container.dataset.chips;
    for (const p of products.filter((x) => x.data.zone === zoneId)) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip';
      btn.id = `chip-${p.id}`;
      btn.textContent = p.data.short;
      btn.addEventListener('click', () => {
        pinned = pinned === p ? null : p;
      });
      if (!isTouch) {
        btn.addEventListener('mouseenter', () => { hovered = p; });
        btn.addEventListener('mouseleave', () => { if (hovered === p) hovered = null; });
      }
      container.appendChild(btn);
      chips.set(p, btn);
    }
  }
  for (const hint of document.querySelectorAll('[data-hint]')) {
    hint.textContent = isTouch
      ? 'Tippe auf ein Gerät oder wähle es hier aus.'
      : 'Fahre mit der Maus über ein Gerät oder wähle es hier aus.';
  }

  function onUi(target) {
    return target instanceof Element && target.closest('.panel, .info, .topbar');
  }

  function pick(clientX, clientY) {
    if (!zone) return null;
    ndc.set((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const candidates = products.filter((p) => p.data.zone === zone);
    const hit = raycaster.intersectObjects(candidates.map((p) => p.hit), false)[0];
    return hit ? candidates.find((p) => p.hit === hit.object) : null;
  }

  if (!isTouch) {
    addEventListener('pointermove', (e) => {
      if (onUi(e.target)) return;
      hovered = pick(e.clientX, e.clientY);
      document.body.style.cursor = hovered ? 'pointer' : '';
    });
  }

  addEventListener('click', (e) => {
    if (onUi(e.target)) return;
    pinned = pick(e.clientX, e.clientY);
  });

  infoClose.addEventListener('click', () => {
    pinned = null;
    hovered = null;
  });

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') pinned = null;
  });

  function fill(p) {
    infoZone.textContent = ZONES[p.data.zone];
    infoName.textContent = p.data.name;
    infoTag.textContent = p.data.tagline;
    infoSpecs.replaceChildren(...p.data.specs.map((s) => {
      const li = document.createElement('li');
      li.textContent = s;
      return li;
    }));
  }

  // Info-Karte neben dem Gerät platzieren (nur bei breiten Bildschirmen, sonst unten angedockt)
  function position(p) {
    if (innerWidth <= 700) {
      info.style.left = '';
      info.style.top = '';
      return;
    }
    // Umriss des Geräts auf dem Bildschirm aus den 8 Ecken seiner Box
    const { min, max } = p.bounds;
    let x0 = Infinity;
    let x1 = -Infinity;
    let y0 = Infinity;
    let y1 = -Infinity;
    for (let i = 0; i < 8; i++) {
      corner.set(i & 1 ? max.x : min.x, i & 2 ? max.y : min.y, i & 4 ? max.z : min.z).project(camera);
      const sx = (corner.x * 0.5 + 0.5) * innerWidth;
      const sy = (-corner.y * 0.5 + 0.5) * innerHeight;
      x0 = Math.min(x0, sx);
      x1 = Math.max(x1, sx);
      y0 = Math.min(y0, sy);
      y1 = Math.max(y1, sy);
    }
    const w = info.offsetWidth;
    const h = info.offsetHeight;
    let left = x1 + 20;
    if (left + w > innerWidth - 16) left = x0 - w - 20;
    left = Math.max(16, Math.min(left, innerWidth - w - 16));
    const top = Math.max(72, Math.min((y0 + y1) / 2 - h / 2, innerHeight - h - 16));
    info.style.left = `${left}px`;
    info.style.top = `${top}px`;
  }

  return {
    setZone(next) {
      if (next === zone) return;
      zone = next;
      if (pinned && pinned.data.zone !== zone) pinned = null;
      if (hovered && hovered.data.zone !== zone) hovered = null;
      if (!zone) document.body.style.cursor = '';
    },

    update(dt) {
      const active = pinned || hovered;

      // Ausgewähltes Gerät leicht anheben und vergrößern
      const k = reducedMotion ? 1 : Math.min(1, dt * 10);
      for (const p of products) {
        const target = p === active ? 1 : 0;
        p.h += (target - p.h) * k;
        p.obj.position.y = p.baseY + p.h * 0.05;
        p.obj.scale.copy(p.baseScale).multiplyScalar(1 + p.h * 0.1);
      }

      for (const [p, btn] of chips) btn.setAttribute('aria-pressed', String(p === active));

      if (active !== shown) {
        shown = active;
        if (active) {
          fill(active);
          info.hidden = false;
          info.classList.add('open');
        } else {
          info.classList.remove('open');
          info.hidden = true;
        }
      }
      if (shown) position(shown);
    },
  };
}
