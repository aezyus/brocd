# BroCD
A mobile-friendly OCD self-support app: a public landing page, managed account login, a quiet grounding flow, 23 common theme descriptions, optional context logging, private Neon history, theme visualizations, and PWA installation.

## Open locally
Run `npm install`, then `npm run dev`. Open http://localhost:5173.

Neon Postgres and Neon Auth are already provisioned for the supplied project and production branch. `neon deploy` pulled their settings into `.env.local`; an app-specific cookie secret was generated locally. Do not commit or share that file.

## Deploy on Vercel
1. Push this folder to a private GitHub repository. `.gitignore` keeps database passwords out.
2. In Vercel, choose **Add New → Project**, then import the repository.
3. Keep the **Vite** preset. Build command: `npm run build`. Output directory: `dist`.
4. Add these three **Environment Variables** from `.env.local`: `DATABASE_URL`, `NEON_AUTH_BASE_URL`, and `NEON_AUTH_COOKIE_SECRET`. Do not prefix them with `VITE_`. The database migrations are already applied. `DATABASE_URL_UNPOOLED` is needed only when running future migrations.
5. Click **Deploy**. Copy the HTTPS website address.
6. In Neon Auth, add that address to **Trusted domains**. You can also run `npx neon@latest neon-auth domain add https://YOUR-APP.vercel.app` locally. Add any custom domain separately. Localhost is already supported.
7. Open the website and create an account. The small install suggestion appears on the landing page. Eligible browsers show native installation; iPhone users get Safari **Share → Add to Home Screen** guidance.

The React app and `/api/data` plus `/api/auth/*` server functions are served together. Managed Neon Auth is proxied through the app's own domain using Neon's official SDK toolkit, so login does not rely on third-party cookies. The cookie secret must remain stable between deployments. Do not use a production database or auth branch for untrusted preview deployments.

Rotate the database password shared in chat before public launch, then update local and Vercel settings. Neon recommends custom SMTP for production account email delivery; the shared Neon sender is used for development. Set that up in Neon Auth before relying on verification/recovery emails for a public launch.

## Accounts and privacy
Visitors see the landing page and account screens. The dashboard, grounding flow, library, and journal require login. Every read, save, export-source read, and delete is scoped to the authenticated Neon user; `/api/data` returns 401 without a valid account session. Cookies are HttpOnly and SameSite, managed with the official Neon server toolkit. Account journals follow users across browsers/devices. Sign-out clears app state and returns to the landing page.

Sessions are never cached by the PWA service worker. Sign out on shared devices. Settings allow journal export and deletion. There is no reassurance AI or free-text thought analysis. This app is not a clinically validated treatment, an emergency service, or a replacement for ERP with an OCD specialist.

## Grounding and visualizations
The hold screen is dark and has no visible clock. There is no required minimum time, pass/fail label, guaranteed anxiety reduction, or invented rumination-savings estimate. Haptics depend on browser/device support and can be disabled. After release, optional themes, sleep, caffeine, and environment can be saved. Completion summarizes the selected theme and actual practice duration. Journey groups real sessions by theme, toggles between counts and practice time, and lets a chart row filter the session list. Theme percentages describe logged sessions, not severity or recovery.

## Offline behavior
After an online visit, the public landing page and downloaded assets are available offline. A grounding session in an already-open signed-in app can continue offline. Reopening the app requires a network connection to verify login; offline mode never bypasses the account gate. Saving/loading history needs a connection. Failed saves retain the current session for retry while the page stays open; there is no automatic background upload queue.

## Checks
- `npm run build` — production build.
- `npm run migrate` — versioned SQL migrations using the direct database URL.
- With the app running, `npm test` — anonymous API denial and public asset checks.
- `npm run test:e2e` — real Neon signup, sign-in, sign-out, reload persistence, mobile anchor-to-save, theme completion/chart, and second-browser history. Requires Playwright Chromium and its Linux dependencies. On a fresh machine run `npx playwright install --with-deps chromium`.
- With the production app on port 5174, `npm run test:pwa` — installed assets and offline public page without leaking private journal data.

The end-to-end test uses reserved `example.com` QA addresses and deletes its own journal records. The managed service's user self-delete endpoint returned 404; all five synthetic QA identities were instead removed with Neon's supported admin CLI. After future end-to-end runs, use `node --env-file=.env.local scripts/cleanup-qa.js` to remove the reserved QA identities. Inbox delivery and real-device vibration cannot be verified by these browser tests. Account email-code recovery UI is wired to Neon, but delivery to a real inbox still needs a manual check. Seven low-severity upstream dependency advisories remain; high/critical Better Auth and Zod advisories were patched through pinned overrides.

See `ASSETS.md` for illustration, photography, font, and icon sources.
