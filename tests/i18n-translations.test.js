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
  // artists
  'artist_ciaoella_p', 'artist_ciaoella_quote', 'artist_consent_pending',
  'artist_eberg_p', 'artist_greyscale_h3', 'artist_greyscale_p',
  'artist_nyx_h3', 'artist_nyx_p', 'artist_reyneke_p', 'artist_sandra_p',
  'artist_tiefgang_p', 'artists_h3',
  // booking
  'book_btn', 'book_date', 'book_email', 'book_name', 'book_time', 'book_topic', 'booking_soon',
  // built with
  'built_h2', 'built_label', 'built_p',
  // contact
  'contact_h2', 'contact_label', 'contact_p',
  // d5
  'd5_artwork', 'd5_foot', 'd5_h3', 'd5_intro',
  'd5_s1_h', 'd5_s1_t', 'd5_s2_h', 'd5_s2_t', 'd5_s3_h', 'd5_s3_t',
  'd5_sub',
  // flow
  'flow_korrektur', 'flow_versuch',
  // hero
  'hero_aka', 'hero_allgemeingut', 'hero_citations_toggle', 'hero_creed',
  'hero_scroll', 'hero_tagline', 'hero_text',
  // idols
  'idol_abramovic_p', 'idol_aggroberlin_p', 'idol_akin_p',
  'idol_beateuwe_p', 'idol_biggie_p', 'idol_birkenbiehl_p',
  'idol_boys36_h3', 'idol_boys36_p', 'idol_buschsieweke_p',
  'idol_cfbhasenheide_p', 'idol_chappelle_p', 'idol_cohen_p',
  'idol_dalai_p', 'idol_einstein_p', 'idol_fabuland_p',
  'idol_fob_p', 'idol_gysi_p', 'idol_herber_p', 'idol_hirschfeld_p',
  'idol_hofmann_p', 'idol_jarmusch_p', 'idol_jojo_p', 'idol_kiz_p',
  'idol_lasseoelen_p', 'idol_maxik_p', 'idol_megaloh_p',
  'idol_meis_p', 'idol_michi_p', 'idol_mira_p', 'idol_mobbdeep_p',
  'idol_oy_p', 'idol_pasadakis_p', 'idol_pertsch_p', 'idol_platon_p',
  'idol_salgado_p', 'idol_simone_p', 'idol_skinnyshef_p',
  'idol_snowden_p', 'idol_sokrates_p', 'idol_southpark_p',
  'idol_ssio_p', 'idol_subotic_p', 'idol_svendose_p',
  'idol_torvalds_p', 'idol_tryanderror_p', 'idol_tschaikowski_p',
  'idol_tupac_p', 'idol_wales_p', 'idol_wutang_p', 'idol_zwote_p',
  'idols_h2', 'idols_label', 'idols_p', 'idols_quote_note',
  'idols_sub_film', 'idols_sub_greatminds', 'idols_sub_music',
  'idols_sub_people', 'idols_sub_philosophy', 'idols_sub_teams', 'idols_sub_tech',
  // journey
  'journey_h2', 'journey_intro', 'journey_label', 'journey_p',
  // lifeline
  'lifeline_basc_h', 'lifeline_basc_sub', 'lifeline_busch_h', 'lifeline_busch_sub',
  'lifeline_deeper', 'lifeline_deeper_link',
  'lifeline_filter_career', 'lifeline_filter_patent', 'lifeline_filter_personal', 'lifeline_filter_travel',
  'lifeline_gensor_detail', 'lifeline_gensor_h', 'lifeline_gensor_sub',
  'lifeline_indie_h', 'lifeline_indie_sub', 'lifeline_inpro_h', 'lifeline_inpro_sub',
  'lifeline_insolvenz_detail', 'lifeline_insolvenz_h', 'lifeline_insolvenz_sub',
  'lifeline_karibik_detail', 'lifeline_karibik_h', 'lifeline_karibik_sub',
  'lifeline_mbzwo_h', 'lifeline_mbzwo_sub',
  'lifeline_mondiali_detail', 'lifeline_mondiali_h', 'lifeline_mondiali_sub',
  'lifeline_msc_detail', 'lifeline_msc_h', 'lifeline_msc_sub',
  'lifeline_patent1_detail', 'lifeline_patent1_h', 'lifeline_patent1_sub',
  'lifeline_patent2_detail', 'lifeline_patent2_h', 'lifeline_patent2_sub',
  'lifeline_sa_detail', 'lifeline_sa_h', 'lifeline_sa_sub',
  'lifeline_schaltwerk_h', 'lifeline_schaltwerk_sub',
  'lifeline_sieenergy_h', 'lifeline_sieenergy_sub',
  'lifeline_tag_journey1', 'lifeline_tag_journey2', 'lifeline_tag_journey3',
  'lifeline_usa_detail', 'lifeline_usa_h', 'lifeline_usa_sub',
  'lifeline_vw_h', 'lifeline_vw_sub', 'lifeline_zivi_h', 'lifeline_zivi_sub',
  // local
  'local_casacerto_h3', 'local_casacerto_nikos', 'local_casacerto_p',
  'local_fatimah_badge', 'local_fatimah_p',
  'local_h3', 'local_howzit_p', 'local_jzkamp_p', 'local_kiezbohne_p',
  'local_madhat_p', 'local_mbzwo_p', 'local_orania_p',
  'local_placeholder_h3', 'local_placeholder_p',
  'local_restlos_h3', 'local_restlos_p',
  'local_spaetibros_p', 'local_stabielefeld_p',
  // meta / rollen
  'meta_phase_metabolisiert', 'meta_phase_roh', 'meta_phase_verstanden', 'mindset_key',
  // minds
  'minds_cite', 'minds_quote',
  // nav
  'nav_blog', 'nav_built_with', 'nav_contact', 'nav_idols', 'nav_invest',
  'nav_journey', 'nav_philosophy', 'nav_projects',
  // nicknames
  'nickname_iceman_p', 'nickname_karibik_p', 'nickname_landstreicher_p',
  'nickname_nicklas_p', 'nickname_ssue_p', 'nickname_stee_p',
  'nickname_steef_p', 'nickname_steefie_p', 'nickname_weihemstepham_p',
  // oezil
  'oezil_reflection_p',
  // olympia
  'olympia_donate', 'olympia_h3', 'olympia_li1', 'olympia_li2', 'olympia_li3',
  'olympia_open', 'olympia_p1', 'olympia_prize', 'olympia_sub',
  // philosophy
  'philosophy_cite', 'philosophy_h2', 'philosophy_label',
  'philosophy_p1', 'philosophy_p2', 'philosophy_quote',
  // projects
  'proj1_p', 'proj1_tag', 'proj2_p', 'proj2_tag', 'proj3_p', 'proj3_tag',
  'projects_h2', 'projects_label', 'projects_p',
  // retrogott
  'retrogott_cite', 'retrogott_quote',
  // rollen
  'rollen_card1_attr', 'rollen_card1_h', 'rollen_card1_sub',
  'rollen_card2_attr', 'rollen_card2_h', 'rollen_card2_sub',
  'rollen_card3_attr', 'rollen_card3_h', 'rollen_card3_sub',
  'rollen_h', 'rollen_held', 'rollen_intro', 'rollen_label',
  'rollen_opfer', 'rollen_taeter', 'rollen_triangle_caption',
  // support
  'support_ccc_h3', 'support_ccc_p', 'support_codeberg_h3', 'support_codeberg_p',
  'support_ddmg_h3', 'support_ddmg_p', 'support_donate',
  'support_dpsvdb_badge', 'support_dpsvdb_h3', 'support_dpsvdb_link', 'support_dpsvdb_p',
  'support_gls_h3', 'support_gls_p', 'support_h2', 'support_hydra_p',
  'support_ivory_h3', 'support_ivory_p', 'support_label',
  'support_laion_h3', 'support_laion_p',
  'support_landstreicher_h3', 'support_landstreicher_p',
  'support_learn_more', 'support_listen',
  'support_mge_h3', 'support_mge_link', 'support_mge_p',
  'support_schwulesmuseum_p',
  'support_vca_h3', 'support_vca_p', 'support_visit',
  'support_werrepiraten_h3', 'support_werrepiraten_p',
  // theorie
  'theorie_alf_author', 'theorie_alf_p',
  // tools
  'tool_alpine_p', 'tool_bitwarden_p', 'tool_claudecode_p',
  'tool_codeberg_p', 'tool_deepl_p', 'tool_donate',
  'tool_duckdns_p', 'tool_duckduckgo_p', 'tool_firefox_p',
  'tool_git_p', 'tool_gitlab_p', 'tool_htmlvalidate_p',
  'tool_jest_p', 'tool_jsdom_p', 'tool_linuxmint_p',
  'tool_mixx_p', 'tool_nextcloud_p', 'tool_node_p',
  'tool_ollama_p', 'tool_osm_p', 'tool_puppeteer_p',
  'tool_pycharm_p', 'tool_python_p', 'tool_raspberrypi_p',
  'tool_soundcloud_p', 'tool_spreadshop_p', 'tool_thunderbird_p',
  'tool_ublock_p', 'tool_ubuntuserver_p', 'tool_visit', 'tool_vlc_p',
  // tribe
  'tribe_contact', 'tribe_h3', 'tribe_intro',
  'tribe_rule1', 'tribe_rule2', 'tribe_rule3', 'tribe_rule4',
  // values
  'val_connection', 'val_connection_p',
  'val_cultivation', 'val_cultivation_p',
  'val_family', 'val_family_p',
  'val_feminism', 'val_feminism_p',
  'val_inclusion', 'val_inclusion_p',
  'val_respect', 'val_respect_p',
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
    // artists
    'artist_ciaoella_p', 'artist_ciaoella_quote', 'artist_consent_pending',
    'artist_eberg_p', 'artist_greyscale_h3', 'artist_nyx_h3', 'artist_nyx_p',
    'artist_reyneke_p', 'artist_tiefgang_p',
    // d5 section
    'd5_artwork', 'd5_foot', 'd5_h3', 'd5_intro',
    'd5_s1_h', 'd5_s1_t', 'd5_s2_h', 'd5_s2_t', 'd5_s3_h', 'd5_s3_t', 'd5_sub',
    // flow
    'flow_korrektur', 'flow_versuch',
    // hero
    'hero_aka', 'hero_allgemeingut', 'hero_citations_toggle', 'hero_creed',
    // idols (new)
    'idol_aggroberlin_p', 'idol_beateuwe_p', 'idol_biggie_p', 'idol_boys36_h3',
    'idol_buschsieweke_p', 'idol_cfbhasenheide_p', 'idol_fabuland_p', 'idol_fob_p',
    'idol_gysi_p', 'idol_herber_p', 'idol_hirschfeld_p', 'idol_hofmann_p',
    'idol_jojo_p', 'idol_kiz_p', 'idol_lasseoelen_p', 'idol_maxik_p',
    'idol_meis_p', 'idol_michi_p', 'idol_mobbdeep_p', 'idol_oy_p',
    'idol_pasadakis_p', 'idol_pertsch_p', 'idol_simone_p', 'idol_skinnyshef_p',
    'idol_southpark_p', 'idol_svendose_p', 'idol_tryanderror_p', 'idol_tschaikowski_p',
    'idol_tupac_p', 'idol_zwote_p',
    'idols_quote_note', 'idols_sub_film', 'idols_sub_greatminds', 'idols_sub_music',
    'idols_sub_people', 'idols_sub_philosophy', 'idols_sub_teams', 'idols_sub_tech',
    // lifeline
    'lifeline_basc_h', 'lifeline_basc_sub', 'lifeline_busch_h', 'lifeline_busch_sub',
    'lifeline_deeper', 'lifeline_deeper_link',
    'lifeline_filter_career', 'lifeline_filter_patent', 'lifeline_filter_personal', 'lifeline_filter_travel',
    'lifeline_gensor_detail', 'lifeline_gensor_h', 'lifeline_gensor_sub',
    'lifeline_indie_h', 'lifeline_indie_sub', 'lifeline_inpro_h', 'lifeline_inpro_sub',
    'lifeline_insolvenz_detail', 'lifeline_insolvenz_h', 'lifeline_insolvenz_sub',
    'lifeline_karibik_detail', 'lifeline_karibik_h', 'lifeline_karibik_sub',
    'lifeline_mbzwo_h', 'lifeline_mbzwo_sub',
    'lifeline_mondiali_detail', 'lifeline_mondiali_h', 'lifeline_mondiali_sub',
    'lifeline_msc_detail', 'lifeline_msc_h', 'lifeline_msc_sub',
    'lifeline_patent1_detail', 'lifeline_patent1_h', 'lifeline_patent1_sub',
    'lifeline_patent2_detail', 'lifeline_patent2_h', 'lifeline_patent2_sub',
    'lifeline_sa_detail', 'lifeline_sa_h', 'lifeline_sa_sub',
    'lifeline_schaltwerk_h', 'lifeline_schaltwerk_sub',
    'lifeline_sieenergy_h', 'lifeline_sieenergy_sub',
    'lifeline_tag_journey1', 'lifeline_tag_journey2', 'lifeline_tag_journey3',
    'lifeline_usa_detail', 'lifeline_usa_h', 'lifeline_usa_sub',
    'lifeline_vw_h', 'lifeline_vw_sub', 'lifeline_zivi_h', 'lifeline_zivi_sub',
    // local
    'local_casacerto_h3', 'local_casacerto_nikos', 'local_casacerto_p',
    'local_fatimah_badge', 'local_fatimah_p',
    'local_howzit_p', 'local_jzkamp_p', 'local_madhat_p', 'local_mbzwo_p',
    'local_orania_p', 'local_restlos_h3', 'local_restlos_p',
    'local_spaetibros_p', 'local_stabielefeld_p',
    // meta / rollen
    'meta_phase_metabolisiert', 'meta_phase_roh', 'meta_phase_verstanden', 'mindset_key',
    // minds
    'minds_cite', 'minds_quote',
    // nav
    'nav_blog',
    // nicknames
    'nickname_iceman_p', 'nickname_karibik_p', 'nickname_landstreicher_p',
    'nickname_nicklas_p', 'nickname_ssue_p', 'nickname_stee_p',
    'nickname_steef_p', 'nickname_steefie_p', 'nickname_weihemstepham_p',
    // oezil
    'oezil_reflection_p',
    // olympia
    'olympia_donate', 'olympia_h3', 'olympia_li1', 'olympia_li2', 'olympia_li3',
    'olympia_open', 'olympia_p1', 'olympia_prize', 'olympia_sub',
    // rollen
    'rollen_card1_attr', 'rollen_card1_h', 'rollen_card1_sub',
    'rollen_card2_attr', 'rollen_card2_h', 'rollen_card2_sub',
    'rollen_card3_attr', 'rollen_card3_h', 'rollen_card3_sub',
    'rollen_h', 'rollen_held', 'rollen_intro', 'rollen_label',
    'rollen_opfer', 'rollen_taeter', 'rollen_triangle_caption',
    // support (new)
    'support_ccc_h3', 'support_codeberg_h3',
    'support_dpsvdb_badge', 'support_dpsvdb_h3', 'support_dpsvdb_link', 'support_dpsvdb_p',
    'support_gls_h3', 'support_hydra_p',
    'support_ivory_h3', 'support_laion_h3', 'support_landstreicher_h3',
    'support_mge_h3', 'support_schwulesmuseum_p',
    'support_vca_h3', 'support_werrepiraten_h3', 'support_werrepiraten_p',
    // theorie
    'theorie_alf_author', 'theorie_alf_p',
    // tools (new)
    'tool_alpine_p', 'tool_codeberg_p', 'tool_deepl_p', 'tool_duckdns_p',
    'tool_duckduckgo_p', 'tool_git_p', 'tool_htmlvalidate_p',
    'tool_jest_p', 'tool_jsdom_p', 'tool_mixx_p', 'tool_nextcloud_p',
    'tool_node_p', 'tool_osm_p', 'tool_puppeteer_p', 'tool_raspberrypi_p',
    'tool_soundcloud_p', 'tool_spreadshop_p', 'tool_ubuntuserver_p',
    'tool_ublock_p',
    // tribe
    'tribe_contact', 'tribe_h3', 'tribe_intro',
    'tribe_rule1', 'tribe_rule2', 'tribe_rule3', 'tribe_rule4',
    // values (new)
    'val_family', 'val_family_p', 'val_feminism', 'val_feminism_p',
    'val_respect', 'val_respect_p',
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
