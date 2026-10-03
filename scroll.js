// Kamerafahrt: GSAP koppelt eine Zeitleiste an die Scroll-Position.
// Eine Zeiteinheit entspricht grob einem Abschnitt; die Gesamtlänge wird auf die Scroll-Strecke verteilt.

const LOCATIONS = [
  [0, 'Vor dem Laden'],
  [3.2, 'Eingang'],
  [5.6, 'Im Laden'],
  [8.6, 'Smartphones'],
  [13.4, 'Tablets'],
  [18.4, 'PC & Gaming'],
  [23.6, 'Zubehör'],
];

// Zeitfenster, in denen die Geräte einer Zone anklickbar sind
const ZONE_WINDOWS = [
  ['smartphones', 9.6, 12.8],
  ['tablets', 14.6, 17.8],
  ['pcs', 19.8, 23.0],
  ['accessories', 24.8, Infinity],
];

// Kamera-Standpunkte vor den Zonen: [Kamera, Blickziel]
const STOPS = {
  phones: [{ x: -3.4, y: 1.7, z: -4.1 }, { x: -4.2, y: 1.02, z: -6.5 }],
  tablets: [{ x: 3.1, y: 1.75, z: -3.7 }, { x: 3.75, y: 1.02, z: -6.5 }],
  pcs: [{ x: -3.2, y: 1.75, z: -9.2 }, { x: -4.9, y: 1.0, z: -12.5 }],
  accessories: [{ x: 3.8, y: 1.7, z: -12.85 }, { x: 7.2, y: 1.55, z: -12.95 }],
};

export function setupScroll({ state, reducedMotion, onLocation, onZone }) {
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '#tour',
      start: 'top top',
      end: 'bottom bottom',
      scrub: reducedMotion ? true : 1.2,
    },
  });

  function moveTo([cam, look], at, duration = 2.3) {
    tl.to(state.cam, { ...cam, duration, ease: 'sine.inOut' }, at)
      .to(state.look, { ...look, duration, ease: 'sine.inOut' }, at);
  }

  function card(selector, inAt, outAt) {
    tl.fromTo(selector, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6 }, inAt);
    if (outAt !== undefined) tl.to(selector, { autoAlpha: 0, y: -20, duration: 0.5 }, outAt);
  }

  // 1) Auf den Laden zugehen
  tl.to(state.cam, { x: 0, y: 1.7, z: 4.4, duration: 3, ease: 'power1.inOut' }, 0)
    .to(state.look, { x: 0, y: 1.6, z: -8, duration: 3, ease: 'power1.inOut' }, 0)
    .to(state, { away: 0, duration: 3, ease: 'power1.inOut' }, 0)
    // 2) Tür öffnet sich
    .to(state, { door: 1, duration: 1.3, ease: 'power2.inOut' }, 2.1)
    // 3) Durch die Tür hinein
    .to(state.cam, { y: 1.68, z: -3.2, duration: 2.4, ease: 'power1.inOut' }, 3.4)
    .to(state.look, { y: 1.35, z: -18, duration: 2.4, ease: 'power1.inOut' }, 3.4)
    // 4) Ein paar Schritte in den Raum; das Bild rückt nach rechts, damit links Platz für die Tafeln ist
    .to(state.cam, { x: 0.3, z: -4.3, duration: 2.2, ease: 'sine.inOut' }, 6)
    .to(state, { shift: 0.12, duration: 1.2, ease: 'sine.inOut' }, 5.0);

  // 5) Rundgang durch die Zonen
  moveTo(STOPS.phones, 8.2);
  moveTo(STOPS.tablets, 13.0, 2.4);
  moveTo(STOPS.pcs, 18.0, 2.6);
  moveTo(STOPS.accessories, 23.2, 2.4);

  // Texttafeln ein- und ausblenden
  tl.to('#ov-hero', { autoAlpha: 0, y: -24, duration: 0.9 }, 0.25);
  card('#ov-door', 1.6, 3.6);
  card('#ov-welcome', 5.2, 7.6);
  card('#ov-phones', 9.6, 12.6);
  card('#ov-tablets', 14.6, 17.6);
  card('#ov-pcs', 19.8, 22.8);
  card('#ov-accessories', 24.8);
  tl.to({}, { duration: 1 }, 27);

  let location = '';
  let zone = null;
  tl.eventCallback('onUpdate', () => {
    const t = tl.time();

    let label = LOCATIONS[0][1];
    for (const [time, name] of LOCATIONS) if (t >= time) label = name;
    if (label !== location) {
      location = label;
      onLocation(label);
    }

    const current = ZONE_WINDOWS.find(([, from, to]) => t >= from && t < to);
    const next = current ? current[0] : null;
    if (next !== zone) {
      zone = next;
      onZone(zone);
    }
  });

  return tl;
}
