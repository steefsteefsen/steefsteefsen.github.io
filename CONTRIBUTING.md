# Contributing to „Der springende Punkt"

This is Steef's personal homepage — but it's also a template that
others can fork and adapt. Both forms of contribution are welcome.

## Two ways to contribute

### 1. Fork the template, build your own

The site is MIT-licensed. Fork it, strip out anything personal
(my idol cards, my journey, my impressum), keep the structure,
the i18n system, the test suite, the easter-eggs, and build your
own thing on top. No attribution required, no permission needed.

If you do this and want to build *with* me — read the
[bounty post](blog/posts/2026-05-03-bounty-hunter-telefonnummer.html)
or write to me at <steef@huellinghorst.info>.

### 2. Fix something on this site

If you spot a bug, broken link, accessibility issue, typo, or
factual error in a blog post — open an issue or a merge request.

**Please follow the rules in [CLAUDE.md](CLAUDE.md)** if your change
touches:
- Real-person mentions (Tier-1 vs. Tier-2 — see Privacy section)
- The i18n system (DE first, EN second, others fallback)
- Tests (filename = subject, never harness)
- Cookies / tracking / privacy stance
- The `.env` or any secret-container (don't read, don't write)

## Local setup

```bash
# Serve the site locally
cd /path/to/repo
python3 -m http.server 8080
# Open http://localhost:8080

# Run tests
cd tests
npm ci
JEST_SKIP_NETWORK=1 npx jest
```

## Pull-Request checklist

- [ ] Tests pass locally with `JEST_SKIP_NETWORK=1`
- [ ] `npx html-validate index.html invest.html impressum.html roadmap.html` is green
- [ ] DE + EN versions are both updated if a translatable string is touched
- [ ] No real names introduced without consent (see CLAUDE.md privacy rule)
- [ ] No `.env` or secret-container content in the diff

## Languages

The site speaks 18 languages, but only **German** is legally maintained
by Steef. The other 17 languages need community sponsors — see the
[Legal-Germany post](blog/posts/2026-05-03-legal-germany.html) for
how to volunteer as a language sponsor.

## Code of conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Short version: be direct,
be honest, no performative niceness, no posing.
