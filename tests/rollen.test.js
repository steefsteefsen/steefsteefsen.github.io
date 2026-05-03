/**
 * @jest-environment jsdom
 *
 * Rollen-Card structural test — runs in jsdom.
 *
 * jsdom doesn't render layout (so we can't test the physics simulation
 * itself — that would need puppeteer), but it WILL run the inline
 * <script> wiring, which lets us assert:
 *   - the section, three zones, and ball are present
 *   - each zone is keyboard-accessible (role=button, tabindex)
 *   - clicking a zone marks it active and updates the caption
 *   - the caption text carries the "schnapp-haft = Vorverurteilung"
 *     framing on the perpetrator zone
 *
 * Layout-dependent assertions (ball at correct x position) live for
 * a future puppeteer test — see tests/wip/ pattern.
 */

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

beforeEach(() => {
  document.documentElement.innerHTML = html
    .replace(/^[\s\S]*?<body\b[^>]*>/i, '')
    .replace(/<\/body>[\s\S]*$/i, '');

  // Karte 1 (rosa Ball) ist Firefox-only via 'MozAppearance' in
  // documentElement.style. jsdom hat keine Vendor-Prefixes — wir setzen
  // die Eigenschaft manuell, damit der Init-Code als "in Firefox" durchläuft.
  if (!('MozAppearance' in document.documentElement.style)) {
    Object.defineProperty(document.documentElement.style, 'MozAppearance', {
      value: '', writable: true, configurable: true,
    });
  }

  // Pull out only the initRollen IIFE — running the full inline JS in
  // jsdom triggers IntersectionObserver, AudioContext etc. that we
  // don't need for this test.
  const inline = Array.from(document.querySelectorAll('script'))
    .map(s => s.textContent)
    .join('\n');
  const mRollen = inline.match(/\(function initRollen\(\)[\s\S]*?\}\)\(\);/);
  if (!mRollen) throw new Error('initRollen IIFE not found in index.html');
  const mMeta = inline.match(/\(function initMeta\(\)[\s\S]*?\}\)\(\);/);
  if (!mMeta) throw new Error('initMeta IIFE not found in index.html');
  const script = document.createElement('script');
  script.textContent = mRollen[0] + '\n' + mMeta[0];
  document.head.appendChild(script);
});

describe('Rollen-Card — DOM and JS wiring', () => {
  test('#rollen section exists', () => {
    expect(document.querySelector('#rollen')).not.toBeNull();
  });

  test('exactly three zones present (Held / Opfer / Täter)', () => {
    const zones = document.querySelectorAll('#rollen-zones .rollen-zone');
    expect(zones.length).toBe(3);
    const labels = Array.from(zones).map(z => z.textContent.trim());
    expect(labels).toEqual(['Held', 'Opfer', 'Täter']);
  });

  test('silberner ball element is present', () => {
    expect(document.getElementById('rollen-ball')).not.toBeNull();
  });

  test('each zone is keyboard-accessible (role=button, tabindex=0)', () => {
    const zones = document.querySelectorAll('#rollen-zones .rollen-zone');
    zones.forEach(z => {
      expect(z.getAttribute('role')).toBe('button');
      expect(z.getAttribute('tabindex')).toBe('0');
    });
  });

  test('pointerdown on Opfer (idx 1) marks it active', () => {
    const zones = document.querySelectorAll('#rollen-zones .rollen-zone');
    zones[1].dispatchEvent(new Event('pointerdown'));
    expect(zones[1].classList.contains('active')).toBe(true);
  });

  test('pointerdown on Täter (idx 2) marks it active and caption carries Vorverurteilung framing', () => {
    const zones = document.querySelectorAll('#rollen-zones .rollen-zone');
    const cap = document.getElementById('rollen-caption');
    zones[2].dispatchEvent(new Event('pointerdown'));
    expect(zones[2].classList.contains('active')).toBe(true);
    expect(cap.textContent.toLowerCase()).toMatch(/vorverurteil|schnapp/);
  });

  test('Held (idx 0) refuses: no active class on Held, caption says "verdient"', () => {
    const zones = document.querySelectorAll('#rollen-zones .rollen-zone');
    const cap = document.getElementById('rollen-caption');
    // Klick auf Held darf NIEMALS die active-Klasse setzen.
    zones[0].dispatchEvent(new Event('pointerdown'));
    expect(zones[0].classList.contains('active')).toBe(false);
    // Caption MUSS aber die Verweigerungs-Pointe zeigen.
    expect(cap.textContent.toLowerCase()).toMatch(/verdient|nicht zuschnap/);
  });

  test('Held click after Opfer/Täter clears active without snapping', () => {
    const zones = document.querySelectorAll('#rollen-zones .rollen-zone');
    zones[2].dispatchEvent(new Event('pointerdown'));
    expect(zones[2].classList.contains('active')).toBe(true);
    zones[0].dispatchEvent(new Event('pointerdown'));
    // Held klickt → kein neues active gesetzt, alte active geräumt.
    expect(zones[0].classList.contains('active')).toBe(false);
    expect(zones[1].classList.contains('active')).toBe(false);
    expect(zones[2].classList.contains('active')).toBe(false);
  });

  test('refuse class is added to ball on Held click (jsdom can verify class toggle)', () => {
    const zones = document.querySelectorAll('#rollen-zones .rollen-zone');
    const ball  = document.getElementById('rollen-ball');
    zones[0].dispatchEvent(new Event('pointerdown'));
    expect(ball.classList.contains('refuse')).toBe(true);
  });
});

