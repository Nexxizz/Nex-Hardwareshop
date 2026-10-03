// Einstieg: Renderer, Kamera, Nachleuchten (Bloom) und Render-Schleife.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildShop } from './shop.js';
import { setupScroll } from './scroll.js';
import { setupInteraction } from './interaction.js';

const canvas = document.getElementById('scene');
const whereEl = document.getElementById('where');
const isMobile = matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) < 600;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Rundgang beginnt beim Neuladen immer vor dem Laden
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
scrollTo(0, 0);

function createRenderer() {
  try {
    return new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  } catch (err) {
    console.warn('WebGL nicht verfügbar:', err);
    return null;
  }
}

// Schriften müssen geladen sein, bevor sie in die Leuchtschrift-Texturen gezeichnet werden
async function fontsReady() {
  const wanted = ['800 100px Unbounded', '600 100px Unbounded', '500 40px "JetBrains Mono"', '600 40px Onest'];
  const timeout = new Promise((resolve) => setTimeout(resolve, 2500));
  await Promise.race([Promise.all(wanted.map((f) => document.fonts.load(f))), timeout]);
}

// Tageshimmel als Verlauf von Blau zum hellen Horizont
function skyTexture() {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#4f8fd1');
  grad.addColorStop(0.55, '#9cc4e8');
  grad.addColorStop(1, '#e3edf6');
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Ladebildschirm: Fortschritt in groben Schritten, bis das erste Bild gerendert ist
const loaderEl = document.getElementById('loader');
const loaderFill = document.getElementById('loader-fill');
const loaderText = document.getElementById('loader-text');
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));

async function loading(progress, text) {
  loaderFill.style.setProperty('--p', progress);
  if (text) loaderText.textContent = text;
  await nextFrame();
}

async function init() {
  const renderer = createRenderer();
  if (!renderer) {
    document.documentElement.classList.add('no-webgl');
    return;
  }

  await loading(0.25, 'Schriften werden geladen …');
  await fontsReady();
  await loading(0.5, 'Laden wird eingerichtet …');

  const pixelRatio = Math.min(devicePixelRatio, isMobile ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  const shadows = !isMobile;
  renderer.shadowMap.enabled = shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = skyTexture();
  scene.fog = new THREE.FogExp2(0xdbe6f0, 0.003);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.45;

  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.05, 160);

  const shop = buildShop({ isMobile, shadows });
  scene.add(shop.root);
  await loading(0.8, 'Licht wird eingeschaltet …');

  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: isMobile ? 2 : 4 });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.3, 0.4, 1.3);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  // Werte, die die Scroll-Zeitleiste verändert
  const state = {
    cam: { x: 0, y: 1.8, z: 12.5 },
    look: { x: -1.2, y: 2.4, z: 0 },
    door: 0,
    away: 1,
    shift: 0,
    overview: 0,
  };

  let portrait = false;
  let viewShift = NaN;
  function resize() {
    viewShift = NaN;
    const w = innerWidth;
    const h = innerHeight;
    portrait = w / h < 0.9;
    camera.aspect = w / h;
    camera.fov = portrait ? 64 : 50;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    composer.setPixelRatio(pixelRatio);
    composer.setSize(w, h);
  }
  resize();
  addEventListener('resize', resize);

  // Leichte Parallaxe mit der Maus (nur Desktop)
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  if (!isMobile && !reducedMotion) {
    addEventListener('pointermove', (e) => {
      pointer.x = (e.clientX / innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / innerHeight) * 2 - 1);
    });
  }

  const isTouch = matchMedia('(hover: none)').matches;
  const interaction = setupInteraction({ camera, products: shop.products, isTouch, reducedMotion });

  setupScroll({
    state,
    reducedMotion,
    onLocation: (label) => { whereEl.textContent = label; },
    onZone: (zone) => interaction.setZone(zone),
  });

  const look = new THREE.Vector3();
  const back = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const clock = new THREE.Clock();
  let first = true;

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    pointer.sx += (pointer.x - pointer.sx) * Math.min(1, dt * 3);
    pointer.sy += (pointer.y - pointer.sy) * Math.min(1, dt * 3);

    // Im Hochformat steht die Kamera draußen weiter weg und mittig, damit die Fassade ins Bild passt
    const extra = portrait ? 8 * state.away : 0;
    // Im Laden wirkt die Maus-Parallaxe schwächer, damit die Geräte beim Zeigen ruhig bleiben
    const sway = 0.35 + 0.65 * state.away;
    camera.position.set(
      state.cam.x + pointer.sx * 0.3 * sway,
      state.cam.y + pointer.sy * 0.12 * sway + extra * 0.12,
      state.cam.z + extra,
    );
    const center = portrait ? 1.2 * state.away : 0;
    look.set(state.look.x + center + pointer.sx * 0.5 * sway, state.look.y + pointer.sy * 0.2 * sway + extra * 0.08, state.look.z);

    // Am Ende kreist die Kamera langsam über dem Laden
    if (state.overview > 0 && !reducedMotion) {
      back.subVectors(camera.position, look);
      back.applyAxisAngle(up, state.overview * Math.sin(t * 0.12) * 0.22);
      camera.position.addVectors(look, back);
    }

    if (portrait) {
      // Im Hochformat tritt die Kamera im Laden einen Schritt zurück, damit die ganze Zone ins Bild passt
      back.subVectors(camera.position, look).normalize().multiplyScalar(2.6 * (1 - state.away) * (1 - state.overview));
      back.y = 0;
      camera.position.add(back);
      // und fährt beim Überblick höher, damit der ganze Laden ins schmale Bild passt
      back.subVectors(camera.position, look).multiplyScalar(0.7 * state.overview);
      camera.position.add(back);
    }
    camera.lookAt(look);
    camera.updateMatrixWorld();

    // Bild seitlich verschieben (nur Querformat), damit die Texttafeln links nichts verdecken
    const shift = portrait ? 0 : state.shift;
    if (shift !== viewShift) {
      viewShift = shift;
      const w = innerWidth;
      const h = innerHeight;
      if (shift) camera.setViewOffset(w, h, -shift * w, 0, w, h);
      else camera.clearViewOffset();
    }

    shop.update(t, dt, state, reducedMotion);
    interaction.update(dt);
    composer.render();

    if (first) {
      first = false;
      canvas.classList.add('ready');
      loading(1, 'Fertig').then(() => loaderEl.classList.add('done'));
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

init();
