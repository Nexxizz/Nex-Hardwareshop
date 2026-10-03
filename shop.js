// Aufbau des Ladens: Straße, Fassade mit Schiebetür, Innenraum mit den Produkt-Zonen.
// Einheiten sind Meter, die Fassade liegt bei z = 0, der Innenraum bei z < 0.
import * as THREE from 'three';
import {
  NEON, glow, canvasTexture, mesh, box, neonText, M, screenTexture, signTexture,
  displayTable, desk, plinth, stand, phone, compactPhone, foldable, tablet, kidsTablet, pen,
  laptop, monitor, tower, officePc, keyboard, mouse, headphones, controller, charger,
} from './devices.js';

// Einfacher, fester Zufallsgenerator, damit die Szene bei jedem Laden gleich aussieht
function rng(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

// ---------- Texturen ----------

function facadeSignTexture() {
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
    map: facadeSignTexture(), transparent: true, depthWrite: false, toneMapped: false,
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

  // --- Produkt-Zonen ---
  // Jedes Produkt bekommt eine unsichtbare Trefferbox für Hover/Tippen; die Umrisse dienen zum Platzieren der Info-Karte.
  const products = [];
  const hitMat = new THREE.MeshBasicMaterial();
  const minHit = new THREE.Vector3(0.14, 0.14, 0.14);
  const tmpV = new THREE.Vector3();

  function place(id, obj, { x, y, z, scale = 1, rx = 0, ry = 0 }) {
    obj.position.set(x, y, z);
    obj.rotation.order = 'YXZ';
    obj.rotation.set(rx, ry, 0);
    obj.scale.multiplyScalar(scale);
    root.add(obj);
    obj.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(obj);
    const size = bb.getSize(new THREE.Vector3()).multiplyScalar(1.2).max(minHit);
    const hit = mesh(new THREE.BoxGeometry(size.x, size.y, size.z), hitMat, 0, 0, 0, root);
    hit.position.copy(bb.getCenter(tmpV));
    hit.visible = false;
    products.push({
      id,
      obj,
      hit,
      baseY: obj.position.y,
      baseScale: obj.scale.clone(),
      bounds: bb,
      h: 0,
    });
    return obj;
  }

  function hangingSign(text, sub, x, y, z, ry = 0) {
    const g = new THREE.Group();
    mesh(new THREE.PlaneGeometry(1.8, 0.45), new THREE.MeshBasicMaterial({ map: signTexture(text, sub), toneMapped: false }), 0, 0, 0.011, g);
    box(1.84, 0.49, 0.02, M.signPanel, 0, 0, 0, g);
    if (ry === 0) {
      for (const s of [-0.7, 0.7]) box(0.012, 4.4 - y - 0.24, 0.012, M.frame, s, (4.4 - y) / 2 + 0.12, 0, g);
    }
    g.position.set(x, y, z);
    g.rotation.y = ry;
    root.add(g);
  }

  // Smartphone-Zone (vorne links)
  const phoneTable = displayTable(2.8, 1.2);
  phoneTable.position.set(-4.2, 0, -6.6);
  root.add(phoneTable);
  hangingSign('SMARTPHONES', null, -4.2, 3.0, -6.9);
  const phoneTop = 0.91;
  const phoneSetups = [
    ['phone-flagship', () => phone(screenTexture(256, 512, '#1b6cff', '#5a2be2', { clock: true, apps: true }), M.graphite), -5.25],
    ['phone-mid', () => phone(screenTexture(256, 512, '#ff8a5c', '#a3245c', { clock: true }), M.white), -4.55],
    ['phone-fold', () => foldable(screenTexture(512, 512, '#8d6bff', '#2b1a6b', { apps: true }), M.graphite), -3.85],
    ['phone-compact', () => compactPhone(screenTexture(256, 512, '#2bd9a6', '#0b4a5a', { clock: true }), M.silver), -3.15],
  ];
  for (const [id, make, x] of phoneSetups) {
    const st = stand(0.24, 0.4);
    st.position.set(x, phoneTop, -6.5);
    root.add(st);
    place(id, make(), { x, y: phoneTop + 0.19, z: -6.48, scale: 2.2, rx: -0.3 });
  }

  // Tablet-Zone (vorne rechts)
  const tabletTable = displayTable(2.8, 1.2);
  tabletTable.position.set(4.2, 0, -6.6);
  root.add(tabletTable);
  hangingSign('TABLETS', null, 4.2, 3.0, -6.9);
  const tabletSetups = [
    ['tablet-everyday', () => tablet(screenTexture(512, 360, '#4facfe', '#00b8d4', { apps: true }), M.silver), 3.35, 2.0],
    ['tablet-pro', () => tablet(screenTexture(512, 360, '#ffb347', '#ff4f81', { title: 'Skizze', subtitle: 'Ebene 3 · Pinsel' }), M.graphite), 4.25, 2.3],
    ['tablet-kids', () => kidsTablet(screenTexture(512, 360, '#43e97b', '#1f8b6f', { apps: true })), 5.15, 1.9],
  ];
  for (const [id, make, x, scale] of tabletSetups) {
    const st = stand(0.42, 0.45);
    st.position.set(x, phoneTop, -6.52);
    root.add(st);
    place(id, make(), { x, y: phoneTop + 0.2, z: -6.5, scale, rx: -0.35 });
  }
  const stylus = pen();
  stylus.scale.setScalar(1.6);
  stylus.position.set(4.25, phoneTop + 0.008, -6.18);
  stylus.rotation.y = 0.15;
  root.add(stylus);

  // PC- & Gaming-Zone (hinten links)
  const pcDesk = desk(3.8, 0.9);
  pcDesk.position.set(-4.6, 0, -12.5);
  root.add(pcDesk);
  hangingSign('PC & GAMING', null, -4.6, 3.0, -12.9);
  const deskTop = 0.785;
  place('pc-gaming', tower(fans), { x: -6.0, y: deskTop, z: -12.55, scale: 1.5, ry: -0.4 });
  place('monitor', monitor(screenTexture(1024, 600, '#0b1a3a', '#5a1a6a', { title: 'Gaming-Setup', subtitle: '27 Zoll · 165 Hz' })), { x: -5.0, y: deskTop, z: -12.7, scale: 1.5, ry: 0.25 });
  const deskKeys = keyboard(true);
  deskKeys.position.set(-5.0, deskTop, -12.22);
  deskKeys.rotation.y = 0.25;
  root.add(deskKeys);
  const deskMouse = mouse();
  deskMouse.scale.setScalar(1.2);
  deskMouse.position.set(-4.58, deskTop, -12.12);
  deskMouse.rotation.y = 0.25;
  root.add(deskMouse);
  place('laptop-gaming', laptop(screenTexture(512, 320, '#ff3d6e', '#2b0b4a', { title: 'Level 7', subtitle: '240 FPS' }), M.graphite, { rgb: true }), { x: -3.85, y: deskTop, z: -12.45, scale: 1.8, ry: 0.2 });
  place('pc-office', officePc(), { x: -3.05, y: deskTop, z: -12.6, scale: 1.2, ry: 0.3 });

  // Zubehör-Wand (rechts hinten): Geräte hängen an einer beleuchteten Wand und schauen in den Raum (-x)
  const wallX = roomW / 2 - 0.08;
  box(0.1, 2.6, 4.4, M.pillar, wallX, 1.65, -13, root);
  const lightbox = glow(0xe4edf7, 0.8);
  box(0.02, 2.5, 0.02, glow(NEON, 1.4), wallX - 0.06, 1.65, -15.15, root);
  box(0.02, 2.5, 0.02, glow(NEON, 1.4), wallX - 0.06, 1.65, -10.85, root);
  hangingSign('ZUBEHÖR', null, wallX - 0.07, 3.3, -13, -Math.PI / 2);
  const itemX = wallX - 0.18;
  const accSetups = [
    ['headphones', headphones(), 2.1, -14.15, 2.7, 0, 0.75],
    ['controller', controller(), 2.1, -12.95, 3.0, 1.2, 0.75],
    ['charger', charger(), 2.1, -11.8, 3.4, 0, 0.75],
    ['keyboard', keyboard(true), 1.0, -13.6, 1.75, 1.2, 1.05],
    ['mouse', mouse(), 1.0, -12.2, 3.2, 1.2, 0.6],
  ];
  // Jedes Teil hängt vor einem hellen Leuchtkasten mit Ablage
  for (const [id, obj, y, z, scale, rx, size] of accSetups) {
    box(0.02, 0.78, size, lightbox, wallX - 0.06, y, z, root);
    box(0.26, 0.025, size, M.white, wallX - 0.17, y - 0.39, z, root);
    place(id, obj, { x: itemX, y, z, scale, rx, ry: -Math.PI / 2 });
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
    inside.push([-4.2, 3.4, -6.6, 0xfff8ef, 5, 7], [4.2, 3.4, -6.6, 0xfff8ef, 5, 7], [0, 3.4, -17, 0xfff8ef, 6, 8], [-4.6, 3.4, -11.8, 0xfff8ef, 6, 7], [5.4, 3.4, -13, 0xfff8ef, 6, 7]);
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

  return { root, update, products };
}