describe('Rollen-Card — Firefox-only gate', () => {
  test('rollen-card-1 markup carries display:none default (so non-Firefox stays hidden)', () => {
    // Read raw HTML rather than the live DOM (since beforeEach faked Firefox
    // detection, the live element will have its inline style cleared).
    expect(html).toMatch(/<div class="rollen-card" id="rollen-card-1" style="display:none;"/);
  });
});

describe('Metabolisierungs-Karte (JuJoVa) — DOM and JS wiring', () => {
  test('three meta-zones present (roh / metabolisiert / verstanden)', () => {
    const zones = document.querySelectorAll('#meta-zones .meta-zone');
    expect(zones.length).toBe(3);
    const labels = Array.from(zones).map(z => z.textContent.trim());
    expect(labels).toEqual(['roh', 'metabolisiert', 'verstanden']);
  });

  test('silberner drop element is present', () => {
    expect(document.getElementById('meta-drop')).not.toBeNull();
  });

  test('meta zones are keyboard-accessible', () => {
    const zones = document.querySelectorAll('#meta-zones .meta-zone');
    zones.forEach(z => {
      expect(z.getAttribute('role')).toBe('button');
      expect(z.getAttribute('tabindex')).toBe('0');
    });
  });

  test('pointerdown on meta-zone marks it active and applies phase class', () => {
    const zones = document.querySelectorAll('#meta-zones .meta-zone');
    const drop = document.getElementById('meta-drop');
    zones[2].dispatchEvent(new Event('pointerdown'));
    expect(zones[2].classList.contains('active')).toBe(true);
    expect(drop.classList.contains('phase-2')).toBe(true);
    expect(drop.classList.contains('phase-0')).toBe(false);
  });

  test('caption updates on click and verstanden-zone carries the time framing', () => {
    const zones = document.querySelectorAll('#meta-zones .meta-zone');
    const cap = document.getElementById('meta-caption');
    zones[2].dispatchEvent(new Event('pointerdown'));
    expect(cap.textContent.toLowerCase()).toMatch(/gedauert|nötig|verstanden/);
  });

  test('VaJoJuA attribution (Vale, Jojo, Julia, Ariane) is present in the meta card', () => {
    const card = document.querySelector('.rollen-card--meta');
    expect(card).not.toBeNull();
    const attr = card.querySelector('.rollen-attribution');
    expect(attr.textContent).toMatch(/Vale.*Jojo.*Julia.*Ariane|VaJoJuA/);
  });
});
