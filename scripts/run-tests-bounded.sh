#!/usr/bin/env bash
# HIAU test runner: each test file is an isolated Node process, so one leaked
# server/socket/timer cannot silently keep the entire test suite alive.
set -euo pipefail
shopt -s nullglob

per_file_timeout="${HIAU_TEST_FILE_TIMEOUT_SECONDS:-90}"
if ! [[ "$per_file_timeout" =~ ^[0-9]+$ ]] || (( per_file_timeout < 10 || per_file_timeout > 600 )); then
  echo "HIAU_TEST_FILE_TIMEOUT_SECONDS must be an integer between 10 and 600" >&2
  exit 2
fi

files=(src/utils/*.test.ts server/*.test.ts)
if (( ${#files[@]} == 0 )); then
  echo "ERROR: No test files found, refusing to pass an empty suite" >&2
  exit 2
fi
echo "[HIAU test runner] ${#files[@]} files; per-file timeout: ${per_file_timeout}s"
completed=0
failed=0
timed_out=0
failures=()
for file in "${files[@]}"; do
  echo "::group::HIAU TEST $file"
  start=$SECONDS
  if timeout --signal=TERM --kill-after=5s "${per_file_timeout}s" \
      node --import tsx --test --test-timeout=60000 "$file"; then
    echo "[PASS] $file in $((SECONDS-start))s"
    ((completed+=1))
  else
    rc=$?
    echo "::error file=$file::Test file failed (exit=$rc, duration=$((SECONDS-start))s)"
    failures+=("$file (exit $rc)")
    ((failed+=1))
    if (( rc == 124 || rc == 137 )); then
      echo "::error file=$file::Timed out or force-killed; inspect open HTTP servers, timers and DB handles"
      ((timed_out+=1))
    fi
  fi
  echo "::endgroup::"
done
echo "[HIAU test summary] total=${#files[@]} passed=$completed failed=$failed timed_out=$timed_out"
if (( failed > 0 )); then
  printf '[FAILED FILE] %s\n' "${failures[@]}" >&2
  exit 1
fi
