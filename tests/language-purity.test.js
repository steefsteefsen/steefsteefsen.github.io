/**
 * Language-purity test: when applyLanguage('en') is run on the live
 * index.html DOM, no element should still display German content. Same
 * principle for DE → no surprise English. This is the mechanical guard
 * Stefan asked for after spotting "DE/EN gemischt" on the live site
 * (2026-05-05).
 *
 * Detection mechanism:
 *   - Load index.html into jsdom
 *   - Run applyLanguage('en') (or 'de' for the reverse direction)
 *   - For every "leaf" text element (h1-h3, p, button, span, li, a)
 *     read the rendered textContent
 *   - Match against a hard list of unmistakable foreign-language tokens
 *     (German function words for the EN sweep; English function words
 *     for the DE sweep)
 *   - Flag any element where 2+ such tokens appear AND the text isn't
 *     in the allow-list
 *
 * Allow-list reason: real proper nouns (Bielefeld, Die Zwote, Aggro Berlin),
 * historical references (Institut für Sexualwissenschaft), and intentional
 * code-switching in the text (the manifesto "Ich bin Mensch") legitimately
 * carry foreign-language tokens. The allow-list captures the substring of
 * the *element* that justifies the foreign tokens; if the element matches,
 * it is excluded from the failure set.
 *
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

let html;

beforeAll(() => {
  html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
});

// ── German function-word probe ────────────────────────────────────────────────
// Words that are unambiguously German and unlikely to appear in English text
// for any legitimate reason. Includes articles, conjunctions, prepositions,
// auxiliary verbs. Deliberately excludes "ist", "bin" (English "is", "I'm"
// trip on those after lowercasing) and short ambiguous tokens.
const DE_TOKENS = [
  'der', 'die', 'das', 'dem', 'den', 'des',
  'und', 'oder', 'aber', 'sondern', 'weil', 'obwohl', 'damit', 'sowie',
  'nicht', 'doch', 'schon', 'noch',
  'durch', 'zwischen', 'während', 'unter', 'über', 'gegen', 'ohne', 'außer',
  'wird', 'werden', 'wurde', 'wurden', 'haben', 'hatten', 'kann', 'können',
  'soll', 'sollen', 'muss', 'müssen', 'darf', 'dürfen',
  'mein', 'meine', 'meinen', 'meines', 'meiner', 'meinem',
  'dein', 'deine', 'deinen',
  'sein', 'seine', 'seinen',
  'ihre', 'ihren', 'ihres',
  'unser', 'unsere', 'unseren',
  'einer', 'einem', 'einen', 'eines',
  'sich',
  'auch',
  'wenn', 'dann', 'weil',
  'jede', 'jeder', 'jedes', 'jedem', 'jeden',
  'diese', 'dieser', 'dieses', 'diesen', 'diesem',
  'kein', 'keine', 'keinen', 'keines', 'keinem',
  'beim', 'vom', 'zum', 'zur', 'ins', 'ans',
  'gibt', 'gegeben',
];

// English function-word probe (for the DE-mode sweep).
const EN_TOKENS = [
  'the', 'and', 'with', 'from', 'this', 'that', 'these', 'those',
  'when', 'while', 'because', 'though', 'although', 'whereas',
  'should', 'would', 'could', 'must',
  'their', 'there', 'where', 'which',
  'what', 'who', 'whose',
  'have', 'has', 'had', 'having',
  'will', 'shall',
  'into', 'onto', 'upon',
  'between', 'among', 'against', 'without', 'within',
  'never', 'always', 'often', 'sometimes',
  'something', 'anything', 'everything', 'nothing',
];

// Allow-list of substrings: if an element's text contains any of these
// (case-sensitive partial match), it is excluded from the failure set.
// Reasons:
//   - Proper nouns and place names (Berlin, Bielefeld, Mettmann etc.)
//   - Bilingual labels (e.g. "Sprache / Language")
//   - Historical/cultural references where the German term is the artwork
//     ("Gegen die Wand", "Hurra die Welt geht unter", Institut für
//     Sexualwissenschaft, Kicken für Afrika)
//   - The hero "Steef"-Allgemeingut paragraph which deliberately quotes the
//     German idioms it discusses.
const ALLOW_SUBSTRINGS = [
  // ── Proper nouns / venue names ──
  'Bielefeld', 'Berlin', 'Mettmann', 'Filderstadt', 'Wolfsburg',
  'Enger-Steinbeck', 'Stuttgart', 'Hamburg', 'Hellersdorf',
  'Kreuzberg', 'Tiergarten', 'Schillerkiez', 'Prenzlauer',
  'Pula', 'Karibik',
  // ── Brand names / institutional names that contain DE words ──
  'Die Zwote', 'Mein Grundeinkommen', 'Mondiali Antirazzisti',
  'Volkswagen', 'Aggro Berlin', 'Beate Uwe',
  'Institut für Sexualwissenschaft', 'Kicken für Afrika',
  'Karl-Schubert-Werkstätten', 'Möbelwerkstätten', 'Buschsieweke',
  'Schaltwerk', 'Siemensstadt', 'inpro Innovationsgesellschaft',
  'Restlos', 'Werrepiraten', 'Stabielefeld', 'Späti Bros',
  'MBzwo', 'MadHat', 'madhat', "Fatimah's", "Neneh's",
  'Salon at Rummels Bucht', 'Bucht der Träumer',
  'Nation of Gondwana', 'Rummelsburger',
  'Jungs vom 36', 'jungs vom 36',
  'Codeberg e.V.', 'Forgejo',
  'YAAM', 'Schillingbrücke',
  // ── Track / song / artwork titles ──
  'Hurra die Welt', 'Schule der Gewalt', 'Frieden sei mit euch',
  'Gegen die Wand', 'Wir sind der Batman', 'Quer und bunt',
  'Der springende Punkt', 'Am Hintern wird die Ente fett',
  'Bella ciao', 'Diedoris ist das Gift',
  'Still D.R.E.', 'Kreuzberg stayed Kreuzberg',
  // ── Verbatim citations / Stefan-Voice DE quotes left in EN text ──
  '„',  // typographic German quote — almost always wraps a verbatim DE quote
  '"Wir sind der Batman',
  // ── Site-internal labels that show DE alongside the language code ──
  'Sprache / Language',
  // ── Esperanto and other non-DE non-EN labels in the language switcher ──
  // (these are intentional native-language labels that may share tokens
  //  with DE/EN function-word lists)
  'Esperanto', 'Deutsch', 'English', 'Français', 'Italiano',
  'Español', 'Português', 'Dansk', 'Türkçe',
  'Українська', 'Русский',
  // ── The Steef "Allgemeingut"-paragraph which discusses DE idioms ──
  'is part of the German language',
  // ── Open Letter Watzke / Fernandes — the addressee names ──
  'Watzke', 'BVB', 'Fernandes', 'Collien',
  // ── Patent IDs and similar codes ──
  'DE10201', 'patent', 'Patent',
  // ── Robin Haemisch role label "Fürst von Kicken" ──
  'Fürst von',
];

// Build a case-insensitive token regex.
function tokensRegex(tokens) {
  // Word-boundary match, case-insensitive. The \\b on each side prevents
  // matching tokens inside larger words (e.g. "Berlin" inside "Berliner"
  // would not match — but Berlin is in the allow-list anyway).
  return new RegExp(`\\b(${tokens.join('|')})\\b`, 'gi');
}

const DE_RE = tokensRegex(DE_TOKENS);
const EN_RE = tokensRegex(EN_TOKENS);

function elementText(el) {
  // textContent collapses descendants. For the purity check we want the
  // direct rendered text of *this* element; using textContent is fine
  // because we walk leaf-like nodes (h1-h3, p, button, li, a, span without
  // child block elements). The probe will fire on the deepest matching
  // ancestor; we do not double-count.
  return (el.textContent || '').replace(/\s+/g, ' ').trim();
}

// Verbatim-quote elements (<blockquote>, <cite>) and footnote <li> entries
// preserve the source-language of the citation per the CLAUDE.md citation
// rule ("verbatim quotes from named people stay in source language") and the
// footnote convention (citation sources keep publisher's original language).
// They are excluded from the language-purity sweep.
function isVerbatimQuoteContext(el) {
  if (el.tagName === 'BLOCKQUOTE' || el.tagName === 'CITE') return true;
  // Walk ancestors: a <li> inside <section class="footnotes"> is a citation
  // source; a <p> inside <blockquote> is verbatim quote body.
  let p = el.parentElement;
  while (p) {
    if (p.tagName === 'BLOCKQUOTE') return true;
    if (p.tagName === 'CITE') return true;
    if (p.tagName === 'SECTION' && p.classList && p.classList.contains('footnotes')) {
      return true;
    }
    p = p.parentElement;
  }
  return false;
}

function isAllowed(text) {
  return ALLOW_SUBSTRINGS.some((sub) => text.includes(sub));
}

function findForeign(elements, foreignRe, threshold = 2) {
  const offenders = [];
  elements.forEach((el) => {
    if (isVerbatimQuoteContext(el)) return;
    const text = elementText(el);
    if (!text || text.length < 8) return;
    if (isAllowed(text)) return;
    const matches = text.match(foreignRe) || [];
    if (matches.length >= threshold) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        i18nKey: el.getAttribute('data-i18n') || el.getAttribute('data-i18n-html') || null,
        snippet: text.length > 120 ? `${text.slice(0, 120)}…` : text,
        tokens: [...new Set(matches.map((m) => m.toLowerCase()))],
      });
    }
  });
  return offenders;
}

// Boot a jsdom environment with the actual page + the i18n module hooked up.
function bootPage(lang) {
  document.documentElement.innerHTML = html.replace(
    /<!DOCTYPE[^>]*>/i,
    ''
  );
  // Reset any existing language state and force the chosen one.
  // i18n.js installs a DOMContentLoaded handler; we bypass it by calling
  // applyLanguage() directly so the test is deterministic.
  jest.resetModules();
  const { applyLanguage } = require('../i18n.js');
  applyLanguage(lang);
}

const TEXT_SELECTORS = [
  'h1', 'h2', 'h3', 'h4', 'h5',
  'p', 'li', 'button',
  'span[data-i18n]', 'a[data-i18n]',
  'figcaption', 'blockquote', 'cite',
];

describe('language purity — applyLanguage(en)', () => {
  beforeAll(() => {
    bootPage('en');
  });

  test('no element renders 2+ unmistakable German tokens after EN switch', () => {
    const els = document.querySelectorAll(TEXT_SELECTORS.join(', '));
    const offenders = findForeign(els, DE_RE);
    if (offenders.length > 0) {
      const report = offenders
        .slice(0, 20)
        .map(
          (o) =>
            `  [${o.tag}${o.i18nKey ? ` data-i18n="${o.i18nKey}"` : ''}] tokens=${o.tokens.join(',')} :: ${o.snippet}`
        )
        .join('\n');
      throw new Error(
        `Found ${offenders.length} element(s) still rendering German content in EN mode:\n${report}`
      );
    }
  });
});

describe('language purity — applyLanguage(de)', () => {
  beforeAll(() => {
    bootPage('de');
  });

  test('no element renders 2+ unmistakable English function-word tokens after DE switch', () => {
    const els = document.querySelectorAll(TEXT_SELECTORS.join(', '));
    const offenders = findForeign(els, EN_RE);
    if (offenders.length > 0) {
      const report = offenders
        .slice(0, 20)
        .map(
          (o) =>
            `  [${o.tag}${o.i18nKey ? ` data-i18n="${o.i18nKey}"` : ''}] tokens=${o.tokens.join(',')} :: ${o.snippet}`
        )
        .join('\n');
      throw new Error(
        `Found ${offenders.length} element(s) still rendering English content in DE mode:\n${report}`
      );
    }
  });
});
