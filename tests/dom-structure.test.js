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
    'Tschaikowski':            ['tchaikovsky', 'tschaikowski', 'symphony no. 4'],
    'O/Y':                     ['oh_why', 'live im salon', 'soundcloud.com/oh_why'],
    // Anonymised stage-name cards — embed src / soundcloud handle is the
    // identifier, h3 only carries a role description.
    'norwegischer Künstler':   ['katongo', 'soundcloud.com/katongo'],
    'Berliner Produzent':      ['oh_why', 'soundcloud-embed', 'live im salon'],
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

  const EXPECTED_TOOLS = ['DuckDNS', 'Ubuntu Server', 'Raspberry Pi', 'Python', 'GitLab', 'OpenStreetMap'];

  test.each(EXPECTED_TOOLS)('tool card for "%s" is present', (name) => {
    const found = Array.from(section.querySelectorAll('h3'))
      .some(h => h.textContent.includes(name));
    expect(found).toBe(true);
  });
});

// ── 13. Footnote numbering ────────────────────────────────────────────────────
// Catches drift between in-text <sup class="fn">N</sup> markers and the
// auto-numbered <li> entries in <section class="footnotes">. The <ol> renders
// li #1 as "1.", li #2 as "2.", etc. — so a <sup>N</sup> is *meaningful* only
// if the Nth <li> exists, and an <li> without any matching <sup> is orphaned.

describe('footnote numbering', () => {
  let supNumbers;
  let liCount;

  beforeAll(() => {
    supNumbers = Array.from(document.querySelectorAll('sup.fn'))
      .map(sup => parseInt(sup.textContent.trim(), 10))
      .filter(n => Number.isFinite(n));
    const footnoteSection = document.querySelector('section.footnotes ol');
    liCount = footnoteSection ? footnoteSection.querySelectorAll(':scope > li').length : 0;
  });

  test('<section class="footnotes"><ol> exists', () => {
    expect(document.querySelector('section.footnotes ol')).not.toBeNull();
  });

  test('every in-text <sup class="fn">N</sup> points to an existing <li> (N <= li count)', () => {
    const broken = supNumbers.filter(n => n < 1 || n > liCount);
    expect(broken).toEqual([]);
  });

  test('every <li> in footnotes is referenced by at least one <sup> (no orphans)', () => {
    const referenced = new Set(supNumbers);
    const orphans = [];
    for (let i = 1; i <= liCount; i++) {
      if (!referenced.has(i)) orphans.push(i);
    }
    expect(orphans).toEqual([]);
  });

  test('<sup> markers are contiguous starting at 1 (no gaps)', () => {
    const referenced = new Set(supNumbers);
    const max = Math.max(0, ...referenced);
    const gaps = [];
    for (let i = 1; i <= max; i++) {
      if (!referenced.has(i)) gaps.push(i);
    }
    expect(gaps).toEqual([]);
  });
});

// ── 14. Tier-2 (private person) privacy rule ─────────────────────────────────
// Per CLAUDE.md "Privacy rule for third parties": a card whose subject is a
// Tier-2 (private) person may only link to SoundCloud. No LinkedIn, Instagram,
// Bandcamp, personal websites, etc. — even if the person publishes themselves
// on those platforms. The site only points at SoundCloud.
//
// Add a stage name here when a new private-person card is added. Public-
// interest people (Tier 1) are not listed and are not subject to this check.

