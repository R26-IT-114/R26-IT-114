import axios from 'axios';
import { getApiUrl } from './apiConfig';

export const createAxiosClient = (moduleName) => {
  return axios.create({
    baseURL: getApiUrl(moduleName),
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });
};

export const dyscalculiaClient = createAxiosClient('dyscalculia');
export const dysgraphiaClient = createAxiosClient('dysgraphia');
export const dyslexiaClient = createAxiosClient('dyslexia');
export const workingMemoryClient = createAxiosClient('workingMemory');
