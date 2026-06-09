# Vibook — Remote & Cross-Network Access

This guide explains how to connect the **mobile app** to the **Spring Boot backend** when:

- Phone and laptop are on the **same Wi‑Fi** (default graduation setup)
- You need access from **another Wi‑Fi** or **mobile data** (tunnel)
- You deploy a **public production** API URL

The mobile app reads **`EXPO_PUBLIC_API_URL`** from `mobile/.env` at **bundle time**. There is no runtime URL switching in the app.

**Related files**

| File | Purpose |
|------|---------|
| `mobile/.env` | Active config (gitignored) — copy from an example below |
| `mobile/.env.lan.example` | Same Wi‑Fi / LAN |
| `mobile/.env.tunnel.example` | ngrok or similar HTTPS tunnel |
| `mobile/.env.production.example` | Deployed public API |
| `mobile/src/api/env.ts` | Reads `EXPO_PUBLIC_API_URL` |
| `backend/src/main/resources/application.yml` | Server port `8080`, CORS patterns |

---

## Quick diagnosis

| Symptom | Likely cause |
|---------|----------------|
| Works on home Wi‑Fi, fails on mobile data | App points to a **private LAN IP** (e.g. `192.168.x.x`) |
| Stopped working after changing network | **LAN IP changed**; `.env` still has the old address |
| `Network request failed` in the app | Backend not running, wrong URL, or unreachable host |
| Logged out after app restart off‑LAN | `hydrateAuthSession` clears tokens when `GET /users/me` cannot reach the API (network failure, not JWT misconfiguration) |

---

## 1. Same Wi‑Fi LAN setup

Use this for local development and graduation demos when the phone and laptop share one network.

### Prerequisites

- Spring Boot backend running on port **8080**
- MySQL running locally (`backend/.env` or defaults in `application.yml`)
- Phone and laptop on the **same Wi‑Fi** (not guest/isolated VLAN if your router blocks device-to-device traffic)

### Step 1 — Start the backend

From the repository root:

```bash
cd backend
# Ensure MySQL is up and backend/.env exists if you use custom DB credentials
mvn spring-boot:run
```

Confirm the process listens on all interfaces (not only localhost):

```bash
lsof -iTCP:8080 -sTCP:LISTEN
# Expect: TCP *:8080 (LISTEN)
```

There is **no** `server.address` in `application.yml`, so Spring Boot binds to **`*:8080`** by default.

### Step 2 — Find your laptop’s LAN IP

**macOS**

```bash
ipconfig getifaddr en0
```

If empty, try `en1` or check **System Settings → Network**.

**Windows**

```cmd
ipconfig
```

Use the **IPv4 Address** of your active Wi‑Fi adapter (e.g. `192.168.1.5`).

### Step 3 — Configure the mobile app

```bash
cd mobile
cp .env.lan.example .env
```

Edit `mobile/.env` and replace the placeholder with your IP:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.5:8080/api/v1
```

Rules:

- Include **`http://`**, **port `8080`**, and path **`/api/v1`**
- Do **not** use `localhost` or `127.0.0.1` on a physical phone

### Step 4 — Restart Expo with a clean cache

```bash
npx expo start -c
```

Reload the app in Expo Go (or rebuild your dev client).

### Step 5 — Test from the phone browser

On the phone, open:

```text
http://<YOUR_LAN_IP>:8080/api/v1/categories
```

You should see JSON (a list of categories). If this fails, fix networking before debugging the app.

---

## 2. ngrok tunnel setup (any network)

Use this to test from **mobile data**, a **friend’s Wi‑Fi**, or anywhere outside your LAN. Your laptop must stay on and running the backend; ngrok forwards the public URL to `localhost:8080`.

### Step 1 — Start backend locally

Same as LAN setup — backend on port **8080**.

### Step 2 — Install and run ngrok

