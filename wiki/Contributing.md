# Contributing

Guidelines for making changes to the site without breaking things.

---

## Golden rules

1. **Never edit `main` directly for big changes** — use a branch, then merge
2. **Never overwrite content that was written together** — check the section before editing
3. **The CI pipeline is your friend** — if it fails, read the log before pushing again

---

## Workflow for changes

```bash
# 1. Create a branch
git checkout -b my-change

# 2. Edit files
# ... make your changes ...

# 3. Commit
git add <file>
git commit -m "Short description"

# 4. Push branch
git push -u origin my-change

# 5. Merge into main when ready
git checkout main
git merge my-change
git push
```

---

## Sections to be careful with

These sections have content that was written deliberately — don't overwrite with placeholder text:

| Section | File | What's there |
|---------|------|-------------|
| Projects | `index.html` | Incubator, diedorismachtdasgift.io, careergraph.io & beyond |
| Journey | `index.html` | TU Berlin MSc, Insolvency, Die Zwote / Mondiali |
| Contact | `index.html` | Real email, LinkedIn, GitHub links |
| Booking form | `index.html` | Form with disabled submit (pending domain) |
| I Support | `index.html` | Mein Grundeinkommen, GLS Bank, Landstreicher |

---

## Adding a new page

1. Copy the structure from `impressum.html` (it's the simplest page)
2. Keep the same CSS variables (colors, fonts)
3. Add a link to it in the footer of `index.html`
4. Add it to the wiki if it needs explanation

---

## Commit message style

Keep it short and specific:
```
Add GLS Bank to I Support section
Fix contact email placeholder
Restore project content lost in manual edits
```

Avoid vague messages like `update` or `fix stuff`.
