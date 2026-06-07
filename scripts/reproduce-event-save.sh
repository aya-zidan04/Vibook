#!/usr/bin/env bash
# Reproduce mobile event create flow with full request/response logging.
set -euo pipefail

BASE="http://localhost:8080/api/v1"
EMAIL="eventdebug-$(date +%s)@test.com"
PASSWORD="Password123"
ADMIN_EMAIL="admin@gmail.com"
ADMIN_PASSWORD="Admin1234"
LOG="/tmp/vibook-event-save-repro.log"

log_step() {
  echo "" | tee -a "$LOG"
  echo "========== $1 ==========" | tee -a "$LOG"
}

log_req_resp() {
  local step="$1" method="$2" url="$3" payload="$4" status="$5" body="$6"
  {
    echo "STEP: $step"
    echo "REQUEST: $method $url"
    echo "PAYLOAD: $payload"
    echo "STATUS: $status"
    echo "BODY: $body"
    echo "---"
  } | tee -a "$LOG"
}

: > "$LOG"

log_step "REGISTER partner user"
REG_BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"firstName\":\"Event\",\"lastName\":\"Debug\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"phone\":\"+962790000001\"}")
REG_STATUS="${REG_BODY##*$'\n'}"
REG_JSON="${REG_BODY%$'\n'*}"
log_req_resp "register" POST "$BASE/auth/register" "{email:$EMAIL}" "$REG_STATUS" "$REG_JSON"
TOKEN=$(echo "$REG_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null || true)
if [ -z "${TOKEN:-}" ]; then
  echo "Register failed; trying login" | tee -a "$LOG"
  LOGIN_BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
  LOGIN_STATUS="${LOGIN_BODY##*$'\n'}"
  LOGIN_JSON="${LOGIN_BODY%$'\n'*}"
  TOKEN=$(echo "$LOGIN_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
fi

log_step "UPSERT business profile"
PROFILE_PAYLOAD='{"businessName":"Event Debug Co","tagline":"Test","primaryCategoryId":1,"description":"Long enough business profile description for testing.","workEmail":"'"$EMAIL"'","phone":"+962790000001","governorateId":5,"googleMapsUrl":null,"website":null}'
PROFILE_BODY=$(curl -s -w "\n%{http_code}" -X PUT "$BASE/business-profile/me" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d "$PROFILE_PAYLOAD")
PROFILE_STATUS="${PROFILE_BODY##*$'\n'}"
PROFILE_JSON="${PROFILE_BODY%$'\n'*}"
log_req_resp "profile-upsert" PUT "$BASE/business-profile/me" "$PROFILE_PAYLOAD" "$PROFILE_STATUS" "$PROFILE_JSON"

log_step "SUBMIT profile for review"
SUBMIT_BODY=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE/business-profile/me/submit" -H "Authorization: Bearer $TOKEN")
SUBMIT_STATUS="${SUBMIT_BODY##*$'\n'}"
SUBMIT_JSON="${SUBMIT_BODY%$'\n'*}"
log_req_resp "profile-submit" PATCH "$BASE/business-profile/me/submit" "(none)" "$SUBMIT_STATUS" "$SUBMIT_JSON"
PROFILE_ID=$(echo "$SUBMIT_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "")

log_step "ADMIN approve profile"
ADMIN_LOGIN=$(curl -s -X POST "$BASE/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
if [ -n "$PROFILE_ID" ]; then
  APPROVE_BODY=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE/admin/business-profiles/$PROFILE_ID/approve" -H "Authorization: Bearer $ADMIN_TOKEN")
  APPROVE_STATUS="${APPROVE_BODY##*$'\n'}"
  APPROVE_JSON="${APPROVE_BODY%$'\n'*}"
  log_req_resp "profile-approve" PATCH "$BASE/admin/business-profiles/$PROFILE_ID/approve" "(none)" "$APPROVE_STATUS" "$APPROVE_JSON"
fi

FUTURE_DATE=$(python3 -c "from datetime import date,timedelta; print((date.today()+timedelta(days=7)).isoformat())")

log_step "1) POST /business/events (create hidden)"
CREATE_PAYLOAD=$(cat <<EOF
{
  "title": "Debug Test Event",
  "subcategoryId": 1,
  "description": "This is a long enough event description for validation testing.",
  "eventDate": "$FUTURE_DATE",
  "timeSlots": ["10:00 AM"],
  "governorateId": 5,
  "googleMapsUrl": null,
  "priceJod": 0,
  "currency": "JOD",
  "capacityGuests": 10,
  "hidden": true,
  "photoUrls": null
}
EOF
)
CREATE_BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE/business/events" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d "$CREATE_PAYLOAD")
CREATE_STATUS="${CREATE_BODY##*$'\n'}"
CREATE_JSON="${CREATE_BODY%$'\n'*}"
log_req_resp "create" POST "$BASE/business/events" "$CREATE_PAYLOAD" "$CREATE_STATUS" "$CREATE_JSON"

if [ "$CREATE_STATUS" != "200" ]; then
  echo "FAILED at step 1 (create). See $LOG"
  exit 1
fi

EVENT_ID=$(echo "$CREATE_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

log_step "2) POST /business/events/{id}/photos"
# Minimal valid JPEG (1x1)
IMG="/tmp/vibook-test-event.jpg"
python3 -c "import base64; open('$IMG','wb').write(base64.b64decode('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAA//EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AP//Z'))"
UPLOAD_BODY=$(curl -s -w "\n%{http_code}" -X POST "$BASE/business/events/$EVENT_ID/photos" \
  -H "Authorization: Bearer $TOKEN" -F "image=@$IMG;type=image/jpeg")
UPLOAD_STATUS="${UPLOAD_BODY##*$'\n'}"
UPLOAD_JSON="${UPLOAD_BODY%$'\n'*}"
log_req_resp "upload" POST "$BASE/business/events/$EVENT_ID/photos" "(multipart image)" "$UPLOAD_STATUS" "$UPLOAD_JSON"

if [ "$UPLOAD_STATUS" != "200" ]; then
  echo "FAILED at step 2 (upload). See $LOG"
  exit 1
fi

log_step "3) GET /business/events/{id}"
GET_BODY=$(curl -s -w "\n%{http_code}" -X GET "$BASE/business/events/$EVENT_ID" -H "Authorization: Bearer $TOKEN")
GET_STATUS="${GET_BODY##*$'\n'}"
GET_JSON="${GET_BODY%$'\n'*}"
log_req_resp "get" GET "$BASE/business/events/$EVENT_ID" "(none)" "$GET_STATUS" "$GET_JSON"

PHOTO_URLS=$(echo "$GET_JSON" | python3 -c "
import sys,json
r=json.load(sys.stdin)
if r.get('photos'):
  print(json.dumps([p['url'] for p in r['photos']]))
else:
  print(json.dumps(r.get('photoUrls') or []))
")

log_step "4) PUT /business/events/{id} (final save visible)"
UPDATE_PAYLOAD=$(python3 -c "
import json
photo_urls=json.loads('''$PHOTO_URLS''')
print(json.dumps({
  'title': 'Debug Test Event',
  'subcategoryId': 1,
  'description': 'This is a long enough event description for validation testing.',
  'eventDate': '$FUTURE_DATE',
  'timeSlots': ['10:00 AM'],
  'governorateId': 5,
  'googleMapsUrl': None,
  'priceJod': 0,
  'currency': 'JOD',
  'capacityGuests': 10,
  'hidden': False,
  'photoUrls': photo_urls,
}))
")
UPDATE_BODY=$(curl -s -w "\n%{http_code}" -X PUT "$BASE/business/events/$EVENT_ID" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d "$UPDATE_PAYLOAD")
UPDATE_STATUS="${UPDATE_BODY##*$'\n'}"
UPDATE_JSON="${UPDATE_BODY%$'\n'*}"
log_req_resp "update" PUT "$BASE/business/events/$EVENT_ID" "$UPDATE_PAYLOAD" "$UPDATE_STATUS" "$UPDATE_JSON"

if [ "$UPDATE_STATUS" != "200" ]; then
  echo "FAILED at step 4 (update). See $LOG"
  exit 1
fi

log_step "5) DELETE /admin/events/{id} (cleanup debug event)"
DELETE_BODY=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE/admin/events/$EVENT_ID" -H "Authorization: Bearer $ADMIN_TOKEN")
DELETE_STATUS="${DELETE_BODY##*$'\n'}"
DELETE_JSON="${DELETE_BODY%$'\n'*}"
log_req_resp "cleanup-delete" DELETE "$BASE/admin/events/$EVENT_ID" "(none)" "$DELETE_STATUS" "$DELETE_JSON"

if [ "$DELETE_STATUS" != "204" ] && [ "$DELETE_STATUS" != "200" ]; then
  echo "WARNING: cleanup delete returned $DELETE_STATUS (event $EVENT_ID may still be visible). See $LOG"
fi

echo "SUCCESS — all 4 steps passed; debug event removed. Full log: $LOG"