Install from [https://ngrok.com](https://ngrok.com), authenticate once, then:

```bash
ngrok http 8080
```

Copy the **HTTPS** forwarding URL, e.g. `https://abc123.ngrok-free.app`.

### Step 3 — Configure mobile

```bash
cd mobile
cp .env.tunnel.example .env
```

Set:

```env
EXPO_PUBLIC_API_URL=https://abc123.ngrok-free.app/api/v1
```

Use **HTTPS** from ngrok, not `http://`.

### Step 4 — Restart Expo

```bash
npx expo start -c
```

### Step 5 — Test from the phone browser

```text
https://abc123.ngrok-free.app/api/v1/categories
```

### Admin web + CORS (optional)

CORS does **not** block the native mobile app’s `fetch` calls. It **does** affect **admin-web** in the browser.

If you open the admin SPA against a tunnel URL, add the tunnel origin to `backend/src/main/resources/application.yml` under `vibook.cors.allowed-origin-patterns`, for example:

```yaml
- "https://*.ngrok-free.app"
```

Restart the backend after changing CORS.

### Tunnel limitations

- Free ngrok URLs **change** each time you restart ngrok → update `mobile/.env` and run `npx expo start -c` again
- Laptop must remain online with backend + ngrok running
- Not a substitute for a real production deployment

---

## 3. Production-style public backend URL

Use this when the API is deployed to a VPS, cloud host, or PaaS with a stable domain and HTTPS.

### Backend deployment checklist

1. Deploy Spring Boot + MySQL (or managed database) to your host
2. Set production secrets via environment variables (see `backend/.env.example`):
   - `JWT_SECRET` (strong, ≥32 characters)
   - `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
   - `PAYPAL_*` if using live PayPal (sandbox is fine for demos)
3. Use **HTTPS** termination (reverse proxy, load balancer, or platform TLS)
4. Tighten `vibook.cors.allowed-origin-patterns` to your real admin origin(s)
5. Prefer `spring.jpa.hibernate.ddl-auto: validate` (or migrations) instead of `update` in production

### Mobile configuration

```bash
cd mobile
cp .env.production.example .env
```

Example:

```env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

### Build / release

For Expo production builds (EAS or local), set `EXPO_PUBLIC_API_URL` in the build environment or `.env` **before** building so it is baked into the binary.

```bash
npx expo start -c   # dev smoke test against production API
# or
eas build --profile production   # when using EAS with env in eas.json
```

### iOS / Android notes

- **HTTPS** is strongly recommended; iOS App Transport Security blocks cleartext HTTP in release builds unless you add exceptions in `app.json`
- Media URLs from the API are resolved with `resolveBackendMediaUrl()` in `mobile/src/api/env.ts` — they use the same base host as `EXPO_PUBLIC_API_URL`

---

## 4. How to update `mobile/.env`

1. Choose a template:
   - LAN → `cp .env.lan.example .env`
   - Tunnel → `cp .env.tunnel.example .env`
   - Production → `cp .env.production.example .env`
2. Set **`EXPO_PUBLIC_API_URL`** to the full API base including `/api/v1`
3. Save the file
4. Run **`npx expo start -c`** (see below)
5. Reload the app in Expo Go or restart your dev build

**Never commit** `mobile/.env` — it is gitignored and may contain machine-specific IPs.

---

## 5. Why `npx expo start -c` is required

Expo (Metro) inlines `EXPO_PUBLIC_*` variables when the JavaScript bundle is built. Changing `mobile/.env` does **not** update a running bundle.

- `-c` clears the Metro cache so the new `EXPO_PUBLIC_API_URL` is picked up
- Without it, the app may keep calling the **old** URL until you fully restart with cache clear

`getApiBaseUrl()` in `mobile/src/api/env.ts` only reads `process.env.EXPO_PUBLIC_API_URL` — there is no in-app settings screen to change the API host.

---

## 6. Test the backend URL from the phone browser

Use a **public** endpoint that does not require login:

```text
<API_BASE_WITHOUT_TRAILING_SLASH>/categories
```

Examples:

| Setup | URL to open on the phone |
|--------|---------------------------|
| LAN | `http://192.168.1.5:8080/api/v1/categories` |
| ngrok | `https://abc123.ngrok-free.app/api/v1/categories` |
| Production | `https://api.yourdomain.com/api/v1/categories` |

**Success:** JSON array/object in the browser.  
**Failure:** timeout, “can’t connect”, or blank page → fix URL, network, or backend before debugging the app.

Optional authenticated check (after login in the app): `GET /api/v1/users/me` requires a Bearer token — the categories URL is enough for connectivity.

---

## 7. Common mistakes

### Using `localhost` or `127.0.0.1`

On a **physical phone**, `localhost` means the phone itself, not your laptop.

```env
# Wrong on a real device
EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
```

Use LAN IP, tunnel HTTPS URL, or production domain.

### Using an old LAN IP

DHCP assigns a new address when you change Wi‑Fi or reboot the router. Your `.env` might still say `192.168.100.164` while the laptop is now `172.20.10.2` (common on iPhone hotspot).

Re-run `ipconfig getifaddr en0`, update `.env`, then `npx expo start -c`.

### Phone and laptop on different networks

Private addresses (`192.168.x.x`, `10.x.x.x`, `172.16–31.x.x`) are not routable over the internet or another Wi‑Fi. Use **ngrok** or a **deployed** API for cross-network access.

### Tunnel URL changed

Restarting ngrok generates a new subdomain on free plans. Update `EXPO_PUBLIC_API_URL` and run `npx expo start -c`.

### Backend not running

```bash
cd backend && mvn spring-boot:run
```

Verify:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8080/api/v1/categories
# Expect: 200
```

### Port 8080 already in use

```bash
lsof -iTCP:8080 -sTCP:LISTEN
```

Stop the conflicting process or change `server.port` in `application.yml` (if you change the port, update `EXPO_PUBLIC_API_URL` to match).

### macOS firewall blocking incoming connections

If LAN browser test fails but `curl` works on the laptop, allow **Java** or incoming connections for port 8080 in **System Settings → Network → Firewall**.

### Guest / client isolation Wi‑Fi

Some routers prevent devices on Wi‑Fi from talking to each other. Use a normal LAN SSID or a tunnel.

---

## Environment template reference

| Template | When to use | Example URL |
|----------|-------------|-------------|
| `.env.lan.example` | Same Wi‑Fi as laptop | `http://192.168.1.5:8080/api/v1` |
| `.env.tunnel.example` | ngrok / Cloudflare Tunnel | `https://xxxx.ngrok-free.app/api/v1` |
| `.env.production.example` | Deployed API | `https://api.yourdomain.com/api/v1` |

Copy one to `.env`, edit, then:

```bash
cd mobile
npx expo start -c
```

---

## What this project does *not* include

- Automatic discovery of backend IP
- Runtime API URL switching in the app
- Built-in ngrok or tunnel scripts
- Cloud deployment manifests

Those are intentional for the graduation LAN scope. Use this guide and the `.env.*.example` files when you need broader access.
