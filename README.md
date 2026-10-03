# Nex Hardwareshop

Interaktive 3D-Landingpage für den (fiktiven) **Nex Hardwareshop**. Beim Scrollen geht die Kamera von der Straße durch die Ladentür in den Laden und zeigt nacheinander Smartphones, Tablets, PCs und Zubehör.

**Live ansehen:** https://nexxizz.github.io/Nex-Hardwareshop/

## Funktionen

- **3D-Rundgang beim Scrollen:** Ladenfront bei Tag, Schiebetür, Innenraum und vier Produkt-Zonen. Am Ende fährt die Kamera nach oben und zeigt den ganzen Laden.
- **Geräte erkunden:** Am PC per Mausbewegung über ein Gerät, auf dem Smartphone per Tippen. Eine Info-Karte zeigt Name, Kurzbeschreibung und Merkmale. Jede Zone hat zusätzlich Auswahl-Buttons.
- **Fortschrittsanzeige:** Stationen am Rand bzw. oben (Smartphone). Ein Klick springt direkt zur Station.
- **PC und Smartphone:** Kamera und Texttafeln passen sich an Quer- und Hochformat an.
- **Einfache Ansicht ohne 3D:** Erscheint automatisch ohne WebGL, wenn die 3D-Bibliothek nicht lädt oder bei „Bewegung reduzieren“. Lässt sich auch selbst wählen.
- **Automatische Qualitätsanpassung:** Läuft die Seite zu langsam, werden Nachleuchten, Auflösung und Schatten schrittweise reduziert.

Die Seite ist eine reine Präsentation: kein Warenkorb, keine Preise, keine Bestellungen.

## Technik

- [Three.js](https://threejs.org/) 0.169 für die 3D-Szene. Der Laden ist komplett im Code gebaut, ohne externe 3D-Modelle oder Fotos.
- [GSAP](https://gsap.com/) 3.12 mit ScrollTrigger für die Kamerafahrt.
- Reines HTML, CSS und JavaScript ohne Build-Schritt. Die Bibliotheken kommen per CDN (jsDelivr, cdnjs), die Schriften von Google Fonts.

## Dateien

| Datei | Inhalt |
|---|---|
| `index.html` | Seitengerüst, Texttafeln, Info-Karte, einfache Ansicht |
| `style.css` | Gestaltung aller Texte, Tafeln und der einfachen Ansicht |
| `boot.js` | Start: wählt zwischen 3D-Rundgang und einfacher Ansicht |
| `main.js` | Renderer, Kamera, Licht, Render-Schleife, Qualitätsanpassung |
| `shop.js` | Aufbau von Straße, Fassade, Innenraum und Zonen |
| `devices.js` | Materialien, Texturen und Gerätemodelle |
| `scroll.js` | Kamerapfad, Texttafeln und Fortschrittsanzeige |
| `interaction.js` | Hover/Tippen, Info-Karten und Auswahl-Buttons |
| `products.js` | Produktnamen, Beschreibungen und Merkmale |
| `static.js` | Einfache Ansicht ohne 3D |
| `PLAN.md` | Projektplan mit allen Entscheidungen |

## Produkte ändern

Alle Texte der Geräte stehen in [`products.js`](products.js). Name, Kurzbeschreibung und Merkmale lassen sich dort ändern, ohne die 3D-Szene anzufassen. Die Änderungen erscheinen im 3D-Rundgang und in der einfachen Ansicht.

Neue Geräte brauchen zusätzlich ein 3D-Modell und einen Platz in der Szene (`devices.js` und `shop.js`).

## Lokal starten

Die Seite nutzt JavaScript-Module und muss deshalb über einen lokalen Webserver laufen. Ein direktes Öffnen der `index.html` funktioniert nicht. Zum Beispiel mit Python:

```bash
python -m http.server 5173
```

Danach im Browser `http://localhost:5173` öffnen.

## Veröffentlichung

Die Seite läuft über **GitHub Pages** direkt aus dem Branch `main` (Ordner `/`). Jeder Push auf `main` geht nach ein bis zwei Minuten automatisch online. Die leere Datei `.nojekyll` sorgt dafür, dass GitHub die Dateien unverändert ausliefert.
