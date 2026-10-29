# Nexora — Production Deployment Guide

This guide walks through deploying Nexora with:
- **Database**: MongoDB Atlas
- **Backend API**: Render, Railway, or Fly.io (Node.js service)
- **Frontend SPA**: Vercel

---

## 1. Environment Variables Checklist

### Backend (`nexora/backend`)
| Variable | Required | Production Value Example | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `production` | Enables strict production checks and security defaults |
| `PORT` | Yes | `5000` (or host-assigned) | Port the Express server binds to |
| `MONGODB_URI` | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/nexora?retryWrites=true&w=majority` | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | 64-byte random hex string (`>= 32` chars) | Secret key used to sign HTTP-only session tokens |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiration lifetime |
| `FRONTEND_ORIGIN` | Yes | `https://nexora.yourdomain.com` | Exact frontend URL(s) allowed by CORS (comma-separated if multiple) |
| `COOKIE_SECURE` | Yes | `true` | Ensures cookies are transmitted only over HTTPS |
| `COOKIE_SAMESITE` | Yes | `lax` (same site) or `none` (cross-domain) | Set to `lax` if using Vercel `/api` rewrite or custom subdomain (`api.yourdomain.com` + `app.yourdomain.com`); set to `none` if frontend and backend are on different root domains |

### Frontend (`nexora/frontend`)
| Variable | Required | Production Value Example | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Yes | `/api` (recommended with Vercel proxy) or `https://api.yourdomain.com/api` | Base URL for backend API requests |

---

## 2. Recommended Deployment Topology (Simplest & Most Reliable for Cookies)

Because modern browsers increasingly restrict third-party cross-domain cookies, the **most reliable production setup** is either:

### Option A (Recommended): Vercel Reverse Proxy Rewrite to Backend Host
1. Deploy `nexora/backend` to **Render** or **Railway** (e.g., `https://nexora-api-prod.onrender.com`).
2. Set `COOKIE_SECURE=true` and `COOKIE_SAMESITE=lax` on the backend, and set `FRONTEND_ORIGIN` to your Vercel URL (e.g., `https://nexora-app.vercel.app`).
3. In `nexora/frontend/vercel.json`, add a rewrite before the SPA fallback so `/api/*` requests are proxied through your Vercel origin:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://nexora-api-prod.onrender.com/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
4. Keep `VITE_API_BASE_URL=/api` in Vercel. Because the browser communicates with `/api` on the same origin, `HttpOnly; Secure; SameSite=Lax` cookies and `nexora_csrf_token` work natively in all browsers (including Safari ITP and Brave).

### Option B: Custom Subdomains (`app.yourdomain.com` + `api.yourdomain.com`)
1. Point `app.yourdomain.com` to Vercel and `api.yourdomain.com` to your Node.js backend host.
2. Set `VITE_API_BASE_URL=https://api.yourdomain.com/api` in Vercel.
3. On the backend, set:
   - `FRONTEND_ORIGIN=https://app.yourdomain.com`
   - `COOKIE_SECURE=true`
   - `COOKIE_SAMESITE=none` (or `lax` since both share the same registrable root domain `yourdomain.com`).

---

## 3. Step-by-Step Deployment Instructions

### Step 1: Prepare MongoDB Atlas for Production
1. In MongoDB Atlas, verify your database user has a strong password and is scoped only to the `nexora` database (`readWrite`).
2. Under **Network Access**, allow access from your backend host's outbound IP addresses.

### Step 2: Deploy the Express Backend (Render / Railway)
1. Create a new **Web Service** pointing to your repository's `backend` root directory.
2. **Build Command**: `npm install`
3. **Start Command**: `npm start`
4. Add all required backend environment variables from the checklist above.
5. Verify deployment by opening `https://<your-backend-domain>/api/health` and confirming:
   ```json
   {
     "success": true,
     "service": "nexora-api",
     "environment": "production",
     "database": {
       "connected": true,
       "status": "connected"
     }
   }
   ```

### Step 3: Deploy the React Frontend (Vercel)
1. Import your repository into Vercel and set the **Root Directory** to `frontend`.
2. **Framework Preset**: `Vite`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. Set `VITE_API_BASE_URL` in Vercel Environment Variables.
6. Deploy and test:
   - Visit `/`, `/register`, `/login`, `/privacy`, `/terms`.
   - Register a new account and verify redirect to `/dashboard`.
   - Refresh the browser on `/dashboard` and confirm authentication persists and Vercel serves the SPA cleanly.
   - Click **Sign out** and confirm redirect to `/login` and that navigating back to `/dashboard` requires authentication.
