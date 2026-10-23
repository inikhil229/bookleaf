# BookLeaf Portal — Separate Frontends, Cookie Auth & Socket.IO

Three independent projects:
- `author-portal/` — author-facing React app.
- `admin-portal/` — operations/admin-facing React app.
- `backend/` — shared Express/MongoDB REST API and Socket.IO server.

## Stack
React, Vite, Tailwind CSS v4, React Router DOM v7, Redux Toolkit, React Icons, Node.js, Express 5, MongoDB/Mongoose, HttpOnly cookie sessions, Socket.IO, optional OpenAI.

## Run locally
Requirements: Node.js 20.19+ (or current Node 22), MongoDB.

### Backend
```bash
cd backend
cp .env.example .env
# Configure MONGODB_URI, JWT_SECRET, CLIENT_ORIGIN=http://localhost:5173,http://localhost:5174
npm install
npm run dev
```
### Author frontend
```bash
cd author-portal
cp .env.example .env
npm install
npm run dev -- --port 5173
```
### Admin frontend
```bash
cd admin-portal
cp .env.example .env
npm install
npm run dev -- --port 5174
```

## Authentication
The sample intentionally uses email-only sign-in. The server issues a JWT in the `bookleaf_session` HttpOnly cookie. The frontend never reads or stores the token in localStorage. Browser API requests and Socket.IO handshakes send the cookie. After login, the UI alerts: “Password wasn't included in the sample data. Password authentication can be implemented using bcrypt and password hashing.”

This is demo-only authentication: anyone who knows a registered email can sign in as that user. For production, add password entry and bcrypt hashing/verification, CSRF protections as appropriate, HTTPS-only secure cookies, rate limits, and trusted admin provisioning.

For cross-site production deployment, set `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=none`, use HTTPS, and restrict `CLIENT_ORIGIN` to exact frontend origins.

## Real-time tickets
Socket.IO authenticates from the HttpOnly cookie. Authors join `user:<id>`; admins join `role:admin`. Ticket creation, updates, and replies emit `ticket:updated` to the relevant author and admin rooms, so updates appear without refreshing.

## Data
No sample authors, books, or tickets are seeded. Add your own records. Book documents reference the author's MongoDB `_id` in `author`.

## Limitations
Attachments are UI-only; file bytes are not uploaded. Add tests, deployment CORS checks, audit logs, and monitoring before production.
