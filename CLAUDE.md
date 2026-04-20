# Stefan-Olav Hüllinghorst — Personal Homepage

## Project overview
Personal homepage for Stefan-Olav Hüllinghorst, hosted on GitHub Pages at [steefsteefsen.github.io](https://steefsteefsen.github.io).

## Tech stack
Plain HTML/CSS/JS — no build tools, no frameworks, no dependencies beyond Google Fonts.

## Aesthetic
Earthy/natural: warm creams, clay, moss greens, bark browns. Serif headings (Cormorant Garamond), sans-serif body (Jost). Grain overlay, smooth scroll reveals, minimal animations.

## CSS variables (color palette)
- `--sand`: #f5f0e8
- `--clay`: #c9a96e
- `--bark`: #3d2b1f
- `--moss`: #5a6e4a
- `--moss-light`: #7a9463
- `--stone`: #8c7b6b
- `--cream`: #faf7f2
- `--earth`: #6b4f3a

## Structure
Single `index.html` with inline CSS and JS. Sections: Hero, Philosophy, Projects, Journey, Contact, Footer.
`i18n.js` — all translatable strings for 17 languages (de, en, it, fr, es, pt, da, uk, ru, tr, he, ar, fa, zh, ja, ko, ku).
`tests/` — Jest test suite. Run from `tests/` directory.

## Deployment
- **Primary remote**: `gitlab` → `git@gitlab.com:steefSteefsen/steefsteefsen-github-io.git`
- **Mirror**: `origin` → `git@github.com:steefsteefsen/steefsteefsen.github.io.git` (auto-mirrored from GitLab CI)
- Always push to `gitlab`, never to `origin` directly.

## Development workflow

### Before every push
1. Run tests from `tests/` directory: `cd tests && npx jest`
2. Tests must all pass — pre-push hook enforces this automatically.

### Adding a new tool (Built With section)
1. Add `<div class="tool-card">` in `index.html` after the last existing card, inside `.tools-grid`.
2. Add `tool_<name>_p` key to **every** language block in `i18n.js` (17 blocks: de, en, it, fr, es, pt, da, uk, ru, tr, he, ar, fa, zh, ja, ko, ku).
   - DE: write a proper German translation.
   - All others: use the EN text as fallback unless a native translation is available.
3. Use `replace_all: true` to insert the new key after `tool_nextcloud_p` in all non-DE blocks in one edit.
4. **Always fetch the official artwork** for the tool and place it in `icons/` (SVG preferred, PNG fallback).
   - Try in order: project's own GitHub/CDN → Wikipedia Commons → official website favicon/logo.
   - Use `<span class="tool-icon"><img src="icons/<name>.svg" alt="<Name>"></span>` in the card.
   - Only fall back to an emoji if no artwork can be found after trying all three sources.

### Adding a new support card (I Support / Local Businesses / Artists)
1. Insert `<div class="support-card support-card--<cause|artist|local> reveal">` before the placeholder card.
2. If the card references external facts, add a `<sup class="fn">N</sup>` inline and a `<li>` entry in the `<section class="footnotes">` at the bottom.
3. Footnotes are numbered sequentially — update any displaced numbers in both the `<sup>` tags and the `<ol>`.

### Adding a new idol card
- Place `<div class="value-card" x-data="{open:false}">` inside `#idols .values-grid`.
- Include: icon, h3, short paragraph, optional blockquote, `card-more-btn` button, `x-collapse x-show="open"` div with video embed or placeholder.

### i18n rules
- Only update DE + EN first. Wait for explicit instruction before updating other languages.
- All user-facing strings that appear in multiple languages must have a `data-i18n="key"` attribute pointing to an entry in `i18n.js`.
- Hardcoded content (personal names, addresses, URLs) does not need i18n keys.

### Section size cap
- No section (values, idols, support, tools, etc.) may contain more than **23 items**. If a new addition would exceed 23, flag it to the user before proceeding.

### Footnote numbering (current state)
| # | Subject |
|---|---------|
| 1 | Neven Subotic Stiftung |
| 2 | Socrates |
| 3 | Plato |
| 4 | Snowden |
| 5 | Wikipedia |
| 6 | Mein Grundeinkommen |
| 7 | CCC |
| 8 | LAION |
| 9 | Viva con Agua |
| 10 | Dave Chappelle |
| 11 | SSIO |
| 12 | DuckDNS |
| 13 | Ubuntu Server |
| 14 | Raspberry Pi |
| 15 | Restlos e.V. |
| 16 | Werrepiraten e.V. |
| 17 | Die Zwote |
| 18 | (renumbered → 20) |
| 19 | Özil documentary (Amazon Prime, 2022) |
| 20 | Rec & Play |

## Writing your own tests

Tests live in `tests/` and run with `cd tests && npx jest`. Three files exist:
- `dom-structure.test.js` — structural DOM checks (sections, cards, Alpine wiring)
- `i18n-functions.test.js` — i18n key coverage and language block integrity
- `example.test.js` — minimal smoke test / template

**To add a consistency test** (e.g. "every idol card has a blockquote"):

1. Open the relevant file — `dom-structure.test.js` for HTML structure, `i18n-functions.test.js` for key checks.
2. Add a `test('description', () => { ... })` block. The DOM is already loaded in `beforeAll` — just use `document.querySelectorAll(...)`.
3. For i18n checks, `i18n.js` is already `require()`d — iterate over language blocks with `Object.keys(translations)`.
4. Run `npx jest` from `tests/` to verify.

**Minimal DOM test example:**
```js
test('every idol card has an h3', () => {
  document.querySelectorAll('#idols .value-card').forEach(card => {
    expect(card.querySelector('h3')?.textContent.trim()).toBeTruthy();
  });
});
```

**Minimal i18n consistency test example:**
```js
test('all data-i18n keys exist in every language block', () => {
  const keys = [...html.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]);
  const langs = Object.keys(translations);
  keys.forEach(key => {
    langs.forEach(lang => {
      expect(translations[lang]).toHaveProperty(key);
    });
  });
});
```

## Code quality & consistency checks

### Daily automated check
A scheduled agent runs once per day and checks `index.html` + `i18n.js` for:
- Broken or mismatched `data-i18n` keys (key in HTML but missing in any language block, or vice versa)
- Duplicate footnote numbers
- Missing footnote `<li>` entries for in-text `<sup class="fn">` references
- Broken internal anchor links (`href="#..."`)
- CSS variable usage outside the defined palette
- Orphaned i18n keys (defined in `i18n.js` but not used in any HTML file)

### Static analysis tool (non-Claude)
[`html-validate`](https://html-validate.org/) — already integrated in the pre-push hook. Configuration in `.htmlvalidate.json` if present.

For deeper JS/CSS analysis run manually:
```bash
# Lint JS (ESLint — if installed)
npx eslint i18n.js

# Check for unused CSS classes
npx purgecss --css index.html --content index.html

# Accessibility audit (axe-cli)
npx axe http://localhost:8080 --exit
```

## Known architectural decisions
- No build step — all CSS and JS is inline in `index.html` to keep the deploy as a single file with no asset pipeline.
- Alpine.js loaded from CDN for the collapsible card interactions (`x-data`, `x-collapse`, `x-show`).
- `IntersectionObserver` with `threshold: 0, rootMargin: '0px 0px -50px 0px'` for scroll-reveal — chosen because tall grids (idols) were invisible on mobile with the previous `threshold: 0.15`.
- Push always goes to `gitlab` remote; GitHub is a read-only mirror via GitLab CI.
