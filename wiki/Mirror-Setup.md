# GitHub ↔ GitLab Mirror

The site lives on GitHub Pages (which serves it). GitLab is used for CI/CD. The two repos are kept in sync via GitLab's built-in mirroring — GitHub is the source of truth, GitLab pulls from it automatically.

---

## How to set up the mirror (one-time setup)

### Step 1 — Create the GitLab project

1. Go to https://gitlab.com and sign in as `steefSteefsen`
2. Click **New project → Import project → Repository by URL**
3. Enter the GitHub URL: `https://github.com/steefsteefsen/steefsteefsen.github.io.git`
4. Set visibility to **Public**
5. Click **Create project**

### Step 2 — Enable pull mirroring

1. In the GitLab project, go to **Settings → Repository**
2. Expand **Mirroring repositories**
3. Click **Add new**
4. Fill in:
   - **Git repository URL:** `https://github.com/steefsteefsen/steefsteefsen.github.io.git`
   - **Mirror direction:** Pull
   - **Authentication:** None (public repo)
5. Click **Mirror repository**

GitLab will now check GitHub for new commits every 5 minutes and pull them automatically. Every pull that brings in new commits on `main` will trigger the CI pipeline.

---

## How it flows

```
You edit → git push → GitHub (main) → GitLab mirror pulls → CI pipeline runs
```

You never need to push to GitLab manually.

---

## Checking mirror status

Go to **Settings → Repository → Mirroring repositories** in GitLab. You'll see the last sync time and whether it succeeded.

---

## If the mirror falls behind

Click the **sync now** button (circular arrow icon) next to the mirror entry in GitLab settings.
