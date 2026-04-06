# Setting Up the Daily Cron Schedule

The `daily-cve-digest` job and all security scans run daily via a GitLab pipeline schedule. You need to set this up once manually in the GitLab UI.

---

## One-time setup

1. Go to your GitLab project: https://gitlab.com/steefSteefsen/steefsteefsen.github.io
2. Click **Build → Pipeline schedules** in the left sidebar
3. Click **New schedule**
4. Fill in:
   - **Description:** Daily security scan
   - **Interval Pattern:** `0 6 * * *` (every day at 06:00 UTC)
   - **Cron timezone:** UTC
   - **Target branch:** `main`
   - **Active:** Yes (checked)
5. Click **Save pipeline schedule**

That's it. GitLab will now trigger the full pipeline every morning at 06:00 UTC, including the `daily-cve-digest` CVE news job.

---

## Cron syntax reference

| Pattern | Meaning |
|---------|---------|
| `0 6 * * *` | Every day at 06:00 UTC |
| `0 0 * * *` | Every day at midnight UTC |
| `0 6 * * 1` | Every Monday at 06:00 UTC |

---

## Verifying it works

After saving, you'll see the schedule listed with a **Next run** time. You can also click the **play button** to trigger it immediately and check the result.
