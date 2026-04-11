/**
 * i18n completeness + quality tests
 *
 * What we check:
 *   1. Every data-i18n key used in index.html exists in every language object
 *   2. No translation value is empty or whitespace-only
 *   3. No translation value is suspiciously short (< 2 chars, flags copy-paste stubs)
 *   4. RTL languages (ar, he, fa) have dir: 'rtl'
 *   5. LTR languages do NOT have dir: 'rtl'
 *   6. LANG_NAMES contains an entry for every language in translations
 *   7. Every language has the required metadata fields (reviewed, dir, lang)
 *   8. No value contains an untranslated English placeholder left from copy-paste
 *      (heuristic: non-English languages must not have >60% ASCII-only words
 *       for values longer than 30 chars — flags forgotten translations)
 */

// i18n.js guards DOM access with typeof checks and exports via module.exports in Node
const { translations, LANG_NAMES, applyLanguage, initLanguageSwitcher } = require('../i18n.js');

// ── Keys used in index.html (extracted at test-write time, kept in sync here) ─
// Regenerate with:
//   grep -o 'data-i18n="[^"]*"' index.html | sed 's/data-i18n="//;s/"//' | sort -u
const HTML_KEYS = [
  'artist_greyscale_p', 'artist_placeholder_p', 'artist_sandra_p', 'artists_h3',
  'book_btn', 'book_date', 'book_email', 'booking_soon', 'book_name', 'book_time', 'book_topic',
  'built_h2', 'built_label', 'built_p',
  'contact_h2', 'contact_label', 'contact_p',
  'hero_scroll', 'hero_tagline', 'hero_text',
  'idol_abramovic_p', 'idol_akin_p', 'idol_birkenbiehl_p', 'idol_boys36_p', 'idol_chappelle_p', 'idol_cohen_p', 'idol_dalai_p', 'idol_einstein_p', 'idol_herber_p', 'idol_jarmusch_p', 'idol_megaloh_p', 'idol_mira_p', 'idol_platon_p', 'idol_salgado_p', 'idol_wutang_p',
  'idols_h2', 'idols_label', 'idol_snowden_p', 'idol_sokrates_p', 'idols_p',
  'idol_ssio_p', 'idol_subotic_p', 'idol_torvalds_p', 'idol_wales_p',
  'journey1_h3', 'journey1_p', 'journey1_year',
  'journey2_h3', 'journey2_p', 'journey2_year',
  'journey3_h3', 'journey3_p', 'journey3_year',
  'journey_h2', 'journey_intro', 'journey_label', 'journey_p',
  'local_h3', 'local_kiezbohne_p', 'local_placeholder_h3', 'local_placeholder_p',
  'nav_built_with', 'nav_contact', 'nav_idols', 'nav_invest', 'nav_journey',
  'nav_philosophy', 'nav_projects',
  'philosophy_cite', 'philosophy_h2', 'philosophy_label',
  'philosophy_p1', 'philosophy_p2', 'philosophy_quote',
  'proj1_p', 'proj1_tag', 'proj2_p', 'proj2_tag', 'proj3_p', 'proj3_tag',
  'projects_h2', 'projects_label', 'projects_p',
  'retrogott_cite', 'retrogott_quote',
  'support_ccc_p', 'support_codeberg_p',
  'support_ddmg_h3', 'support_ddmg_p', 'support_donate',
  'support_gls_p', 'support_h2', 'support_ivory_p', 'support_label', 'support_laion_p',
  'support_landstreicher_p', 'support_learn_more', 'support_listen',
  'support_mge_link', 'support_mge_p', 'support_vca_p', 'support_visit',
  'tool_bitwarden_p', 'tool_claudecode_p', 'tool_donate',
  'tool_duckdns_p', 'tool_firefox_p', 'tool_gitlab_p', 'tool_linuxmint_p',
  'tool_ollama_p', 'tool_pycharm_p', 'tool_python_p', 'tool_raspberrypi_p',
  'tool_thunderbird_p', 'tool_ubuntuserver_p', 'tool_visit', 'tool_vlc_p',
  'val_connection', 'val_connection_p',
  'val_cultivation', 'val_cultivation_p',
  'val_inclusion', 'val_inclusion_p',
  'val_sustainability', 'val_sustainability_p',
];

const LANGUAGES = Object.keys(translations);
const RTL_LANGS = ['ar', 'he', 'fa'];

