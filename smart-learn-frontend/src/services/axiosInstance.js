import axios from 'axios';
import { getApiUrl } from './apiConfig';
import { auth } from './firebaseConfig';

export const createAxiosClient = (moduleName, timeout = 10000) => {
  const client = axios.create({
    baseURL: getApiUrl(moduleName),
    timeout,
  });

  client.interceptors.request.use(
    (config) => {
      console.log('[axiosInstance] request interceptor - config', {
        baseURL: config.baseURL,
        requestURL: client.getUri(config),
        url: config.url,
        method: config.method,
      });
      return config;
    },
    (error) => {
      console.error('[axiosInstance] request interceptor error', error);
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => {
      console.log('[axiosInstance] response interceptor - success', {
        url: response.config?.url,
        status: response.status,
      });
      return response;
    },
    (error) => {
      const responseBody = error?.response?.data;
      const nestedError = responseBody?.error;
      const backendMessage = typeof responseBody === 'string'
        ? responseBody
        : responseBody?.message || nestedError?.message ||
          (nestedError ? JSON.stringify(nestedError) : undefined);
      const requestUrl = error?.config
        ? client.getUri(error.config)
        : error?.config?.url;

      console.error('[axiosInstance] response interceptor error', {
        method: error?.config?.method?.toUpperCase(),
        requestURL: requestUrl,
        status: error?.response?.status,
        backendMessage: backendMessage || error?.message,
        code: error?.code,
      });
      return Promise.reject(error);
    }
  );

  return client;
};

const attachFirebaseTokenInterceptor = (client) => {
  client.interceptors.request.use(async (config) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return config;
    }

    try {
      const token = await currentUser.getIdToken();
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    } catch (err) {
      console.warn('Could not retrieve Firebase ID token, proceeding without auth header.', err?.message || err);
      try {
        const refreshed = await currentUser.getIdToken(true);
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${refreshed}`,
        };
      } catch (refreshErr) {
        console.warn('Could not retrieve Firebase ID token (initial and refresh failed). Proceeding without auth header.', {
          initial: err?.message || err,
          refresh: refreshErr?.message || refreshErr,
        });
      }
    }

    return config;
  });

  return client;
};

export const dyscalculiaClient = createAxiosClient('dyscalculia');
export const dysgraphiaClient = attachFirebaseTokenInterceptor(createAxiosClient('dysgraphia'));
export const dysgraphiaMlClient = attachFirebaseTokenInterceptor(createAxiosClient('dysgraphia', 60000));
export const dyslexiaClient = createAxiosClient('dyslexia');
export const workingMemoryClient = createAxiosClient('workingMemory');
