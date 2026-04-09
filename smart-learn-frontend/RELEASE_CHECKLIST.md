# Smart Learn Release Checklist

## Firebase

- [ ] Firestore rules deployed from `firestore.rules`
- [ ] Authorized domains configured in Firebase Auth
- [ ] One trusted admin account seeded
- [ ] `/admin/recommendations` tested with admin user

## Functional Verification

- [ ] Student account smoke test complete
- [ ] Therapist account smoke test complete
- [ ] Admin account smoke test complete
- [ ] Recommendation updates create `adminAuditLogs` entries
- [ ] Role updates create `adminAuditLogs` entries

## Frontend Quality

- [ ] `npm run lint` passed
- [ ] `npm run test` passed
- [ ] `npm run build` passed
- [ ] Mobile smoke test complete
- [ ] Desktop smoke test complete

## Observability

- [ ] `VITE_SENTRY_DSN` configured in production
- [ ] Runtime exception appears in Sentry

## Deployment Readiness

- [ ] CI workflow is green
- [ ] Build artifacts verified in staging
- [ ] Release notes updated
