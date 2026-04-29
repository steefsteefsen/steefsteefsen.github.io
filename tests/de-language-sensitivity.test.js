/**
 * German-language sensitivity tests.
 *
 * Catches problematic patterns in DE copy before they ship:
 *
 *   1. NS-loaded vocabulary — words historically associated with National
 *      Socialism, current AfD/right-wing usage, or otherwise burdened.
 *      These must not appear in DE-author voice. If a card text genuinely
 *      needs one of these words, route via Stefan first (allowlist
 *      mechanism below).
 *
 *   2. Generic-masculine forms — "der Bürger", "die Wähler" etc. as
 *      generic role labels. CLAUDE.md mandates Neutrum/collective forms
 *      first. This is a soft guard: documented exceptions live in the
 *      ALLOWED_GENERIC_MASCULINE list.
 *
 *   3. "kriegt" instead of "bekommt" — colloquial register that
 *      Stefan does not want on the site.
 *
 * Quotes are an edge case: anything inside <blockquote>...</blockquote>
 * is verbatim and exempt. Same for footnoted citations and named-person
 * direct speech.
 *
 * Scope: this test runs against (a) DE-author content in index.html
 * (text outside <blockquote>, outside footnote-citation cite tags,
 * outside x-data video iframe titles), and (b) the DE block in i18n.js.
 *
 * @jest-environment node
 */

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const i18nSource = fs.readFileSync(path.resolve(__dirname, '../i18n.js'), 'utf8');

// Strip <blockquote>...</blockquote> blocks — quotes are verbatim, exempt.
// Also strip <cite>...</cite> for named-person attribution.
// Also strip <script> blocks (they contain code, not user-facing text).
function stripExempt(text) {
  return text
    .replace(/<blockquote\b[^>]*>[\s\S]*?<\/blockquote>/gi, ' ')
    .replace(/<cite\b[^>]*>[\s\S]*?<\/cite>/gi, ' ')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ');
}

