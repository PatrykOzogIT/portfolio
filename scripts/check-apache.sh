#!/usr/bin/env bash
# Verifies public/.htaccess against a real Apache (Docker httpd:2.4 serving dist/portfolio/browser).
# Usage: scripts/check-apache.sh [base-url]   (default http://localhost:8088)
# Requests carry Host + X-Forwarded-Proto so the HTTPS/host rules can be exercised over plain HTTP.
set -u
shopt -s extglob
BASE="${1:-http://localhost:8088}"
FAIL=0
H=(-H "Host: patryk-ozog.pl" -H "X-Forwarded-Proto: https")

check() { # description, expected, actual
  if [[ "$3" == $2 ]]; then echo "  ok    $1"; else echo "  FAIL  $1 — expected '$2', got '$3'"; FAIL=1; fi
}
status()   { curl -s -o /dev/null -w "%{http_code}" "${H[@]}" "$@"; }
location() { curl -s -o /dev/null -w "%{redirect_url}" "${H[@]}" "$@"; }
header()   { curl -s -D - -o /dev/null "${H[@]}" "${@:2}" | tr -d '\r' | grep -i "^$1:" | head -1 | cut -d' ' -f2-; }

echo "Redirects"
check "http → https"            "https://patryk-ozog.pl/pl" "$(curl -s -o /dev/null -w '%{redirect_url}' -H 'Host: patryk-ozog.pl' "$BASE/pl")"
check "www → no www"            "https://patryk-ozog.pl/pl" "$(curl -s -o /dev/null -w '%{redirect_url}' -H 'Host: www.patryk-ozog.pl' -H 'X-Forwarded-Proto: https' "$BASE/pl")"
check "/ Polish browser → /pl"  "*/pl"  "$(location -H 'Accept-Language: pl-PL,pl;q=0.9,en;q=0.8' "$BASE/")"
check "/ English browser → /en" "*/en"  "$(location -H 'Accept-Language: en-US,en;q=0.9' "$BASE/")"
check "/ no language → /pl"     "*/pl"  "$(location "$BASE/")"
check "/ is a temporary redirect" "302" "$(status "$BASE/")"
check "trailing slash removed"  "*/pl/projects/x" "$(location "$BASE/pl/projects/x/")"
check "trailing slash is 301"   "301" "$(status "$BASE/pl/")"

echo "Pages"
check "/pl served without redirect" "200" "$(status "$BASE/pl")"
check "/en served without redirect" "200" "$(status "$BASE/en")"
check "/pl is the Polish page"  "pl" "$(curl -s "${H[@]}" "$BASE/pl" | grep -o '<html lang="[a-z]*"' | cut -d'"' -f2)"
check "unknown page → 404"      "404" "$(status "$BASE/pl/nope")"
check "404 page is Polish"      "*Nie znaleziono strony*" "$(curl -s "${H[@]}" "$BASE/pl/nope")"
check "404 page is English under /en" "*Page not found*" "$(curl -s "${H[@]}" "$BASE/en/nope")"
check "index.csr.html hidden"   "403" "$(status "$BASE/index.csr.html")"
check ".htaccess hidden"        "403" "$(status "$BASE/.htaccess")"
check "sitemap.xml"             "200" "$(status "$BASE/sitemap.xml")"
check "robots.txt"              "200" "$(status "$BASE/robots.txt")"

MAIN=$(ls dist/portfolio/browser/main-*.js 2>/dev/null | head -1 | xargs -n1 basename)
echo "Headers"
check "HTML not cached"         "no-cache" "$(header Cache-Control "$BASE/pl")"
check "bundles cached 1 year"   "*immutable*" "$(header Cache-Control "$BASE/$MAIN")"
check "fonts cached 1 year"     "*immutable*" "$(header Cache-Control "$BASE/fonts/inter-latin-wght-normal.woff2")"
check "image variants cached"   "*immutable*" "$(header Cache-Control "$BASE/img/images/photo.w96.webp")"
check "HTML compressed"         "@(br|gzip)" "$(header Content-Encoding "$BASE/pl" -H 'Accept-Encoding: br, gzip')"
check "JS compressed"           "@(br|gzip)" "$(header Content-Encoding "$BASE/$MAIN" -H 'Accept-Encoding: br, gzip')"
check "webp type"               "image/webp" "$(header Content-Type "$BASE/img/images/photo.w96.webp")"
check "nosniff"                 "nosniff" "$(header X-Content-Type-Options "$BASE/pl")"
check "HSTS"                    "max-age=*" "$(header Strict-Transport-Security "$BASE/pl")"
check "no framing"              "DENY" "$(header X-Frame-Options "$BASE/pl")"
check "no directory listing"    "40[34]" "$(status "$BASE/fonts")"

exit $FAIL
