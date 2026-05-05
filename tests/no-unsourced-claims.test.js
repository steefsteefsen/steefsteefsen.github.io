/**
 * No-unsourced-claims sweep: catch (a) leftover briefing/draft markers
 * in live content, (b) speculation phrasing without an attached source.
 *
 * Triggered by Stefan-Anweisung 2026-05-05 after the Netzausfall blog
 * briefing — see CLAUDE.md "Unrecherchierte Aussagen — keine, nicht im
 * Post, nicht im Draft (hard rule)".
 *
 * Scope of files: every file the public visitor can reach.
 *   - index.html
 *   - blog/posts/*.html (only the live posts; blog/planned/ is local-
 *     scheduled and excluded)
 *   - all Open-Letter HTMLs at repo root
 *   - all pillar-page index.html / index-en.html under
 *     ethics/ philosophy/ science/ movement/ mentorship/ tribe/
 *     journeys/
 *   - i18n.js (the translation strings are live too)
 *
 * Out of scope: docs/* (drafts, briefings, gitignored), tests/*,
 *   CLAUDE.md (rule documents, not visitor-facing).
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

// ── File set ────────────────────────────────────────────────────────────────

function collect(globPaths) {
  const out = [];
  for (const rel of globPaths) {
    const abs = path.join(REPO_ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    const stat = fs.statSync(abs);
    if (stat.isFile()) {
      out.push(rel);
    } else if (stat.isDirectory()) {
      for (const f of fs.readdirSync(abs)) {
        const subRel = path.posix.join(rel, f);
        const subAbs = path.join(REPO_ROOT, subRel);
        if (fs.statSync(subAbs).isFile() && /\.html?$/.test(f)) {
          out.push(subRel);
        }
      }
    }
  }
  return out;
}

const FILES = [
  'index.html',
  'i18n.js',
  ...collect(['blog/posts']),
  ...collect([
    'open-letter.html',
    'open-letter-watzke.html',
    'open-letter-fernandes.html',
  ]),
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
].filter((f) => fs.existsSync(path.join(REPO_ROOT, f)));

// ── 1. Leftover briefing/draft markers ────────────────────────────────────────
//
// Markers that mean "I am unfinished — Stefan needs to fill this in". These
// belong in docs/*-DRAFT.md, never in live content.

const FORBIDDEN_MARKERS = [
  '[ SOURCE NEEDED ]',
  '[ SOURCE PENDING ]',
  '[ NAME PENDING ]',
  '[ TODO source ]',
  '[ TODO Stefan ]',
  '[ TODO ]',
  '[ pending ]',
  '[ PENDING ]',
  '[ TBD ]',
  // Verbatim from the briefing template:
  'pending source',
  'PENDING SOURCE',
];

// HTML comments that signal an open source-research task. Some legitimate
// TODOs exist in the codebase (e.g. the Sven-Dose track title); they are
// allow-listed below. Anything else is suspect.
const FORBIDDEN_COMMENT_PATTERNS = [
  /<!--\s*SOURCE\b/i,
  /<!--\s*TODO source/i,
  /<!--\s*TODO Stefan: source/i,
  /<!--\s*\[?\s*SOURCE\s*PENDING/i,
];

// Allow-list of legitimate HTML comments that look TODO-shaped but don't
// describe an unsourced claim. Each entry must reference a specific
// substring of the live comment. Add new entries with a one-line comment
// explaining why the TODO is acceptable to ship.
const ALLOWED_COMMENT_SUBSTRINGS = [
  // Sven-Dose card: Stefan adds the track title later; the card itself
  // makes no source-dependent claim about the missing track, only an
  // observation about an evening that happened.
  'TODO Stefan: Track-Titel',
  // Mira card: explicit placeholder until Stefan picks a video.
  '[ VIDEO PLACEHOLDER — TODO ]',
  // Try & Error card: asset-TODO (photo not yet recovered from old
  // hard drives). The card itself makes no claim that depends on the
  // missing photo — it's a media enrichment, not a source.
  'TODO: Foto vom Stencil-T-Shirt',
];

// ── 2. Speculation phrasing without attached source ───────────────────────────
//
// Speculation phrases (DE + EN) whose presence is fine *if* a source link
// or a footnote ref appears within a small window. The window heuristic is
// 200 characters around the match.

const SPECULATION_TOKENS = [
  // German
  'möglicherweise',
  'wahrscheinlich',
  'vermutlich',
  'mutmaßlich',
  'angeblich',
  'sicher ein anschlag',
  'könnte ein anschlag',
  'könnte ein hack',
  'wohl ein',
  // English
  'allegedly',
  'reportedly',
  'supposedly',
  'presumably',
  'most likely',
];

// Within this character distance from a speculation token, we expect to
// find evidence of attribution: an <a href>, a <sup class="fn"> reference,
// or the words "siehe", "see", "according to", "laut".
const ATTRIBUTION_WINDOW = 200;

const ATTRIBUTION_PATTERNS = [
  /<a\s+href=/i,
  /<sup\s+class="fn"/i,
  /\bsiehe\b/i,
  /\bsee\b/i,
  /\baccording to\b/i,
  /\blaut\b/i,
  /\bquelle:/i,
  /\bsource:/i,
];

// Allow-list of speculation phrases that occur in legitimate prose where
// the speculation is the *subject*, not a claim about a third party.
// Each entry should match a substring of the surrounding paragraph.
const SPECULATION_ALLOW_SUBSTRINGS = [
  // Ethics page discusses the limits of knowledge — speculation tokens
  // appear as topic vocabulary, not as claims.
  'Was wir wissen können',
  'What we can know',
  'Popper',
  'Falsifikation',
  // The "dinge-beim-namen-nennen" blog post discusses speculation language
  // *about* itself — argues that genocide should not be paraphrased as
  // "alleged atrocities". The token is the topic, not a claim.
  'nicht durch „mutmaßliche',
  'nicht durch "mutmaßliche',
  'mutmaßliche Gräueltaten',
];

// ── 3. Actor-attribution patterns ────────────────────────────────────────────
//
// "Anschlag von X" / "Hack von X" / "Sabotage durch X" — checked only when
// the surrounding 200 characters have no attribution evidence.

const ACTOR_ATTRIBUTION_TOKENS = [
  'anschlag von',
  'anschlag durch',
  'hack von',
  'hack durch',
  'sabotage von',
  'sabotage durch',
  'angriff von',
  'angriff durch',
  'attack by',
  'attributed to',
];

// ── helpers ──────────────────────────────────────────────────────────────────

function readFile(rel) {
  return fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');
}

function findAllIndices(haystack, needle) {
  const lower = haystack.toLowerCase();
  const lowerNeedle = needle.toLowerCase();
  const out = [];
  let i = 0;
  while (true) {
    const j = lower.indexOf(lowerNeedle, i);
    if (j === -1) break;
    out.push(j);
    i = j + lowerNeedle.length;
  }
  return out;
}

function windowAround(text, idx, len, radius) {
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + len + radius);
  return text.slice(start, end);
}

function hasAttributionNearby(text, idx, len) {
  const window = windowAround(text, idx, len, ATTRIBUTION_WINDOW);
  return ATTRIBUTION_PATTERNS.some((re) => re.test(window));
}

function isSpeculationAllowed(text, idx, len) {
  const window = windowAround(text, idx, len, ATTRIBUTION_WINDOW);
  return SPECULATION_ALLOW_SUBSTRINGS.some((s) => window.includes(s));
}

// ── tests ────────────────────────────────────────────────────────────────────

describe('no-unsourced-claims sweep — leftover briefing markers', () => {
  FILES.forEach((rel) => {
    test(`${rel} contains no forbidden draft markers`, () => {
      const content = readFile(rel);
      const hits = [];
      FORBIDDEN_MARKERS.forEach((m) => {
        if (content.includes(m)) hits.push(m);
      });
      FORBIDDEN_COMMENT_PATTERNS.forEach((re) => {
        const matches = content.match(re);
        if (!matches) return;
        // Pull the surrounding ~80 chars so we can check the allow-list.
        const idx = content.search(re);
        const surrounding = content.slice(idx, idx + 200);
        if (
          ALLOWED_COMMENT_SUBSTRINGS.some((s) => surrounding.includes(s))
        ) return;
        hits.push(matches[0]);
      });
      // Also check for un-allowlisted TODO comments
      const allTodoComments = content.match(/<!--[^>]*\bTODO\b[^>]*-->/gi) || [];
      allTodoComments.forEach((c) => {
        if (!ALLOWED_COMMENT_SUBSTRINGS.some((s) => c.includes(s))) {
          hits.push(c.length > 80 ? `${c.slice(0, 80)}…` : c);
        }
      });
      if (hits.length > 0) {
        throw new Error(
          `${rel} contains forbidden draft/source markers:\n  ${hits.slice(0, 5).join('\n  ')}`
        );
      }
    });
  });
});

describe('no-unsourced-claims sweep — speculation without attribution', () => {
  FILES.forEach((rel) => {
    test(`${rel} has no speculation phrase without attribution nearby`, () => {
      const content = readFile(rel);
      const offenders = [];
      SPECULATION_TOKENS.forEach((tok) => {
        const positions = findAllIndices(content, tok);
        positions.forEach((idx) => {
          if (hasAttributionNearby(content, idx, tok.length)) return;
          if (isSpeculationAllowed(content, idx, tok.length)) return;
          const ctx = windowAround(content, idx, tok.length, 60);
          offenders.push(`"${tok}" → …${ctx.replace(/\s+/g, ' ').trim()}…`);
        });
      });
      if (offenders.length > 0) {
        throw new Error(
          `${rel} has speculation phrasing without nearby attribution:\n  ${offenders.slice(0, 5).join('\n  ')}`
        );
      }
    });
  });
});

// Allow-list for actor-attribution phrasing where the phrase is the
// *topic* of meta-discussion (e.g. "often attributed to Socrates" is
// itself the proper way to flag a contested attribution — that *is*
// the citation, not a claim).
const ACTOR_ATTRIBUTION_ALLOW_SUBSTRINGS = [
  'attributed to Socrates',
  'attributed to Buckle',
  'often attributed to',
  'misattributed to',
];

describe('no-unsourced-claims sweep — actor-attribution without source', () => {
  FILES.forEach((rel) => {
    test(`${rel} has no actor-attribution phrasing without source`, () => {
      const content = readFile(rel);
      const offenders = [];
      ACTOR_ATTRIBUTION_TOKENS.forEach((tok) => {
        const positions = findAllIndices(content, tok);
        positions.forEach((idx) => {
          if (hasAttributionNearby(content, idx, tok.length)) return;
          const window = windowAround(content, idx, tok.length, ATTRIBUTION_WINDOW);
          if (ACTOR_ATTRIBUTION_ALLOW_SUBSTRINGS.some((s) => window.includes(s))) return;
          const ctx = windowAround(content, idx, tok.length, 80);
          offenders.push(`"${tok}" → …${ctx.replace(/\s+/g, ' ').trim()}…`);
        });
      });
      if (offenders.length > 0) {
        throw new Error(
          `${rel} has actor-attribution phrasing without source:\n  ${offenders.slice(0, 5).join('\n  ')}`
        );
      }
    });
  });
});

describe('no-unsourced-claims sweep — falsifiability self-test', () => {
  // Confidence-test the test itself: a controlled string that should
  // trigger the sweep. We synthesise a tiny in-memory document and run
  // the same logic on it.
  test('detects a leftover [ SOURCE NEEDED ] marker', () => {
    const fake = '<p>This is a claim [ SOURCE NEEDED ] about the world.</p>';
    expect(FORBIDDEN_MARKERS.some((m) => fake.includes(m))).toBe(true);
  });

  test('detects "möglicherweise" without nearby attribution', () => {
    const fake = '<p>Es war möglicherweise ein Anschlag der Akteure.</p>';
    const idx = fake.toLowerCase().indexOf('möglicherweise');
    expect(hasAttributionNearby(fake, idx, 'möglicherweise'.length)).toBe(false);
  });

  test('accepts "möglicherweise" when followed by a footnote ref', () => {
    const fake =
      '<p>Es war möglicherweise — siehe Bundesnetzagentur-Statement<sup class="fn">1</sup>.</p>';
    const idx = fake.toLowerCase().indexOf('möglicherweise');
    expect(hasAttributionNearby(fake, idx, 'möglicherweise'.length)).toBe(true);
  });

  test('accepts "möglicherweise" when followed by an <a href>', () => {
    const fake =
      '<p>Möglicherweise <a href="https://example.org/source">siehe Quelle</a>.</p>';
    const idx = fake.toLowerCase().indexOf('möglicherweise');
    expect(hasAttributionNearby(fake, idx, 'möglicherweise'.length)).toBe(true);
  });
});