describe('tier-2 privacy rule', () => {
  // Stage names of private persons whose cards must link to SoundCloud only.
  // Match is by exact <h3> textContent, normalised for whitespace and the
  // " — der Friedensfürst" / " — joy frempong" style suffix that some cards use.
  const TIER_2_STAGE_NAMES = [
    'Greyscale',
    'REYNEKE',
    'S. Bass',
    'ciao 3lla',
    'O/Y',
    'Skinny Shef',
    'Mira',
  ];

  function findCardByH3(stageName) {
    const cards = Array.from(document.querySelectorAll('.support-card, .value-card'));
    return cards.find(card => {
      const h3 = card.querySelector('h3')?.textContent.trim() || '';
      return h3 === stageName || h3.startsWith(stageName + ' ') || h3.startsWith(stageName + ' —');
    });
  }

  test.each(TIER_2_STAGE_NAMES)('Tier-2 card "%s": every <a href> is a soundcloud.com link (or no link)', (stageName) => {
    const card = findCardByH3(stageName);
    if (!card) return; // card may not exist yet — soft skip rather than fail
    const links = Array.from(card.querySelectorAll('a[href]'));
    const offending = links
      .map(a => a.getAttribute('href'))
      .filter(href => {
        // Allow only soundcloud.com links. Block everything else, including
        // intra-page docs links, instagram, linkedin, bandcamp, custom domains.
        if (/^https?:\/\/(www\.)?soundcloud\.com\//i.test(href)) return false;
        // Embedded SoundCloud player iframe href is fine if encoded as a SC URL —
        // but those live in <iframe src>, not <a href>, so we don't see them here.
        return true;
      });
    expect({ stageName, offending }).toEqual({ stageName, offending: [] });
  });
});

// ── 15. Banned-string sweep (private surnames already scrubbed) ──────────────
// If any of these reappear in index.html or i18n.js, the privacy rule was
// violated. Add a name here whenever a private-person mention is removed,
// so reintroduction triggers a CI failure.

describe('banned-string sweep', () => {
  const BANNED_PRIVATE_REFERENCES = [
    // Skinny Shef's real first name and a private collaborator he was named with
    'Siggi aufgehört',
    'Timi Hendrix',
    // Karibik nickname previously named teammate
    'Vergeben von Torben',
    'Given by Torben',
    // Landstreicher nickname previously named mentors
    'Vergeben von Boris',
    'Given by Boris',
    'Boris &amp; Uwe',
    'Boris & Uwe',
    // OY namedrop incident
    'Joy Frempong',
    'Lleluja-Ha',
    'Marcel Blatti',
    'Gun!lla',
    'Gunilla',
    // Reisen-Seite Couchsurfing host (Vorab-gated bis Freigabe)
    // currently only catches index.html / i18n.js — extend sweep to journeys/
    // and blog/ when introducing a multi-file test runner.
    'Loyda',
  ];

  test.each(BANNED_PRIVATE_REFERENCES)('"%s" does not appear in index.html', (needle) => {
    expect(html.includes(needle)).toBe(false);
  });

  // i18n.js read once for sweep
  const i18nJs = fs.readFileSync(path.resolve(__dirname, '../i18n.js'), 'utf8');
  test.each(BANNED_PRIVATE_REFERENCES)('"%s" does not appear in i18n.js', (needle) => {
    expect(i18nJs.includes(needle)).toBe(false);
  });
});

// ── 16. Public-name discipline ────────────────────────────────────────────────
// On the site Stefan goes by "Steef". The civil full name "Stefan-Olav
// Hüllinghorst" / "S. H." may only appear in legally-required places
// (Impressum § 5 TMG). This sweep catches accidental reintroduction in
// any other HTML/XML/JS surface.
//
// See CLAUDE.md → "Stefan's public-facing name" for the policy.

describe('public name discipline', () => {
  const PUBLIC_FILES = [
    'index.html',
    'feed.xml',
    'feed-en.xml',
    'blog/index.html',
    'roadmap.html',
    'invest.html',
    'open-letter.html',
    'open-letter-watzke.html',
    'open-letter-fernandes.html',
    'ethics/index.html',
    'ethics/index-en.html',
    'philosophy/index.html',
    'philosophy/index-en.html',
    'science/index.html',
    'science/index-en.html',
    'movement/index.html',
    'movement/index-en.html',
    'mentorship/index.html',
    'mentorship/index-en.html',
    'tribe/index.html',
    'tribe/index-en.html',
    'journeys/index.html',
    'journeys/index-en.html',
  ];
  const FORBIDDEN_FRAGMENTS = [
    'Stefan-Olav Hüllinghorst',
    'Stefan Hüllinghorst',
    'S. H.',
  ];

  PUBLIC_FILES.forEach(rel => {
    const abs = path.resolve(__dirname, '..', rel);
    if (!fs.existsSync(abs)) return; // file may not exist yet (e.g. journeys/)
    const content = fs.readFileSync(abs, 'utf8');
    FORBIDDEN_FRAGMENTS.forEach(needle => {
      test(`${rel} does not contain "${needle}"`, () => {
        expect(content.includes(needle)).toBe(false);
      });
    });
  });

  test('impressum.html DOES contain the full legal name (TMG § 5)', () => {
    const imp = fs.readFileSync(path.resolve(__dirname, '../impressum.html'), 'utf8');
    expect(imp.includes('Stefan-Olav Hüllinghorst')).toBe(true);
  });
});

// Local-business card resolution tests live in tests/local-business-links.test.js
// (separate file so it can opt into @jest-environment node, where fetch is
// natively available — jest-environment-jsdom does not expose fetch).

// ── 17. Try & Error status badge — well-formed where used ─────────────────────
// Option A from CLAUDE.md: instead of a "Try & Error" section, individual
// cards may carry a <span class="status-badge status-badge--try"> badge. This
// test does NOT require any badges to exist — but if they do, they must:
//   - sit inside a .support-card or .value-card,
//   - carry both the base class and a modifier (status-badge--<type>),
//   - appear after the <h3> and before any <p> (so screen readers announce
//     the card name first, the status second, the description third).

describe('status badge structure (Try & Error and friends)', () => {
  const badges = Array.from(document.querySelectorAll('.status-badge'));

  test('every .status-badge carries a modifier class', () => {
    const bare = badges.filter(b => {
      const classes = Array.from(b.classList);
      return !classes.some(c => c.startsWith('status-badge--'));
    });
    expect(bare).toEqual([]);
  });

  test('every .status-badge sits inside a .support-card or .value-card', () => {
    const orphaned = badges.filter(b => !b.closest('.support-card, .value-card'));
    expect(orphaned).toEqual([]);
  });

  test('every .status-badge appears after the <h3> in its card', () => {
    const misplaced = badges.filter(b => {
      const card = b.closest('.support-card, .value-card');
      if (!card) return false;
      const h3 = card.querySelector('h3');
      if (!h3) return true;
      return !(h3.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(misplaced).toEqual([]);
  });
});
