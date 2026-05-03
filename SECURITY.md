# Security policy

## Reporting a vulnerability

If you find a security issue with this site or its codebase:

**Don't open a public issue.** Email <steef@huellinghorst.info>
with subject `Security` and a description of the issue.

You'll get a reply within 7 days. If the issue is critical
(active exploit, data exposure, auth bypass): same day if at
all possible.

## Scope

This site is **static HTML/CSS/JS**, served by GitLab Pages.
There is no backend, no database, no user-account system,
no payment integration. The attack surface is therefore limited
to:

- Code injection via embedded third parties (SoundCloud,
  YouTube-nocookie, Google Fonts iframes)
- XSS via untrusted input that lands in `data-i18n`-driven HTML
- Supply-chain via the CI/CD pipeline (jest, html-validate, npm packages)
- Repository-side: leak of `.env` or `docs/_private/`
  (both gitignored)

## What this site does NOT do

- Set its own cookies (cookies are cleared on every page load,
  see [privacy.txt](.well-known/privacy.txt))
- Track via analytics, pixels, or third-party fingerprinting
- Store personal data in localStorage beyond user-chosen settings
  (sound on/off, easter-egg flag on/off, go-to-top hand preference)
- Send anything off-site without an explicit user action

## Privacy stance

See [.well-known/privacy.txt](.well-known/privacy.txt) for the
machine-readable privacy stance. Short form: no cookies, no
tracking, no stalking — curiosity is welcome, surveillance is not.

## Responsible disclosure

I'll credit reporters in the commit that fixes the issue, unless
you ask to stay anonymous. No bug-bounty payments — this is a
personal project.
