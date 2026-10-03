// Bausteine für den Laden: Hilfsfunktionen, Materialien, Texturen und Gerätemodelle.
// Alle Geräte schauen mit der Vorderseite (Display) in +z-Richtung.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const NEON = 0x3fe6ff;
export const HOT = 0xff5fd2;

// ---------- Hilfsfunktionen ----------

export function glow(hex, strength = 1) {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(hex).multiplyScalar(strength),
    toneMapped: false,
  });
}

export function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function mesh(geo, mat, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (parent) parent.add(m);
  return m;
}

export function box(w, h, d, mat, x, y, z, parent) {
  return mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent);
}

function rounded(w, h, d, r, mat, x, y, z, parent) {
  return mesh(new RoundedBoxGeometry(w, h, d, 2, r), mat, x, y, z, parent);
}

export function neonText(g, text, x, y, color, core, blurs = [60, 30, 14]) {
  g.save();
  g.fillStyle = color;
  g.shadowColor = color;
  for (const blur of blurs) {
    g.shadowBlur = blur;
    g.fillText(text, x, y);
  }
  g.shadowBlur = 0;
  g.fillStyle = core;
  g.fillText(text, x, y);
  g.restore();
}

// ---------- Materialien ----------

export const M = {
  facade: new THREE.MeshStandardMaterial({ color: 0xc4c8cf, roughness: 0.85 }),
  pillar: new THREE.MeshStandardMaterial({ color: 0x3b4049, roughness: 0.8 }),
  signPanel: new THREE.MeshStandardMaterial({ color: 0x1a1e27, roughness: 0.5, metalness: 0.4 }),
  frame: new THREE.MeshStandardMaterial({ color: 0x2a2e37, roughness: 0.4, metalness: 0.7 }),
  glass: new THREE.MeshStandardMaterial({
    color: 0xbfd8f0, transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.6, depthWrite: false,
  }),
  acrylic: new THREE.MeshStandardMaterial({
    color: 0xe8f4ff, transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.1, depthWrite: false,
  }),
  sidewalk: new THREE.MeshStandardMaterial({ color: 0x777a80, roughness: 0.95 }),
  road: new THREE.MeshStandardMaterial({ color: 0x3f4248, roughness: 0.9 }),
  marking: new THREE.MeshStandardMaterial({ color: 0xf2f2f0, roughness: 0.8 }),
  neighbors: [0xd9c8b0, 0xa9b6c2, 0xe6ddd0, 0xbfae9a, 0xc9d0d6, 0xd2c2c8].map(
    (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.92 }),
  ),
  floor: new THREE.MeshStandardMaterial({ color: 0x6f737b, roughness: 0.3, metalness: 0.05 }),
  wall: new THREE.MeshStandardMaterial({ color: 0xc9ccd1, roughness: 0.9 }),
  ceiling: new THREE.MeshStandardMaterial({ color: 0xa9adb4, roughness: 0.95 }),
  white: new THREE.MeshStandardMaterial({ color: 0xd6d9de, roughness: 0.55 }),
  graphite: new THREE.MeshStandardMaterial({ color: 0x23262e, roughness: 0.35, metalness: 0.6 }),
  black: new THREE.MeshStandardMaterial({ color: 0x14161b, roughness: 0.6, metalness: 0.2 }),
  silver: new THREE.MeshStandardMaterial({ color: 0xc3c8d2, roughness: 0.28, metalness: 0.85 }),
  sand: new THREE.MeshStandardMaterial({ color: 0xd8cbb8, roughness: 0.6 }),
  orange: new THREE.MeshStandardMaterial({ color: 0xff8a3d, roughness: 0.7 }),
  plant: new THREE.MeshStandardMaterial({ color: 0x3f7a4a, roughness: 0.85, flatShading: true }),
};

// ---------- Texturen ----------

