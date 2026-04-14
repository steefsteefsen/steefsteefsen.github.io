/**
 * DOM structure tests — section visibility and content integrity
 *
 * Runs in jest-environment-jsdom. index.html is parsed into the global document.
 * Scripts are NOT executed — we only test static DOM structure.
 *
 * What we check:
 *   1. All required sections exist (#idols, #built-with, etc.)
 *   2. No <section> is permanently hidden via inline style
 *   3. No .reveal element has inline display:none
 *   4. #idols has .value-card elements
 *   5. No .value-card inside #idols has class="reveal" (Alpine.js conflict)
 *   6. Every .value-card in #idols has a non-empty <h3>
 *   7. Alpine x-data cards have a matching [x-collapse] element
 *   8. Specific idol names are present
 *   9. Alpine CDN scripts are present
 *  10. #built-with has tool cards and expected tools
 */

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

// Extract only the <body> innerHTML to avoid re-triggering script execution.
// jsdom's testEnvironment already provides a clean document — we just populate it.
beforeAll(() => {
  // Strip <script> tags so jsdom doesn't try to execute them (IntersectionObserver etc.)
  const stripped = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  document.documentElement.innerHTML = stripped;
});

// ── 1. Required sections ──────────────────────────────────────────────────────

const REQUIRED_SECTIONS = ['#idols', '#built-with', '#journey', '#contact', '#support'];

describe('required sections exist', () => {
  test.each(REQUIRED_SECTIONS)('%s is present in the DOM', (selector) => {
    expect(document.querySelector(selector)).not.toBeNull();
  });
});

// ── 2 & 3. No section/reveal permanently hidden via inline style ──────────────

describe('sections are not permanently hidden', () => {
  test('no <section> has inline display:none or visibility:hidden', () => {
    const hidden = Array.from(document.querySelectorAll('section')).filter(s => {
      const style = s.getAttribute('style') || '';
      return /display\s*:\s*none/i.test(style) || /visibility\s*:\s*hidden/i.test(style);
    });
    expect(hidden.map(s => '#' + s.id)).toEqual([]);
  });

  test('no .reveal element has inline display:none', () => {
    const broken = Array.from(document.querySelectorAll('.reveal')).filter(el => {
      return /display\s*:\s*none/i.test(el.getAttribute('style') || '');
    });
    expect(broken.length).toBe(0);
  });
});

// ── 4–8. Idols section ───────────────────────────────────────────────────────

describe('#idols section content', () => {
  let section;
  beforeAll(() => { section = document.querySelector('#idols'); });

  test('section exists', () => expect(section).not.toBeNull());

  test('contains at least one .value-card', () => {
    expect(section.querySelectorAll('.value-card').length).toBeGreaterThan(0);
  });

  test('no .value-card has class "reveal" (conflicts with Alpine.js x-show)', () => {
    const conflicting = Array.from(section.querySelectorAll('.value-card.reveal'));
    expect(conflicting.map(el => el.querySelector('h3')?.textContent)).toEqual([]);
  });

  test('every .value-card has a non-empty <h3>', () => {
    const missing = Array.from(section.querySelectorAll('.value-card')).filter(card => {
      const h3 = card.querySelector('h3');
      return !h3 || h3.textContent.trim() === '';
    });
    expect(missing.length).toBe(0);
  });

  test('every card with x-data has at least one [x-collapse] element', () => {
    const broken = Array.from(section.querySelectorAll('.value-card[x-data]')).filter(
      card => !card.querySelector('[x-collapse]')
    );
    expect(broken.map(el => el.querySelector('h3')?.textContent)).toEqual([]);
  });

  const EXPECTED_IDOLS = [
    'Linus Torvalds', 'Megaloh', 'SSIO', 'Neven Subotic',
    'Albert Einstein', 'Sokrates', 'Platon', 'Edward Snowden',
    'Jimmy Wales', 'Dalai Lama', 'Leonard Cohen', 'Paula Herber', 'Nina Simone',
  ];

  test.each(EXPECTED_IDOLS)('card for "%s" is present', (name) => {
    const found = Array.from(section.querySelectorAll('.value-card h3'))
      .some(h3 => h3.textContent.includes(name));
    expect(found).toBe(true);
  });
});

// ── 9. Idol grid mobile safety ───────────────────────────────────────────────
// grid-auto-rows:1fr collapses cards to zero height on mobile (1-column layout)

describe('#idols grid mobile safety', () => {
  test('#idols .values-grid does not use grid-auto-rows:1fr in CSS', () => {
    // Extract inline <style> blocks from raw HTML and check for the broken rule
    const styleBlocks = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
    const css = styleBlocks.map(b => b.replace(/<\/?style[^>]*>/gi, '')).join('\n');

    // Find the #idols .values-grid block and check it doesn't contain grid-auto-rows:1fr
    const idolsGridRule = css.match(/#idols\s+\.values-grid\s*\{([^}]*)\}/);
    if (idolsGridRule) {
      expect(idolsGridRule[1]).not.toMatch(/grid-auto-rows\s*:\s*1fr/);
    }
    // Also check globally — this rule is unsafe in any single-column context
    expect(css).not.toMatch(/#idols[^}]*grid-auto-rows\s*:\s*1fr/);
  });

  test('every .value-card in #idols has no inline height:0 or max-height:0', () => {
    const section = document.querySelector('#idols');
    const broken = Array.from(section.querySelectorAll('.value-card')).filter(card => {
      const style = card.getAttribute('style') || '';
      return /height\s*:\s*0/i.test(style) || /max-height\s*:\s*0/i.test(style);
    });
    expect(broken.length).toBe(0);
  });
});

// ── 10. Alpine CDN scripts present in raw HTML ────────────────────────────────
// (checked against raw HTML since scripts were stripped for DOM parsing)

describe('required scripts', () => {
  test('Alpine.js CDN script tag is present in HTML source', () => {
    expect(html).toMatch(/cdn\.jsdelivr\.net.*alpinejs/);
  });

  test('Alpine Collapse plugin script tag is present in HTML source', () => {
    expect(html).toMatch(/@alpinejs\/collapse/);
  });
});

// ── 11. Built-with section ────────────────────────────────────────────────────

describe('#built-with section content', () => {
  let section;
  beforeAll(() => { section = document.querySelector('#built-with'); });

  test('section exists', () => expect(section).not.toBeNull());

  test('contains at least one .tool-card', () => {
    expect(section.querySelectorAll('.tool-card').length).toBeGreaterThan(0);
  });

  const EXPECTED_TOOLS = ['DuckDNS', 'Ubuntu Server', 'Raspberry Pi', 'Python', 'GitLab'];

  test.each(EXPECTED_TOOLS)('tool card for "%s" is present', (name) => {
    const found = Array.from(section.querySelectorAll('h3'))
      .some(h => h.textContent.includes(name));
    expect(found).toBe(true);
  });
});
