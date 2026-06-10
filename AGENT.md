# SellSnap — Agent Project Brief

## What This Product Is

SellSnap is a link-based commerce platform for Nigerian small business owners. Sellers upload a product, generate a unique payment link, and share it on WhatsApp or Instagram. Buyers click the link, see the product, and pay instantly. No store. No website. Just a link.

**Core promise:** Sell anything in seconds using just a link.

---

## Tech Stack

| Layer           | Choice                                              |
| --------------- | --------------------------------------------------- |
| Framework       | Next.js 15 (App Router)                             |
| Language        | TypeScript (strict mode)                            |
| Database        | PostgreSQL                                          |
| ORM             | Prisma                                              |
| Payment Gateway | Paystack                                            |
| Styling         | CSS Modules + CSS custom properties (design tokens) |
| Auth            | NextAuth.js                                         |
| Email           | SMTP Free Options                                   |
| Hosting         | Vercel                                              |

---

## Folder Structure

```
sellsnap/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── products/
│   │   └── orders/
│   ├── p/
│   │   └── [slug]/          ← public product page (the shareable link)
│   └── api/
│       ├── auth/
│       ├── products/
│       ├── orders/
│       └── webhooks/
│           └── paystack/
├── components/
│   ├── ui/                  ← primitive components (Button, Input, Card)
│   └── features/            ← product, order, checkout components
├── lib/
│   ├── db.ts                ← Prisma client singleton
│   ├── auth.ts              ← NextAuth config
│   └── utils.ts             ← shared helpers
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tokens/
│   ├── colors.css           ← DO NOT touch. Design token source of truth.
│   └── typography.css       ← DO NOT touch. Design token source of truth.
└── types/
    └── index.ts             ← shared TypeScript types
```

---

## Data Models

These match the database schema exactly. Use these as the reference for all data operations.

### User

```
id              String    @id @default(cuid())
name            String
email           String    @unique
businessName    String
passwordHash    String
createdAt       DateTime  @default(now())
products        Product[]
```

### Product

```
id          String    @id @default(cuid())
userId      String
name        String
description String
price       Int                          ← stored in kobo (smallest unit)
imageUrl    String
uniqueSlug  String    @unique
createdAt   DateTime  @default(now())
user        User      @relation(...)
orders      Order[]
```

### Order

```
id                   String       @id @default(cuid())
productId            String
buyerEmail           String?
amount               Int                              ← in kobo
status               OrderStatus                      ← pending | paid | failed
transactionReference String       @unique
createdAt            DateTime     @default(now())
product              Product      @relation(...)
payment              Payment?
```

### Payment

```
id                String    @id @default(cuid())
orderId           String    @unique
gatewayReference  String
status            String
paidAt            DateTime?
order             Order     @relation(...)
```

---

## Key Business Rules

- Price is always stored and handled in **kobo** (Nigerian kobo). Convert to Naira only at the display layer (divide by 100).
- Every product gets a unique `uniqueSlug`. Public URL is `/p/[uniqueSlug]`.
- Payment flow: Paystack inline popup → buyer pays via card → callback confirms payment → order created with status 'paid'.
- Duplicate transactions are blocked by checking `transactionReference` uniqueness before confirming.
- If a product is deleted, its public link must return a "Product not available" page, not a 404.
- Only the product owner can edit or delete their products.

---

## Environment Variables Required

```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY  ← Paystack public key (safe for client)
PAYSTACK_SECRET_KEY              ← Paystack secret key (server-side only)
RESEND_API_KEY
```

All secrets live in `.env.local`. Never hardcode them. Never log them. `PAYSTACK_SECRET_KEY` must never appear in client-side code.

---

## User Flows (Reference)

**Seller:** Signup → Dashboard → Create Product → Copy Link → Share on WhatsApp

**Buyer:** Click link → View product page → Fill details → Review order → Click "Pay" → Paystack popup → Complete payment → See confirmation

**System:** Paystack callback received → Order created with status 'paid' → Payment record created → Seller notified (dashboard)
