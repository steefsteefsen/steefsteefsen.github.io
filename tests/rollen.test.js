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

  // Pull out only the initRollen IIFE — running the full inline JS in
  // jsdom triggers IntersectionObserver, AudioContext etc. that we
  // don't need for this test.
  const inline = Array.from(document.querySelectorAll('script'))
    .map(s => s.textContent)
    .join('\n');
  const m = inline.match(/\(function initRollen\(\)[\s\S]*?\}\)\(\);/);
  if (!m) throw new Error('initRollen IIFE not found in index.html');
  const script = document.createElement('script');
  script.textContent = m[0];
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

  test('pointerdown on a zone marks it active', () => {
    const zones = document.querySelectorAll('#rollen-zones .rollen-zone');
    zones[2].dispatchEvent(new Event('pointerdown'));
    expect(zones[2].classList.contains('active')).toBe(true);
    expect(zones[0].classList.contains('active')).toBe(false);
  });

  test('caption updates on click and Täter-zone carries the Vorverurteilung framing', () => {
    const zones = document.querySelectorAll('#rollen-zones .rollen-zone');
    const cap = document.getElementById('rollen-caption');
    zones[2].dispatchEvent(new Event('pointerdown'));
    expect(cap.textContent.toLowerCase()).toMatch(/vorverurteil|schnapp/);
  });

  test('clicking another zone moves the active class', () => {
    const zones = document.querySelectorAll('#rollen-zones .rollen-zone');
    zones[1].dispatchEvent(new Event('pointerdown'));
    expect(zones[1].classList.contains('active')).toBe(true);
    zones[0].dispatchEvent(new Event('pointerdown'));
    expect(zones[0].classList.contains('active')).toBe(true);
    expect(zones[1].classList.contains('active')).toBe(false);
  });
});
