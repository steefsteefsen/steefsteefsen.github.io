# Deployment

The site is deployed automatically by GitHub Pages. There is no build step and no deployment script.

---

## How it works

1. You push a commit to the `main` branch on GitHub
2. GitHub Pages detects the push and serves the updated files within ~1 minute
3. The live site at https://steefsteefsen.github.io updates automatically

That's the entire deployment process.

---

## Checking deployment status

Go to https://github.com/steefsteefsen/steefsteefsen.github.io/actions — you'll see a deployment workflow run for every push to `main`. A green checkmark means it's live.

---

## GitHub Pages settings

- **Source:** Deploy from branch `main`, root `/`
- **Custom domain:** None (using the default `steefsteefsen.github.io`)
- **HTTPS:** Enforced by GitHub automatically

To change these settings: GitHub repo → **Settings → Pages**.

---

## If the site doesn't update

1. Hard refresh your browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Check the Actions tab on GitHub for any failed deployment
3. Wait up to 2 minutes — GitHub Pages occasionally takes a moment

---

## GitLab does NOT deploy

The GitLab pipeline only runs tests and security scans. It does not deploy the site. Deployment is entirely handled by GitHub Pages.
