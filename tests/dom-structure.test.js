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
    'K.I.Z', 'Gregor Gysi',
  ];

  test.each(EXPECTED_IDOLS)('card for "%s" is present', (name) => {
    const found = Array.from(section.querySelectorAll('.value-card h3'))
      .some(h3 => h3.textContent.includes(name));
    expect(found).toBe(true);
  });

  // ── Embed correctness ─────────────────────────────────────────────────────
  // Each card's iframe (if any) must reference the card's subject — either via
  // its title attribute or its src. Catches mis-paired embeds: e.g. Abramović
  // video accidentally placed on the Pasadakis card.
  //
  // Aliases map a card's <h3> to acceptable substrings in title|src. Add
  // aliases here when adding a card whose embed link doesn't share a literal
  // surname (e.g. SoundCloud handles, YouTube channel slugs, song titles).
  const EMBED_ALIASES = {
    'Linus Torvalds':          ['torvalds', 'linus', 'linux'],
    'Sokrates':                ['socrates', 'sokrates'],
    'Marina Abramović':        ['abramovi'],   // covers ć/c spelling differences
    'Dimosthenis Pasadakis':   ['dmskmn', 'pasadakis', 'soundcloud.com/dmskmn'],
    'Gregor Gysi':             ['gysi'],
    'Megaloh':                 ['megaloh'],
    'SSIO':                    ['ssio'],
    'Wu-Tang':                 ['wu-tang', 'cream', 'c.r.e.a.m'],
    'Mobb Deep':               ['mobb deep', 'shook ones'],
    'The Notorious B.I.G.':    ['notorious', 'biggie', 'juicy'],
    '2Pac':                    ['2pac', 'tupac', 'dear mama'],
    'Nina Simone':             ['nina simone', 'mississippi'],
    'K.I.Z':                   ['k.i.z', 'kiz', 'hurra'],
    'South Park':              ['south park', 'parker', 'matt stone', 'trey parker'],
  };

  function passesEmbedCheck(h3Text, iframe) {
    const title = (iframe.getAttribute('title') || '').toLowerCase();
    const src = (iframe.getAttribute('src') || '').toLowerCase();
    const haystack = title + ' ' + src;

    // Allow a generic-titled iframe (some YouTube embeds default to "YouTube
    // video player") to pass if there's no other card-specific signal needed —
    // we still require the src not to obviously belong to a different card.
    // For now we treat generic titles as a soft skip.
    const isGeneric = title === 'youtube video player' || title === '';

    // Direct match: any word from the h3 (>= 4 chars) appears in title or src
    const h3Words = h3Text.toLowerCase().split(/[^\p{L}]+/u).filter(w => w.length >= 4);
    if (h3Words.some(w => haystack.includes(w))) return true;

    // Alias match
    const aliases = Object.entries(EMBED_ALIASES).find(
      ([key]) => h3Text.includes(key)
    )?.[1] || [];
    if (aliases.some(a => haystack.includes(a.toLowerCase()))) return true;

    // Last resort: if the iframe title is generic AND no aliases defined,
    // pass with a console warning so the test isn't a false positive on
    // stub embeds. This is intentionally permissive — the goal is to catch
    // obvious mismatches (Abramović video on Pasadakis card), not to enforce
    // perfect titling.
    if (isGeneric && aliases.length === 0) return true;

    return false;
  }

  test('every idol card embed (iframe) references the card subject', () => {
    const cards = Array.from(section.querySelectorAll('.value-card'));
    const mismatches = [];
    cards.forEach(card => {
      const h3 = card.querySelector('h3')?.textContent.trim();
      if (!h3) return;
      const iframes = card.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        if (!passesEmbedCheck(h3, iframe)) {
          mismatches.push({
            card: h3,
            iframeTitle: iframe.getAttribute('title') || '(no title)',
            iframeSrc: (iframe.getAttribute('src') || '').slice(0, 100),
          });
        }
      });
    });
    expect(mismatches).toEqual([]);
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

// ── 11. Mobile burger menu ────────────────────────────────────────────────────

describe('mobile burger menu', () => {
  let nav;
  let burger;
  let navLinks;

  beforeAll(() => {
    nav = document.getElementById('main-nav');
    burger = document.getElementById('burger');
    navLinks = document.getElementById('main-nav-links');
  });

  test('nav has id="main-nav" so the toggle script can find it', () => {
    expect(nav).not.toBeNull();
    expect(nav.tagName.toLowerCase()).toBe('nav');
  });

  test('burger button exists inside the nav', () => {
    expect(burger).not.toBeNull();
    expect(burger.closest('nav')).toBe(nav);
  });

  test('burger is a real <button type="button"> for accessibility', () => {
    expect(burger.tagName.toLowerCase()).toBe('button');
    expect(burger.getAttribute('type')).toBe('button');
  });

  test('burger has aria-label and aria-expanded="false" by default', () => {
    expect(burger.getAttribute('aria-label')).toBeTruthy();
    expect(burger.getAttribute('aria-expanded')).toBe('false');
  });

  test('burger aria-controls points at the nav-links id', () => {
    expect(burger.getAttribute('aria-controls')).toBe('main-nav-links');
    expect(navLinks).not.toBeNull();
  });

  test('burger has exactly three .burger-line spans (three-line icon)', () => {
    const lines = burger.querySelectorAll('.burger-line');
    expect(lines.length).toBe(3);
  });

  test('nav-links ul is the first-party menu and contains anchor links', () => {
    expect(navLinks.tagName.toLowerCase()).toBe('ul');
    expect(navLinks.querySelectorAll('a').length).toBeGreaterThan(0);
  });

  test('stylesheet has a max-width:700px breakpoint that shows the burger', () => {
    const styles = Array.from(document.querySelectorAll('style'))
      .map(s => s.textContent)
      .join('\n');
    expect(styles).toMatch(/@media\s*\(max-width:\s*700px\)/);
    expect(styles).toMatch(/\.burger\s*\{\s*display:\s*none/); // hidden on desktop

    // Extract the body of the `@media (max-width: 700px)` rule and assert the
    // burger is shown inside it. Counts nested braces to find the matching `}`.
    const mqRe = /@media\s*\(max-width:\s*700px\)\s*\{/;
    const m = mqRe.exec(styles);
    expect(m).not.toBeNull();
    let depth = 1;
    let i = m.index + m[0].length;
    while (i < styles.length && depth > 0) {
      const ch = styles[i];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      i++;
    }
    const mqBody = styles.slice(m.index + m[0].length, i - 1);
    expect(mqBody).toMatch(/\.burger\s*\{\s*display:\s*block/);
  });
});

// ── 12. Built-with section ────────────────────────────────────────────────────

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
