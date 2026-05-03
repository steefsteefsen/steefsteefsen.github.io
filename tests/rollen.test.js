/**
 * @jest-environment jsdom
 *
 * Rollen-Card structural test — runs in jsdom.
 *
 * Karte 1 (Held / Opfer / Täter): hover-based emoji reveal.
 *   - Hover Täter → 🙏 (sorry)
 *   - Hover Opfer → 🖕 (Mittelfinger — Würde, nicht Vorverurteilung)
 *   - Hover Held → kein Emoji (Held lässt sich nicht zuteilen)
 *   - Caption updatet bei Hover/Focus für a11y.
 *
 * Karte 2 (JuJoVa = Vale, Jojo, Julia, Ariane): Tropfen morpht durch
 * drei Phasen roh / metabolisiert / verstanden.
 */

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

beforeEach(() => {
  document.documentElement.innerHTML = html
    .replace(/^[\s\S]*?<body\b[^>]*>/i, '')
    .replace(/<\/body>[\s\S]*$/i, '');

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

describe('Rollen-Card — Emoji-Hover (Karte 1)', () => {
  test('#rollen section exists', () => {
    expect(document.querySelector('#rollen')).not.toBeNull();
  });

  test('exactly three zones present (Held / Opfer / Täter)', () => {
    const labels = Array.from(document.querySelectorAll('#rollen-zones .rollen-zone .rollen-label'))
      .map(el => el.textContent.trim());
    expect(labels).toEqual(['Held', 'Opfer', 'Täter']);
  });

  test('Held zone carries no emoji (data-emoji=""); Opfer = 🖕; Täter = 🙏', () => {
    const zones = document.querySelectorAll('#rollen-zones .rollen-zone');
    expect(zones[0].getAttribute('data-emoji')).toBe('');
    expect(zones[1].getAttribute('data-emoji')).toBe('🖕');
    expect(zones[2].getAttribute('data-emoji')).toBe('🙏');
  });

  test('emoji <span> is empty for Held, non-empty for Opfer + Täter', () => {
    const zones = document.querySelectorAll('#rollen-zones .rollen-zone');
    expect(zones[0].querySelector('.rollen-emoji').textContent.trim()).toBe('');
    expect(zones[1].querySelector('.rollen-emoji').textContent.trim()).toBe('🖕');
    expect(zones[2].querySelector('.rollen-emoji').textContent.trim()).toBe('🙏');
  });

  test('each zone is keyboard-focusable (tabindex=0)', () => {
    document.querySelectorAll('#rollen-zones .rollen-zone').forEach(z => {
      expect(z.getAttribute('tabindex')).toBe('0');
    });
  });

  test('mouseenter on Täter sets caption with sorry/Entschuldigung framing', () => {
    const zones = document.querySelectorAll('#rollen-zones .rollen-zone');
    const cap = document.getElementById('rollen-caption');
    zones[2].dispatchEvent(new Event('mouseenter'));
    expect(cap.textContent.toLowerCase()).toMatch(/sorry|entschuldigung|hände/);
  });

  test('mouseenter on Opfer sets caption with Würde/Mittelfinger framing', () => {
    const zones = document.querySelectorAll('#rollen-zones .rollen-zone');
    const cap = document.getElementById('rollen-caption');
    zones[1].dispatchEvent(new Event('mouseenter'));
    expect(cap.textContent.toLowerCase()).toMatch(/würde|mittelfinger|vorverurteil/);
  });

  test('mouseenter on Held sets caption with verdient/zuteilen framing', () => {
    const zones = document.querySelectorAll('#rollen-zones .rollen-zone');
    const cap = document.getElementById('rollen-caption');
    zones[0].dispatchEvent(new Event('mouseenter'));
    expect(cap.textContent.toLowerCase()).toMatch(/verdient|zuteilen|keine antwort/);
  });

  test('mouseleave clears the caption', () => {
    const zones = document.querySelectorAll('#rollen-zones .rollen-zone');
    const cap = document.getElementById('rollen-caption');
    zones[2].dispatchEvent(new Event('mouseenter'));
    expect(cap.textContent.length).toBeGreaterThan(0);
    zones[2].dispatchEvent(new Event('mouseleave'));
    expect(cap.textContent).toBe('');
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
