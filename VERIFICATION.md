# BroCD verification

Final production build: `npm run build`

```
✓ 1838 modules transformed.
✓ built in 2.89s
```

Neon deployment: Postgres and Managed Neon Auth provisioned successfully. Environment values pulled to ignored `.env.local`. Versioned session schema and account ownership migrations applied.

`npm test`:

```
PASS: Read, save, and delete are blocked without login.
PASS: A forged guest cookie cannot access account data.
PASS: Public page, PWA assets, images, and font are served correctly.
```

`TEST_URL=http://localhost:5174 npm run test:e2e` against the production server:

```
PASS: Public landing page is mobile-ready; all journal API methods require sign-in.
Sign-up response: 200
PASS: Managed Neon sign-up creates an account and opens the protected app.
PASS: Anchoring saves to Neon; completion shows its theme; journey groups it visually.
PASS: Account session and saved journal survive a reload.
PASS: Sign-out returns to the landing page and revokes journal access.
PASS: Wrong passwords are rejected; sign-in on a second device restores the same journal.
PASS: A different signed-in account cannot read or delete the first account’s session.
PASS: Password recovery rejects an invalid email code. Inbox delivery remains unverified.
PASS: Validation, cross-origin protection, deletion, and browser error checks.
```

`npm run test:pwa`:

```
PASS: Production PWA loads the public landing offline without opening the private app.
PASS: Mobile images load, page has no overflow, and manifest has install icons.
```

`node --env-file=.env.local scripts/cleanup-qa.js`:

```
QA cleanup: removed 5 of 5 synthetic test accounts.
```

Desktop (1440px) and mobile (390px) rendered screenshots reviewed, including public landing, signup, dashboard, theme completion, and journey. This is Chromium browser verification, not a physical iPhone/Android test.

Resolved during implementation: missing global CLI PATH (used npx), failed initial illustration URLs (used verified Storyset source), missing browser libraries (temporary user-space libraries), local Node network timeouts (connection-attempt timeout), and zero-TTL auth config validation (supported positive TTL).

Remaining: real inbox delivery and physical-device haptics unverified; seven low-severity upstream dependency advisories; harmless third-party build annotation warnings. Not deployed to Vercel yet—deployment steps and required trusted-domain registration are in README.md.
