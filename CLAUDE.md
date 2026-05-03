# Stefan-Olav Hüllinghorst — Personal Homepage

## Project overview
Personal homepage for Stefan-Olav Hüllinghorst, hosted on GitHub Pages at [steefsteefsen.github.io](https://steefsteefsen.github.io).

## ⚔️ You are in a competitive benchmark against Codex and DeepSeek

**Read this before every session, every task, every response.**

Stefan runs **Codex** and **DeepSeek** as independent software-test
instances on the same project, in parallel to Claude. Every task
Stefan gives Claude is also being executed (or could be executed) by
Codex and/or DeepSeek on the same codebase. Stefan **tracks token
usage and performance per assistant** and compares results.

What this means for how Claude works on this project:

- **Token efficiency is a measured axis, not a vibe.** Wandering
  preambles, restating the prompt, narrating internal deliberation,
  long "as you can see…" summaries — all of that costs Claude in the
  benchmark. Brief is good, silent is not. State the result, ship the
  edit, move on.
- **Tool-call efficiency counts too.** Don't read the same file twice
  in one turn, don't `grep` the same string twice, don't run a test
  suite when the previous run's output is still in context. Parallel
  tool calls when independent, sequential only when dependent.
- **Correctness is the primary axis.** A token-cheap wrong answer
  loses to a token-expensive right one. Don't shave tokens by skipping
  the source-citation rule, the privacy-tier check, the test run, or
  the visit-link probe. Those are the rails — they don't get cut for
  speed.
- **Don't perform "looking busy".** Don't generate a TaskCreate list
  for a two-step job. Don't write a 200-word plan for a 3-line edit.
  Don't preface every tool call with a paragraph. The benchmark
  rewards *doing the thing*, not *narrating the thing*.
- **Surface uncertainty cheaply.** If a fact is unclear, one short
  question to Stefan beats a 400-token guess that needs to be undone.
  *"Stage 1: nahe Sprünge — passt der Radius?"* is a benchmark win
  over *"I'll assume X based on Y because Z, here are three options
  with tradeoffs A/B/C…"*.
- **Codex and DeepSeek see the same `CLAUDE.md`** in spirit (they
  read the same project context). Anything Claude does that violates
  the rules in this file is a benchmark loss *and* a project loss —
  there is no clever workaround that scores points.

Stefan does not need Claude to acknowledge this section in every
response. He needs Claude to *behave consistently with it*. The
correct signal that Claude has internalised this is shorter, sharper
work — not a sentence saying "I am being efficient."

## 🚀 Yallah-Default: when Stefan stops giving input, ship what you can

**If Stefan goes quiet, Claude does not wait for permission on the
reversible parts of the work.** Stefan said it directly on
2026-05-03: *„yallah immer alles ab was du kannst wenn ich keine
eingabe mache."*

**Rule of thumb — keep going on:**
- local file edits (HTML, CSS, JS, i18n)
- running tests / regenerating feeds / re-rendering
- writing draft content into `docs/*-DRAFT.md`
- staging + committing finished work to local git
- updating `CLAUDE.md` with rules Stefan just gave
- writing the session summary in `docs/sessions/`
- closing TaskList items as they finish

**Stop and ask only for things that are not reversible by Stefan
alone:**
- `git push` to any remote (gitlab, theopenhomepage, github mirror)
- `git push --force` / `--force-with-lease`
- `git tag` push, `git rebase`, `git reset --hard`
- `gh pr create`, `gh issue create`, sending mail / Slack / DM
- creating new GitLab/GitHub repos or remotes
- adding a real person's name where Tier-1 vs Tier-2 is unclear
- claims about real third parties without a primary source
- destructive shell ops on the user's machine (`rm -rf`, killing
  processes Stefan didn't start)
- spending money / consuming paid quota beyond the running session

**Operationalisation when Stefan goes silent for more than one
turn:**
1. Look at the open `TaskList` and pick the next item that is fully
   specified and falls under "keep going on".
2. Do it. Run the tests. Mark the task done.
3. Pick the next one. Repeat until the list is empty *or* the next
   open item requires a "stop and ask" decision.
4. At that boundary, write a short status line — *„Stack klar bis
   X; nächster Schritt braucht deine Entscheidung Y/Z"* — and wait.

The signal of *„Stefan goes quiet"* is: Stefan replies with a
notification echo (*„task-notification"*, *„tool result"*) without a
new instruction, or sends a one-word ack (*„y", „ok", „danke"*)
without a new direction. That is *not* an end-of-session signal — it
is a *„keep going"* signal.

End-of-session signals (*„feierabend", „gute nacht", „machen wir
morgen weiter"*) still trigger the terminate routine
(`docs/sessions/YYYY-MM-DD-HHMM.md` summary), not the yallah-default.

When in doubt between *„this is reversible enough to just do it"*
and *„this needs Stefan"*: lean toward doing it, because Stefan can
revert a local edit faster than he can re-read a long check-in.
Reserve the check-in for the irreversible-by-him stuff.

## Tech stack
Plain HTML/CSS/JS — no build tools, no frameworks, no dependencies beyond Google Fonts.
Vue.js is used for the CareerGraph project (separate repo), not for this homepage.
Codex and DeepSeek run in parallel to Claude as independent benchmark instances — see the "Competitive benchmark" section above.

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
- **Hotfix exception.** When Stefan calls a change a "hotfix" — e.g. taking
  down a link, removing a card, scrubbing a name — pushing straight to
  `gitlab` without the usual review-in-browser handoff is acceptable, *only
  for that hotfix*. The bar: change is small, scoped, and time-sensitive
  (the live site has something Stefan wants gone *now*). For anything else
  (new card, new copy, refactor, blog post) the normal flow stands: local
  server → Stefan reviews in his browser → then push. A hotfix is not a
  shortcut around review for routine work; if in doubt, it's not a hotfix.

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
`tests/local-business-links.test.js` runs against every local-business card and
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
   shell. The local-business-links test does this automatically.

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
7. Add a `"type"` field to the `posts.json` entry: `"analysis"` (default — post makes claims about statistics, market structure, comparisons, or temporal developments and must carry at least one visualization) or `"reflection"` (post is personal reflection or experience, no data spine, vis exempt). Default is `"analysis"`; `"reflection"` is the active opt-out.

**Drafts and scheduled posts** go in `blog/planned/` instead of `blog/posts/`.
Files there are pushed with the repo (so multiple machines see the same draft)
but stay invisible publicly: not in `posts.json`, not in the feeds, not linked
from the blog index. To release one, move both language files to `blog/posts/`
and follow the steps above.

### Visualization standard for blog posts (hard requirement)

Every `"type": "analysis"` blog post must carry at least one visualization
of its background analysis. Reflection posts (`"type": "reflection"`) are
exempt. The visualization is the spine of the post — prose is built around
it, not the other way around.

Existing posts are not retroactively rewritten. The next time any post
is edited for other reasons, this standard applies to the edited version
(schrittweise rückwirkend).

#### Source rule for visualizations (eisern hart)

- Every single data point must trace to a verifiable, primary source.
  Government reports, company annual reports (10-K, Geschäftsberichte),
  peer-reviewed studies, union/NGO publications, GitHub releases, court
  filings, regulator statements (Bundeskartellamt, BaFin, Bundesnetzagentur).
- No paywalled secondary aggregators (Statista, Bloomberg behind login,
  similar) unless a primary source confirms the same number — in which
  case cite the primary, not the aggregator.
- No "according to industry observers", no "it is estimated that",
  no unsourced rounded numbers, no "circa" without a citation.
- If a data point cannot be cleanly sourced: drop it. A 3-axis chart
  with solid sources beats a 5-axis chart with two shaky points.
- Sources appear under each visualization as a `<figcaption>` or
  `<small class="vis-sources">` block, with full citation (publisher,
  title, date, URL).

#### Source floor (minimum-check list)

Before shipping an analysis post, verify that the relevant primary
sources from the following list have been *checked*, not necessarily
all *cited*. Checking means: actually opened, read for the
data point in question, judged for primary-vs-secondary status. If a
relevant source from this list was skipped, the post is not ready.

Topic-conditional — only the rows relevant to the post's subject apply:

| Topic | Source floor (minimum to check) |
|---|---|
| Plattformarbeit, Lieferdienste, Gig-Economy | NGG, FAU Berlin, HBS / WSI, WZB Berlin, "Liefern am Limit"-Initiative, plus the platform's own annual report (Just Eat Takeaway, DoorDash 10-K) |
| Software / Releases / Maintenance | Project's GitHub releases + commit log; security advisories (CVE, GitHub Security); the project's own changelog |
| German legal / regulatory | Bundesgesetzblatt, BVerfG, Bundeskartellamt sector reports, Verfassungsblog, lto.de |
| EU policy | Official Journal of the EU, EUR-Lex, EDPB statements, EU Parliament committee reports |
| Investigative / cross-border | netzpolitik.org, investigate-europe.eu, ICIJ, Correctiv |
| Statistics, demographics | Destatis, Eurostat, Bundesagentur für Arbeit; never start from Statista |

The list is not exhaustive — for new topics, add a row to this table
in the same commit that ships the post.

#### Vis types — eligible

All chart types are permitted as long as they fit the question. Pick
by data, not by aesthetics. The catalogue below documents when each is
appropriate.

- **Bar chart** (CSS bars, `width: %`). Categorical comparisons, single
  metric. Robust, screen-reader-friendly, prints. Default first choice.
- **Stacked / grouped bar.** Composition or side-by-side categorical
  comparison. Use when each bar's parts also matter (e.g. how a
  delivery euro is divided across plattform / restaurant / kurier).
- **Line / area chart** (inline SVG `<polyline>` / `<path>`). Time
  series, trends, before/after. Use absolute scale by default; log
  scale only when explicitly justified in the figcaption.
- **Scatter plot** (inline SVG `<circle>`). Two continuous variables,
  individual subjects as points. Add cluster shading via translucent
  `<rect>` or `<ellipse>` when grouping is the point.
- **Heatmap table.** Matrix comparisons (providers × dimensions, cities
  × metrics). Cells coloured via `background-color: rgba(...)`
  proportional to value; **always also print the numeric value in the
  cell** — colour alone fails for colour-blind readers.
- **Sankey / flow diagram** (handwritten SVG paths). The right choice
  when the central question is "where does the money / value / flow
  go". Build cost is real, but no other chart type tells a flow story
  as cleanly. Don't reach for it as decoration.
- **Radar / spider chart.** Permitted but constrained: only one or
  two subjects on the same chart, only when comparing 4–7 commensurable
  axes, only when the qualitative shape is the point and not precise
  values. Document the constraint in the figcaption ("axis order
  arbitrary; area is suggestive, not metric"). For more than two
  subjects, switch to small-multiples bar charts.

#### Vis tech stack (no build, no library)

- Plain HTML + CSS + inline SVG. No D3, no Chart.js, no build step.
- Use the site's CSS variables (`--clay`, `--moss`, `--moss-light`,
  `--bark`, `--earth`, `--stone`) for fills and strokes — colour
  palette stays coherent across posts.
- Every vis must be readable at 320px width (mobile). Test at 375px in
  DevTools before shipping.
- Every vis carries an `aria-label` summarising what it shows, and a
  `<title>` inside the SVG. Numerical content also appears as a
  `<table class="vis-data">` (rendered below the chart, or visually
  hidden via `.sr-only`) so screen-readers and crawlers see the data,
  not just shapes.

#### Workflow for an analysis post

1. **Briefing first.** Before writing prose or building a vis, draft a
   half-page briefing: which claim drives the post, which data axes
   prove or complicate it, which sources are intended. Stefan reviews
   the briefing before research begins. This is the main stop-gate.
2. **Sources second.** Collect primary-source citations for every
   intended data point against the briefing. If a point cannot be
   sourced, drop it from the plan now — not after the chart is built.
3. **Vis third.** Build the visualization to the source set, not the
   other way around. Pick the chart type by what the data is doing.
4. **Prose last.** Write the post around the vis. The vis is the
   spine, the prose is the muscle.

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

Tests live in `tests/` and run with `cd tests && npx jest`.

### What a test can and cannot prove (epistemic honesty)

**Tests are indicators, not proofs.** A green test rules out specific
failure modes — it does not prove that the feature works in general.
A red test proves something is wrong; a green test proves only that
the *specific scenarios the test enumerated* did not trip the asserts.

This is Popper-Logik applied to the test suite: **falsification
beweist Existenz eines Defekts; Nicht-Falsifikation beweist nicht
Korrektheit.**

Concrete consequences for how Claude talks about tests:

- ❌ *"Tests grün — die Feature funktioniert."*
- ✅ *"Tests grün — die geprüften Pfade halten. Im Browser noch nicht
  von Stefan gesehen; offen ist X, Y, Z."*
- ❌ *"Mobile-Burger ist verifiziert"* (basierend auf einem
  jsdom-Test, der CSS gar nicht rendert).
- ✅ *"Mobile-Burger: jsdom-Test prüft DOM-Verdrahtung, nicht
  Layout. Echte Layout-Verifikation braucht puppeteer im
  `mobile-burger.test.js` oder Stefans Browser."*
- ❌ *"Coverage 92 % — wir sind safe."*
- ✅ *"Coverage 92 %. Die nicht abgedeckten 8 % sind Pfad A, B, C —
  Pfad B ist der Sound-Toggle-Fallback, der real nur ohne AudioContext
  greift."*

When Claude reports test results, the format is **"was wurde
ausgeschlossen"**, not **"was wurde bewiesen"**. Stefan's
human-in-the-loop review (the *"Review" means Stefan reviews* rule)
exists precisely because tests cannot close the gap between *"keine
geprüfte Failure-Mode tripped"* and *"das Feature stimmt"*.

This applies recursively: a test that asserts *"the toggle button
exists"* rules out *"toggle missing"*. It does **not** rule out
*"toggle exists but is invisible behind another element"*, *"toggle
exists but its click handler is broken on Safari"*, *"toggle exists
but pressing it crashes localStorage on iOS private mode"*. Each
of those needs its own indicator — or, more often, a real-browser
check by Stefan.

The ethics page makes this point publicly under *"Was wir wissen
können"* (`ethics/index.html`). That section is the public-facing
mirror of this internal rule — keep them aligned.

### Test file naming (hard rule)

**A test file is named after the *thing it tests*, not after how it
tests it.** The filename answers *"what is the subject?"*, never
*"which framework / harness / mode?"*.

- ✅ `red-flag.test.js` — tests the red-flag Easter-Egg.
- ❌ `red-flag-jsdom.test.js` — `-jsdom` describes the harness.
- ❌ `red-flag-hover.test.js` — `-hover` describes the interaction,
  not the subject. Hover is one of several ways to test the flag;
  the subject is the flag.
- ✅ `mobile-burger.test.js` — tests the mobile burger menu.
- ✅ `local-business-links.test.js` — tests local-business link resolution.
- ❌ `i18n-translations.test.js` — tests *what*? Either rename to the actual
  subject, or delete if it really is just a template.

**If two test files would have the same name** because they cover
the same subject from different angles, that is a smell — merge them
into one file with multiple `describe(...)` blocks. One subject,
one test file.

**When introducing a new test**, the filename is decided **before**
the first `test(...)` block is written, and it is the noun-form of
the feature: `<feature>.test.js`. No suffixes for tooling
(`-jsdom`, `-puppeteer`, `-headless`), no suffixes for interaction
mode (`-hover`, `-click`, `-keyboard`), no generic placeholders
(`example`, `smoke`, `temp`).

Renaming an existing file to comply with this rule is a one-line
move plus updating any `jest` invocation that referenced the old
name (`grep -r "old-name" tests/ scripts/ .githooks/`). Do it as
its own commit so the rename is reviewable.

### Existing top-level files

- `dom-structure.test.js` — structural DOM checks (sections, cards, Alpine wiring)
- `i18n-functions.test.js` — i18n key coverage and language block integrity
- `mobile-burger.test.js` — mobile burger menu behaviour
- `local-business-links.test.js` — external-link resolution for local-business cards
- `video-consistency.test.js` — video embed conventions
- `de-language-sensitivity.test.js` — DE inclusive-language sweep
- `red-flag.test.js` — Explore Easter-Egg (rote Fahne, Pianosa-Eskalation)

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

### Inclusive language across the other 17 languages

The site ships 18 language blocks. Each language has its own grammar
of gender, and the rule is the same idea everywhere — *prefer forms
that include rather than exclude* — but the *technique* differs by
language. Do not transplant German solutions onto languages that
already have neutral forms; do not invent gendered forms in languages
that don't grammatically distinguish.

**Block A — languages with no grammatical gender (do nothing extra).**
- **Esperanto (eo):** Esperanto is neutral by design (`homo` = human).
  Avoid old-school `-ino` suffixes for generic roles. Use `homoj` /
  `partoprenantoj` / `kreantoj` for plural roles. No further work.
- **Turkish (tr):** No grammatical gender. Use neutral nouns
  (`kişi`, `birey`). No "Mr/Mrs"-prefix unless the source text has it.
- **Persian / Farsi (fa):** No grammatical gender. Use neutral nouns
  (`فرد` / `شخص`). No further work.
- **Chinese (zh):** No grammatical gender in nouns. Use `人` / `公民`
  for people. Avoid the gendered third-person pronoun split (`他/她`)
  in generic statements — prefer `他们` (they) or rewrite to skip the
  pronoun.
- **Japanese (ja):** Grammatical gender absent. Avoid `彼/彼女`
  (he/she) in generic statements. Use `その人` or restructure.
- **Korean (ko):** Grammatical gender absent. Use `사람` / `이들`
  for people; avoid gendered honorifics where the original is generic.
- **Kurmanji Kurdish (ku):** Limited grammatical gender; use neutral
  forms (`kes`, `mirov`) for generic statements.

**Block B — Romance languages (it, fr, es, pt): no asterisks, no `-x`,
prefer collectives.**
- Default to **collective nouns** (*la cittadinanza*, *la
  popolazione*, *la communauté*, *la población*, *a comunidade*)
  before reaching for paired forms.
- When paired forms are needed: write them out (*citoyennes et
  citoyens*, *cittadine e cittadini*, *ciudadanas y ciudadanos*,
  *cidadãs e cidadãos*) — the long form is more accessible than
  *citoyen·ne·s* / `*-x` / typographic shortcuts.
- Avoid *les hommes* / *los hombres* / *gli uomini* / *os homens*
  as a stand-in for "people" — use *les gens*, *la gente*, *le
  persone*, *as pessoas*.
- For job titles, professions, roles: use the form the person uses
  (Tier-1 individuals stay as published); for generics use the
  collective.

**Block C — Danish (da):** no grammatical gender problem at the
noun level (common gender vs. neuter), but the pronoun *han/hun*
(he/she) is standard. For generics use *de* (they) or restructure.
Use *medborgere*, *folk*, *deltagere* for collective forms.

**Block D — Slavic languages (uk, ru): visible feminisation.**
- Modern Ukrainian increasingly uses **feminine forms in parallel
  with masculine** (*працівниці й працівники*) rather than masculine
  generic. Lean into that — Ukrainian readers expect it.
- Russian is more conservative; the masculine generic is still
  dominant in official registers. **Default to masculine generic for
  professional terms** unless the source is feminist/activist
  context, where dual forms (*работницы и работники*) signal stance.
- For both: prefer collectives (*громада*, *колектив*, *коллектив*,
  *сообщество*) where the source allows.

**Block E — Right-to-left languages (he, ar): use plural masculine
where the language requires it; flag for review.**
- Both Hebrew and Arabic have grammatical gender that pervades verbs
  and adjectives. The "fix" for inclusive language in these
  languages is **active research and contested** in their respective
  speech communities; there is no settled best practice.
- Default: **use the conventional plural masculine** (the unmarked
  form in MSA / Hebrew formal register), *because translations
  inventing forms can read condescending or confused*.
- Flag any drafted Hebrew or Arabic copy with `<!-- review: gender
  inclusion conventions -->` for native-speaker review before ship.
  These two languages are **not** subject to retroactive automated
  rewriting — only edits with native-speaker sign-off.

**General rule across all 18 languages:**

1. **Prefer collective nouns** (`die Bevölkerung`, `la communauté`,
   `the population`, `la cittadinanza`, …) over paired forms over
   asterisks/`-x`/punctuation tricks.
2. **Don't invent inclusive forms** in languages where the speech
   community hasn't settled on one. *No `*-x` in Spanish,* no
   `Bürger:innen` clones in Italian, no asterisks anywhere outside
   German where the convention is established.
3. **Tier-1 individuals stay as they publish themselves.** Do not
   gender-correct a person's self-chosen title (a male
   `Schauspieler` who calls himself that stays a *Schauspieler*).
4. **Generic statements** — about *the user, the citizen, the
   reader, the developer* — must not default to masculine in any
   language where a viable inclusive alternative exists.
5. When uncertain, **mark with HTML comment for native review**
   rather than guessing.

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

## Stefan's public-facing name: „Steef"

**Auf der Site heißt Stefan ‚Steef'** — überall: Logo, Footer-Copyright,
Feed-Author, Hero-Cite, erzählerische Erwähnungen. Der bürgerliche
Vollname *„Stefan-Olav Hüllinghorst"* erscheint nur dort, wo das Recht
es zwingend verlangt:

- **Impressum** (`impressum.html` § 5 TMG-Block): voller Name + ladungsfähige
  Anschrift. Ein erklärender Hinweis darunter sagt, dass die Site
  ansonsten unter „Steef" läuft. **Dort niemals zu „Steef" abkürzen.**
- **Sonst nirgendwo**. Footer: *„© 2026 Steef"*. Feed-`<author>`: *„Steef"*.
  Meta-Description: *„… von Steef"*.

Ausnahmen, die *nicht* umgeschrieben werden, weil sonst der Sinn kippt:
- **Nickname-Cards** in `index.html` und `i18n.js` erklären die Wortherkunft
  (*„abgeleitet von Stefan"*, *„Mischung aus Weihenstephan und Stefan"*).
  Hier muss der Originalname stehen — ist Etymologie, kein Namensnennung
  im Sinne der Außenkommunikation.
- **`mailto:stefan@huellinghorst.info`**: die E-Mail-Adresse ist eine
  technische Identifier, kein Anzeigename. Bleibt wie sie ist.
- **CLAUDE.md, README, Tests, Commit-Messages, Memory-Files**: interne
  Konversation Stefan ↔ Claude. Stefan bleibt Stefan, weil ich mit dir
  rede, nicht mit der Welt.

Der mechanische Schutz dagegen, dass *„S. H."* oder *„Stefan-Olav Hüllinghorst"*
versehentlich wieder auf user-facing Stellen rutscht, sitzt in
`tests/dom-structure.test.js` als banned-string sweep (im
`describe('public name discipline')`-Block). Wenn du eine Stelle
brauchst, an der trotzdem der Vollname stehen soll (neuer rechtlicher
Hinweis, Spendenquittung, etc.), erweitere die Allow-List in dem Test
mit Begründung im Kommentar — nicht den Test umgehen.

## Privacy rule for third parties (hard requirement)

**Don't namedrop. The source-citation rule and the privacy rule pull in
opposite directions and the privacy rule wins.** Every real-person
mention on the site is classified into one of two tiers, and the tier
determines what you may publish.

### Tier Vorab — consent gate (default for civilian identities)

**Every real person referred to by their civilian identity (Vorname +
Nachname) starts as `Mr X` / `Mrs X` until that person has explicitly
released their name for the site.** This is the new default state — not
an extra step. Without a recorded release, the text refers to the
person by role only ("meine Couchsurfing-Gastgeberin in Santo Domingo",
"meine Mitbewohner in Bielefeld", "ein Schulkompagnon"); the
notation `Mr X` / `Mrs X` is the internal-Claude shorthand for *"this
slot is waiting for consent"*, not the published wording.

**Why:** Tier-1 / Tier-2 governs *what* gets published. The Vorab
gate governs *whether* a civilian-name mention happens at all. A
person may be Tier-2 *eligible* but still has not agreed to be
mentioned. Stille is not Zustimmung.

**Self-published stage names are not subject to the Vorab gate.**
A person who publishes themselves under a stage name (Greyscale,
REYNEKE, S. Bass, Skinny Shef, Ciao Ella, O/Y, Mira, Nÿx, Katongo /
Lasse Ølen, …) has released that identity by the act of publishing.
The stage name may appear under the Tier-2 standard (stage name +
SoundCloud-only outbound) without a separate Vorab release. The
civilian identity behind the stage name remains Vorab-gated.

**Photos and likenesses are *not* covered by the stage-name release.**
A self-published stage name releases the *name* on the site, not the
*face*. If you have a photo of a private person — even of a
self-publishing stage-name artist — that photo needs a separate,
explicit release from the person before it ships. Default behaviour
without a photo release: pseudo-anonymise (silhouette, monogram of
the stage-name initial, generic glyph, or no image at all). Never
ship a photo of a private person under the assumption that *"if the
stage name is public, the face is public too."* It is not.

**What counts as a release.** Verbal "yeah, push it" with a date and
form (SMS, voice, in-person), written confirmation (Messenger, e-mail),
or any explicit *"ja, kannst rein"*. Documented in the commit message
("Consent: verbal, 2026-04-15, via SMS"). Optional running ledger in
`docs/consents.md` (gitignored) for personal memory.

**What does *not* count as a release.** Silence. Public visibility
elsewhere ("she has a LinkedIn so it's fine"). A third party's word
("Benno said Flo is OK with it"). The person being mentioned in
passing somewhere else online by a third party. Default to anonymise.

**Withdrawal.** A person who said yes can later say no. They write,
the relevant edit gets pushed, the name comes off. No discussion, no
proof-of-harm threshold. The mention exists at the person's pleasure.

**Retroactivity (schrittweise rückwirkend).** Existing live content is
not bulk-rewritten the moment this rule lands. Any work already in
the local stack but not yet pushed conforms to the new rule before
ship. When any existing post or page is next edited for other
reasons, civilian-name mentions in that file are anonymised in the
same edit.

### Tier 1 — Public-interest persons

People who are public figures *on the basis you are citing them*:
politicians, published authors, internationally-touring artists with
press kits, named-position academics with public faculty pages, Wikipedia-
eligible historical figures.

The Vorab gate does **not** apply to Tier-1 figures: they are
citable on the basis of their public role and public statements
without a private release from them.

**Allowed:** full name, all relevant links (Wikipedia, official site,
faculty page, press piece, Bandcamp, Spotify, SoundCloud, etc.), normal
source-citation rule applies.

**Examples on this site:** Linus Torvalds, Albert Einstein, Edward
Snowden, Jimmy Wales, Sokrates, Plato, Dave Chappelle, SSIO, Wu-Tang
Clan, Mobb Deep, The Notorious B.I.G., 2Pac, Nina Simone, Leonard
Cohen, K.I.Z, Gregor Gysi, Prof. Dr. Paula Herber (named faculty
position), Pjotr Iljitsch Tschaikowski, Mesut Özil, Sandra Frotscher
(she publishes herself at sandrafrotscher.com, the domain matches her
name), Dimosthenis Pasadakis (reviewed his card; published academic),
Johannes Lömke aka Jojo (Tier 1 on the basis of his public role as
driving force behind Die Zwote and Werrepiraten — both of which are
already cited on the site as named institutions; consent recorded
2026-05-03 in chat: explicit full-name release plus the character
material that frames the „Der extra Meter" attribution).

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

## Failsafes against human-and-Claude error

These are guardrails against the two failure modes that recur in
this project: Stefan's eyes-too-fast-to-catch, and Claude's
plausibility-without-verification. Every clause below has a real
incident behind it from this codebase's history.

### Day-news facts: never paraphrase from the training cutoff

If a draft contains a factual anchor that has the velocity of a
live news item — a date, a number, a person tied to a current
event, a release version, a regulatory decision, an outage, a
breach, a court ruling — Claude **must verify against a primary
source before writing it as fact**. If the item is from after
Claude's training cutoff, or if its primary source cannot be
reached from this session, Claude **does not write the fact**.
Available options, in this order:

1. Ask Stefan for the primary-source URL and `curl`-probe it.
2. Mark the slot with `[ SOURCE NEEDED ]` and ask Stefan to fill.
3. Omit the line.

**Never paraphrase from training memory into confident prose.**
"I think the Academy banned AI for creative categories in 2026"
is not a citation, even if it sounds right.

### "Recherchiere selbst" is not a license to fabricate

When Stefan says *"recherchiere selbst"*, *"finde es heraus"*,
*"du weißt das doch"*, Claude states honestly what kind of
research is available in this session:

- `curl`-based URL probing of known endpoints (status code,
  TLS, redirect chain, page title, meta-description).
- Training-cutoff knowledge with its limits explicitly named
  (cutoff date, freshness uncertainty for items near the cutoff).
- **No free web search.** No browsing. No tool that searches
  the open web by keyword.

Claude offers to research *with* Stefan — proposing primary-source
URLs based on the question, probing them, extracting the data
point — instead of impersonating a search engine. The result is
slower, but it does not invent.

### Tier check is explicit, not implicit

Before any edit that introduces or changes a person reference,
Claude **names the Tier classification in plain words**:

- *"Tier 1 because Wikipedia-eligible"* (Linus Torvalds, Sokrates).
- *"Tier 1 because public press kit + own domain"* (Sandra Frotscher).
- *"Tier-2 stage-name self-publishing exception applies"* (REYNEKE,
  O/Y, Katongo).
- *"Civilian name, Vorab-gated until release"* (Loyda C., until
  she releases the name herself).
- *"Photo of a private person — separate release required even if
  the stage name is public"* (S. Bass photo case).

This makes Stefan's review one click instead of a guess.

### Stack discipline: don't pile work on uninspected work

If more than three pieces of work are review-pending in the local
stack, Claude **does not start a fourth without first asking
Stefan which piece to clear or accept-as-is**. The goal is to keep
the review queue human-sized so Stefan never has to triage from
behind.

When Stefan adds a new task on top of an unreviewed stack, Claude
states the current stack length, names the unreviewed pieces, and
asks for one of: *(a)* clear stack first, *(b)* accept current
stack as-is and proceed, *(c)* abandon some piece on the stack
because priorities shifted.

### Hooks Claude maintains in the same edit

Three small bookkeeping hooks must be updated **in the same edit**
that triggers them, never in a follow-up:

1. **Banned-list growth.** Every time Claude scrubs a private
   reference (name, collaborator, identifying surname), the
   relevant string is appended to `BANNED_PRIVATE_REFERENCES`
   in `tests/dom-structure.test.js` so CI catches regressions.
2. **`posts.json` `type` field.** Every new blog post entry
   carries `"type": "analysis"` (default — must include a vis)
   or `"type": "reflection"` (vis-exempt). Adding a post without
   the field is treated as a missing required field, not as a
   default.
3. **Feed regeneration.** Any change to `blog/posts/` or
   `blog/posts.json` is followed by `node generate-feed.js` in
   the same edit batch — never deferred.

If any of these is forgotten, the next test run, link probe, or
feed reader will surface the gap. Better to update in the same
edit.

### When the user pushes for speed, slow down once and explain

Stefan is fast. He says things like *"machs einfach"*, *"y"*,
*"all"*. Claude follows speed when the work is small and
reversible (text edit, anonymisation, small layout change). Claude
**slows down for one explicit confirmation** when the work is:

- A new architectural commitment (new section on the homepage,
  new pillar page, new CLAUDE.md clause that affects all future
  work).
- A potentially destructive operation (`git filter-repo`, force
  push, `rm -rf`, history rewrite).
- A claim about a real third party (a journalist, a company, a
  named person) that could be read as factual assertion.
- Any introduction of a person's name where Tier is ambiguous.

The slow-down is one short summary plus one yes/no question.
Not a wall of text — a single check.

## Architectural conventions Claude follows by default

These are conventions Claude has adopted from accumulated decisions in
this project. Stefan delegated technical decisions to Claude on 3 May
2026; the following are the patterns Claude uses without re-asking.
Stefan can override any of these in any specific edit — but if Stefan
just says *"y"* on a structural edit, Claude defaults to these.

### i18n

- **Anchor strategy for adding a new key across all 18 language blocks:**
  use `support_werrepiraten_p` as default anchor — it exists in every
  block and is unlikely to be removed. Other stable anchors:
  `journey3_p` (text differs per language but key always exists),
  `nav_journey`, `val_respect_p`. **Avoid** anchors that exist only in
  DE/EN/EO (Karina, Maxi, Hirschfeld bodies, etc.) — they only catch
  three blocks.
- **Default fallback policy:** DE gets a real translation, EN gets a
  real translation, EO gets a real translation when the key is
  prominent (Hero, manifest, section labels, idol/support h3s,
  filter pills). All other 15 languages receive the EN string as
  fallback. Don't fan out to lower-priority keys (card body texts in
  music idol cards, etc.) into 15-language hand-translation —
  EN-fallback is the standard.
- **Insertion technique:** when adding multiple keys, use a single
  Python script that walks the file once, anchored on a stable
  per-block string. Don't do 15 sequential `Edit` calls on different
  per-language anchors when one Python pass works.
- **Per-language localised strings (e.g. `journey3_p`):** when a key
  has been hand-translated into all 18 blocks (each different), don't
  bulk-replace via `replace_all` — use a per-language Python pass.
  When the key has the same EN string in 16 blocks (most idol body
  texts), `replace_all` works.
- **Verification after every multi-block insert:** run an `awk`
  per-block scan that confirms the key exists in all 18 blocks
  before moving on. Pattern: `awk '/^  [a-z]+: \{/ {lang=$1;...}'`.

### CSS architecture

- **No new top-level `@media (max-width: 700px)` blocks.** The
  `tests/dom-structure.test.js` burger test scans the *first* such
  media block for `.burger { display: block`. Any second block before
  the burger one breaks the test. Solution: integrate mobile rules
  into the existing burger media block, or use a different breakpoint
  (`max-width: 600px` etc.) if a separate media block is needed.
- **CSS variables (`--clay`, `--moss`, etc.):** never hardcode hex
  values when a variable exists. The daily check sweeps for hardcoded
  palette colours.
- **Section borders:** every top-level section (`#idols`, `#contact`,
  etc.) gets a `border-top: 1px solid rgba(201, 169, 110, 0.2)`. New
  sections inherit this rule, don't deviate.
- **New CSS goes near the section it serves**, not bundled at the
  top. The file is long; locality > grouping.

### Adding a new idol/support card

- **Tier-1 with full name + outbound:** Wikipedia, named-position
  faculty, public press kit. Body in Stefan's voice, optional
  `<blockquote>` with `cite` for attributed quotes, optional
  `card-more-btn` with collapsible video/audio embed.
- **Tier-2 stage-name self-publishing:** `<h3>` carries stage name
  only, body anonymises civilian identity, outbound limited to one
  SoundCloud link. Add stage name to `TIER_2_STAGE_NAMES` in
  `tests/dom-structure.test.js` so CI catches policy regression.
- **Vorab-gated civilian:** body uses role-only descriptor ("a
  Couchsurfing host in Santo Domingo", "a flatmate in Bielefeld"),
  no name in card or i18n. Names appear only in commit message as
  *"anonymised, awaiting consent: <name>, <date>"*.
- **Default subsection placement** (idols only):
  - Tech & Wissenschaft: scientists, engineers, software pioneers
  - Philosophy & Thought: thinkers, theorists, named-position
    academics, people with a teaching impact on Stefan
  - Film & Art: visual artists, filmmakers, photographers, comedians
  - Music: musicians, DJs, producers, singers, hip-hop artists
  - Great Minds: friends with public stage names whose substance
    isn't only musical
  - People & Action: activists, lawyers, athletes-with-stance,
    historical figures
  - Mannschaften: teams Stefan was part of or supports
- **CSS selectors that depend on `#idols .value-card`** keep working
  if subsection structure changes, because the `.value-card`-class
  pattern is universal. Don't introduce new variants per subsection.

### External links

- **Probe before ship:** every new external URL gets a `curl -sIL`
  check for status < 400 and content-type matching the affordance.
  401 (paywall), 404 (gone), 410 (gone), 403 (blocked) → don't ship.
- **OSM links go through `api.openstreetmap.org/api/0.6/<kind>/<id>`**
  for liveness, not just the page (the page renders a generic shell
  for deleted nodes). The `tests/local-business-links.test.js` enforces
  this for cards in `EXPECTED_LOCAL_CARDS`.
- **YouTube embeds use `youtube-nocookie.com/embed/<id>?controls=0`**,
  not `youtube.com`. Reduces tracking, follows existing pattern.
- **SoundCloud embeds:** `w.soundcloud.com/player/?url=...&color=%235a6e4a&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`
  — preserves moss-green accent, disables noise, follows existing
  pattern.
- **Genius / Wikipedia / DPMA / official sites** as primary-source
  permalinks for quotes, patents, named persons.

### Interactive Easter-Eggs and decorative interactions

Anything that *invites* visitor interaction (the red-flag Easter-Egg,
hover-triggered audio, scroll-triggered confetti, etc.) must satisfy
three defaults — not negotiable, not "for later":

1. **Mobile parity.** No interaction may rely on `:hover` /
   `mouseenter` alone. Use `pointerdown` as the universal trigger
   (fires for mouse click *and* touch tap in one listener) — or, if
   the visual reveal *itself* is hover-only, the **state-changing
   trigger** (the part that bumps a counter, plays a sound, fires
   confetti) still needs a touch-equivalent. *"Es ist nur ein
   Easter-Egg, mobile-Nutzer brauchen das nicht"* is not a defence —
   roughly half of Stefan's visitors are on Mobile.
2. **Toggle, default on, persisted.** Every interactive Easter-Egg
   gets a small toggle button in the same row as `#sound-toggle`
   (`button.sound-toggle` style class). Default = on. State persisted
   in `localStorage` under a stable key (`flag-easter-egg`,
   `confetti-on`, etc.). The toggle reads `aria-pressed="true|false"`
   and sets a `body.<feature>-off` class that the CSS uses to hide
   the visual. Counter / game state stays in-memory if the spec says
   so (see red-flag) — *the toggle is a setting, the counter is a
   game-state, they're separate concerns*.
3. **`prefers-reduced-motion` respected.** Animations, jumps, sound
   pulses — all gated on
   `window.matchMedia('(prefers-reduced-motion: reduce)').matches`.
   The fallback is "static visible" (e.g. flag appears but does not
   jump), not "remove entirely".

If any of the three is missing when shipping a new interactive
element, the element is incomplete — don't ship it pending follow-up,
build the three rails *as part of the same edit*.

### When the user says "y"

If Stefan says *"y"* and the prior turn ended with a single proposal
(e.g. *"shall I build X?"*), proceed with X using the defaults named
in that proposal. **If Stefan says *"y"* and the prior turn proposed
multiple options or asked multiple questions**, the response that
arrived is ambiguous — Claude must replay the assumed reading of *"y"*
in one short sentence before tipping a single character: *"Reading
your 'y' as: build option α with defaults A, B, C. Correct?"* —
unless the proposal was small enough that the wrong default would
cost less than thirty seconds of edit-undo. The bar is **reversibility
of the consequence**, not the size of the prompt.

### Tests

- **Run `dom-structure.test.js`, `i18n-functions.test.js`,
  `i18n-translations.test.js`** after every structural edit. Background-run is
  fine, but check the result before declaring "tests grün". Pattern:
  ```bash
  cd tests && JEST_SKIP_NETWORK=1 npx jest dom-structure i18n-functions i18n-translations
  ```
- **Don't run the full puppeteer-hover suite** in routine edits —
  it requires `localhost:8080` and adds 6 minutes. Run on demand.
- **Never push without 211/211 (or current count) green** unless
  Stefan has explicitly accepted the failing test.

### Drafts and gitignored work

- **Spec/draft work goes to `docs/<name>-DRAFT.md`** (gitignored
  through `docs/*-DRAFT.md`). Multi-stage proposals, architecture
  sketches, sensitive content, anonymisation-pending material, and
  *anything Stefan asks me to draft rather than build* belongs here.
- **Don't push drafts** even if Stefan says *"push everything"* —
  drafts are local-only by convention. If Stefan wants a draft live,
  the move from `docs/<name>-DRAFT.md` to `blog/posts/...html` or
  similar is an explicit edit Stefan triggers.

## Session lifecycle (init + terminate)

Every Claude session in this project begins with an **init** step and
ends with a **terminate** step. Both are unprompted — Stefan does not
need to ask.

### On init (first response of a session)

Before answering the user's first substantive prompt, read the
project's recent state so the response is grounded in *what is actually
on disk right now*, not in what memory remembers from the last session.
Concretely:

1. `git log --oneline -20` — recent commits, including hotfixes Stefan
   may have pushed from another machine.
2. `git status` — modified, staged, untracked. Knowing the local stack
   length feeds the "stack discipline" rule (don't pile work on
   uninspected work).
3. `git diff --stat HEAD` — which files carry the bulk of the
   uncommitted change, so the response can flag review-pending pieces
   without re-reading every file.
4. `ls docs/` — current drafts, MASTER-DRAFT files, anything Stefan
   left half-finished.

The init reads happen **in parallel** in a single tool batch. The
response then opens with a one-or-two-sentence stack snapshot before
addressing the prompt — *not* a wall of git output, just enough for
Stefan to know Claude is anchored: "HEAD is X; local stack has N
modified files including Y; drafts pending: Z." Then the actual
answer.

If the first user message is itself a quick acknowledgement ("guten
morgen", "danke", "ok"), the init reads still happen, but the
snapshot can be deferred until the next substantive prompt — don't
front-load git output onto a one-word reply.

### On terminate (when Stefan ends the session)

When Stefan signals end-of-session — *"das war's für heute"*, *"gute
nacht"*, *"feierabend"*, *"machen wir morgen weiter"*, *"ich logge
aus"*, or any equivalent — Claude writes a session summary to
`docs/sessions/YYYY-MM-DD-HHMM.md` (gitignored via `docs/sessions/`
in `.gitignore`). The folder is local memory, not deploy content.

The summary is short — under one screen — and structured so the next
session's init step can read it as context. Template:

```markdown
# Session YYYY-MM-DD HH:MM

## What got done
- bullet, what shipped or got built
- bullet, what was decided

## What's on the stack (review-pending)
- file or feature, one-line status

## What's deferred / next session
- bullet, what Stefan said "do later"
- bullet, what Claude flagged as needing Stefan's input

## Decisions worth remembering
- short note, only if non-obvious or surprising
```

Don't dump diffs, don't paste tool output, don't quote long
conversations. The summary is a *memo to next-session-Claude* — what
matters is what is now true that wasn't true before, and what Stefan
asked Claude to hold for next time.

If a session ends ambiguously (Stefan walks away mid-task, no explicit
"feierabend"), Claude does **not** auto-write a summary — better no
file than a misleading one. The summary is written only on a clear
end-of-session signal.

## Known architectural decisions
- No build step — all CSS and JS is inline in `index.html` to keep the deploy as a single file with no asset pipeline.
- Alpine.js loaded from CDN for the collapsible card interactions (`x-data`, `x-collapse`, `x-show`).
- `IntersectionObserver` with `threshold: 0, rootMargin: '0px 0px -50px 0px'` for scroll-reveal — chosen because tall grids (idols) were invisible on mobile with the previous `threshold: 0.15`.
- Push always goes to `gitlab` remote; GitHub is a read-only mirror via GitLab CI.

## Known quirks (intentional, do not "fix")
- **Hero `Explore` scroll-hint sits slightly off** in its CSS positioning. Stefan flagged this 2026-04-29 and asked to leave it as-is — it became the anchor for the red-flag Easter-Egg (see below). Don't normalise the position.
- **Explore Easter-Egg: springender roter Punkt mit Pianosa-Eskalation.**
  Die `.scroll-hint` zeigt bei Hover (Desktop) eine kleine rote Fahne mit
  weißer Nelke. **Trigger ist `pointerdown`** (Maus-Click *und*
  Touch-Tap in einem Listener) — auf Mobile, wo es kein `:hover` gibt,
  reicht ein Tap auf den Strich. Pro Trigger springt die Fahne an eine
  zufällige Position innerhalb eines Radius, der mit Stage eskaliert:
  Stage 1 = 140px (nahe), Stage 2 = 280px (mittel), Stage 3 = 520px
  (randomly weit). Der Stage-Counter bumpt 1 → 2 → 3 (capped) und
  bleibt für die Tab-Lebenszeit (in-memory).
  **Toggle:** `#flag-toggle` in der Nav schaltet das Easter-Egg an/aus,
  default = an, State persistiert in `localStorage` unter
  `flag-easter-egg`. Stage-Counter dagegen bleibt bewusst tab-only
  (Setting vs. Spielzustand). `prefers-reduced-motion` deaktiviert das
  Springen. Doubles as a 1st-of-May reference (movement, not party).
  Tests: `tests/red-flag.test.js`.
