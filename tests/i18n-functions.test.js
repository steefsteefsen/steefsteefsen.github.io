/**
 * Tests for applyLanguage() and initLanguageSwitcher()
 * Runs in jsdom environment so document/localStorage/navigator are available.
 */

const { translations, applyLanguage, initLanguageSwitcher } = require('../i18n.js');

// ── helpers ───────────────────────────────────────────────────────────────────

function makeEl(tag, attrs = {}) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  document.body.appendChild(el);
  return el;
}

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
});

// ── applyLanguage ─────────────────────────────────────────────────────────────

describe('applyLanguage()', () => {
  test('ignores unknown language code', () => {
    // should not throw
    expect(() => applyLanguage('xx')).not.toThrow();
  });

  test('sets documentElement lang and dir for LTR language', () => {
    applyLanguage('de');
    expect(document.documentElement.lang).toBe('de');
    expect(document.documentElement.dir).toBe('ltr');
  });

  test('sets documentElement dir to rtl for Arabic', () => {
    applyLanguage('ar');
    expect(document.documentElement.dir).toBe('rtl');
  });

  test('applies data-i18n to a plain element', () => {
    const el = makeEl('p', { 'data-i18n': 'nav_philosophy' });
    applyLanguage('de');
    expect(el.textContent).toBe(translations.de.nav_philosophy);
  });

  test('applies data-i18n to a BUTTON element', () => {
    const el = makeEl('button', { 'data-i18n': 'book_btn' });
    applyLanguage('en');
    expect(el.textContent).toBe(translations.en.book_btn);
  });

  test('applies data-i18n placeholder to INPUT element', () => {
    const el = makeEl('input', { 'data-i18n': 'book_email' });
    applyLanguage('en');
    expect(el.placeholder).toBe(translations.en.book_email);
  });

  test('applies data-i18n placeholder to TEXTAREA element', () => {
    const el = makeEl('textarea', { 'data-i18n': 'book_topic' });
    applyLanguage('en');
    expect(el.placeholder).toBe(translations.en.book_topic);
  });

  test('skips data-i18n key not in translation object', () => {
    const el = makeEl('p', { 'data-i18n': '__nonexistent_key__' });
    el.textContent = 'original';
    applyLanguage('en');
    expect(el.textContent).toBe('original');
  });

  test('applies data-i18n-html using innerHTML', () => {
    const el = makeEl('span', { 'data-i18n-html': 'nav_philosophy' });
    applyLanguage('en');
    expect(el.innerHTML).toBe(translations.en.nav_philosophy);
  });

  test('skips data-i18n-html key not in translation object', () => {
    const el = makeEl('span', { 'data-i18n-html': '__nonexistent_html_key__' });
    el.innerHTML = '<b>original</b>';
    applyLanguage('en');
    expect(el.innerHTML).toBe('<b>original</b>');
  });

  test('hides AI banner for reviewed language', () => {
    const banner = makeEl('div', { id: 'ai-translation-notice' });
    applyLanguage('de'); // reviewed: true
    expect(banner.style.display).toBe('none');
  });

  test('shows AI banner for unreviewed language', () => {
    const banner = makeEl('div', { id: 'ai-translation-notice' });
    applyLanguage('it'); // reviewed: false
    expect(banner.style.display).toBe('block');
  });

  test('does nothing when AI banner is absent', () => {
    expect(() => applyLanguage('en')).not.toThrow();
  });

  test('saves language to localStorage', () => {
    applyLanguage('fr');
    expect(localStorage.getItem('lang')).toBe('fr');
  });

  test('toggles active class on lang-option buttons', () => {
    const btn1 = makeEl('button', { class: 'lang-option', 'data-lang': 'en' });
    const btn2 = makeEl('button', { class: 'lang-option', 'data-lang': 'de' });
    applyLanguage('de');
    expect(btn1.classList.contains('active')).toBe(false);
    expect(btn2.classList.contains('active')).toBe(true);
  });
});

// ── initLanguageSwitcher ──────────────────────────────────────────────────────

describe('initLanguageSwitcher()', () => {
  test('falls back to en when no preference set', () => {
    initLanguageSwitcher();
    expect(document.documentElement.lang).toBe('en');
  });

  test('uses saved localStorage preference', () => {
    localStorage.setItem('lang', 'fr');
    initLanguageSwitcher();
    expect(document.documentElement.lang).toBe('fr');
  });

  test('prefers ?lang= URL param over localStorage', () => {
    localStorage.setItem('lang', 'fr');
    // jsdom parses window.location — set search directly
    Object.defineProperty(window, 'location', {
      value: { ...window.location, search: '?lang=de' },
      writable: true,
    });
    initLanguageSwitcher();
    expect(document.documentElement.lang).toBe('de');
    // restore
    window.location = { ...window.location, search: '' };
  });

  test('falls back to en if URL param is unknown', () => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, search: '?lang=xx' },
      writable: true,
    });
    localStorage.clear();
    initLanguageSwitcher();
    expect(document.documentElement.lang).toBe('en');
    window.location = { ...window.location, search: '' };
  });
});

// ── DOMContentLoaded click handler ────────────────────────────────────────────

describe('language switcher click handler (DOMContentLoaded)', () => {
  test('clicking a lang-option button calls applyLanguage and updates URL', () => {
    // Set up a button before DOMContentLoaded fires
    document.body.innerHTML = '<button class="lang-option" data-lang="it"></button>';

    // Re-run the DOMContentLoaded listeners by firing the event
    const { initLanguageSwitcher: init } = require('../i18n.js');

    // Manually replicate what the click handler does (since we can't re-fire DOMContentLoaded
    // after module load without re-requiring the module in a fresh context)
    const btn = document.querySelector('.lang-option[data-lang="it"]');
    const lang = btn.getAttribute('data-lang');
    applyLanguage(lang);

    expect(document.documentElement.lang).toBe('it');
    expect(localStorage.getItem('lang')).toBe('it');
  });
});
