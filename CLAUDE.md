# Stefan-Olav Hüllinghorst — Personal Homepage

## Project overview
Personal homepage for Stefan-Olav Hüllinghorst, hosted on GitHub Pages at [steefsteefsen.github.io](https://steefsteefsen.github.io).

## Tech stack
Plain HTML/CSS/JS — no build tools, no frameworks, no dependencies beyond Google Fonts.
Vue.js is used for the CareerGraph project (separate repo), not for this homepage.

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
4. **Local Businesses (Berlin) — map links: OpenStreetMap only, never Google.** For any Berlin-based local business, the location/map link must point to OpenStreetMap (e.g. `https://www.openstreetmap.org/?mlat=...&mlon=...#map=18/...` or `https://www.openstreetmap.org/node/<id>`). Do not link to Google Maps, do not embed a Google Maps iframe, and do not use a Google place ID. If the business has its own website, link the website too — but the *map* link is OSM. This applies to the card body, footnotes, and any structured data.

5. **Geo-research source order: OSM first, Google second.** When researching any place — addresses, opening hours, business names, postal codes, neighbourhood boundaries — always query OpenStreetMap (Nominatim or Overpass) **before** falling back to Google search results. OSM is the authoritative source for this site; Google is a fallback for cases where OSM has no data, and even then the Google answer must be cross-checked against the business's own primary source (its website, its registry entry, etc.) before it ends up on the page. Reasons: OSM is community-owned, ODbL-licensed, and queryable without tracking; Google's free-text results are vulnerable to outdated SEO duplicates and misattributions. If OSM and Google disagree, OSM wins unless a primary source confirms otherwise.

#### Pre-flight checklist for a new local-business card
Before Claude builds the card, Stefan must collect on-site (verbal OK to feature is *not* enough — Claude needs the data):
- **Exact business name** as on the shop sign (not "the Späti at Kotti", not "the African restaurant on my street"). Also: nail the *category* — restaurant vs. shop vs. bar vs. Späti — before resolving OSM, because OSM tags differ (`amenity=restaurant` vs. `shop=*` vs. `amenity=pub`).
- **Exact street + house number.** OSM may use ASCII spelling (e.g. "Bärwaldstraße" → "Baerwaldstraße"); Claude resolves the OSM spelling, Stefan supplies the human one.
- **Postal address sanity check.** Berlin renamed several streets recently (e.g. Kohlfurter Str. → Regina-Jonas-Str. in Dec 2023). Confirm with the owner which name they want printed — official-current vs. neighbourhood-known.
- **Tier classification (per privacy rule).** Is the *business* the subject (Tier-1-style: name the shop, link website + OSM) or is the *owner* the subject (Tier 2: shop name only if it is itself a public-facing brand, no owner surname, OSM map link only, no Insta/LinkedIn/website-of-the-person)? When unclear, ask the owner what they want linked.
- **One-sentence "why I push them"** from Stefan — the angle that goes on the card (sortiment, late-night reliability, kindness, neighbourhood anchor, etc.).
- **Photo of the shop sign / logo** (phone snap is fine) — used both to confirm the name and as artwork source. If no usable artwork, the card uses a text-only layout, not a stand-in image.
- **Owner consent record.** A verbal "yeah push us" is the bar; note date + who said it in the commit message so we have a paper trail if anyone objects later.

If any field is missing, Claude does not guess — Claude asks Stefan and waits.

#### Resolution test (mechanical CI guard)
`tests/local-resolve.test.js` runs against every local-business card and
verifies that:
1. the card with the expected `<h3>` exists in `index.html`
2. the card has at least one external link
3. every external link resolves (HTTP < 400). For `openstreetmap.org/`
   links the OSM API is queried so a deleted node/way fails even when
   the public page renders a generic shell.

When adding a new local-business card, append the exact `<h3>` text to
`EXPECTED_LOCAL_CARDS` in that test file. Skip with `JEST_SKIP_NETWORK=1`
when offline. The pre-push hook should run with network so a 404'd OSM
node is caught before users see it.

### Test the visitor's setup before rendering it
**Hard rule: every external resource the site offers a visitor — Visit
button, OpenStreetMap link, embedded iframe, image source, font CDN —
must be probed before it ships.** "Probe" means: real HTTP request from
this machine, status < 400, valid TLS, expected content type. If the
probe fails or is ambiguous, the link does not ship; the card renders
without it (text-only, OSM-only) until the upstream is fixed.

This rule exists because Stefan's visitors do not all run modern Chrome
on a fast line. They land on Firefox-on-mobile, NoScript-on-desktop,
strict-DNS networks, or sometimes a TLS-1.2-only ancient browser. A
"Visit" button that 301-redirects to a PDF on a third-party WordPress,
or a domain whose HTTPS handshake fails with `unrecognized name`, is
worse than no link — it breaks the visitor's session and reads as
sloppy.

Concrete checks Claude must run before adding any external link to a
support card, idol card, blog post or footnote:
1. **DNS resolves** (`host <domain>`) and the IP is sensible.
2. **HTTPS handshakes cleanly** (`curl -sI https://<host>/`) — no TLS
   alert `unrecognized name`, no certificate mismatch.
3. **HTTP status < 400** on the actual URL the card uses (not the
   apex). Follow redirects: a Visit link that redirects from
   `howzitbielefeld.de` to a WordPress PDF is *not* a Visit link, it's
   a download — surface that and ask Stefan whether to drop the link
   or rephrase the button.
4. **Content type matches the affordance.** "Visit" implies HTML.
   "OpenStreetMap" implies osm.org. If the upstream returns
   `application/pdf`, the affordance is wrong even if the byte stream
   loads.
5. **OSM links go through the OSM API** (`api.openstreetmap.org/api/0.6/<kind>/<id>`)
   so a deleted node fails even when the public page renders a generic
   shell. The local-resolve test does this automatically.

Failure mode: prefer **fewer working links over more broken ones**. A
card with one OSM link that resolves is shippable. A card with a
website link that times out is not — drop the link, leave a TODO in
the commit, and tell Stefan that the upstream needs fixing on their
side before we link it.

### Status badges on cards (Try & Error pattern)
Cards can carry a status badge to mark them as "still being figured out"
without moving them into a separate section. The badge is a sibling of
the `<h3>` — between the title and the paragraph. Use it sparingly; if
half the cards in a section carry it, the badge has lost meaning.

Markup:
```html
<div class="support-card support-card--local reveal">
  <h3>Bucht Kollektiv</h3>
  <span class="status-badge status-badge--try">Try &amp; Error</span>
  <p data-i18n="local_buchtkollektiv_p">…</p>
  …
</div>
```

Why this lives as a per-card badge instead of a "Try & Error" section:
the privacy rule (Tier-1 vs Tier-2) is a *card* property, not a section
property. A separate section would force every card in it to share a
single tier policy, which collides with reality — some collectives are
public, others are friends-of-friends. The badge respects each card's
existing tier classification while still surfacing the "still
experimental" status.

Adding a new badge variant (e.g. `status-badge--seasonal`,
`status-badge--archive`): mint a new modifier class, add the styling
under the existing `.status-badge` block in `index.html`, and update
the structural test in `dom-structure.test.js` if the new variant
needs different placement rules. The base test guarantees every badge
carries *some* modifier class and sits after its `<h3>` — that
contract should not break.

### Card artwork — multi-format buffering (Johann/MBzwo pattern)
For business and artist cards where artwork quality matters, ship **multiple resolutions** of the same image and let the browser pick based on network conditions. Credit: Johann, CEO of MBzwo, who introduced this pattern — sharper image when the line is fast, lighter image when it's not, no JS needed.

Implementation:
- Store assets as `name-320.webp`, `name-640.webp`, `name-1280.webp` (and a `.jpg` fallback at one size for older browsers) under `images/local/` or `images/artists/`.
- Use the native `<img srcset>` + `sizes` attributes — the browser handles the negotiation:
  ```html
  <img
    src="images/local/shopname-640.jpg"
    srcset="images/local/shopname-320.webp 320w,
            images/local/shopname-640.webp 640w,
            images/local/shopname-1280.webp 1280w"
    sizes="(max-width: 600px) 320px, (max-width: 1024px) 640px, 1280px"
    alt="<business name> shopfront"
    loading="lazy">
  ```
- `loading="lazy"` is mandatory for cards below the fold.
- Don't ship a single 2MB JPEG and call it done — the whole point is the buffer of formats.
- Keep originals (the unscaled source) in `images/_originals/` outside the deploy, so we can re-derive resolutions later without losing quality.

### Adding a new blog post
Blog posts support DE + EN. Each post is two HTML files (one per language) plus one entry in `blog/posts.json`.

1. Write the DE post at `blog/posts/<slug>.html` and the EN post at `blog/posts/<slug>-en.html`.
2. Each file includes a language toggle in the nav linking to its sibling. The "← Blog" link in the EN post goes to `/blog/?lang=en`.
3. Any assets (SVG, images) go in `blog/images/`.
4. Append an entry to `blog/posts.json` with this shape — newest first:
   ```json
   {
     "slug": "<slug>",
     "date": "YYYY-MM-DD",
     "translations": {
       "de": {"slug": "<slug>", "title": "...", "teaser": "..."},
       "en": {"slug": "<slug>-en", "title": "...", "teaser": "..."}
     }
   }
   ```
5. Regenerate feeds: `node generate-feed.js` (writes `feed.xml` and `feed-en.xml`).
6. If the post makes factual claims about software status (releases, audits, maintenance), verify each against the project's GitHub releases/commits before publishing.

**Drafts and scheduled posts** go in `blog/planned/` instead of `blog/posts/`.
Files there are pushed with the repo (so multiple machines see the same draft)
but stay invisible publicly: not in `posts.json`, not in the feeds, not linked
from the blog index. To release one, move both language files to `blog/posts/`
and follow the steps above.

### Adding a new idol card
- Place `<div class="value-card" x-data="{open:false}">` inside `#idols .values-grid`.
- Include: icon, h3, short paragraph, optional blockquote, `card-more-btn` button, `x-collapse x-show="open"` div with video embed or placeholder.

### i18n rules
- Only update DE + EN first. Wait for explicit instruction before updating other languages.
- All user-facing strings that appear in multiple languages must have a `data-i18n="key"` attribute pointing to an entry in `i18n.js`.
- Hardcoded content (personal names, addresses, URLs) does not need i18n keys.
- **Bilingual content order: DE first, EN second.** When a single page or
  block contains both DE and EN side-by-side (open letters, manifestos,
  inline-bilingual sections that are not driven by `data-i18n` switching),
  the German text comes first, the English text second. The site is
  primarily a German person's homepage; the EN mirror is a courtesy to
  international readers, not the default. The same rule applies even
  when the addressee is anglophone (e.g. an open letter to an English
  speaker): DE is the publisher's voice, EN is the courtesy translation.
  Exception: if a piece of content is *exclusively* aimed at an English
  audience and has no German counterpart, EN may stand alone.


### Footnote numbering (current state)

The `<ol>` in `<section class="footnotes">` auto-numbers entries 1, 2, 3 …
in document order. Every in-text `<sup class="fn">N</sup>` must reference
the **N-th `<li>`** in that list — and every `<li>` must be referenced
by at least one `<sup>`. The jest suite enforces this (see "footnote
numbering" describe block in `tests/dom-structure.test.js`).

When adding or removing a footnote: update the table below, the `<sup>`
markers, and the `<li>` order in the same commit. Don't leave gaps and
don't leave orphans.

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
| 18 | Özil documentary (Amazon Prime, 2022) — referenced from Philosophy reflection paragraph |
| 19 | Rec & Play (Skinny Shef quote) |
| 20 | Tschaikowski — Symphony No. 4, II. Andantino oboe solo |
| 21 | OY — Berlin duo + Salon at Rummels Bucht + Bucht der Träumer Festival |
| 22 | "Strong minds discuss ideas…" — misattributed to Socrates, traces to H. T. Buckle |
| 23 | YAAM Berlin (Young African Art Market, Schillingbrücke 3) — referenced from Ciao Ella card |

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

## Post-deploy responsiveness test

After each deployment, manually verify the UI at three breakpoints using browser DevTools (or a real device):

| Breakpoint | Width | What to check |
|---|---|---|
| Mobile | 375px (iPhone SE) | Cards stack to single column, no horizontal scroll, idol cards fully readable, nav links don't overflow |
| Tablet | 768px (iPad) | 2-column grid, images not clipped, blockquotes don't overflow |
| Desktop | 1280px | 3+ column grid, no layout shift, section max-width respected |

**Automated check (axe-cli):**
```bash
npx axe http://localhost:8080 --exit
```

**Quick local server:**
```bash
cd /home/steef/stefan-site && python3 -m http.server 8080
```

The key responsive rule for `.values-grid` is `minmax(min(240px, 100%), 1fr)` — the `min()` prevents cards from overflowing their container on narrow viewports.

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

## "Review" means Stefan reviews — start the local server

When Stefan says **"review"** (e.g. "ich reviewe", "lass mich reviewen",
"warte mit Push, ich reviewe"), he means *he* will look at the site
himself in his browser. The human is the reviewer, not Claude. Claude's
visual judgment caps at maybe 95% of what a human catches; the rest is
context, taste, and the Mendix-instinct that Stefan brings.

What to do when Stefan says "review":
1. Make sure `python3 -m http.server 8080` is running in the background
   (start it if not — check first with `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/`).
2. List the URLs Stefan should open, including DE/EN variants if the
   change has both.
3. Wait. Don't push, don't keep editing, don't pre-empt. He'll come back
   with feedback or with "OK push".

Headless screenshots are still useful as a *sanity check before handing
off* (e.g. "I rendered it once headless to confirm it loads"), but they
do not replace the human review.

## Gender-inclusive language (German, hard requirement) — Neutrum first

All German-language content on the site uses **gender-inclusive language**,
**Neutrum or collective forms first**, before any other strategy.

Preferred patterns, in strict order:

1. **Neutrum / abstract noun first.** This is the default move. "der kleine
   Mann" → "das einfache Leben". "der Bürger" → "die Bevölkerung". "der
   Wähler" → "die Wählerschaft". "der Künstler" → "die Kunstszene".
   "der Forscher" → "die Forschung" oder, wenn Personen gemeint sind,
   substantiviertes Partizip: "Forschende".
2. **Substantiviertes Partizip / Adjektiv (kollektive Personenform).**
   "Studenten" → "Studierende". "Mitarbeiter" → "Mitarbeitende". "Nutzer"
   → "Nutzende". "Wissenschaftler" → "Forschende". "Aktivisten" →
   "Aktive". This is the second-best move and works in most cases.
3. **Plural / Kollektivum.** "die Pflegekraft" stays singular; for plural
   "die Pflegenden". "die Kunden" → "die Kundschaft". Use when the abstract
   noun (1) doesn't fit and substantiviertes Partizip (2) reads stiff.
4. **Verb-based personalization with "wer …".** "Wer um 5 Uhr im Pflegeheim
   steht" rather than "Der Pfleger, der …". Use when a sentence is built
   around a single hypothetical actor.
5. **Doppelpunkt only as last resort.** "Bürger:innen" — only if 1–4
   genuinely don't work. Never use Gender-Stern (`*`).

Pronoun rules following these subjects:
- After "das einfache Leben" / "die Bevölkerung" / "die Forschung" → "es" / "sie".
- After "die Forschenden" / "die Studierenden" → "sie" (plural).
- After a "wer …" clause → re-use "wer das tut, …" or restructure;
  do not switch to "er".
- Never default to "er" / "ihn" / "ihm" for a generic role.

Hard "do not"s:
- Generic-masculine nouns ("der Bürger", "der Mensch im Land") as the
  default subject of a sentence.
- "Er" / "ihn" when the antecedent is a generic role rather than a named
  person.
- Colloquial "kriegt" — write "bekommt".
- "Kamerad" / "Schulkamerad" — historically loaded in German
  (Wehrmacht, AfD-circles). Use **"Kompagnon"** / **"Schulkompagnon"**,
  or restructure ("ein Freund aus Schulzeiten", "wir waren zusammen
  auf der Schule").

Exceptions (do NOT rewrite):
- **Quotes from named people** (blockquotes, footnoted citations) — their
  words stay verbatim.
- **Concrete named individuals** referred to with the correct grammatical
  gender (e.g. "Pasadakis ist Lecturer und Postdoc" — Pasadakis is a
  specific man, this is not generic-masculine).
- **Stefan's first-person self-description** ("Ich bin ein Macher") — it's
  a self-statement, not a generic claim.

This applies to: index.html, blog posts (DE), pillar pages (movement/,
science/, ethics/, mentorship/, tribe/, philosophy/), idol cards,
footnotes, hero copy, all i18n.js DE entries. EN content follows
standard inclusive-English conventions (singular "they", avoid "mankind",
etc.) — no special German rules apply.

When generating new DE copy, always run a final scan with patterns like:
```
\b(der|dem|den) (Bürger|Wähler|Mitarbeiter|Pfleger|Lehrer|Künstler|Forscher|Entwickler|Gründer|Politiker|Aktivist|Sportler|Kunde|Nutzer|Leser)\b
\bAktivisten|Mitarbeiter|Wähler|Studenten|Anwender|Kunden|Wissenschaftler|Bürger\b
\bkriegt\b
\b(Schul)?[Kk]amerad(en|in|innen)?\b
```
If any hit, route through patterns 1→5 above before shipping.

## Source-citation rule (hard requirement)

**Every factual claim on the site or in a blog post must have a source citation.**
This includes — but is not limited to — statements about people, organizations,
events, statistics, software status, legal frameworks, government recommendations,
historical claims, and quotes.

How to cite:
- **In the page**: footnote `<sup class="fn">N</sup>` plus a `<li>` entry in the
  `<section class="footnotes">` with title, publisher, and URL.
- **In a blog post**: inline link via `<a href="..." rel="noopener" target="_blank">`
  to the primary source. Prefer the original (publisher's site, official PDF,
  GitHub release page) over secondary aggregators.
- **For quotes**: include the speaker, the work or context, and a link if the
  quote is verifiable online.
- **For software status, audits, releases**: link the GitHub release tag or
  the commit, not a third-party blog summarizing it.

If you cannot find a primary source, do not make the claim — soften the
language ("often described as", "according to X"), add a clear caveat, or
omit the line. Never fabricate a source. Never paraphrase a fact you cannot
verify into something that sounds confident.

This rule applies to Claude when generating content too: do not write a
"sounds plausible" sentence about a real person, organization, or event
without an attached link to where you got it. If a draft has facts without
sources, mark them with `[ SOURCE NEEDED ]` and ask Stefan, rather than
silently shipping unsourced text.

## Privacy rule for third parties (hard requirement)

**Don't namedrop. The source-citation rule and the privacy rule pull in
opposite directions and the privacy rule wins.** Every real-person
mention on the site is classified into one of two tiers, and the tier
determines what you may publish.

### Tier 1 — Public-interest persons

People who are public figures *on the basis you are citing them*:
politicians, published authors, internationally-touring artists with
press kits, named-position academics with public faculty pages, Wikipedia-
eligible historical figures.

**Allowed:** full name, all relevant links (Wikipedia, official site,
faculty page, press piece, Bandcamp, Spotify, SoundCloud, etc.), normal
source-citation rule applies.

**Examples on this site:** Linus Torvalds, Albert Einstein, Edward
Snowden, Jimmy Wales, Sokrates, Plato, Dave Chappelle, SSIO, Wu-Tang
Clan, Mobb Deep, The Notorious B.I.G., 2Pac, Nina Simone, Leonard
Cohen, K.I.Z, Gregor Gysi, Prof. Dr. Paula Herber (named faculty
position), Pjotr Iljitsch Tschaikowski, Mesut Özil, Sandra Frotscher
(she publishes herself at sandrafrotscher.com, the domain matches her
name), Dimosthenis Pasadakis (reviewed his card; published academic).

### Tier 2 — Private persons

Friends, collaborators, family members of a subject, people Stefan met
in passing, anyone who isn't publicly findable in the role being cited.

**Identifier format:** `Vorname N.` — first name plus initial of
surname only. (Stefan Hüllinghorst → Stefan H.) Stage names that the
person publishes themselves are fine as-is (Greyscale, REYNEKE, S. Bass,
Skinny Shef, Ciao Ella, O/Y).

**Outbound links: SoundCloud only.** No LinkedIn, no Instagram, no
personal website, no portfolio, no Bandcamp, no Spotify. One
SoundCloud link per private person, or zero. Even if the person links
themselves elsewhere, the site only points at SoundCloud.

**Don't add:** real surnames, employers, alma mater, schools, neighbourhood,
relatives, partners, social graph ("his sister X", "her partner at Y",
"they grew up with Z"), even if a third-party source confirms it. The
fact that someone *can* be sourced doesn't mean it belongs on the site.

**When in doubt, ask Stefan before shipping.** "Is this person Tier 1
or Tier 2?" and "Should I include the sibling fact?" are the right
questions. Don't decide unilaterally based on what you can find on
the open web.

### Applies to Claude generating content too

If a draft mentions people in someone's circle by name, role, relation,
employer, or school, strip those mentions before shipping unless the
person is Tier 1 *on that basis*. Default to Tier 2.

### Enforcement

The jest suite enforces both halves of the rule mechanically:

- `describe('tier-2 privacy rule')` in `tests/dom-structure.test.js`
  walks each Tier-2 stage name and asserts that every `<a href>` inside
  that card resolves to `soundcloud.com`. Adding a new private-person
  card means appending the stage name to `TIER_2_STAGE_NAMES` in that
  file.
- `describe('banned-string sweep')` in the same file blocks
  reintroduction of named private people in `index.html` and `i18n.js`.
  When you scrub a private-person reference, append the surname /
  collaborator name to `BANNED_PRIVATE_REFERENCES` so CI catches
  regressions.

## Known architectural decisions
- No build step — all CSS and JS is inline in `index.html` to keep the deploy as a single file with no asset pipeline.
- Alpine.js loaded from CDN for the collapsible card interactions (`x-data`, `x-collapse`, `x-show`).
- `IntersectionObserver` with `threshold: 0, rootMargin: '0px 0px -50px 0px'` for scroll-reveal — chosen because tall grids (idols) were invisible on mobile with the previous `threshold: 0.15`.
- Push always goes to `gitlab` remote; GitHub is a read-only mirror via GitLab CI.

## Known quirks (intentional, do not "fix")
- **Hero `Explore` scroll-hint sits slightly off** in its CSS positioning. Stefan flagged this 2026-04-29 and asked to leave it as-is — it became the anchor for the red-flag Easter-Egg (see below). Don't normalise the position.
- **Explore Easter-Egg: red flag with Pianosa escalation.** Hovering the `.scroll-hint` reveals a small red flag with a white carnation. The first hover stays at Stage 1 (ja, gentle wave). Second hover bumps to Stage 2 (hm, restless). Third hover and beyond stays at Stage 3 (eskalation, capped). State persists across `mouseleave` for the lifetime of the tab — only a page reload resets to Stage 1. **In-memory only**, no cookies, no localStorage, no server. Doubles as a 1st-of-May reference (movement, not party). Respects `prefers-reduced-motion`. Tested in `tests/red-flag-jsdom.test.js`.
