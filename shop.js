// Aufbau des Ladens: Straße, Fassade mit Schiebetür, Innenraum mit Zonen.
// Einheiten sind Meter, die Fassade liegt bei z = 0, der Innenraum bei z < 0.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const NEON = 0x3fe6ff;
const HOT = 0xff5fd2;

// ---------- Hilfsfunktionen ----------

function glow(hex, strength = 1) {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(hex).multiplyScalar(strength),
    toneMapped: false,
  });
}

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function mesh(geo, mat, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (parent) parent.add(m);
  return m;
}

function box(w, h, d, mat, x, y, z, parent) {
  return mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent);
}

// Einfacher, fester Zufallsgenerator, damit die Szene bei jedem Laden gleich aussieht
function rng(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function neonText(g, text, x, y, color, core, blurs = [60, 30, 14]) {
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

// ---------- Texturen ----------

function signTexture() {
  return canvasTexture(2048, 640, (g, w) => {
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = '800 300px Unbounded, "Arial Black", sans-serif';
    neonText(g, 'NEX', w / 2, 225, '#3fe6ff', '#e6fdff', [40, 18]);
    g.font = '600 118px Unbounded, "Arial Black", sans-serif';
    if ('letterSpacing' in g) g.letterSpacing = '14px';
    neonText(g, 'HARDWARESHOP', w / 2 + 7, 520, '#3fe6ff', '#ffffff', [22, 8]);
  });
}

function openSignTexture() {
  return canvasTexture(512, 160, (g, w, h) => {
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = '600 64px Unbounded, "Arial Black", sans-serif';
    neonText(g, 'GEÖFFNET', w / 2, h / 2, '#ff5fd2', '#ffe3f6');
  });
}

function screenTexture(w, h, a, b, opts = {}) {
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

function welcomeTexture() {
  return canvasTexture(1536, 520, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#071a2a');
    grad.addColorStop(0.55, '#0b1030');
    grad.addColorStop(1, '#25103a');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(63,230,255,0.12)';
    g.lineWidth = 2;
    for (let x = 0; x < w; x += 64) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.stroke();
    }
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = '600 104px Unbounded, "Arial Black", sans-serif';
    neonText(g, 'Willkommen bei Nex', w / 2, h * 0.44, '#3fe6ff', '#effdff');
    g.font = '500 40px "JetBrains Mono", Consolas, monospace';
    if ('letterSpacing' in g) g.letterSpacing = '8px';
    g.fillStyle = 'rgba(220,232,255,0.8)';
    g.fillText('PCs · SMARTPHONES · TABLETS · ZUBEHÖR', w / 2, h * 0.72);
  });
}

function rgbTexture() {
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

// ---------- Materialien ----------

const M = {
  facade: new THREE.MeshStandardMaterial({ color: 0xc4c8cf, roughness: 0.85 }),
  pillar: new THREE.MeshStandardMaterial({ color: 0x3b4049, roughness: 0.8 }),
  signPanel: new THREE.MeshStandardMaterial({ color: 0x1a1e27, roughness: 0.5, metalness: 0.4 }),
  frame: new THREE.MeshStandardMaterial({ color: 0x2a2e37, roughness: 0.4, metalness: 0.7 }),
  glass: new THREE.MeshStandardMaterial({
    color: 0xbfd8f0, transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.6, depthWrite: false,
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
  silver: new THREE.MeshStandardMaterial({ color: 0xc3c8d2, roughness: 0.28, metalness: 0.85 }),
  plant: new THREE.MeshStandardMaterial({ color: 0x3f7a4a, roughness: 0.85, flatShading: true }),
};

// ---------- Geräte ----------

function phone(screen, body = M.graphite) {
  const g = new THREE.Group();
  mesh(new RoundedBoxGeometry(0.078, 0.162, 0.008, 2, 0.008), body, 0, 0, 0, g);
  mesh(new THREE.PlaneGeometry(0.072, 0.156), new THREE.MeshBasicMaterial({ map: screen }), 0, 0, 0.0042, g);
  return g;
}

function tablet(screen, body = M.silver) {
  const g = new THREE.Group();
  mesh(new RoundedBoxGeometry(0.25, 0.175, 0.007, 2, 0.01), body, 0, 0, 0, g);
  mesh(new THREE.PlaneGeometry(0.236, 0.161), new THREE.MeshBasicMaterial({ map: screen }), 0, 0, 0.0037, g);
  return g;
}

function laptop(screen, body = M.silver) {
  const g = new THREE.Group();
  mesh(new RoundedBoxGeometry(0.32, 0.012, 0.22, 2, 0.004), body, 0, 0.006, 0, g);
  const lid = new THREE.Group();
  lid.position.set(0, 0.012, -0.11);
  lid.rotation.x = -0.32;
  mesh(new RoundedBoxGeometry(0.32, 0.21, 0.006, 2, 0.004), body, 0, 0.105, 0, lid);
  mesh(new THREE.PlaneGeometry(0.3, 0.19), new THREE.MeshBasicMaterial({ map: screen }), 0, 0.105, 0.0035, lid);
  g.add(lid);
  return g;
}

function monitor(screen) {
  const g = new THREE.Group();
  mesh(new RoundedBoxGeometry(0.62, 0.37, 0.025, 2, 0.006), M.graphite, 0, 0.33, 0, g);
  mesh(new THREE.PlaneGeometry(0.6, 0.35), new THREE.MeshBasicMaterial({ map: screen }), 0, 0.33, 0.0131, g);
  box(0.04, 0.2, 0.03, M.graphite, 0, 0.1, -0.03, g);
  box(0.22, 0.012, 0.16, M.graphite, 0, 0.006, -0.02, g);
  return g;
}

function tower(fans) {
  const g = new THREE.Group();
  box(0.22, 0.46, 0.45, M.graphite, 0, 0.23, 0, g);
  // Glasseite mit RGB-Innenleben
  mesh(new THREE.PlaneGeometry(0.4, 0.4), new THREE.MeshBasicMaterial({ map: rgbTexture(), toneMapped: false, color: new THREE.Color(1.6, 1.6, 1.6) }), 0.111, 0.24, 0, g).rotation.y = Math.PI / 2;
  for (let i = 0; i < 3; i++) {
    const ring = mesh(new THREE.TorusGeometry(0.052, 0.006, 8, 32), glow(i % 2 ? HOT : NEON, 3), 0, 0.1 + i * 0.13, 0.226, g);
    fans.push(ring);
  }
  return g;
}

function displayTable(w, d) {
  const g = new THREE.Group();
  box(w, 0.06, d, M.white, 0, 0.88, 0, g);
  box(w - 0.3, 0.85, d - 0.3, M.graphite, 0, 0.425, 0, g);
  box(w - 0.1, 0.02, 0.02, glow(NEON, 2.2), 0, 0.84, d / 2 - 0.04, g);
  return g;
}

function plinth() {
  const g = new THREE.Group();
  mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.95, 40), M.white, 0, 0.475, 0, g);
  const ring = mesh(new THREE.TorusGeometry(0.43, 0.012, 8, 64), glow(NEON, 2.6), 0, 0.955, 0, g);
  ring.rotation.x = Math.PI / 2;
  return g;
}

// ---------- Aufbau ----------

export function buildShop({ isMobile, shadows }) {
  const root = new THREE.Group();
  const spinners = [];
  const fans = [];

  // --- Straße und Gehweg ---
  const road = mesh(new THREE.PlaneGeometry(120, 50), M.road, 0, -0.14, 30, root);
  road.rotation.x = -Math.PI / 2;
  box(120, 0.14, 5.2, M.sidewalk, 0, -0.07, 2.6, root);
  box(120, 0.16, 0.25, M.pillar, 0, -0.06, 5.2, root);
  for (let x = -58; x < 60; x += 5) box(2.4, 0.01, 0.14, M.marking, x, -0.13, 12, root);

  // --- Nachbarhäuser mit Fenstern ---
  const rand = rng(7);
  const neighbors = [
    [-13.6, 10.4, 13], [-24.9, 10.6, 9], [-36, 11, 15],
    [13.4, 10, 11], [24.8, 11.4, 15.5], [36, 10.6, 10],
  ];
  const windowGeo = new THREE.PlaneGeometry(0.9, 1.25);
  const windowMat = new THREE.MeshStandardMaterial({ roughness: 0.12, metalness: 0.5 });
  const slots = [];
  neighbors.forEach(([x, w, h], i) => {
    box(w, h, 18, M.neighbors[i % M.neighbors.length], x, h / 2, -9.4, root);
    box(w, 0.25, 0.4, M.pillar, x, 3.4, 0.2, root);
    // Ladenfront im Erdgeschoss
    box(w - 1.6, 2.6, 0.1, windowMat, x, 1.5, -0.36, root);
    for (let y = 4.6; y < h - 1; y += 2.3) {
      for (let wx = x - w / 2 + 1.2; wx < x + w / 2 - 0.8; wx += 1.7) slots.push([wx, y]);
    }
  });
  const windows = new THREE.InstancedMesh(windowGeo, windowMat, slots.length);
  const tmp = new THREE.Object3D();
  const glassTones = [0x3c4f66, 0x5a7390, 0x2e3a4a].map((c) => new THREE.Color(c));
  slots.forEach(([wx, wy], i) => {
    tmp.position.set(wx, wy, -0.39);
    tmp.updateMatrix();
    windows.setMatrixAt(i, tmp.matrix);
    const r = rand();
    windows.setColorAt(i, glassTones[Math.floor(r * glassTones.length)]);
  });
  root.add(windows);

  // --- Straßenlaternen (tagsüber aus) ---
  const lampGlow = new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.4 });
  for (const x of [-11, 12]) {
    mesh(new THREE.CylinderGeometry(0.06, 0.08, 5.2, 12), M.frame, x, 2.6, 4.6, root);
    box(0.08, 0.08, 1.1, M.frame, x, 5.15, 4.1, root);
    box(0.36, 0.1, 0.5, M.frame, x, 5.1, 3.6, root);
    box(0.3, 0.02, 0.42, lampGlow, x, 5.04, 3.6, root);
  }

  // --- Fassade ---
  box(16, 3.9, 0.6, M.facade, 0, 5.55, -0.3, root);
  box(1.6, 3.6, 0.6, M.pillar, -7.2, 1.8, -0.3, root);
  box(1.6, 3.6, 0.6, M.pillar, 7.2, 1.8, -0.3, root);
  box(16.2, 0.12, 0.7, M.frame, 0, 7.5, -0.3, root);

  // Neon-Schriftzug
  const signMat = new THREE.MeshBasicMaterial({
    map: signTexture(), transparent: true, depthWrite: false, toneMapped: false,
  });
  // Dunkle Tafel hinter der Schrift für mehr Kontrast
  box(10.2, 3.25, 0.06, M.signPanel, 0, 5.55, -0.02, root);
  box(10.2, 0.025, 0.02, glow(NEON, 1.6), 0, 3.95, 0.02, root);
  box(10.2, 0.025, 0.02, glow(NEON, 1.6), 0, 7.15, 0.02, root);
  const sign = mesh(new THREE.PlaneGeometry(8.8, 2.75), signMat, 0, 5.55, 0.03, root);
  sign.renderOrder = 2;

  // Vordach mit Lichtkante
  box(13.2, 0.12, 1.4, M.frame, 0, 3.78, 0.7, root);
  box(12.8, 0.03, 0.04, glow(NEON, 1.4), 0, 3.71, 1.38, root);
  for (let x = -5; x <= 5; x += 2.5) {
    const d = mesh(new THREE.CircleGeometry(0.09, 20), glow(0xf4f8ff, 1.0), x, 3.715, 0.7, root);
    d.rotation.x = Math.PI / 2;
  }

  // Schaufenster: Rahmen und feste Scheiben
  const frameBars = [
    [12.2, 0.1, 0.12, 0, 3.6, -0.2],
    [12.2, 0.1, 0.12, 0, 0.05, -0.2],
    [2.6, 0.08, 0.12, 0, 2.95, -0.2],
  ];
  for (const x of [-6.05, -3.6, -1.25, 1.25, 3.6, 6.05]) frameBars.push([0.1, 3.6, 0.12, x, 1.8, -0.2]);
  for (const [w, h, d, x, y, z] of frameBars) box(w, h, d, M.frame, x, y, z, root);
  for (const [x, w] of [[-4.82, 2.35], [-2.42, 2.25], [2.42, 2.25], [4.82, 2.35]]) {
    box(w, 3.5, 0.02, M.glass, x, 1.8, -0.22, root);
  }
  box(2.4, 0.6, 0.02, M.glass, 0, 3.27, -0.22, root);

  // Schiebetür (zwei Flügel)
  const doors = [];
  for (const side of [-1, 1]) {
    const leaf = new THREE.Group();
    box(1.18, 2.84, 0.02, M.glass, 0, 1.47, 0, leaf);
    box(1.2, 0.06, 0.05, M.frame, 0, 2.89, 0, leaf);
    box(1.2, 0.06, 0.05, M.frame, 0, 0.06, 0, leaf);
    box(0.05, 2.9, 0.05, M.frame, -0.58, 1.47, 0, leaf);
    box(0.05, 2.9, 0.05, M.frame, 0.58, 1.47, 0, leaf);
    box(0.03, 0.9, 0.03, glow(NEON, 2), -side * 0.48, 1.15, 0.04, leaf);
    leaf.position.set(side * 0.6, 0, -0.08);
    root.add(leaf);
    doors.push({ leaf, side });
  }

  // "Geöffnet"-Schild im Schaufenster
  const openSign = mesh(
    new THREE.PlaneGeometry(1.15, 0.36),
    new THREE.MeshBasicMaterial({ map: openSignTexture(), transparent: true, depthWrite: false, toneMapped: false, color: new THREE.Color(1.8, 1.8, 1.8) }),
    4.82, 2.75, -0.3, root,
  );
  openSign.renderOrder = 2;

  // Pflanzkübel neben dem Eingang
  for (const x of [-6.95, 6.95]) {
    box(0.9, 0.7, 0.9, M.frame, x, 0.35, 0.75, root);
    mesh(new THREE.IcosahedronGeometry(0.62, 1), M.plant, x, 1.15, 0.75, root);
  }

  // --- Innenraum ---
  const roomW = 14.6;
  const roomD = 22;
  const floor = mesh(new THREE.PlaneGeometry(roomW, roomD), M.floor, 0, 0.001, -roomD / 2, root);
  floor.rotation.x = -Math.PI / 2;
  const ceil = mesh(new THREE.PlaneGeometry(roomW, roomD), M.ceiling, 0, 4.4, -roomD / 2, root);
  ceil.rotation.x = Math.PI / 2;
  const wl = mesh(new THREE.PlaneGeometry(roomD, 4.4), M.wall, -roomW / 2, 2.2, -roomD / 2, root);
  wl.rotation.y = Math.PI / 2;
  const wr = mesh(new THREE.PlaneGeometry(roomD, 4.4), M.wall, roomW / 2, 2.2, -roomD / 2, root);
  wr.rotation.y = -Math.PI / 2;
  mesh(new THREE.PlaneGeometry(roomW, 4.4), M.wall, 0, 2.2, -roomD, root);
  // Innenseite über den Schaufenstern
  const lintel = mesh(new THREE.PlaneGeometry(roomW, 0.8), M.wall, 0, 4.0, -0.5, root);
  lintel.rotation.y = Math.PI;

  // Lichtbänder an der Decke und am Boden
  const strip = glow(0xf2f8ff, 1.0);
  for (const x of [-3.6, 0, 3.6]) box(0.12, 0.03, 18.5, strip, x, 4.37, -11.5, root);
  for (const z of [-4, -10, -16]) box(7.3, 0.03, 0.1, strip, 0, 4.37, z, root);
  const floorLed = glow(NEON, 1.3);
  box(0.03, 0.03, roomD - 1, floorLed, -roomW / 2 + 0.03, 0.04, -roomD / 2 - 0.5, root);
  box(0.03, 0.03, roomD - 1, floorLed, roomW / 2 - 0.03, 0.04, -roomD / 2 - 0.5, root);

  // Rückwand mit Begrüßungs-Bildschirm
  box(7.4, 2.5, 0.08, M.frame, 0, 2.55, -roomD + 0.06, root);
  mesh(new THREE.PlaneGeometry(7.2, 2.34), new THREE.MeshBasicMaterial({ map: welcomeTexture(), toneMapped: false, color: new THREE.Color(1.15, 1.15, 1.15) }), 0, 2.55, -roomD + 0.11, root);

  // Theke
  box(4.8, 1.02, 1.0, M.white, 0, 0.51, -17, root);
  box(5.0, 0.06, 1.15, M.graphite, 0, 1.05, -17, root);
  box(4.6, 0.025, 0.02, glow(NEON, 2.6), 0, 0.1, -16.49, root);
  const counterLaptop = laptop(screenTexture(512, 320, '#0e2a4a', '#3a1a5a'));
  counterLaptop.scale.setScalar(1.3);
  counterLaptop.position.set(1.2, 1.08, -17.15);
  counterLaptop.rotation.y = Math.PI;
  root.add(counterLaptop);

  // Schaufenster-Auslage: drehendes Riesen-Smartphone und Laptop
  const winL = plinth();
  winL.position.set(-3.6, 0, -1.5);
  root.add(winL);
  const heroPhone = phone(screenTexture(256, 512, '#1b6cff', '#8a2be2', { clock: true }));
  heroPhone.scale.setScalar(5.5);
  heroPhone.position.set(-3.6, 1.45, -1.5);
  root.add(heroPhone);
  spinners.push({ obj: heroPhone, speed: 0.45 });

  const winR = plinth();
  winR.position.set(3.6, 0, -1.5);
  root.add(winR);
  const heroLaptop = laptop(screenTexture(512, 320, '#ff5f8a', '#3f2bff', { title: 'Nex', subtitle: 'Ultrabook · 14 Zoll' }));
  heroLaptop.scale.setScalar(2.4);
  heroLaptop.position.set(3.6, 0.96, -1.5);
  heroLaptop.rotation.y = -0.5;
  root.add(heroLaptop);
  spinners.push({ obj: heroLaptop, speed: -0.25 });

  // Smartphone-Zone (vorne links) – Vorschau, wird in Etappe 2 interaktiv
  const phoneTable = displayTable(3.2, 1.3);
  phoneTable.position.set(-4.2, 0, -6.6);
  root.add(phoneTable);
  const phoneColors = [['#0f9bff', '#0b2a6b'], ['#ff7a59', '#7a1f5c'], ['#28d7a5', '#0b4a5a'], ['#c9a6ff', '#3b2a80']];
  phoneColors.forEach(([a, b], i) => {
    const p = phone(screenTexture(256, 512, a, b, { clock: i === 0 }), i % 2 ? M.silver : M.graphite);
    p.scale.setScalar(2.2);
    p.position.set(-5.4 + i * 0.8, 1.1, -6.45);
    p.rotation.x = -0.7;
    root.add(p);
  });

  // Tablet-Zone (vorne rechts)
  const tabletTable = displayTable(3.2, 1.3);
  tabletTable.position.set(4.2, 0, -6.6);
  root.add(tabletTable);
  [['#ffb347', '#ff4f81'], ['#4facfe', '#00f2fe'], ['#43e97b', '#1f6f8b']].forEach(([a, b], i) => {
    const t = tablet(screenTexture(512, 360, a, b), i === 1 ? M.graphite : M.silver);
    t.scale.setScalar(2.1);
    t.position.set(3.15 + i * 1.05, 1.18, -6.55);
    t.rotation.x = -0.45;
    root.add(t);
    box(0.06, 0.28, 0.06, M.frame, 3.15 + i * 1.05, 1.03, -6.75, root);
  });

  // PC- & Gaming-Zone (hinten links)
  box(3.4, 0.05, 1.0, M.graphite, -4.6, 0.76, -12.4, root);
  box(0.06, 0.74, 0.9, M.frame, -6.2, 0.37, -12.4, root);
  box(0.06, 0.74, 0.9, M.frame, -3.0, 0.37, -12.4, root);
  const mon = monitor(screenTexture(1024, 600, '#0b1a3a', '#5a1a6a', { title: 'Gaming-Setup', subtitle: '27 Zoll · 165 Hz' }));
  mon.scale.setScalar(1.6);
  mon.position.set(-4.8, 0.785, -12.6);
  root.add(mon);
  const pc = tower(fans);
  pc.scale.setScalar(1.5);
  pc.position.set(-3.55, 0.785, -12.45);
  pc.rotation.y = -0.35;
  root.add(pc);

  // Zubehör-Wand (rechts hinten)
  box(0.12, 2.8, 4.6, M.frame, roomW / 2 - 0.07, 1.9, -13, root);
  const cubby = glow(0x9fdcff, 0.9);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      box(0.02, 0.62, 0.95, cubby, roomW / 2 - 0.14, 0.95 + r * 0.82, -14.65 + c * 1.1, root);
      box(0.12, 0.16 + (c % 2) * 0.1, 0.42, c % 3 === 0 ? M.white : M.graphite, roomW / 2 - 0.25, 0.75 + r * 0.82 + 0.08, -14.65 + c * 1.1, root);
    }
  }

  // --- Licht ---
  root.add(new THREE.HemisphereLight(0xcfe3ff, 0x6a655c, 0.9));

  // Sonne von vorne links; Schatten nur auf dem Desktop
  const sun = new THREE.DirectionalLight(0xfff3e2, 2.6);
  sun.position.set(-14, 22, 18);
  sun.target.position.set(0, 0, -4);
  root.add(sun, sun.target);
  if (shadows) {
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 22, bottom: -22, near: 1, far: 80 });
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.03;
  }

  const inside = [
    [0, 4.0, -5, 0xfff8ef, 16, 16],
    [0, 4.0, -13, 0xfff8ef, 16, 16],
    [-3.6, 3.2, -2.1, 0xfff0dc, 6, 6],
    [3.6, 3.2, -2.1, 0xfff0dc, 6, 6],
  ];
  if (!isMobile) {
    inside.push([-4.2, 3.4, -6.6, 0xfff8ef, 5, 7], [4.2, 3.4, -6.6, 0xfff8ef, 5, 7], [0, 3.4, -17, 0xfff8ef, 6, 8]);
  }
  for (const [x, y, z, col, intensity, dist] of inside) {
    const l = new THREE.PointLight(col, intensity, dist, 2);
    l.position.set(x, y, z);
    root.add(l);
  }

  if (shadows) {
    root.traverse((o) => {
      if (!o.isMesh || !o.material.isMeshStandardMaterial || o.material.transparent) return;
      o.castShadow = true;
      o.receiveShadow = true;
    });
  }

  // --- Animation ---
  const signBase = 1.15;
  // An/Aus-Muster für das Einschalten der Leuchtschrift (Sekunden, an?)
  const flicker = [[0.25, 0], [0.32, 1], [0.4, 0], [0.62, 1], [0.7, 0.2], [0.78, 1], [1.05, 0.3], [1.12, 1]];

  function setDoor(v) {
    for (const { leaf, side } of doors) leaf.position.x = side * (0.6 + v * 1.18);
  }

  function update(t, dt, state, reducedMotion) {
    setDoor(state.door);

    let on = 1;
    if (!reducedMotion && t < 1.2) {
      on = 0;
      for (const [time, level] of flicker) if (t >= time) on = level;
    }
    signMat.color.setScalar(0.08 + on * signBase);

    for (const s of spinners) s.obj.rotation.y += s.speed * dt * (reducedMotion ? 0.3 : 1);
    for (const f of fans) f.rotation.z += dt * 2.5;
  }

  return { root, update };
}