export function screenTexture(w, h, a, b, opts = {}) {
  return canvasTexture(w, h, (g) => {
    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, a);
    grad.addColorStop(1, b);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    // weiche Lichtflecken als Hintergrundbild
    for (const [cx, cy, r, col] of [[0.25, 0.3, 0.55, 'rgba(255,255,255,0.22)'], [0.8, 0.75, 0.6, 'rgba(0,0,0,0.25)']]) {
      const rg = g.createRadialGradient(cx * w, cy * h, 0, cx * w, cy * h, r * Math.max(w, h));
      rg.addColorStop(0, col);
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg;
      g.fillRect(0, 0, w, h);
    }
    if (opts.clock) {
      g.fillStyle = 'rgba(255,255,255,0.92)';
      g.textAlign = 'center';
      g.font = `600 ${Math.round(w * 0.2)}px Onest, "Segoe UI", sans-serif`;
      g.fillText('10:24', w / 2, h * 0.24);
      g.font = `400 ${Math.round(w * 0.055)}px Onest, "Segoe UI", sans-serif`;
      g.fillText('Samstag, 3. Oktober', w / 2, h * 0.3);
    }
    if (opts.apps) {
      // App-Raster im unteren Bereich
      const cols = 4;
      const size = w * 0.14;
      const gap = (w - cols * size) / (cols + 1);
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < cols; c++) {
          g.fillStyle = `hsla(${(r * cols + c) * 47 + 180}, 80%, 70%, 0.85)`;
          const x = gap + c * (size + gap);
          const y = h * 0.62 + r * (size + gap);
          g.beginPath();
          g.roundRect(x, y, size, size, size * 0.24);
          g.fill();
        }
      }
    }
    if (opts.title) {
      g.fillStyle = 'rgba(255,255,255,0.95)';
      g.textAlign = 'left';
      g.font = `600 ${Math.round(h * 0.11)}px Unbounded, "Arial Black", sans-serif`;
      g.fillText(opts.title, w * 0.07, h * 0.62);
      g.font = `400 ${Math.round(h * 0.05)}px "JetBrains Mono", Consolas, monospace`;
      g.fillStyle = 'rgba(255,255,255,0.75)';
      g.fillText(opts.subtitle || '', w * 0.07, h * 0.76);
    }
  });
}

export function rgbTexture() {
  return canvasTexture(256, 256, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#ff5fd2');
    grad.addColorStop(0.5, '#7a5cff');
    grad.addColorStop(1, '#3fe6ff');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.55)';
    g.fillRect(w * 0.1, h * 0.45, w * 0.8, h * 0.2);
  });
}

function keysTexture(rgb) {
  return canvasTexture(512, 160, (g, w, h) => {
    g.fillStyle = '#15171c';
    g.fillRect(0, 0, w, h);
    const rows = 5;
    const cols = 15;
    const kw = w / cols;
    const kh = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (rgb) g.fillStyle = `hsl(${(c / cols) * 300 + 180}, 90%, 62%)`;
        else g.fillStyle = '#3a3e48';
        g.fillRect(c * kw + 3, r * kh + 3, kw - 6, kh - 6);
        g.fillStyle = '#23262e';
        g.fillRect(c * kw + 6, r * kh + 6, kw - 12, kh - 12);
      }
    }
  });
}

export function signTexture(text, sub) {
  return canvasTexture(1024, 256, (g, w, h) => {
    g.fillStyle = '#1a1e27';
    g.fillRect(0, 0, w, h);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = '600 92px Unbounded, "Arial Black", sans-serif';
    neonText(g, text, w / 2, sub ? h * 0.42 : h / 2, '#3fe6ff', '#ffffff', [18, 6]);
    if (sub) {
      g.font = '500 30px "JetBrains Mono", Consolas, monospace';
      if ('letterSpacing' in g) g.letterSpacing = '6px';
      g.fillStyle = 'rgba(220,232,255,0.8)';
      g.fillText(sub, w / 2, h * 0.78);
    }
  });
}

// ---------- Möbel ----------

export function displayTable(w, d) {
  const g = new THREE.Group();
  box(w, 0.06, d, M.white, 0, 0.88, 0, g);
  box(w - 0.3, 0.85, d - 0.3, M.graphite, 0, 0.425, 0, g);
  box(w - 0.1, 0.02, 0.02, glow(NEON, 2.2), 0, 0.84, d / 2 - 0.04, g);
  return g;
}

export function desk(w, d) {
  const g = new THREE.Group();
  box(w, 0.05, d, M.sand, 0, 0.76, 0, g);
  box(0.06, 0.74, d - 0.1, M.frame, -w / 2 + 0.15, 0.37, 0, g);
  box(0.06, 0.74, d - 0.1, M.frame, w / 2 - 0.15, 0.37, 0, g);
  box(w - 0.3, 0.04, 0.04, M.frame, 0, 0.5, -d / 2 + 0.1, g);
  return g;
}

export function plinth() {
  const g = new THREE.Group();
  mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.95, 40), M.white, 0, 0.475, 0, g);
  const ring = mesh(new THREE.TorusGeometry(0.43, 0.012, 8, 64), glow(NEON, 2.6), 0, 0.955, 0, g);
  ring.rotation.x = Math.PI / 2;
  return g;
}

