#!/usr/bin/env bash
# PayPal Sandbox API smoke test (no secrets printed).
# Usage (from backend/): ./scripts/paypal-sandbox-test.sh <user-email> <user-password> <event-id> [guests]
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

BASE="${API_BASE:-http://localhost:8080/api/v1}"
EMAIL="${1:?user email}"
PASSWORD="${2:?user password}"
EVENT_ID="${3:?event id}"
GUESTS="${4:-1}"

echo "→ Login at ${BASE}/auth/login"
TOKEN="$(
  curl -sf "${BASE}/auth/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])"
)"
AUTH="Authorization: Bearer ${TOKEN}"

echo "→ Create PENDING booking (event ${EVENT_ID}, guests ${GUESTS})"
BOOKING_ID="$(
  curl -sf "${BASE}/bookings" \
    -H 'Content-Type: application/json' \
    -H "${AUTH}" \
    -d "{\"eventId\":${EVENT_ID},\"guestsCount\":${GUESTS}}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])"
)"
echo "   bookingId=${BOOKING_ID}"

echo "→ Create PayPal order"
CREATE_JSON="$(curl -sf "${BASE}/payments/paypal/create-order" \
  -H 'Content-Type: application/json' \
  -H "${AUTH}" \
  -d "{\"bookingId\":${BOOKING_ID},\"eventId\":${EVENT_ID}}")"

APPROVAL_URL="$(echo "${CREATE_JSON}" | python3 -c "import sys,json; print(json.load(sys.stdin)['approvalUrl'])")"
PAYPAL_ORDER_ID="$(echo "${CREATE_JSON}" | python3 -c "import sys,json; print(json.load(sys.stdin)['paypalOrderId'])")"

echo "   paypalOrderId=${PAYPAL_ORDER_ID}"
echo ""
echo "Open this URL in a browser and approve with your Personal Sandbox buyer:"
echo "${APPROVAL_URL}"
echo ""
read -r -p "Press Enter after you approved payment in PayPal…"

echo "→ Capture order"
CAPTURE_JSON="$(curl -sf "${BASE}/payments/paypal/capture-order" \
  -H 'Content-Type: application/json' \
  -H "${AUTH}" \
  -d "{\"paypalOrderId\":\"${PAYPAL_ORDER_ID}\",\"bookingId\":${BOOKING_ID}}")"

echo "${CAPTURE_JSON}" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print('   paymentStatus:', d.get('paymentStatus'))
print('   bookingStatus:', d.get('bookingStatus'))
print('   paypalCaptureId:', d.get('paypalCaptureId'))
"

echo "Done."
