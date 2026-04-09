# Firebase Setup

Use these steps to finish Firebase integration for Smart Learn.

## 1. Enable Google sign-in

In Firebase Console:

- Go to Authentication
- Open Sign-in method
- Enable Google
- Save

## 2. Add authorized domains

In Firebase Console:

- Go to Authentication
- Open Settings
- Add your deployed domain(s)
- Keep `localhost` for local development

## 3. Firestore security rules

This project now includes a full rules file at `firestore.rules`.

- `loginEvents`: user can only create/read their own login entries.
- `userProfiles`: user can read their own profile.
- `userProfiles` updates: owner, therapist, or admin can update.
- `userProfiles` delete: admin only.

To deploy from Firebase CLI:

```bash
npm run firebase:deploy:rules
```

If you have multiple Firebase projects:

```bash
npm run firebase:deploy:rules:project -- your-project-id
```

To use Firebase Console directly:

- Open Firestore Database -> Rules
- Paste contents from `firestore.rules`
- Publish

## 4. Test the flow

- Start the frontend with Node 20
- Open the app in the browser
- Click `Continue with Google`
- Confirm sign-in and Firestore event creation

## 5. Admin recommendations flow

- Sign in as an existing admin account.
- Open `/admin/recommendations`.
- Pick a user and update their role (`student`, `therapist`, `admin`).
- Edit recommendations per user with format:
  - `Label | /module-path | Reason`

## 6. Seed first admin account (one-time)

Before role manager can be used, seed one trusted admin manually in Firestore:

- Open Firestore Database -> `userProfiles` -> `{trusted_uid}`
- Set `role` to `admin`
- Sign in with this trusted account and use `/admin/recommendations` for all later role changes

## 7. Verify rule behavior with 3 accounts

Use one account each for `student`, `therapist`, `admin`.

- Student:
  - Can read own profile
  - Cannot change own role
  - Cannot open `/admin/recommendations`
- Therapist:
  - Can open `/admin/recommendations`
  - Can edit recommendations for users
  - Cannot promote/demote user roles
- Admin:
  - Can open `/admin/recommendations`
  - Can edit recommendations
  - Can update user roles

Also validate `adminAuditLogs` entries are created for recommendation and role updates.

## 8. Sentry observability setup

Set this environment variable for production diagnostics:

- `VITE_SENTRY_DSN=your_sentry_dsn`

If omitted, telemetry remains console-only.
