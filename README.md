# Nexora — Trading Technology & Market Research Platform (Phase 1)

Nexora is a full-stack MERN web application for a next-generation trading technology brand. This **Phase 1** release provides the public marketing website, legal draft pages, hardened user authentication service (HTTP-only cookies + CSRF protection + bcrypt password hashing), and a protected member workspace dashboard.

> **Important Scope Notice:** Interactive charting, historical session backtesting, quantitative execution analytics, and AI research tools are represented honestly as **planned upcoming modules** and are intentionally isolated from this Phase 1 release.

---

## Project Architecture

```text
nexora/
├── .gitignore
├── README.md
├── DEPLOYMENT.md
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── csrf.js
│   │   │   └── rateLimiter.js
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   └── utils/
│   │       ├── cookies.js
│   │       └── validation.js
│   └── tests/
│       └── auth.test.js
└── frontend/
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── vercel.json
    ├── vite.config.js
    ├── public/
    │   ├── favicon.svg
    │   └── nexora-logo-reference.png
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── components/
        │   ├── Footer.jsx
        │   ├── Navbar.jsx
        │   ├── NexoraLogo.jsx
        │   └── RouteGuards.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── DashboardPage.jsx
        │   ├── LandingPage.jsx
        │   ├── LoginPage.jsx
        │   ├── PrivacyPage.jsx
        │   ├── RegisterPage.jsx
        │   └── TermsPage.jsx
        ├── services/
        │   └── api.js
        └── styles/
            └── index.css
```

---

## Local Development Setup

### 1. Configure MongoDB Atlas
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a dedicated cluster (e.g., `nexora-cluster`).
2. Under **Database Access**, create a database user with **Read and write to any database** privileges and a strong password.
3. Under **Network Access**, add your current local IP address (for development) and your backend host's outbound IPs (for production).
4. Click **Connect -> Drivers -> Node.js** and copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@<cluster-url>/nexora?retryWrites=true&w=majority
   ```

### 2. Configure Backend Environment Variables
Copy `backend/.env.example` to `backend/.env` and populate your real values (never commit `backend/.env`):
```powershell
cd d:\projects\nexora\backend
Copy-Item .env.example .env
```

Generate a strong `JWT_SECRET`:
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Install & Run the Backend API
```powershell
cd d:\projects\nexora\backend
npm install
npm run dev
```
The API server listens on `http://localhost:5000` by default and exposes `GET /api/health`.

### 4. Install & Run the React Frontend
```powershell
cd d:\projects\nexora\frontend
Copy-Item .env.example .env
npm install
npm run dev
```
Open `http://localhost:5173` in your browser. Vite automatically proxies `/api` requests to `http://localhost:5000`.

---

## Running Automated Tests

The backend includes an isolated test suite (`tests/auth.test.js`) using Node's native test runner and `supertest`. It validates against the Mongoose `User` schema in an isolated in-memory test store so it **never** touches or requires a production database:

```powershell
cd d:\projects\nexora\backend
npm test
```

---

## Future Charting Integration Notes

- No charting library or TradingView code is installed or embedded in Phase 1.
- No claims of TradingView partnership, sponsorship, or approval are made anywhere in the application.
- Before integrating TradingView Advanced Charts in a future phase, verify the signed agreement's permitted domain scope, attribution requirements, public/authenticated access rules, and obtain authorized access to the private charting library repository.
