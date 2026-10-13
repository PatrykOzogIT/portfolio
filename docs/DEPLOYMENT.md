# Deployment

The site is fully static: `npm run build` produces `dist/portfolio/browser/`, and the **contents** of that
folder go to the web root of `https://patryk-ozog.pl`. No Node.js process runs on the server.

## Hosting

| | |
| --- | --- |
| Domain | `patryk-ozog.pl` (canonical, without `www`) |
| DNS | `ns1/ns2.jchost04.pl` — `patryk-ozog.pl` and `www` → `77.79.251.44` |
| Web server | Apache 2.4 (shared hosting), configured by `public/.htaccess` |
| TLS | Let's Encrypt wildcard `*.patryk-ozog.pl` (also covers future demo subdomains) |

## What `.htaccess` does

- `http` → `https` and `www` → bare domain (301), safe behind a TLS-terminating proxy.
- `/` → `/pl` or `/en` by browser language (302, `Vary: Accept-Language`); Polish when unknown.
- Canonical URLs without trailing slashes: `/pl/` → `/pl` (301); `/pl/projects/x` serves `x/index.html`.
- 404 pages in the visitor's language (`/en/…` → English).
- Brotli/gzip; `Cache-Control: immutable` for fingerprinted bundles, fonts and `/img/*`; HTML `no-cache`.
- Security headers: HSTS, `nosniff`, referrer policy, permissions policy, no framing, minimal CSP.
- Hides `index.csr.html` (unused client fallback) and dotfiles; no directory listings.

### Verifying it locally against real Apache

```bash
npm run build
docker run -d --name po-httpd -p 8088:80 -v "$PWD/dist/portfolio/browser:/usr/local/apache2/htdocs:ro" httpd:2.4 \
  sh -c "sed -i -e 's/^#LoadModule \(rewrite\|headers\|deflate\|brotli\)_module/LoadModule \1_module/' -e 's/AllowOverride None/AllowOverride All/g' conf/httpd.conf && httpd-foreground"
bash scripts/check-apache.sh        # 29 checks: redirects, pages, 404, caching, compression, headers
docker rm -f po-httpd
```

## Before every deployment

```bash
npm run typecheck && npm test && npm run test:scripts && npm run e2e && npm run build
```

`npm run e2e` builds a separate fixture site (`dist/e2e`); always finish with `npm run build` so the
upload contains production content only. Upload the **contents** of `dist/portfolio/browser/`
(including `.htaccess`) to the web root and remove files left over from previous builds
(old `main-*.js` / `chunk-*.js` are harmless but pile up).

## After deployment

- `https://patryk-ozog.pl/` redirects to `/pl` (or `/en`), pages load over HTTPS, `/pl/nope` shows the 404.
- Submit `https://patryk-ozog.pl/sitemap.xml` in Google Search Console.
- Check the link preview, e.g. with the LinkedIn Post Inspector.

## Continuous deployment (GitHub Actions)

`.github/workflows/ci-deploy.yml`:

- **Every push and pull request:** typecheck, unit tests, script tests, end-to-end tests, production build,
  a guard that the production output contains no test fixtures, and the built site as an artifact.
- **Push to `main`** (once enabled): the verified artifact is uploaded over **FTPS**, then a smoke test
  checks the live site (`/pl`, `/en`, `/` redirect, 404, canonical URL). Nothing is deployed if any check fails.
- Uploads are incremental: only changed files are sent, and only files uploaded earlier by the workflow are
  deleted (tracked in `.ftp-deploy-sync-state.json` in the web root). Other files on the server are untouched.
- All actions are pinned to commit SHAs.

### One-time setup

1. **Dedicated FTP account** (DirectAdmin → *FTP Management* → *Create FTP account*):
   restrict it to `domains/patryk-ozog.pl/public_html`. The hosting account also serves other domains;
   with this account the workflow cannot reach them even if misconfigured.
2. In GitHub: **Settings → Secrets and variables → Actions**
   - *Secrets*: `FTP_SERVER` = `ftp.patryk-ozog.pl` (verified: FTPS with a valid certificate), `FTP_USERNAME`
     (full login, usually `name@patryk-ozog.pl`), `FTP_PASSWORD`.
   - *Variables*: `FTP_SERVER_DIR` = `./` (the dedicated account starts in `public_html`).
3. **Dry run:** set the variable `DEPLOY_ENABLED` = `true`, then *Actions → CI / Deploy → Run workflow*
   with *dry run* checked. The log lists what would be uploaded/deleted; the server is not changed.
4. **First deployment:** *Run workflow* with *dry run* unchecked (or push to `main`).
5. Optionally remove the hosting's placeholder files from `public_html` (e.g. its default `index.html` is
   replaced anyway; leftover images or folders are not used by the site).

If the FTPS connection fails with a certificate error (the host's certificate is issued for the server's
own name, not for `ftp.patryk-ozog.pl`), either use that server name as `FTP_SERVER` (preferred) or set the
variable `FTP_SECURITY` = `loose`. Plain FTP is not used — the password would travel unencrypted.

To pause deployments, set `DEPLOY_ENABLED` to anything other than `true`.
