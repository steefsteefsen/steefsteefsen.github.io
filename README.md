# stefan-site

Personal homepage for Stefan-Olav Hüllinghorst. Plain HTML/CSS/JS, no build
step. Deployed via GitHub Pages at
[steefsteefsen.github.io](https://steefsteefsen.github.io).

For the full project handbook (palette, conventions, privacy rules,
gender-language rules, footnote table, deploy workflow), read
[`CLAUDE.md`](./CLAUDE.md). This README is just the local command
reference.

## Local commands

All commands are run from the repo root unless noted otherwise.

### Local preview server

```bash
# Serve the site at http://localhost:8080
python3 -m http.server 8080
```

Open http://localhost:8080 in a browser. Used for the human-in-the-loop
review step ("Stefan reviews in his browser") and for the puppeteer
hover test (`tests/red-flag-hover.test.js`) which navigates a headless
browser at this URL.

### Tests

The jest suite lives in `tests/` and is run from there.

```bash
# Run the full suite (jsdom + puppeteer + structural)
cd tests && npx jest

# Run with coverage (default for `npm test`)
cd tests && npm test

# CI mode (no watch, fail on console.error etc.)
cd tests && npm run test:ci

# Skip network-dependent tests (offline / hotel wifi)
cd tests && JEST_SKIP_NETWORK=1 npx jest

# List which test files exist
cd tests && npx jest --listTests

# Run one suite by path or pattern
cd tests && npx jest dom-structure
cd tests && npx jest --testPathIgnorePatterns="red-flag-hover"

# Override the puppeteer test target (default localhost:8080)
SITE_URL=http://127.0.0.1:8080/ cd tests && npx jest red-flag-hover
```

The puppeteer hover test needs the local server (above) running. The
`local-business-links.test.js` suite issues real HTTP probes against every
external link on every local-business / artist card; skip with
`JEST_SKIP_NETWORK=1` when offline.

### HTML validation

```bash
# Validate every shipped HTML page
npx html-validate index.html invest.html impressum.html roadmap.html
```

Configuration lives in [`.htmlvalidate.json`](./.htmlvalidate.json).

### Blog feeds

```bash
# Regenerate feed.xml + feed-en.xml from blog/posts.json
node generate-feed.js
```

Run this every time `blog/posts.json` changes (new post, edited teaser,
removed post). The script writes both feeds and prints the entry count.

### DNS / TLS healthcheck

```bash
# Check that huellinghorst.info and subdomains resolve and serve TLS
bash tests/dns-health.sh
```

Used during and after the DNS cutover to `huellinghorst.info`. Exit
code 0 if all pass, 1 if any fail.

### Accessibility audit

```bash
# Run axe against the local server
npx axe http://localhost:8080 --exit
```

Requires the local server to be running.

### CSS / JS hygiene (optional)

```bash
# Lint i18n.js (only if eslint is installed locally)
npx eslint i18n.js

# Find unused CSS classes
npx purgecss --css index.html --content index.html
```

### Pre-push hook

A pre-push hook at `.git/hooks/pre-push` runs:

1. `npx html-validate index.html invest.html impressum.html roadmap.html`
2. `cd tests && ./node_modules/.bin/jest --ci`

Any failure aborts the push. Hotfixes that need to bypass the hook (per
the hotfix exception documented in `CLAUDE.md`) use `git push --no-verify`.

### Push targets

- `gitlab` → `git@gitlab.com:steefSteefsen/steefsteefsen-github-io.git`
  (primary; CI mirrors to GitHub Pages)
- `origin` → `git@github.com:steefsteefsen/steefsteefsen.github.io.git`
  (the GitHub Pages mirror)

```bash
# Normal push (primary path)
git push gitlab main

# Hotfix: bypass pre-push hook on gitlab
git push --no-verify gitlab main

# Direct-to-github hotfix (bypasses gitlab; the next gitlab CI mirror
# run may overwrite — sync gitlab afterwards or push to both)
git push --no-verify origin main
```
