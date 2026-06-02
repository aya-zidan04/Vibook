# PayPal Sandbox payments (Vibook)

Vibook uses **PayPal Sandbox only**. Live PayPal is disabled in code (`PAYPAL_MODE` must be `sandbox` and the API host must contain `sandbox`). `PayPalApiClient` calls `requireSandbox()` before every API request.

## 1. PayPal Developer setup

1. Open [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/).
2. Go to **Apps & Credentials** → **Sandbox**.
3. Create or open a **Sandbox** REST app.
4. Copy **Client ID** and **Secret** into your backend environment (never commit secrets):

```bash
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=<sandbox client id>
PAYPAL_CLIENT_SECRET=<sandbox client secret>
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
```

1. Copy `backend/.env.example` → **`backend/.env`** (this file is gitignored).
2. Paste your Sandbox **Client ID** and **Secret** into `.env` only — **do not** put them in `application.yml` or commit them.
3. Spring Boot loads `backend/.env` via `spring.config.import` when you run from the `backend/` directory.

See `backend/.env.example`.

## 2. Sandbox test accounts

1. In the dashboard, open **Testing Tools** → [Sandbox Accounts](https://developer.paypal.com/tools/sandbox/).
2. Use or create:
   - **Business** account → merchant (receives payments; matches your sandbox app).
   - **Personal** account → buyer (use this to approve payments in the PayPal UI).
3. View sandbox transactions at [sandbox.paypal.com](https://www.sandbox.paypal.com/).

## 3. API flow

| Step | Endpoint | Result |
|------|----------|--------|
| 1 | `POST /api/v1/bookings` | Booking `PENDING` |
| 2 | `POST /api/v1/payments/paypal/create-order` | PayPal order + `approvalUrl` |
| 3 | User approves in PayPal (buyer sandbox account) | — |
| 4 | `POST /api/v1/payments/paypal/capture-order` | Payment `CAPTURED`, booking `CONFIRMED` |

Amount and currency are taken from the **booking on the server** (not from the client body).

## 4. Mobile deep links

Default return URLs (override with env):

- `PAYPAL_RETURN_URL=vibook://paypal-return`
- `PAYPAL_CANCEL_URL=vibook://paypal-cancel`

Ensure the Expo app scheme is `vibook` (see `mobile/app.json`).

## 5. Admin visibility

After a payment attempt, open **Admin → Bookings** (list or detail). You should see:

- Booking status (`PENDING`, `CONFIRMED`, …)
- Payment status (`CREATED`, `CAPTURED`, `FAILED`, …)
- PayPal order ID and capture ID (when available)
- A banner indicating whether the booking was **confirmed by successful PayPal capture**

<!-- Screenshot placeholder: admin booking detail with PayPal fields -->
<!-- ![Admin booking PayPal payment](docs/images/paypal-admin-booking-detail.png) -->

## 6. Security verification

| Check | How to verify |
|-------|----------------|
| Secret not in clients | `rg PAYPAL_CLIENT_SECRET` — should only appear under `backend/` (env example, docs), not `mobile/` or `admin-web/` |
| Sandbox host only | `PAYPAL_MODE=sandbox` and `PAYPAL_BASE_URL` must include `sandbox`; `PayPalProperties.requireSandbox()` throws otherwise |
| No confirm before capture | Booking stays `PENDING` until capture returns `COMPLETED` |
| Duplicate capture | Second capture with same `paypalOrderId` returns existing `CAPTURED` row; no second PayPal API capture call |
| Server-side amount | `PayPalPaymentServiceImplTest.createOrder_usesBookingAmountFromServer` |

## 7. Manual test checklist

### Mobile (happy path)

1. Sign in on the app with a user account.
2. Open an API-backed event → checkout → **Pay with PayPal**.
3. Confirm booking is created (`PENDING`) before PayPal opens.
4. Log in with your **Personal** sandbox buyer when PayPal opens.
5. Approve payment; app should capture and show confirmation.
6. In **Bookings** tab, booking should be confirmed.

### Admin

1. Open **Bookings** → find the booking.
2. Payment column shows `Captured` (or earlier state if still in progress).
3. Open booking detail → summary shows booking + payment status and “Confirmed by successful PayPal capture” when applicable.

### Failure / cancel

1. Start PayPal checkout and cancel → booking stays `PENDING`, payment may be `CREATED` or `FAILED`.
2. Retry capture without approval → booking must not become `CONFIRMED`.

### Automated tests

```bash
cd backend
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
./mvnw test -Dtest=PayPalPaymentServiceImplTest
```

```bash
cd mobile && npm run typecheck
cd admin-web && npm run lint && npm run build
```

## 8. Run backend with credentials

```bash
cd backend
export PAYPAL_CLIENT_ID=...
export PAYPAL_CLIENT_SECRET=...
./mvnw spring-boot:run
```

<!-- Screenshot placeholder: PayPal sandbox approval screen -->
<!-- ![PayPal sandbox checkout](docs/images/paypal-sandbox-checkout.png) -->
