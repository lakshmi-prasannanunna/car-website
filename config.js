/**
 * NOCTIS Configuration
 * All section heights, chapter ranges, frame counts, frame paths and callout positions
 */
const CONFIG = {
  // Real frame counts
  heroFrameCount: 442,
  dismantleFrameCount: 150,

  // Section scroll heights (pinned scrollytelling wrappers)
  heroScrollHeight: '600vh',
  dismantleScrollHeight: '350vh',

  // Preloader initial hero frames needed before page reveal
  preloaderInitialFrames: 40,

  // Frame paths pattern
  paths: {
    heroDesktop: 'assets/frames/hero/frame_{index}.webp',
    heroMobile: 'assets/frames/hero-mobile/frame_{index}.webp',
    dismantleDesktop: 'assets/frames/dismantle/frame_{index}.webp',
    dismantleMobile: 'assets/frames/dismantle-mobile/frame_{index}.webp',
    cars: {
      gte: 'assets/cars/gt-e.webp',
      s: 'assets/cars/s.webp',
      x: 'assets/cars/x.webp',
      r: 'assets/cars/r.webp',
      one: 'assets/cars/one.webp'
    },
    staticFallback: {
      hero0: 'assets/static/hero_0.webp',
      hero35: 'assets/static/hero_35.webp',
      hero65: 'assets/static/hero_65.webp',
      hero100: 'assets/static/hero_100.webp',
      dismantleFirst: 'assets/static/dismantle_first.webp',
      dismantleLast: 'assets/static/dismantle_last.webp'
    }
  },

  // Hero Scrollytelling Chapters
  // 0–12%: big "NOCTIS" + small line "The city is asleep." + mono hint "SCROLL TO WAKE IT" with a pulsing 1px line.
  // 22–40%: "It doesn't need the city's light."
  // 50–68%: "It brings its own."
  // 80–100%: "GT-E" in display + mono specs row "0–100 KM/H 3.1S · 640 KM RANGE · DUAL MOTOR" + text link "Discover the GT-E".
  heroChapters: [
    {
      id: 'chap1',
      indexStr: '01/04',
      start: 0.00,
      end: 0.12,
      fadeOut: 0.17
    },
    {
      id: 'chap2',
      indexStr: '02/04',
      start: 0.22,
      end: 0.40,
      fadeOut: 0.45
    },
    {
      id: 'chap3',
      indexStr: '03/04',
      start: 0.50,
      end: 0.68,
      fadeOut: 0.73
    },
    {
      id: 'chap4',
      indexStr: '04/04',
      start: 0.80,
      end: 1.00,
      fadeOut: 1.00
    }
  ],

  // Left-edge HUD telemetry bounds
  hud: {
    maxSpeed: 118,      // 000 -> 118 KM/H
    maxDistance: 4.2    // 0.0 -> 4.2 KM
  },

  // Dismantle Callouts (appear after 70% scroll progress)
  // dotX, dotY: position of xenon dot on car (% of stage)
  // textX, textY: position of label & spec text (% of stage)
  dismantleCallouts: [
    {
      id: 'body',
      label: 'BODY',
      title: 'Carbon composite monocoque',
      dotX: 52,
      dotY: 28,
      textX: 68,
      textY: 18,
      threshold: 0.73
    },
    {
      id: 'light',
      label: 'LIGHT',
      title: 'Single-line LED signature',
      dotX: 14,
      dotY: 52,
      textX: 8,
      textY: 34,
      threshold: 0.80
    },
    {
      id: 'drive',
      label: 'DRIVE',
      title: 'Dual axial-flux motors, 680 kW',
      dotX: 31,
      dotY: 63,
      textX: 12,
      textY: 76,
      threshold: 0.87
    },
    {
      id: 'battery',
      label: 'BATTERY',
      title: '110 kWh structural pack',
      dotX: 56,
      dotY: 68,
      textX: 74,
      textY: 80,
      threshold: 0.93
    }
  ],

  // Section 4 Lineup Models Data
  lineup: [
    {
      id: 'gte',
      num: '01',
      name: 'GT-E',
      tagline: 'The grand tourer.',
      specs: {
        range: '640 KM',
        accel: '3.1 S',
        power: '680 KW'
      },
      swatches: ['#121418', '#EDEAE4', '#0E1726', '#CFE3FF'],
      activeSwatch: 0,
      image: 'assets/cars/gt-e.webp',
      alt: 'NOCTIS GT-E matte graphite grand tourer coupe side profile'
    },
    {
      id: 's',
      num: '02',
      name: 'S',
      tagline: 'Four doors, no compromise.',
      specs: {
        range: '600 KM',
        accel: '3.6 S',
        power: '520 KW'
      },
      swatches: ['#EDEAE4', '#121418', '#1A233A', '#8A8F98'],
      activeSwatch: 0,
      image: 'assets/cars/s.webp',
      alt: 'NOCTIS S four-door sport sedan satin bone white side profile'
    },
    {
      id: 'x',
      num: '03',
      name: 'X',
      tagline: 'Higher, never heavier.',
      specs: {
        range: '560 KM',
        accel: '4.2 S',
        power: '480 KW'
      },
      swatches: ['#0E1726', '#121418', '#EDEAE4', '#2C3440'],
      activeSwatch: 0,
      image: 'assets/cars/x.webp',
      alt: 'NOCTIS X coupe-roofline SUV midnight blue side profile'
    },
    {
      id: 'r',
      num: '04',
      name: 'R',
      tagline: 'Built for the track.',
      specs: {
        range: '420 KM',
        accel: '2.4 S',
        power: '900 KW'
      },
      swatches: ['#0A0B0E', '#E1251B', '#1E2024', '#EDEAE4'],
      activeSwatch: 0,
      image: 'assets/cars/r.webp',
      alt: 'NOCTIS R track coupe satin black with fixed rear wing and red accents side profile'
    },
    {
      id: 'one',
      num: '05',
      name: 'ONE',
      tagline: 'The future, early.',
      specs: {
        range: 'CONCEPT',
        accel: 'SUB 2.0 S',
        power: 'SOLID STATE'
      },
      swatches: ['#D6D8DD', '#07080A', '#CFE3FF', '#8A8F98'],
      activeSwatch: 0,
      image: 'assets/cars/one.webp',
      alt: 'NOCTIS ONE liquid silver concept hypercar low profile'
    }
  ]
};

// Expose CONFIG to global window
window.CONFIG = CONFIG;

