import * as Sentry from '@sentry/react';

let isSentryEnabled = false;

export const initObservability = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    isSentryEnabled = false;
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.2,
  });

  isSentryEnabled = true;
};

export const reportException = (error, context = {}) => {
  if (!isSentryEnabled) return;

  Sentry.withScope((scope) => {
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value);
    });

    Sentry.captureException(error);
  });
};
