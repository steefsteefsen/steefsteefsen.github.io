# Getting Started

No build tools, no package manager, no server needed. The site is a single HTML file per page.

---

## Prerequisites

Just a browser and a text editor. That's it.

Optional but recommended:
- **Git** — to commit and push changes
- **VS Code** or **PyCharm** — for editing with syntax highlighting

---

## View the site locally

1. Clone the repo:
   ```bash
   git clone git@github.com:steefsteefsen/steefsteefsen.github.io.git
   cd steefsteefsen.github.io
   ```

2. Open `index.html` in your browser:
   ```bash
   # Linux
   xdg-open index.html

   # Mac
   open index.html
   ```

That's it — no `npm install`, no build step.

---

## Files

| File | Purpose |
|------|---------|
| `index.html` | Main homepage — all CSS and JS is inline |
| `invest.html` | Investor-facing page |
| `impressum.html` | Legal page (German Impressum) |
| `.gitlab-ci.yml` | GitLab CI/CD pipeline configuration |
| `CLAUDE.md` | Context file for AI-assisted editing |
| `.gitignore` | Files excluded from version control |

---

## Making changes

Edit the HTML files directly. All styles are in `<style>` blocks inside each file. All scripts are in `<script>` blocks at the bottom.

When you're done:
```bash
git add <file>
git commit -m "Short description of what changed"
git push
```

GitLab picks up the push automatically and runs the CI pipeline.
