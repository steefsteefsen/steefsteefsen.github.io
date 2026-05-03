/**
 * @jest-environment jsdom
 *
 * Red-Flag Easter-Egg structural test — runs in jsdom because
 * the headless-chrome path in this sandbox is unreliable.
 *
 * jsdom won't render CSS animations or fire real :hover effects,
 * but it WILL run the inline <script> that wires the JS handlers,
 * so we can:
 *   - confirm the .scroll-hint exists and has data-flag-stage="1"
 *   - dispatch a synthetic pointerdown and check the attribute moves
 *     to "2", "3", "3" (capped); pointerleave does NOT reset
 *   - confirm the .red-flag SVG exists with the carnation paths
 *   - confirm the flag-pulse class is added on each escalation
 *
 * Trigger is pointerdown (not mouseenter) — funktioniert auf
 * Maus *und* Touch in einem Listener (Mobile-Support).
 *
 * If this passes and the user still sees no visual change in the
 * real browser, the bug is in CSS rendering, not in the JS.
 */

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

beforeEach(() => {
  // Build a fresh DOM with the inline <script> blocks evaluated.
  // jsdom's testEnvironment gives us document; we replace its content.
  document.documentElement.innerHTML = html
    // strip the <html> and <body> wrapper since we are already inside them
    .replace(/^[\s\S]*?<body\b[^>]*>/i, '')
    .replace(/<\/body>[\s\S]*$/i, '');

  // We only need the Easter-Egg snippet, not the rest of the page's
  // inline JS (mobile burger etc. fail in jsdom because they expect
  // DOM nodes that the structural test doesn't care about).
  // Pull the initRedFlag IIFE out of index.html by content match.
  const inline = Array.from(document.querySelectorAll('script'))
    .map(s => s.textContent)
    .join('\n');
  const m = inline.match(/\(function initRedFlag\(\)[\s\S]*?\}\)\(\);/);
  if (!m) throw new Error('initRedFlag IIFE not found in index.html');
  const script = document.createElement('script');
  script.textContent = m[0];
  document.head.appendChild(script);
});

describe('red flag — DOM and JS wiring', () => {
  test('.scroll-hint exists in the DOM', () => {
    expect(document.querySelector('.scroll-hint')).not.toBeNull();
  });

  test('.scroll-hint starts with data-flag-stage="1"', () => {
    const hint = document.querySelector('.scroll-hint');
    expect(hint.getAttribute('data-flag-stage')).toBe('1');
  });

  test('.red-flag svg has both pole and cloth (with carnation)', () => {
    const flag = document.querySelector('.scroll-hint .red-flag svg');
    expect(flag).not.toBeNull();
    expect(flag.querySelector('.pole')).not.toBeNull();
    expect(flag.querySelector('.cloth')).not.toBeNull();
    // carnation = circles + paths inside the cloth group
    const carnationParts = flag.querySelectorAll('.cloth circle, .cloth path');
    // 1 cloth path + carnation petals + leaves should be > 3 elements
    expect(carnationParts.length).toBeGreaterThan(3);
  });

  test('first trigger stays at stage 1, second -> 2, third -> 3, capped', () => {
    const hint = document.querySelector('.scroll-hint');
    const trigger = () => hint.dispatchEvent(new Event('pointerdown'));

    trigger();
    expect(hint.getAttribute('data-flag-stage')).toBe('1');
    trigger();
    expect(hint.getAttribute('data-flag-stage')).toBe('2');
    trigger();
    expect(hint.getAttribute('data-flag-stage')).toBe('3');
    trigger();
    expect(hint.getAttribute('data-flag-stage')).toBe('3'); // capped
  });

  test('pointerleave does NOT reset (Pianosa: state persists for the tab lifetime)', () => {
    const hint = document.querySelector('.scroll-hint');
    hint.dispatchEvent(new Event('pointerdown'));
    hint.dispatchEvent(new Event('pointerdown'));
    expect(hint.getAttribute('data-flag-stage')).toBe('2');
    hint.dispatchEvent(new Event('pointerleave'));
    expect(hint.getAttribute('data-flag-stage')).toBe('2');
  });

  test('escalation adds flag-pulse class on the .red-flag', () => {
    const hint = document.querySelector('.scroll-hint');
    const flag = hint.querySelector('.red-flag');
    flag.classList.remove('flag-pulse');
    hint.dispatchEvent(new Event('pointerdown'));
    expect(flag.classList.contains('flag-pulse')).toBe(true);
  });

  test('toggle off via #flag-toggle hides the flag and disables the trigger', () => {
    const hint = document.querySelector('.scroll-hint');
    const toggle = document.getElementById('flag-toggle');
    expect(toggle).not.toBeNull();
    expect(toggle.getAttribute('aria-pressed')).toBe('true'); // default on
    expect(document.body.classList.contains('flag-off')).toBe(false);

    toggle.click();
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(document.body.classList.contains('flag-off')).toBe(true);

    // Trigger after off — stage must NOT bump
    const before = hint.getAttribute('data-flag-stage');
    hint.dispatchEvent(new Event('pointerdown'));
    expect(hint.getAttribute('data-flag-stage')).toBe(before);
  });
});
