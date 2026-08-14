import axios from 'axios';
import { getApiUrl } from './apiConfig';

export const createAxiosClient = (moduleName) => {
  const client = axios.create({
  baseURL: getApiUrl(moduleName),
  timeout: 10000,
});

  client.interceptors.request.use((config) => {
    const finalUrl = `${config.baseURL || ''}${config.url || ''}`;
    console.log('Request URL:', finalUrl);
    return config;
  });

  return client;
};

export const dyscalculiaClient = createAxiosClient('dyscalculia');
export const dysgraphiaClient = createAxiosClient('dysgraphia');
export const dyslexiaClient = createAxiosClient('dyslexia');
export const workingMemoryClient = createAxiosClient('workingMemory');
