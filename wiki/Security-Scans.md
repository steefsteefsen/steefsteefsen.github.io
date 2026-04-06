# Security Scans

The pipeline runs security checks on every push to `main` and every day at midnight UTC. All APIs used are free and open source — no API keys required.

---

## APIs used

### Mozilla Observatory
- **URL:** https://observatory-api.mdn.mozilla.net
- **What it checks:** HTTP security headers — Content-Security-Policy, X-Frame-Options, HSTS, referrer policy, and more
- **Result:** A letter grade (A+ to F)
- **Docs:** https://github.com/mozilla/http-observatory

### Shodan CVEDB
- **URL:** https://cvedb.shodan.io
- **What it checks:** Known CVEs for technologies like nginx, plus CVSS and EPSS scores
- **Free, no key needed**
- **Docs:** https://cvedb.shodan.io

### Shodan InternetDB
- **URL:** https://internetdb.shodan.io
- **What it checks:** Open ports, known vulnerabilities, and hostnames for the resolved IP of the site
- **Free, no key needed**

### NVD (National Vulnerability Database)
- **URL:** https://services.nvd.nist.gov/rest/json/cves/2.0
- **What it checks:** New CVEs published in the last 24 hours (daily cron only)
- **Free, no key needed** (optional key for higher rate limits)
- **Docs:** https://nvd.nist.gov/developers/vulnerabilities

---

## How to read the results

Open the job log in GitLab (Build → Pipelines → click a pipeline → click the job).

**security-headers** — look for the `grade` field in the JSON output. Anything below B is worth investigating.

**cve-check** — shows CVEs relevant to the server infrastructure. Since this is a static GitHub Pages site, most will not apply directly. Read them anyway — awareness is the point.

**daily-cve-digest** — a digest of the 5 newest CVEs published that day. Not all will be relevant. It's a morning briefing, not an alarm.

---

## What to do if something looks serious

1. Check the CVE ID on https://nvd.nist.gov or https://cve.circl.lu
2. Determine if it affects any technology used by this site
3. If yes — open an issue in GitLab and track the fix there
4. If no — note it in the issue tracker as reviewed and dismissed

---

## Adding more scans

Edit `.gitlab-ci.yml` and add a new job to the `security` stage. Follow the same pattern as the existing jobs: `alpine` image, `curl` + `jq`, `allow_failure: true`.