// Schräger Acrylständer für Smartphones und Tablets (Gerät lehnt in +z-Richtung)
export function stand(w, h) {
  const g = new THREE.Group();
  box(w, 0.01, h * 0.6, M.acrylic, 0, 0.005, 0, g);
  const back = box(w * 0.8, h * 0.7, 0.01, M.acrylic, 0, h * 0.33, -h * 0.18, g);
  back.rotation.x = -0.35;
  return g;
}

// ---------- Geräte ----------

const screenMat = (map) => new THREE.MeshBasicMaterial({ map });

export function phone(screen, body = M.graphite) {
  const g = new THREE.Group();
  rounded(0.078, 0.162, 0.008, 0.008, body, 0, 0, 0, g);
  mesh(new THREE.PlaneGeometry(0.072, 0.156), screenMat(screen), 0, 0, 0.0042, g);
  box(0.03, 0.03, 0.004, M.black, -0.018, 0.055, -0.005, g);
  return g;
}

export function compactPhone(screen, body) {
  const g = phone(screen, body);
  g.scale.set(0.92, 0.9, 1);
  return g;
}

// Aufgeklapptes Foldable: zwei Hälften mit leichtem Knick zur Mitte
export function foldable(screen, body = M.graphite) {
  const g = new THREE.Group();
  for (const side of [-1, 1]) {
    const half = new THREE.Group();
    half.rotation.y = -side * 0.28;
    rounded(0.074, 0.158, 0.006, 0.006, body, side * 0.037, 0, 0, half);
    const tex = screen.clone();
    tex.repeat.set(0.5, 1);
    tex.offset.set(side < 0 ? 0 : 0.5, 0);
    tex.needsUpdate = true;
    mesh(new THREE.PlaneGeometry(0.07, 0.152), screenMat(tex), side * 0.037, 0, 0.0032, half);
    g.add(half);
  }
  return g;
}

export function tablet(screen, body = M.silver, w = 0.25, h = 0.175) {
  const g = new THREE.Group();
  rounded(w, h, 0.007, 0.01, body, 0, 0, 0, g);
  mesh(new THREE.PlaneGeometry(w - 0.014, h - 0.014), screenMat(screen), 0, 0, 0.0037, g);
  return g;
}

// Einsteiger-Tablet in dicker Schutzhülle
export function kidsTablet(screen) {
  const g = new THREE.Group();
  rounded(0.27, 0.195, 0.022, 0.02, M.orange, 0, 0, -0.004, g);
  rounded(0.24, 0.165, 0.008, 0.008, M.black, 0, 0, 0.004, g);
  mesh(new THREE.PlaneGeometry(0.222, 0.148), screenMat(screen), 0, 0, 0.0085, g);
  return g;
}

export function pen() {
  const g = new THREE.Group();
  const body = mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.16, 16), new THREE.MeshStandardMaterial({ color: 0xf4f5f7, roughness: 0.4 }), 0, 0, 0, g);
  body.rotation.z = Math.PI / 2;
  const tip = mesh(new THREE.ConeGeometry(0.0045, 0.014, 16), M.graphite, 0.087, 0, 0, g);
  tip.rotation.z = -Math.PI / 2;
  return g;
}

export function laptop(screen, body = M.silver, opts = {}) {
  const g = new THREE.Group();
  rounded(0.32, 0.012, 0.22, 0.004, body, 0, 0.006, 0, g);
  const keys = mesh(new THREE.PlaneGeometry(0.27, 0.09), new THREE.MeshBasicMaterial({ map: keysTexture(opts.rgb) }), 0, 0.0125, -0.03, g);
  keys.rotation.x = -Math.PI / 2;
  const lid = new THREE.Group();
  lid.position.set(0, 0.012, -0.11);
  lid.rotation.x = -0.32;
  rounded(0.32, 0.21, 0.006, 0.004, body, 0, 0.105, 0, lid);
  mesh(new THREE.PlaneGeometry(0.3, 0.19), screenMat(screen), 0, 0.105, 0.0035, lid);
  g.add(lid);
  return g;
}

export function monitor(screen) {
  const g = new THREE.Group();
  rounded(0.62, 0.37, 0.025, 0.006, M.graphite, 0, 0.33, 0, g);
  mesh(new THREE.PlaneGeometry(0.6, 0.35), screenMat(screen), 0, 0.33, 0.0131, g);
  box(0.04, 0.2, 0.03, M.graphite, 0, 0.1, -0.03, g);
  box(0.22, 0.012, 0.16, M.graphite, 0, 0.006, -0.02, g);
  return g;
}

