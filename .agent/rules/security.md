---
trigger: always_on
---

# Security Rules

SellSnap handles money. Sellers trust us to move their customers' payments safely. A security mistake here is not a bug, it is a breach of that trust. Every agent working on this codebase must follow these rules without exception.

## Secrets and Configuration

Never commit secrets to the repository. API keys, database URLs, webhook secrets, and signing keys live in environment variables, loaded through a validated config module.

The required environment variables are:

```
DATABASE_URL
FLUTTERWAVE_PUBLIC_KEY
FLUTTERWAVE_SECRET_KEY
FLUTTERWAVE_SECRET_HASH       (for webhook verification)
SESSION_SECRET
NEXT_PUBLIC_APP_URL
STORAGE_ACCESS_KEY
STORAGE_SECRET_KEY
STORAGE_BUCKET
```

Environment variables are validated at boot with zod in `lib/env.ts`. If a required variable is missing, the app refuses to start rather than running in a half-configured state.

Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put a secret behind that prefix, even if you think it looks harmless.

## Authentication

Passwords are hashed with argon2id or bcrypt before they hit the database. Never store plaintext passwords. Never log passwords, even during debugging.

Sessions are cookie-based. Cookies must have:

- `httpOnly: true`
- `secure: true` in production
- `sameSite: 'lax'`
- A reasonable expiration (30 days is the default)

Session tokens are random, unguessable, and at least 32 bytes of entropy. Use the Node `crypto` module's `randomBytes`, not `Math.random`.

Logout invalidates the session on the server side by deleting the session record, not just the cookie. A stolen cookie is useless if the server no longer recognizes its token.

## Input Validation

Every piece of data that enters the application from outside must be validated with zod before it touches the database or any business logic. This applies to:

- Form submissions
- Route handler request bodies
- URL parameters and query strings
- Webhook payloads
- File uploads

Validation is not optional and is not the frontend's job. The frontend can validate for user experience, but the server validates for safety.

## SQL Injection

All database access goes through Prisma. Prisma uses parameterized queries by default, which prevents SQL injection as long as you do not bypass it. Never use `prisma.$queryRawUnsafe` or string-concatenate SQL. If you need raw SQL, use `prisma.$queryRaw` with a tagged template, which parameterizes correctly.

## Cross-Site Scripting (XSS)

React escapes strings by default when rendering, which handles most cases. The main risks are:

- `dangerouslySetInnerHTML`: do not use it unless content has been sanitized server-side with a library like DOMPurify, and even then, only for content you control.
- User-submitted URLs: never put an unvalidated URL in an `href` or `src`. Validate that it starts with `https://` and, where relevant, that it points to an allowed domain.
- Markdown rendering: if we ever render Markdown from sellers (product descriptions with formatting, for example), use a sanitizing renderer.

## Cross-Site Request Forgery (CSRF)

Server actions in Next.js include built-in CSRF protection. Route handlers that perform state-changing operations must verify the origin of the request:

- Check the `Origin` or `Referer` header matches the app's domain.
- For authenticated endpoints, rely on the `sameSite: 'lax'` cookie attribute plus origin checking.

## Payments (Paystack)

**Server-side verification is mandatory.** Never trust the browser when it says a payment succeeded. The flow is:

1. Buyer fills in details and clicks "Pay" on the review step.
2. Paystack inline popup opens via the client-side script.
3. Buyer completes payment on Paystack's popup.
4. Paystack calls the `onSuccess` callback with the transaction reference.
5. The callback calls the `confirmPayment` server action which creates the Order with status 'paid' and a Payment record.

**Idempotency is enforced.** The `Payment.gatewayReference` column has a unique constraint. If the handler tries to insert a duplicate, the unique constraint violation is caught and an error is returned.

**Never expose the secret key to the browser.** The public key (`NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`) is safe to expose. The secret key (`PAYSTACK_SECRET_KEY`) must only appear in server-side code.

**Amount handling.** Store amounts as integers (kobo, the smallest unit of the naira, where 1 NGN = 100 kobo). Never use floating point for money. Prisma's `Int` or `BigInt` columns are correct; `Float` is not.

## File Uploads

Product images are uploaded by sellers. They are untrusted input.

- Accept only `image/jpeg`, `image/png`, and `image/webp` based on the actual file bytes, not the client-provided MIME type.
- Enforce a maximum file size (5MB is a reasonable default).
- Strip EXIF metadata before storing, because it can contain GPS coordinates of the seller's home.
- Store files in the configured object storage with a random filename. Never use the client's filename directly.
- Serve uploaded images from the storage provider's domain or a CDN, never from the same origin as the app (helps mitigate XSS risks if an SVG ever sneaks through).

## Rate Limiting

Apply rate limits to:

- Login and signup (to slow down credential stuffing)
- Password reset requests
- Order creation on the public product page (to slow down card testing attacks)

Use an in-memory limiter for development and a Redis-backed one for production. The limiter lives in `lib/rate-limit.ts`.

## Logging

Log enough context to debug an incident, never enough to leak user data.

- Log request method, path, status, duration, and a request ID.
- Log user ID (not email, not name) when relevant.
- Log error stacks on the server.
- Never log: passwords, session tokens, full card numbers, CVVs, Paystack secret keys, webhook secrets, buyer email unless required for incident response.

## Dependencies

Every dependency is a potential vulnerability. Keep the list small. Run `npm audit` regularly. When a vulnerability is reported, update the package within a week unless the vulnerability does not affect our use case.

Do not install packages with fewer than a few thousand weekly downloads or no recent commits unless the developer approves.

## Incident Response

If a secret is exposed (committed by accident, leaked in a log, shared in a screenshot), rotate it immediately. The order is:

1. Rotate the secret at the provider (Paystack, database, storage).
2. Update the environment variable in production.
3. Deploy.
4. Revoke the old secret.
5. Tell the developer what happened and when, in writing.

Do not try to hide a leak. Fast, honest response limits damage.
