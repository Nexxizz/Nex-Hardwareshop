// Kamerafahrt: GSAP koppelt eine Zeitleiste an die Scroll-Position.
// Eine Zeiteinheit entspricht grob einem Abschnitt; die Gesamtlänge wird auf die Scroll-Strecke verteilt.

const LOCATIONS = [
  [0, 'Vor dem Laden'],
  [3.2, 'Eingang'],
  [5.6, 'Im Laden'],
  [8.4, 'Smartphone-Zone'],
];

export function setupScroll({ state, reducedMotion, onLocation }) {
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

  // 1) Auf den Laden zugehen
  tl.to(state.cam, { x: 0, y: 1.7, z: 4.4, duration: 3, ease: 'power1.inOut' }, 0)
    .to(state.look, { x: 0, y: 1.6, z: -8, duration: 3, ease: 'power1.inOut' }, 0)
    .to(state, { away: 0, duration: 3, ease: 'power1.inOut' }, 0)
    // 2) Tür öffnet sich
    .to(state, { door: 1, duration: 1.3, ease: 'power2.inOut' }, 2.1)
    // 3) Durch die Tür hinein
    .to(state.cam, { y: 1.68, z: -3.2, duration: 2.4, ease: 'power1.inOut' }, 3.4)
    .to(state.look, { y: 1.35, z: -18, duration: 2.4, ease: 'power1.inOut' }, 3.4)
    // 4) Ein paar Schritte in den Raum
    .to(state.cam, { x: 0.3, z: -4.3, duration: 2.2, ease: 'sine.inOut' }, 6)
    // 5) Blick zur Smartphone-Zone
    .to(state.look, { x: -4.4, y: 1.0, z: -6.6, duration: 2.2, ease: 'sine.inOut' }, 7.8)
    .to(state.cam, { x: -2.9, y: 1.8, z: -4.0, duration: 2.2, ease: 'sine.inOut' }, 8.2);

  // Texttafeln ein- und ausblenden
  tl.to('#ov-hero', { autoAlpha: 0, y: -24, duration: 0.9 }, 0.25)
    .fromTo('#ov-door', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.6)
    .to('#ov-door', { autoAlpha: 0, y: -20, duration: 0.6 }, 3.6)
    .fromTo('#ov-welcome', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 5.2)
    .to('#ov-welcome', { autoAlpha: 0, y: -20, duration: 0.6 }, 7.6)
    .fromTo('#ov-next', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 9.0)
    .to({}, { duration: 0.6 }, 10.4);

  let current = '';
  tl.eventCallback('onUpdate', () => {
    const t = tl.time();
    let label = LOCATIONS[0][1];
    for (const [time, name] of LOCATIONS) if (t >= time) label = name;
    if (label !== current) {
      current = label;
      onLocation(label);
    }
  });

  return tl;
}