// Gaming-PC: Glasseite zeigt nach +x, Lüfter vorne (+z)
export function tower(fans) {
  const g = new THREE.Group();
  box(0.22, 0.46, 0.45, M.graphite, 0, 0.23, 0, g);
  const side = mesh(new THREE.PlaneGeometry(0.4, 0.4), new THREE.MeshBasicMaterial({ map: rgbTexture(), toneMapped: false, color: new THREE.Color(1.4, 1.4, 1.4) }), 0.111, 0.24, 0, g);
  side.rotation.y = Math.PI / 2;
  for (let i = 0; i < 3; i++) {
    const ring = mesh(new THREE.TorusGeometry(0.052, 0.006, 8, 32), glow(i % 2 ? HOT : NEON, 3), 0, 0.1 + i * 0.13, 0.226, g);
    fans.push(ring);
  }
  return g;
}

export function officePc() {
  const g = new THREE.Group();
  rounded(0.17, 0.36, 0.33, 0.01, new THREE.MeshStandardMaterial({ color: 0xeceef1, roughness: 0.5 }), 0, 0.18, 0, g);
  box(0.12, 0.004, 0.002, M.graphite, 0, 0.32, 0.166, g);
  mesh(new THREE.CircleGeometry(0.008, 16), glow(NEON, 2), 0.05, 0.3, 0.1655, g);
  return g;
}

export function keyboard(rgb = true) {
  const g = new THREE.Group();
  rounded(0.44, 0.025, 0.14, 0.006, M.graphite, 0, 0.0125, 0, g);
  const keys = mesh(new THREE.PlaneGeometry(0.42, 0.125), new THREE.MeshBasicMaterial({ map: keysTexture(rgb), toneMapped: !rgb }), 0, 0.0255, 0, g);
  keys.rotation.x = -Math.PI / 2;
  return g;
}

export function mouse() {
  const g = new THREE.Group();
  const shell = mesh(new THREE.SphereGeometry(1, 24, 16), M.graphite, 0, 0.018, 0, g);
  shell.scale.set(0.032, 0.02, 0.058);
  box(0.004, 0.003, 0.02, glow(NEON, 2), 0, 0.037, -0.03, g);
  return g;
}

export function headphones() {
  const g = new THREE.Group();
  mesh(new THREE.TorusGeometry(0.085, 0.009, 10, 40, Math.PI), M.graphite, 0, 0, 0, g);
  for (const s of [-1, 1]) {
    const cup = mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.03, 28), M.graphite, s * 0.088, -0.03, 0, g);
    cup.rotation.z = Math.PI / 2;
    const pad = mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.012, 28), M.sand, s * 0.07, -0.03, 0, g);
    pad.rotation.z = Math.PI / 2;
    const ring = mesh(new THREE.TorusGeometry(0.03, 0.002, 6, 32), glow(NEON, 2), s * 0.104, -0.03, 0, g);
    ring.rotation.y = Math.PI / 2;
  }
  return g;
}

export function controller() {
  const g = new THREE.Group();
  rounded(0.15, 0.035, 0.065, 0.015, M.white, 0, 0, 0, g);
  for (const s of [-1, 1]) {
    const grip = mesh(new THREE.SphereGeometry(0.032, 18, 12), M.white, s * 0.055, -0.004, 0.028, g);
    grip.scale.set(1, 0.8, 1.2);
    mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.014, 14), M.graphite, s * 0.032, 0.022, s < 0 ? -0.006 : 0.012, g);
  }
  const btnColors = [NEON, HOT, 0x7cff9b, 0xffd23f];
  btnColors.forEach((c, i) => {
    const a = (i / 4) * Math.PI * 2;
    mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.006, 10), glow(c, 1.4), 0.058 + Math.cos(a) * 0.009, 0.019, -0.012 + Math.sin(a) * 0.009, g);
  });
  return g;
}

export function charger() {
  const g = new THREE.Group();
  rounded(0.055, 0.055, 0.03, 0.008, new THREE.MeshStandardMaterial({ color: 0xf1f2f4, roughness: 0.45 }), 0, 0, 0, g);
  for (const s of [-1, 1]) box(0.012, 0.004, 0.003, M.graphite, s * 0.012, 0.012, 0.0155, g);
  mesh(new THREE.TorusGeometry(0.035, 0.003, 6, 40, Math.PI * 1.3), new THREE.MeshStandardMaterial({ color: 0xf1f2f4, roughness: 0.5 }), 0, -0.045, 0, g);
  return g;
}
