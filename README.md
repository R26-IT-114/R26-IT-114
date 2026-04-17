# Smart Learn Frontend

Smart Learn is a React + Vite frontend for an adaptive learning platform focused on neurodevelopmental learning disorders. The app provides role-aware access to learning modules, Firebase-backed authentication, Firestore-powered recommendation management, and observability hooks for production support.

## What This App Does

- Supports Firebase email/password and Google sign-in.
- Persists authenticated sessions with remember-me behavior.
- Stores per-user profiles and recommendations in Firestore.
- Restricts features by role: `student`, `therapist`, and `admin`.
- Provides an admin and therapist recommendations dashboard at `/admin/recommendations`.
- Lazily loads pages and module routes for faster startup.
- Captures runtime errors with a global error boundary and telemetry logging.

## Core Modules

- Dyscalculia: numeracy support and adaptive arithmetic practice.
- Dysgraphia: writing and fine-motor oriented exercises.
- Dyslexia: reading, phonics, and language comprehension activities.
- Working memory: recall and short-term memory training.

## Tech Stack

- React 18
- Vite
- React Router
- Firebase Authentication and Firestore
- Axios for API calls
- Vitest and Testing Library for testing
- ESLint for code quality

## Project Structure

- `src/pages/`: top-level screens such as Home, Login, Register, Module Selection, and Admin Recommendations.
- `src/routes/`: route definitions and access control.
- `src/modules/`: feature modules for each learning area.
- `src/components/`: reusable UI building blocks.
- `src/services/`: Firebase, API, and telemetry helpers.
- `firestore.rules`: Firestore security rules for the app.

## Requirements

- Node.js 20 or newer
- npm
- A Firebase project configured for Authentication and Firestore

## Getting Started

1. Install dependencies:

	```bash
	npm install
	```

2. Start the development server:

	```bash
	npm run dev
	```

3. Open the local Vite URL shown in the terminal.

## Available Scripts

- `npm run dev`: start the local development server.
- `npm run build`: create a production build.
- `npm run preview`: preview the production build locally.
- `npm run lint`: run ESLint across the project.
- `npm run test`: run the test suite once.
- `npm run test:watch`: run tests in watch mode.

## Firebase Setup

Follow [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for the full authentication and Firestore configuration flow.

At a high level, you need to:

- Enable Google sign-in in Firebase Authentication.
- Add your deployed domain and `localhost` to authorized domains.
- Deploy the Firestore rules from `firestore.rules`.
- Seed one trusted admin account before using role management.
- Verify student, therapist, and admin access paths.

## Firestore Rules Deployment

Deploy the current rules file with one of these commands:

```bash
npm run firebase:deploy:rules
```

```bash
npm run firebase:deploy:rules:project -- your-project-id
```

## Route Overview

- `/`: landing page.
- `/login`: authentication entry point.
- `/register`: account creation.
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