// Pull DE block out of i18n.js — everything between `de: {` and the next
// `}, // ──` style closer. Each language block in this codebase is opened
// with `<lang>: {` and closed with `},`.
function extractDeBlock(source) {
  const start = source.indexOf('de: {');
  if (start < 0) return '';
  // Find the matching close — count braces from `de: {`.
  let depth = 0;
  let i = start + 'de: '.length;
  for (; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  return source.slice(start, i + 1);
}

const htmlClean = stripExempt(html);
const deBlock = extractDeBlock(i18nSource);

// ── 1. NS-loaded vocabulary ──────────────────────────────────────────────
//
// Words that are historically loaded in German. The list is conservative —
// only entries where appearance in DE-author voice is virtually always
// wrong. Quotes (handled above) are exempt.
//
// To allow a specific phrase, add it to ALLOWED_NS_PHRASES with Stefan's
// explicit OK. Example use case: a footnote that *quotes* a historical
// phrase to critique it — that goes inside <blockquote> and is auto-exempt;
// if it must live outside <blockquote> for layout reasons, allowlist it.

const NS_LOADED_PATTERNS = [
  { re: /\b(Schul)?[Kk]amerad(en|in|innen)?\b/, label: 'Kamerad/Schulkamerad — use Kompagnon or restructure' },
  { re: /\bEndlösung\b/, label: 'Endlösung' },
  { re: /\bVolksgemeinschaft\b/, label: 'Volksgemeinschaft' },
  { re: /\bLebensraum\b/, label: 'Lebensraum' },
  { re: /\b[Aa]risch[a-zäöü]*\b/, label: 'arisch/Arier' },
  { re: /\bUntermensch(en)?\b/, label: 'Untermensch' },
  { re: /\bRassenschande\b/, label: 'Rassenschande' },
  { re: /\bartfremd\b/, label: 'artfremd' },
  { re: /\bvolkstreu\b/, label: 'volkstreu' },
  { re: /\bRemigration\b/, label: 'Remigration (current AfD usage)' },
  { re: /\b[Üü]berfremdung\b/, label: 'Überfremdung' },
];

const ALLOWED_NS_PHRASES = [
  // Add allowlist entries here with format:
  //   { phrase: 'exact phrase', reason: 'why', approvedBy: 'Stefan YYYY-MM-DD' }
  // None currently — the codebase is clean of NS-loaded vocabulary.
];

function findNsHits(text) {
  const hits = [];
  for (const { re, label } of NS_LOADED_PATTERNS) {
    let m;
    const g = new RegExp(re.source, 'g' + (re.flags.includes('i') ? 'i' : ''));
    while ((m = g.exec(text)) !== null) {
      const phrase = m[0];
      const allowed = ALLOWED_NS_PHRASES.some(a => phrase === a.phrase);
      if (!allowed) {
        // Capture a 60-char window around the hit for context.
        const start = Math.max(0, m.index - 30);
        const end = Math.min(text.length, m.index + phrase.length + 30);
        hits.push({ label, phrase, context: text.slice(start, end).replace(/\s+/g, ' ') });
      }
    }
  }
  return hits;
}

describe('DE language sensitivity — NS-loaded vocabulary', () => {
  test('index.html (outside quotes) contains no NS-loaded vocabulary', () => {
    const hits = findNsHits(htmlClean);
    expect(hits).toEqual([]);
  });

  test('i18n.js DE block contains no NS-loaded vocabulary', () => {
    const hits = findNsHits(deBlock);
    expect(hits).toEqual([]);
  });
});

// ── 2. Colloquial "kriegt" → "bekommt" ───────────────────────────────────

describe('DE language sensitivity — register', () => {
  test('index.html (outside quotes) does not use colloquial "kriegt"', () => {
    const re = /\bkriegt\b/g;
    const hits = [];
    let m;
    while ((m = re.exec(htmlClean)) !== null) {
      const start = Math.max(0, m.index - 30);
      const end = Math.min(htmlClean.length, m.index + 30);
      hits.push(htmlClean.slice(start, end).replace(/\s+/g, ' '));
    }
    expect(hits).toEqual([]);
  });

  test('i18n.js DE block does not use colloquial "kriegt"', () => {
    const re = /\bkriegt\b/g;
    const hits = [];
    let m;
    while ((m = re.exec(deBlock)) !== null) {
      const start = Math.max(0, m.index - 30);
      const end = Math.min(deBlock.length, m.index + 30);
      hits.push(deBlock.slice(start, end).replace(/\s+/g, ' '));
    }
    expect(hits).toEqual([]);
  });
});

// ── 3. Generic-masculine flag (warn-only, runs as info) ──────────────────
//
// CLAUDE.md mandates Neutrum/collective forms first. The full pattern from
// CLAUDE.md is large; we encode the most common offenders here. Documented
// exceptions (e.g. quoting a generic-masculine term to critique it, or a
// concrete named individual like "Linus Torvalds, Programmierer") live in
// ALLOWED_GENERIC_MASCULINE.

const GENERIC_MASCULINE_PATTERNS = [
  /\b(der|dem|den)\s+(Bürger|Wähler|Mitarbeiter|Pfleger|Lehrer|Künstler|Forscher|Entwickler|Gründer|Politiker|Aktivist|Sportler|Kunde|Nutzer|Leser)\b/g,
];

// Phrases that are OK because they refer to a concrete named person, are
// part of a brand name, or are explicitly approved.
const ALLOWED_GENERIC_MASCULINE = [
  // Stefan self-references (CLAUDE.md exception)
  /Ich bin ein Macher/,
  // Idol-card framing where the role describes one specific person
  /langjähriges Gesicht der Linken/,
];

function findGenericMasculineHits(text) {
  const hits = [];
  for (const re of GENERIC_MASCULINE_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      const phrase = m[0];
      const start = Math.max(0, m.index - 40);
      const end = Math.min(text.length, m.index + phrase.length + 40);
      const context = text.slice(start, end).replace(/\s+/g, ' ');
      const allowed = ALLOWED_GENERIC_MASCULINE.some(a => a.test(context));
      if (!allowed) hits.push({ phrase, context });
    }
  }
  return hits;
}

describe('DE language sensitivity — generic-masculine (CLAUDE.md gender-inclusive rule)', () => {
  test('index.html (outside quotes) avoids generic-masculine role labels', () => {
    const hits = findGenericMasculineHits(htmlClean);
    expect(hits).toEqual([]);
  });

  test('i18n.js DE block avoids generic-masculine role labels', () => {
    const hits = findGenericMasculineHits(deBlock);
    expect(hits).toEqual([]);
  });
});
