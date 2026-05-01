#!/usr/bin/env bash
# DNS- and TLS-Healthcheck for huellinghorst.info and its subdomains.
# Run after the DNS cutover; should turn green by 1 May 2026.
#
# Exit code 0 if all pass, 1 if any fail. Suitable for pre-cutover
# verification and as a periodic ping later.
#
# Usage:
#   bash tests/dns-health.sh
#
# CI-ready: writes pass/fail per line, summary at the end.

set -u

declare -a HOSTS=(
  "huellinghorst.info"
  "www.huellinghorst.info"
  "rolf.huellinghorst.info"
  "stefan.huellinghorst.info"
)

# Subdomains that are reserved but not yet active (post-Gathering).
# These should NXDOMAIN until they're brought live.
declare -a RESERVED=(
  "antje.huellinghorst.info"
  "katrin.huellinghorst.info"
  "britta.huellinghorst.info"
  "sabine.huellinghorst.info"
)

PASS=0
FAIL=0
WARN=0

green()  { printf '\033[0;32m%s\033[0m\n' "$1"; }
red()    { printf '\033[0;31m%s\033[0m\n' "$1"; }
yellow() { printf '\033[0;33m%s\033[0m\n' "$1"; }

check_dns() {
  local h="$1"
  if host "$h" >/dev/null 2>&1; then
    green "  DNS    ✓  $h resolves"
    return 0
  else
    red   "  DNS    ✗  $h does not resolve"
    return 1
  fi
}

check_https() {
  local h="$1"
  local code
  code=$(curl -sI -A "huellinghorst-health/1.0" --max-time 10 \
           -o /dev/null -w "%{http_code}" "https://$h/" 2>/dev/null)
  if [[ "$code" =~ ^[23] ]]; then
    green "  HTTPS  ✓  $h returned $code"
    return 0
  else
    red   "  HTTPS  ✗  $h returned $code (expected 2xx/3xx)"
    return 1
  fi
}

check_tls_handshake() {
  local h="$1"
  local err
  err=$(curl -sIv --max-time 10 "https://$h/" 2>&1 | grep -iE \
        "(unrecognized name|certificate has expired|self.signed|alert|verify failed)" \
        | head -1)
  if [[ -z "$err" ]]; then
    green "  TLS    ✓  $h handshake clean"
    return 0
  else
    red   "  TLS    ✗  $h handshake issue: $err"
    return 1
  fi
}

check_reserved() {
  local h="$1"
  if host "$h" >/dev/null 2>&1; then
    yellow "  WARN   !  $h resolves but should still be reserved (NXDOMAIN expected)"
    return 1
  else
    green  "  RES    ✓  $h reserved (NXDOMAIN — pre-Gathering)"
    return 0
  fi
}

echo
echo "Active hosts:"
echo "─────────────"
for h in "${HOSTS[@]}"; do
  echo "$h"
  check_dns "$h"   && (( PASS++ )) || (( FAIL++ ))
  check_https "$h" && (( PASS++ )) || (( FAIL++ ))
  check_tls_handshake "$h" && (( PASS++ )) || (( FAIL++ ))
  echo
done

echo "Reserved hosts (Gathering, August 2026):"
echo "────────────────────────────────────────"
for h in "${RESERVED[@]}"; do
  echo "$h"
  check_reserved "$h" && (( PASS++ )) || (( WARN++ ))
done

echo
echo "──────────────"
echo "Summary: $PASS pass, $FAIL fail, $WARN warn"
echo "──────────────"

exit $(( FAIL > 0 ? 1 : 0 ))
