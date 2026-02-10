#!/usr/bin/env bash
# ============================================================
# Static Application Security Testing (SAST)
# Checks source code for common security anti-patterns
# ============================================================

set -euo pipefail

ISSUES=0
SRC_DIR="src"

echo "Running SAST checks on $SRC_DIR/..."
echo "=========================================="

# 1. Check for eval() usage
echo -n "Checking for eval()... "
if grep -rn "eval(" "$SRC_DIR" --include="*.ts" --include="*.tsx" 2>/dev/null; then
  echo "FAIL: eval() usage found"
  ISSUES=$((ISSUES + 1))
else
  echo "PASS"
fi

# 2. Check for innerHTML usage
echo -n "Checking for innerHTML... "
if grep -rn "innerHTML" "$SRC_DIR" --include="*.ts" --include="*.tsx" 2>/dev/null; then
  echo "FAIL: innerHTML usage found"
  ISSUES=$((ISSUES + 1))
else
  echo "PASS"
fi

# 3. Check for dangerouslySetInnerHTML
echo -n "Checking for dangerouslySetInnerHTML... "
if grep -rn "dangerouslySetInnerHTML" "$SRC_DIR" --include="*.ts" --include="*.tsx" 2>/dev/null; then
  echo "FAIL: dangerouslySetInnerHTML usage found"
  ISSUES=$((ISSUES + 1))
else
  echo "PASS"
fi

# 4. Check for document.write
echo -n "Checking for document.write... "
if grep -rn "document\.write" "$SRC_DIR" --include="*.ts" --include="*.tsx" 2>/dev/null; then
  echo "FAIL: document.write usage found"
  ISSUES=$((ISSUES + 1))
else
  echo "PASS"
fi

# 5. Check for hardcoded credentials/secrets
echo -n "Checking for hardcoded secrets... "
if grep -rnE "(password|secret|apikey|api_key|private_key)\s*[:=]\s*['\"][^'\"]+['\"]" "$SRC_DIR" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -vi "type\|interface\|enum\|//\|sanitize"; then
  echo "FAIL: Potential hardcoded secrets"
  ISSUES=$((ISSUES + 1))
else
  echo "PASS"
fi

# 6. Check for http:// URLs (should be https://)
echo -n "Checking for insecure HTTP URLs... "
if grep -rnE "http://[a-zA-Z]" "$SRC_DIR" --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "localhost\|127.0.0.1\|http://www.w3.org"; then
  echo "FAIL: Insecure HTTP URLs found"
  ISSUES=$((ISSUES + 1))
else
  echo "PASS"
fi

# 7. Check for console.log in production code (should use secureLog)
echo -n "Checking for console.log leaks... "
CONSOLE_LOGS=$(grep -rn "console\.log\b" "$SRC_DIR" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
if [ "$CONSOLE_LOGS" -gt 0 ]; then
  echo "WARNING: $CONSOLE_LOGS console.log statement(s) found (use secureLog instead)"
else
  echo "PASS"
fi

echo "=========================================="

if [ $ISSUES -gt 0 ]; then
  echo "SAST FAILED: $ISSUES critical issue(s) found"
  exit 1
else
  echo "SAST PASSED: No critical issues found"
  exit 0
fi
