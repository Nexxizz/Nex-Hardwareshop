// Produktdaten für die Info-Karten. Namen und Texte lassen sich hier austauschen,
// ohne die 3D-Szene anzufassen. Die Reihenfolge innerhalb einer Zone ist die Reihenfolge der Auswahl-Buttons.

export const ZONES = {
  smartphones: 'Smartphone-Zone',
  tablets: 'Tablet-Zone',
  pcs: 'PC- & Gaming-Zone',
  accessories: 'Zubehör',
};

export const PRODUCTS = [
  // Smartphones
  {
    id: 'phone-flagship',
    zone: 'smartphones',
    short: 'Flaggschiff',
    name: 'Flaggschiff-Smartphone',
    tagline: 'Die beste Kamera und das hellste Display.',
    specs: ['6,7-Zoll-OLED mit 120 Hz', 'Dreifach-Kamera mit 5-fach-Zoom', 'Bis zu 1 TB Speicher'],
  },
  {
    id: 'phone-mid',
    zone: 'smartphones',
    short: 'Mittelklasse',
    name: 'Mittelklasse-Smartphone',
    tagline: 'Alles, was man im Alltag braucht.',
    specs: ['6,5-Zoll-Display mit 90 Hz', 'Akku hält zwei Tage', '128 GB Speicher, erweiterbar'],
  },
  {
    id: 'phone-fold',
    zone: 'smartphones',
    short: 'Foldable',
    name: 'Foldable',
    tagline: 'Smartphone und Mini-Tablet in einem.',
    specs: ['Aufgeklappt 7,6 Zoll groß', 'Zwei Apps nebeneinander', 'Zugeklappt wie ein normales Smartphone'],
  },
  {
    id: 'phone-compact',
    zone: 'smartphones',
    short: 'Kompakt',
    name: 'Kompakt-Smartphone',
    tagline: 'Volle Leistung für die Hosentasche.',
    specs: ['6,1-Zoll-Display', 'Unter 170 g leicht', 'Gleicher Prozessor wie das Flaggschiff'],
  },

  // Tablets
  {
    id: 'tablet-everyday',
    zone: 'tablets',
    short: 'Alltags-Tablet',
    name: 'Alltags-Tablet',
    tagline: 'Zum Streamen, Surfen und Lesen.',
    specs: ['11-Zoll-Display', 'Bis zu 12 Stunden Akkulaufzeit', 'Stereo-Lautsprecher'],
  },
  {
    id: 'tablet-pro',
    zone: 'tablets',
    short: 'Profi-Tablet',
    name: 'Profi-Tablet mit Stift',
    tagline: 'Zum Zeichnen, für Notizen und als Laptop-Ersatz.',
    specs: ['13-Zoll-Display mit 120 Hz', 'Druckempfindlicher Stift', 'Tastatur-Cover erhältlich'],
  },
  {
    id: 'tablet-kids',
    zone: 'tablets',
    short: 'Einsteiger-Tablet',
    name: 'Einsteiger-Tablet',
    tagline: 'Robust und günstig, ideal für Kinder.',
    specs: ['10-Zoll-Display', 'Stoßfeste Schutzhülle', 'Kinderprofile mit Zeitlimits'],
  },

  // PCs & Gaming
  {
    id: 'pc-gaming',
    zone: 'pcs',
    short: 'Gaming-PC',
    name: 'Gaming-PC',
    tagline: 'Für aktuelle Spiele in hohen Details.',
    specs: ['Grafikkarte der Oberklasse', '32 GB Arbeitsspeicher', 'Wasserkühlung und RGB-Beleuchtung'],
  },
  {
    id: 'monitor',
    zone: 'pcs',
    short: 'Monitor',
    name: 'Gaming-Monitor',
    tagline: 'Schnelle Bilder ohne Schlieren.',
    specs: ['27 Zoll, 1440p', '165 Hz, 1 ms Reaktionszeit', 'Höhenverstellbarer Fuß'],
  },
  {
    id: 'laptop-gaming',
    zone: 'pcs',
    short: 'Gaming-Laptop',
    name: 'Gaming-Laptop',
    tagline: 'Gaming-Leistung zum Mitnehmen.',
    specs: ['16-Zoll-Display mit 240 Hz', 'Eigene Grafikkarte', 'Beleuchtete Tastatur'],
  },
  {
    id: 'pc-office',
    zone: 'pcs',
    short: 'Office-PC',
    name: 'Office-PC',
    tagline: 'Leise und sparsam fürs Büro.',
    specs: ['Kompaktes Gehäuse', '16 GB RAM, 512 GB SSD', 'Fast lautlos im Betrieb'],
  },

  // Zubehör
  {
    id: 'headphones',
    zone: 'accessories',
    short: 'Kopfhörer',
    name: 'Kopfhörer mit Noise Cancelling',
    tagline: 'Ruhe auf Knopfdruck.',
    specs: ['Aktive Geräuschunterdrückung', 'Bis zu 30 Stunden Akku', 'Bluetooth und Kabel'],
  },
  {
    id: 'controller',
    zone: 'accessories',
    short: 'Controller',
    name: 'Wireless-Controller',
    tagline: 'Für PC, Konsole und Smartphone.',
    specs: ['Bluetooth und USB-C', 'Vibrationsmotoren', 'Bis zu 40 Stunden Akku'],
  },
  {
    id: 'charger',
    zone: 'accessories',
    short: 'Ladegerät',
    name: 'USB-C-Ladegerät, 65 W',
    tagline: 'Ein Netzteil für Laptop, Tablet und Smartphone.',
    specs: ['Schnellladen mit 65 W', 'Zwei USB-C-Anschlüsse', 'So klein wie ein Handy-Netzteil'],
  },
  {
    id: 'keyboard',
    zone: 'accessories',
    short: 'Tastatur',
    name: 'Mechanische Tastatur',
    tagline: 'Spürbarer Anschlag beim Tippen und Zocken.',
    specs: ['Mechanische Schalter', 'RGB-Beleuchtung', 'Abnehmbares USB-C-Kabel'],
  },
  {
    id: 'mouse',
    zone: 'accessories',
    short: 'Maus',
    name: 'Kabellose Gaming-Maus',
    tagline: 'Präzise und federleicht.',
    specs: ['Unter 70 g', 'Hochpräziser Sensor', 'Akku für bis zu 70 Stunden'],
  },
];