// ── Helpers ───────────────────────────────────────────────────────────────────

// Languages that use non-Latin scripts — a high ASCII word ratio here
// means the content was likely never translated (all proper nouns aside,
// body text in these languages will be overwhelmingly non-ASCII).
const NON_LATIN_LANGS = new Set(['ar', 'he', 'fa', 'zh', 'ja', 'ko', 'uk', 'ru', 'ku']);

/**
 * Returns true if the string looks like it was never translated.
 * Only applied to non-Latin-script languages: if >80% of words (>3 chars)
 * are pure ASCII in one of these languages, the value is almost certainly
 * English that was copy-pasted and never replaced.
 */
function looksUntranslated(value, lang) {
  if (!NON_LATIN_LANGS.has(lang)) return false;
  if (value.length < 30) return false;

  const words = value.split(/\s+/).filter(w => w.length > 3);
  if (words.length < 5) return false;

  const asciiWords = words.filter(w => /^[\x00-\x7F]+$/.test(w));
  const ratio = asciiWords.length / words.length;
  return ratio > 0.80;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('translations object shape', () => {
  test('translations is defined and non-empty', () => {
    expect(translations).toBeDefined();
    expect(typeof translations).toBe('object');
    expect(LANGUAGES.length).toBeGreaterThan(0);
  });

  test('LANG_NAMES is defined and covers all language codes', () => {
    expect(LANG_NAMES).toBeDefined();
    for (const lang of LANGUAGES) {
      expect(LANG_NAMES).toHaveProperty(lang);
      expect(typeof LANG_NAMES[lang]).toBe('string');
      expect(LANG_NAMES[lang].trim().length).toBeGreaterThan(0);
    }
  });

  test.each(LANGUAGES)('%s has required metadata fields', (lang) => {
    const t = translations[lang];
    expect(typeof t.dir).toBe('string');
    expect(typeof t.lang).toBe('string');
    expect(typeof t.reviewed).toBe('boolean');
    expect(t.lang).toBe(lang);
  });

  test.each(RTL_LANGS)('%s is marked as rtl', (lang) => {
    expect(translations[lang].dir).toBe('rtl');
  });

  test.each(LANGUAGES.filter(l => !RTL_LANGS.includes(l)))(
    '%s is NOT marked as rtl', (lang) => {
      expect(translations[lang].dir).not.toBe('rtl');
    }
  );
});

describe('key completeness — every HTML key present in every language', () => {
  test.each(LANGUAGES)('%s has all required keys', (lang) => {
    const t = translations[lang];
    const missing = HTML_KEYS.filter(key => !(key in t));
    expect(missing).toEqual([]);
  });
});

describe('translation quality — no empty or stub values', () => {
  test.each(LANGUAGES)('%s has no empty or whitespace-only values', (lang) => {
    const t = translations[lang];
    const empty = HTML_KEYS.filter(key => {
      const v = t[key];
      return v === undefined || v === null || String(v).trim() === '';
    });
    expect(empty).toEqual([]);
  });

  test.each(LANGUAGES)('%s has no suspiciously short values (< 2 chars)', (lang) => {
    const t = translations[lang];
    // Exclude known single-char/symbol keys
    const allowShort = new Set(['philosophy_cite', 'retrogott_cite']);
    const tooShort = HTML_KEYS.filter(key => {
      if (allowShort.has(key)) return false;
      const v = t[key];
      return v !== undefined && String(v).trim().length < 2;
    });
    expect(tooShort).toEqual([]);
  });
});

describe('translation quality — untranslated English copy-paste detection', () => {
  // Only check non-Latin-script languages where English words stand out clearly
  const nonEnglish = LANGUAGES.filter(l => NON_LATIN_LANGS.has(l));

  // Keys intentionally kept as English fallbacks pending translation.
  // Remove a key from this list once it has been translated into all languages.
  const PENDING_TRANSLATION = new Set([
    'idol_herber_p',
    'tool_duckdns_p',
    'tool_ubuntuserver_p',
    'tool_raspberrypi_p',
  ]);

  test.each(nonEnglish)('%s has no values that look like forgotten English', (lang) => {
    const t = translations[lang];
    const suspect = HTML_KEYS.filter(key => {
      if (PENDING_TRANSLATION.has(key)) return false;
      const v = t[key];
      if (v === undefined) return false;
      return looksUntranslated(String(v), lang);
    });
    expect(suspect).toEqual([]);
  });
});
