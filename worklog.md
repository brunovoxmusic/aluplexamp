---
Task ID: 1
Agent: Main Agent
Task: Diagnose and fix 502 Bad Gateway / chrome-error issue

Work Log:
- Analyzed user's error: "Unsafe attempt to load URL from frame with chrome-error://chromewebdata/"
- Checked dev server status: processes kept dying between tool calls
- Found dev server returning HTTP 500 due to two critical errors:
  1. React version mismatch (react: 19.2.3 vs react-dom: 19.2.5) - FIXED by package update
  2. Turbopack internal error: "Invariant: Expected to replace all template variables, missing VAR_MODULE_GLOBAL_ERROR in template"
- Read /start.sh container init script - understood full architecture:
  - PID 1 (tini) → start.sh → dev.sh → bun run dev & → Caddy (PID 2)
  - Caddy proxies :81 → localhost:3000
- Found /tmp/next-panic-*.log with repeated Turbopack VAR_MODULE_GLOBAL_ERROR panics
- Root cause: Next.js 16 Turbopack has a bug that crashes when compiling page.tsx (~1631 lines)
- Fix applied: Changed package.json dev script from `next dev -p 3000` to `next dev -p 3000 --webpack`
- Verified: Both port 3000 (HTTP 200, 109KB) and port 81/Caddy (HTTP 200, 109KB) working
- Server is stable with webpack - no Turbopack panics

Stage Summary:
- Root cause: Turbopack in Next.js 16 crashes on large page.tsx files
- Fix: Added `--webpack` flag to dev script in package.json
- Page is now accessible through Caddy proxy
- chrome-error was a symptom: browser's connection error page can't load external URLs (cross-origin)
