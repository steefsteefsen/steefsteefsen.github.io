# First PRs — In Order

Ship these one at a time. Don't start #2 until #1 is merged. Each one teaches a different part of the system.

---

## PR #1 — Add a tool card to "Built With"

**Why this first:** Touches HTML, i18n, icons, and tests. The full minimum loop.

**The task:**
1. Pick a tool you actually use (terminal, editor, anything).
2. Open `index.html`, find the `.tools-grid` section, add a `<div class="tool-card">` after the last existing card.
3. Add a `tool_<name>_p` key to **every** language block in `i18n.js` (17 languages — read `CLAUDE.md` in the repo root for the procedure).
4. Fetch the official artwork → `icons/<name>.svg` (or .png).
5. Run `cd tests && npx jest`. All green.
6. Push to your fork. Open MR against Stefan's main.

**Done when:** Stefan can see your tool card on your fork's deployed Pages site and the tests pass.

---

## PR #2 — Add yourself to one of the support sections

**Why second:** Teaches you the footnote system and forces you to think about voice/tone.

**The task:**
1. Pick: an artist, a local business, or a cause you care about. Just one.
2. Read the `CLAUDE.md` section "Adding a new support card".
3. Add the card. Add a footnote if you reference an external fact.
4. Update footnote numbering if you displace any existing numbers.
5. Tests pass. Push.

**Done when:** the card renders, the footnote links work, all tests green.

---

## PR #3 — Translate the homepage into one new language

**Why third:** Big visible win. Real impact. Teaches scope discipline (it's *one* language, not five).

**The task:**
1. Pick **one** language already scaffolded in `i18n.js` that you actually speak or can verify well. Don't guess Mandarin.
2. Replace the EN-fallback strings with proper translations for that single block.
3. Don't touch the other languages.
4. Test the language switcher manually in a browser.
5. Push.

**Done when:** you can switch to your language in the footer and every visible string is properly translated.

---

## PR #4 — Write a blog post (DE + EN)

**Why last:** This is the boss fight. End-to-end ownership: writing, fact-checking, two languages, feed regeneration.

**The task:**
1. Pick a topic you actually have something to say about. Don't fake it.
2. Read `CLAUDE.md` section "Adding a new blog post".
3. Write `blog/posts/<slug>.html` (DE) and `blog/posts/<slug>-en.html` (EN).
4. Add the entry to `blog/posts.json`.
5. Run `node generate-feed.js`.
6. If you make any factual claims about software/people/events: verify against primary sources before publishing.
7. Tests pass. Push.

**Done when:** the post appears in the blog list in both languages and the RSS feeds include it.

---

## After PR #4

You're trusted on the homepage. Talk to Stefan about CareerGraph next.
