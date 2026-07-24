import axios from 'axios';
import { getApiUrl } from './apiConfig';
import { auth } from './firebaseConfig';

export const createAxiosClient = (moduleName) => {
  const client = axios.create({
    baseURL: getApiUrl(moduleName),
    timeout: 10000,
  });

  client.interceptors.request.use(
    (config) => {
      console.log('[axiosInstance] request interceptor - config', {
        baseURL: config.baseURL,
        url: config.url,
        method: config.method,
        headers: config.headers,
        params: config.params,
        data: config.data instanceof FormData ? 'FormData' : config.data,
        signal: config.signal,
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
      console.error('[axiosInstance] response interceptor error', {
        message: error?.message,
        code: error?.code,
        url: error?.config?.url,
        config: error?.config,
        response: error?.response,
        request: error?.request,
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
export const dyslexiaClient = createAxiosClient('dyslexia');
export const workingMemoryClient = createAxiosClient('workingMemory');
