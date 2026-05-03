#!/bin/bash
# log-test-run.sh
#
# Run jest with coverage, write timestamped log + coverage snapshot to
# logs/. Both directories are gitignored — these stay local memory.
#
# Stefan-Anweisung 2026-05-04: dokumentiere Code-Coverage etc.
# in logs/ die nicht gepushed werden.
#
# Usage: scripts/log-test-run.sh

set -e

REPO_ROOT="$(git rev-parse --show-toplevel)"
TIMESTAMP="$(date +%Y-%m-%d-%H%M)"
LOG_FILE="${REPO_ROOT}/logs/test-runs/${TIMESTAMP}.log"
COVERAGE_SNAPSHOT="${REPO_ROOT}/logs/coverage-history/${TIMESTAMP}.json"

mkdir -p "$(dirname "$LOG_FILE")" "$(dirname "$COVERAGE_SNAPSHOT")"

cd "${REPO_ROOT}/tests"

echo "=== Test run ${TIMESTAMP} ===" | tee "$LOG_FILE"
echo "Repo: $(git rev-parse --short HEAD) on $(git rev-parse --abbrev-ref HEAD)" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# Run with coverage, append all output (incl. errors) to log
JEST_SKIP_NETWORK=1 ./node_modules/.bin/jest --ci --coverage 2>&1 | tee -a "$LOG_FILE"

# Snapshot coverage summary (small JSON, easy to diff over time)
if [ -f "${REPO_ROOT}/logs/coverage/coverage-summary.json" ]; then
  cp "${REPO_ROOT}/logs/coverage/coverage-summary.json" "$COVERAGE_SNAPSHOT"
  echo "" | tee -a "$LOG_FILE"
  echo "Coverage snapshot: ${COVERAGE_SNAPSHOT}" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"
echo "Full log: ${LOG_FILE}" | tee -a "$LOG_FILE"
