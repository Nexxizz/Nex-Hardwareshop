# Plan: Nex Hardwareshop – interaktive 3D-Landingpage

## Ziel
Eine Landingpage für **Nex Hardwareshop**. Beim Scrollen fliegt die Kamera von außen in einen
fiktiven, modern gestalteten Hardware-Laden hinein und durch dessen Bereiche. Dabei werden
PCs, Smartphones und Tablets präsentiert.

## Festgelegte Rahmenbedingungen
| Punkt | Entscheidung |
|---|---|
| Technik | Echte 3D-Szene (Ansatz A) mit Three.js |
| Optik | Modern und stilisiert statt fotorealistisch; Szene **bei Tag** (Sonne mit Schatten, heller Himmel), helle Fassade mit dunkler Schrifttafel, Neon nur als Akzent |
| Laden | Fiktiv, kein echtes Vorbild |
| Produkte | Gängige, oft verkaufte Geräte: Smartphones, Tablets, PCs/Laptops, etwas Zubehör |
| Kaufen | Nein, nur Präsentation (kein Warenkorb, keine Preise nötig) |
| Weitere Inhalte | Keine (kein Kontakt, keine Öffnungszeiten usw.) |
| Teilen | Vorschau-Link; öffentliches GitHub-Repository; Hosting später: Netlify oder GitHub Pages |
| Sprache | Deutsch |
| Geräte | PC (Desktop) und Smartphone, beide gleichwertig |

## Technischer Aufbau
- **Three.js**: 3D-Szene. Der Laden wird komplett im Code aus Geometrien, Materialien und
  Licht gebaut, es werden keine externen 3D-Modelle oder Fotos benötigt.
- **GSAP + ScrollTrigger**: Koppelt die Kamerafahrt an die Scroll-Position, mit sanftem
  Nachlaufen (Smooth Scroll).
- **Reines HTML/CSS/JS ohne Build-Schritt**: Die Bibliotheken kommen über CDN. So lässt sich
  die Seite direkt als Vorschau-Link veröffentlichen und später ohne Umbau auf
  Netlify/Vercel/eigener Domain hosten.
- **Produktdaten in einer eigenen Datei** (`products.js`): Namen und Kurzinfos lassen sich
  später leicht austauschen, ohne die 3D-Szene anzufassen.

Geplante Dateistruktur:
```
index.html      – Seitengerüst, Text-Overlays, Scroll-Abschnitte
style.css       – Typografie, Overlays, Info-Karten, responsive Anpassungen
main.js         – Szene, Kamera, Licht, Render-Loop
shop.js         – Aufbau des Ladens (Straße, Fassade, Raum, Zonen)
devices.js      – Materialien, Texturen und Gerätemodelle (Smartphones, Tablets, PCs, Zubehör)
scroll.js       – Kamerapfad und Scroll-Steuerung
interaction.js  – Hover/Tippen, Info-Karten und Auswahl-Buttons
products.js     – Produktdaten (Name, Kategorie, Kurzbeschreibung)
```

## Ablauf beim Scrollen (Szenen)
0. **Start (Hero)**: Außenansicht der Ladenfront bei Tag, leuchtender Schriftzug
   „NEX HARDWARESHOP“, kurzer Slogan und der Hinweis „Scrollen zum Eintreten“.
1. **Annäherung**: Die Kamera fährt auf die Glastür zu, die Tür gleitet auf.
2. **Eingang**: Blick in den Laden mit Begrüßungstheke und Lichtleisten. Kurzer Text, was
   Nex Hardwareshop ausmacht.
3. **Smartphone-Zone**: Präsentationstisch mit mehreren Smartphones, die leicht schweben bzw.
   rotieren. Dazu Infokarten.
4. **Tablet-Zone**: Tablets auf Ständern, eines mit Stift und Tastatur-Cover.
5. **PC- & Gaming-Zone**: Gaming-PC mit RGB-Beleuchtung und Glasseitenteil, Monitore,
   Laptops.
6. **Zubehör-Wand**: Kopfhörer, Tastaturen, Mäuse und Controller an einer beleuchteten Wand.
7. **Abschluss**: Die Kamera zieht sich zurück und zeigt den ganzen Laden von oben.
   Abschluss-Slogan mit „Nach oben“.

