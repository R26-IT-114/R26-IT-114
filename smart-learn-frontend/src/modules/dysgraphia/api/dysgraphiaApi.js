import { dysgraphiaClient } from '../../../services/axiosInstance';

const API_PREFIX = '/api/dysgraphia';

const withApiPrefix = (path) => `${API_PREFIX}${path}`;

const appendMultipartField = (formData, key, value) => {
  if (value == null) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => formData.append(key, item));
    return;
  }

  formData.append(key, value);
};

const getPayloadSummary = (payload) => {
  const summary = { ...payload };

  if (payload?.image) {
    summary.image = {
      exists: true,
      type: payload.image.type,
      size: payload.image.size,
      name: payload.image.name || 'unknown',
      constructor: payload.image.constructor?.name || 'unknown',
    };
  }

  return summary;
};

const logFormDataEntries = (formData) => {
  const entries = [];

  formData.forEach((value, key) => {
    const isFile = value instanceof File || value instanceof Blob;
    entries.push({
      key,
      value: isFile ? `${value.constructor.name}:${value.type}:${value.size}` : value,
    });
  });

  console.log('[dysgraphiaApi] FormData entries', entries);
};

const createMultipartPayload = (payload) => {
  console.log('[dysgraphiaApi] createMultipartPayload called', getPayloadSummary(payload));

  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === 'image') {
      if (value) {
        formData.append('image', value, value.name || 'drawing.png');
      }
      return;
    }

    appendMultipartField(formData, key, typeof value === 'number' ? String(value) : value);
  });

  logFormDataEntries(formData);
  return formData;
};

export const getOverview = async () => {
  const { data } = await dysgraphiaClient.get(withApiPrefix('/overview'));
  return data;
};

export const getCatalog = async () => {
  const { data } = await dysgraphiaClient.get(withApiPrefix('/catalog'));
  return data;
};

export const submitShapeAttempt = async (payload) => {
  const { data } = await dysgraphiaClient.post(withApiPrefix('/attempts/shape'), payload);
  return data;
};

export const submitLetterAttempt = async (payload) => {
  let payloadToSend;

  try {
    payloadToSend = createMultipartPayload(payload);
  } catch (err) {
    console.error('[dysgraphiaApi] createMultipartPayload failed', {
      message: err?.message,
      stack: err?.stack,
      payloadSummary: getPayloadSummary(payload),
    });
    throw err;
  }

  const url = withApiPrefix('/attempts/letter');
  console.log('[dysgraphiaApi] dysgraphiaClient.post will send', {
    url,
    payloadSummary: getPayloadSummary(payload),
    hasImage: Boolean(payload?.image),
    imageType: payload?.image?.type,
    imageSize: payload?.image?.size,
  });

  try {
    console.log('[dysgraphiaApi] payloadToSend instanceof FormData', payloadToSend instanceof FormData);

    const { data } = await dysgraphiaClient.post(url, payloadToSend);

    console.log('[dysgraphiaApi] dysgraphiaClient.post response received', { url, data });
    return data;
  } catch (err) {
    console.error('[dysgraphiaApi] dysgraphiaClient.post failed', {
      message: err?.message,
      code: err?.code,
      response: err?.response,
      request: err?.request,
      error: err,
    });
    throw err;
  }
};

export const submitWordAttempt = async (payload) => {
  const { data } = await dysgraphiaClient.post(withApiPrefix('/attempts/word'), createMultipartPayload(payload));
  return data;
};

export const createSession = async (payload) => {
  const { data } = await dysgraphiaClient.post(withApiPrefix('/sessions'), payload);
  return data;
};

export const getRecentActivity = async (limit = 5) => {
  const { data } = await dysgraphiaClient.get(withApiPrefix('/activity/recent'), {
    params: { limit },
  });
  return data;
};

export const resetProgress = async () => {
  const { data } = await dysgraphiaClient.post(withApiPrefix('/reset'));
  return data;
};
