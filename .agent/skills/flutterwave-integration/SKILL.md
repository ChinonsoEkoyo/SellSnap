# Paystack Integration (was Flutterwave)

SellSnap now uses Paystack inline popup for payments. The flow is:

1. Buyer fills checkout form → review step
2. Buyer clicks "Pay" — Paystack inline script loads from `js.paystack.co/v1/inline.js`
3. Paystack popup opens with amount, email, and reference
4. On success, the callback calls `confirmPayment` server action (`app/actions/order.ts`)
5. The action creates the Order (status `paid`) and a Payment record with the Paystack reference

## Key Files

- `app/p/[slug]/ProductBuyForm.tsx` — Client component with Paystack integration
- `app/actions/order.ts` — `confirmPayment` server action
- `.env.local` — `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` and `PAYSTACK_SECRET_KEY`

## Amount Handling

- `unitPrice` (from DB) is in **kobo**
- Paystack expects amount in **kobo** — pass `unitPrice * quantity` directly
- Display divide by 100: `(unitPrice * quantity) / 100`

## Test Cards

Paystack test mode supports test cards at https://paystack.com/docs/payments/test-payments