## Interaktivität
- **Scrollen** steuert die Kamerafahrt, auch rückwärts.
- **Hover (PC) / Tippen (Smartphone)** auf ein Gerät: Es wird hervorgehoben und eine Info-Karte
  erscheint (Name, 2–3 Merkmale).
- **Fortschrittsanzeige** am Rand mit den Zonen. Ein Klick darauf springt zur jeweiligen Zone.
- Leichte **Maus-/Neigungs-Parallaxe**: Die Kamera folgt dem Mauszeiger minimal, damit sich
  der Raum lebendig anfühlt.

## Produkte (Platzhalter, später austauschbar)
Die Geräte werden **generisch** dargestellt, ohne Markenlogos in 3D. Die Texte nennen gängige
Gerätetypen:
- **Smartphones**: Flaggschiff-Smartphone, Mittelklasse-Smartphone, Foldable,
  Kompakt-Smartphone
- **Tablets**: Profi-Tablet mit Stift, Alltags-Tablet, Kinder- bzw. Einsteiger-Tablet
- **PCs/Laptops**: Gaming-PC, Office-PC, Ultrabook, Gaming-Laptop, Monitore
- **Zubehör**: Kopfhörer, Tastatur, Maus, Controller, Ladegeräte

Konkrete Marken- und Modellnamen können später in `products.js` eingetragen werden.

## Performance & Smartphone-Optimierung
- Begrenzte Pixeldichte (max. 2) und auf Mobilgeräten vereinfachte Effekte: weniger Lichter,
  keine Echtzeit-Schatten.
- Licht wo möglich „vorgetäuscht“ (leuchtende Materialien statt vieler echter Lichtquellen).
- Die Kamerafahrt ist auf Hochformat angepasst: Die Kamera bleibt weiter weg bzw. hat ein
  größeres Sichtfeld, damit die Zonen ganz zu sehen sind.
- Ladebildschirm mit Fortschritt, bis die Szene steht.
- Fallback für Geräte ohne WebGL sowie bei „Bewegung reduzieren“: Statt der 3D-Fahrt
  erscheinen statische Abschnitte mit Text.

## Umsetzung in Etappen
1. **Prototyp**: Szenen 0–2 (Fassade, Tür, Eingang) mit funktionierender Scroll-Kamerafahrt.
   Danach folgt ein Vorschau-Link zum Abnehmen von Optik und Gefühl.
2. **Shop-Zonen**: Szenen 3–6 mit Geräten, Info-Karten und Hover/Tippen.
3. **Abschluss & Feinschliff**: Szene 7, Fortschrittsanzeige, Animationen, Ladebildschirm.
4. **Optimierung**: Test auf Desktop und Smartphone-Größe, Performance-Feintuning, Fallback.
5. **Veröffentlichung**: Hosting wählen (Netlify oder GitHub Pages), online stellen, Link teilen.

## Vorschau-Link & Hosting
- **Während der Entwicklung**: Vorschau als privates Artifact auf claude.ai zum Abstimmen.
- **Repository**: Wird als **öffentliches** GitHub-Repository angelegt (Demo-Seite).
- **Hosting**: Entscheidung **später** zwischen **Netlify** und **GitHub Pages**.
  - Netlify: Adresse `….netlify.app` ohne GitHub-Name, Gratis-Tarif auch für kommerzielle
    Nutzung erlaubt.
  - GitHub Pages: Adresse `<github-name>.github.io/<repo>/`, der GitHub-Name ist also
    sichtbar. Bei einem öffentlichen Repository kostenlos.
- **Vorbereitung, damit beides ohne Umbau geht**:
  - Nur relative Pfade verwenden (wichtig für den Unterordner bei GitHub Pages).
  - Kein Build-Schritt, Bibliotheken über CDN.
- **Datenschutz beim öffentlichen Repository** (vor dem ersten Commit erledigen):
  - In GitHub unter Settings → Emails „Keep my email addresses private“ aktivieren und für
    Commits die `…@users.noreply.github.com`-Adresse verwenden.
  - Keine Passwörter, Schlüssel oder privaten Daten ins Repository.
- Hinweis: Der Code, den der Browser lädt (HTML/CSS/JS), ist bei jeder Website einsehbar.
  Das öffentliche Repository macht zusätzlich die Commit-Historie und den GitHub-Account
  sichtbar.
