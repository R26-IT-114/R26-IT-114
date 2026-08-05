# Smart Learn

Smart Learn is a full-stack adaptive learning platform for students with neurodevelopmental learning disorders including dyslexia, dyscalculia, dysgraphia, and working-memory difficulties. The system consists of a React + Vite frontend, a Node.js/Express backend for dyslexia session management, and a working-memory backend service.

---

## Repository Structure

```
R26-IT-114/
├── smart-learn-frontend/       # React + Vite frontend
├── Backend-Dyslexia/           # Express + MongoDB dyslexia API
└── working-memory-backend/     # Working-memory backend service
```

---

## Frontend — `smart-learn-frontend`

### What It Does

- Firebase email/password and Google sign-in with remember-me persistence.
- Per-user profiles and recommendations stored in Firestore.
- Role-based access control: `student`, `therapist`, and `admin`.
- Admin/therapist recommendations dashboard at `/admin/recommendations`.
- Lazy-loaded pages and module routes for fast startup.
- Global error boundary with Sentry and telemetry logging.
- Drag-and-drop interactions via `@dnd-kit/core`.
- Animations via Framer Motion; styling via Tailwind CSS v4.

### Core Learning Modules

| Module | Description |
|---|---|
| **Dyslexia** | Reading, phonics, and language comprehension activities |
| **Dyscalculia** | Numeracy support and adaptive arithmetic practice |
| **Dysgraphia** | Writing and fine-motor oriented exercises |
| **Working Memory** | Recall and short-term memory training |

### Tech Stack

- React 18, Vite 5, React Router v6
- Firebase 11 (Authentication + Firestore)
- Axios, Tailwind CSS v4, Framer Motion
- Vitest + Testing Library for tests
- ESLint for code quality

### Project Structure

```
smart-learn-frontend/
├── src/
│   ├── pages/          # Home, Login, Register, ModuleSelection, AdminRecommendations, NotFound
│   ├── routes/         # AppRouter.jsx (lazy routes + role guards), ProtectedRoute.jsx
│   ├── modules/
│   │   ├── dyslexia/
│   │   ├── dyscalculia/
│   │   ├── dysgraphia/
│   │   └── working-memory/
│   ├── components/     # Shared and common UI building blocks
│   ├── context/        # AppContext, AuthContext
│   ├── hooks/          # useAuth, useInstructionAudio
│   ├── layouts/        # DashboardLayout, MainLayout
│   ├── services/       # Firebase auth, Firestore profile, Axios instance, telemetry
│   └── utils/          # Constants, helpers, validators, instruction audio map
├── firestore.rules
├── firebase.json
└── FIREBASE_SETUP.md
```

### Requirements

- Node.js 20 or newer
- npm
- A Firebase project with Authentication (Email/Password + Google) and Firestore enabled

### Getting Started

```bash
cd smart-learn-frontend
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |
| `npm run test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run firebase:deploy:rules` | Deploy Firestore security rules |
| `npm run firebase:deploy:rules:project -- <id>` | Deploy rules to a specific project |

### Firebase Setup

See [smart-learn-frontend/FIREBASE_SETUP.md](smart-learn-frontend/FIREBASE_SETUP.md) for the full setup guide. At a high level:

1. Enable Email/Password and Google sign-in in Firebase Authentication.
2. Add `localhost` and your deployed domain to the authorized domains list.
3. Deploy the Firestore rules: `npm run firebase:deploy:rules`.
4. Seed one trusted admin account before using role management.

### Route Overview

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page |
| `/login` | Public | Sign-in |
| `/register` | Public | Account creation |
| `/modules` | All roles | Module selection screen |
| `/admin/recommendations` | `therapist`, `admin` | Recommendations dashboard |
| `/dyslexia/*` | All roles | Dyslexia module routes |
| `/dyscalculia/*` | All roles | Dyscalculia module routes |
| `/dysgraphia/*` | All roles | Dysgraphia module routes |
| `/working-memory/*` | All roles | Working memory module routes |
| `/404` | Public | Not found page |

---

## Dyslexia Backend — `Backend-Dyslexia`

### What It Does

Express REST API that manages dyslexia game sessions, records per-attempt results, and serves progress data. Backed by MongoDB via Mongoose. Secured with Helmet, CORS, and rate limiting (120 req/min per route group).

### Tech Stack

- Node.js, Express 4, Mongoose 8
- MongoDB
- Helmet, CORS, Morgan, express-rate-limit
- Nodemon (dev), Supertest (tests)

### Project Structure

```
Backend-Dyslexia/
└── src/
    ├── server.js               # HTTP server entry point
    ├── app.js                  # Express app factory
    ├── config/
    │   ├── database.js         # Mongoose connection
    │   ├── env.js              # Environment variable parsing
    │   └── overviewData.js     # Static overview data
    ├── controllers/
    │   └── dyslexiaController.js
    ├── models/
    │   ├── DyslexiaSession.js
    │   ├── GameAttempt.js
    │   └── UserProgress.js
    ├── routes/
    │   └── dyslexiaRoutes.js
    ├── middleware/
    │   ├── errorHandler.js
    │   └── notFound.js
    └── utils/
        ├── asyncHandler.js
        └── httpError.js
```

### Environment Variables

Create a `.env` file in `Backend-Dyslexia/`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=smartlearn
CLIENT_ORIGIN=http://localhost:5173
```

`CLIENT_ORIGIN` accepts a comma-separated list of allowed origins.

### Getting Started

```bash
cd Backend-Dyslexia
npm install
npm run dev      # nodemon with hot-reload
# or
npm start        # production
```

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon (hot-reload) |
| `npm start` | Start in production mode |
| `npm test` | Run tests with Node test runner |
| `npm run check` | Syntax-check the server entry point |

### API Reference

Base path: `/api/dyslexia`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/api/dyslexia/overview` | Module overview data |
| `GET` | `/api/dyslexia/catalog` | Game catalog |
| `GET` | `/api/dyslexia/games/:gameKey` | Single game by key |
| `POST` | `/api/dyslexia/sessions` | Start a new session |
| `GET` | `/api/dyslexia/sessions` | List sessions |
| `GET` | `/api/dyslexia/sessions/:sessionId` | Get session by ID |
| `POST` | `/api/dyslexia/sessions/:sessionId/attempts` | Record a game attempt |
| `POST` | `/api/dyslexia/sessions/:sessionId/complete` | Complete a session |
| `GET` | `/api/dyslexia/progress/:userId` | Get progress for a user |
- `/modules`: module selection screen.
- `/admin/recommendations`: recommendation and role management for therapist/admin users.
- `/dyscalculia`, `/dysgraphia`, `/dyslexia`, `/working-memory`: module routes protected by role.

## Observability

- Runtime exceptions are captured through telemetry helpers and the global error boundary.
- Set `VITE_SENTRY_DSN` in production to enable Sentry reporting.

## Testing And Verification

Before release, validate the following:

- `npm run lint`
- `npm run test`
- `npm run build`
- Student, therapist, and admin smoke tests
- Firestore rule behavior for profile reads, role updates, and recommendation updates

See [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) for the full release checklist.

## Notes

- The app is designed for mobile and tablet-friendly learning flows.
- Recommendation entries use the format `Label | /module-path | Reason`.
- If Firebase access fails during admin flows, verify the deployed Firestore rules and the active user role.
