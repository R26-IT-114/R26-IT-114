import { reportException } from './observability';

const TELEMETRY_TAG = '[SmartLearnTelemetry]';

const formatError = (error) => {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  return error.stack || error.message || JSON.stringify(error);
};

export const logTelemetryError = (source, error, metadata = {}) => {
  const payload = {
    source,
    error: formatError(error),
    metadata,
    timestamp: new Date().toISOString(),
  };

  console.error(TELEMETRY_TAG, payload);
  reportException(error, payload);
};
