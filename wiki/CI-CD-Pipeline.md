# CI/CD Pipeline

GitLab runs tests automatically every time a new commit lands on `main`. It also runs a separate set of security scans every day on a cron schedule.

---

## How to see the results

1. Go to your GitLab project: https://gitlab.com/steefSteefsen/steefsteefsen.github.io
2. Click **Build → Pipelines** in the left sidebar
3. Click on a pipeline to see individual jobs
4. Click on a job to see its full log output

A green checkmark means it passed. A red X means something failed. An orange `!` means it was allowed to fail (non-blocking).

---

## Pipeline stages

The pipeline has two stages that run in order:

### Stage 1: `validate`
Checks that the HTML, CSS, and links are correct.

| Job | What it does | Blocks deploy? |
|-----|-------------|----------------|
| `html-validate` | Checks HTML5 syntax using `html-validate` | Yes |
| `css-lint` | Lints the inline CSS with Stylelint | No (advisory) |
| `accessibility` | Runs axe accessibility checks on the live site | No (advisory) |
| `link-check` | Scans for broken links across the site | No (advisory) |
| `w3c-validate` | Validates HTML against the W3C Nu validator | No (advisory) |

### Stage 2: `security`
Checks for security issues. Runs on every push to `main` **and** daily.

| Job | What it does |
|-----|-------------|
| `security-headers` | Grades HTTP security headers via Mozilla Observatory |
| `cve-check` | Checks for known CVEs in infrastructure (Shodan CVEDB + InternetDB) |
| `daily-cve-digest` | Fetches the 5 newest CVEs published in the last 24h from NVD (cron only) |

---

## When does it run?

| Trigger | Jobs that run |
|---------|--------------|
| Push to `main` | All validate + security jobs |
| Daily cron (midnight UTC) | All jobs including `daily-cve-digest` |

---

## What happens if a job fails?

- **`html-validate` fails** → the pipeline is marked as failed. Fix the HTML error and push again.
- **Any other job fails** → the pipeline is marked as a warning but does not block anything. Review the logs and decide if action is needed.

The site is served directly from GitHub Pages and is not affected by the GitLab pipeline status — the pipeline is for visibility and quality, not for deployment.
