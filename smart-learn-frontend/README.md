# Smart Learn Frontend

Feature-based React + Vite frontend scaffold for:
Smart Learn: An Adaptive Mobile Platform for Neurodevelopmental Learning Disorders.

## Highlights

- Firebase email/password + Google auth
- Remember-me session persistence support
- Firestore-backed `userProfiles` recommendations
- Admin role promotion controls (`student`, `therapist`, `admin`)
- Role-aware protected routes (`student`, `therapist`, `admin`)
- Admin recommendations editor at `/admin/recommendations`
- Route-level lazy loading for pages and module entry routes
- Global React error boundary with telemetry logging

## Firestore Rules Deploy

- `npm run firebase:deploy:rules`
- `npm run firebase:deploy:rules:project -- your-project-id`

## Firebase Setup

See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for the Google sign-in, authorized domain, Firestore rule, and test steps.
