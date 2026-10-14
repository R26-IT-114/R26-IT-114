// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadEnv } from 'vite';
import axios from 'axios';
import { getApiUrl } from '../../../services/apiConfig';

vi.mock('../../../services/firebaseConfig', () => ({ auth: { currentUser: null } }));

import { workingMemoryClient } from '../../../services/axiosInstance';
import { getAllProgress, getGames, predictShape } from './workingMemoryApi';

const baseURL = 'https://working-memory-backend-f7qu.vercel.app/api/working-memory';
const originalAdapter = workingMemoryClient.defaults.adapter;

afterEach(() => {
  workingMemoryClient.defaults.adapter = originalAdapter;
  vi.restoreAllMocks();
});

describe('Working Memory API routing', () => {
  it.each(['development', 'production'])('loads the full route prefix in %s', (mode) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    expect(getApiUrl('workingMemory', env)).toBe(baseURL);
  });

  it('sends games and progress requests to the prefixed URLs', async () => {
    const requests = [];
    workingMemoryClient.defaults.adapter = async (config) => {
      requests.push(config);
      return { data: { data: [] }, status: 200, statusText: 'OK', headers: {}, config };
    };

    await getGames();
    await getAllProgress('routing-check');

    expect(workingMemoryClient.getUri(requests[0])).toBe(`${baseURL}/games`);
    expect(workingMemoryClient.getUri(requests[1])).toBe(`${baseURL}/progress?userId=routing-check`);
    expect(requests[1].headers['x-user-id']).toBe('routing-check');
  });

  it.each(['VITE_WORKINGMEMORY_API_URL', 'VITE_WORKING_MEMORY_API_URL'])('sends prediction using %s with the multipart image intact', async (key) => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const image = new File(['image-bytes'], 'shape.jpg', { type: 'image/jpeg' });
    let request;
    workingMemoryClient.defaults.adapter = async (config) => {
      request = config;
      // Axios clears Content-Type for FormData in the browser adapter.
      // Before that adapter runs, no multipart Content-Type may be supplied.
      expect(config.headers.get('Content-Type')).not.toMatch(/multipart/i);
      return {
        data: { data: { shape: 'circle', confidence: 0.9 } },
        status: 200, statusText: 'OK', headers: {}, config,
      };
    };

    const originalBaseURL = workingMemoryClient.defaults.baseURL;
    workingMemoryClient.defaults.baseURL = getApiUrl('workingMemory', {
      [key]: 'https://working-memory-backend-f7qu.vercel.app',
    });
    try {
      await predictShape(image);
    } finally {
      workingMemoryClient.defaults.baseURL = originalBaseURL;
    }

    expect(workingMemoryClient.getUri(request)).toBe(`${baseURL}/predict-shape`);
    expect(request.method).toBe('post');
    expect(request.data).toBeInstanceOf(FormData);
    expect([...request.data.keys()]).toEqual(['image']);
    expect(request.data.get('image').name).toBe('shape.jpg');
    expect(request.data.get('image').type).toBe('image/jpeg');
    expect(request.data.get('image').size).toBe(image.size);
    expect(await request.data.get('image').text()).toBe('image-bytes');
  });

  it('logs the full URL, status and backend message without request secrets', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Request failed');
    workingMemoryClient.defaults.adapter = async (config) => {
      config.headers.set('Authorization', 'Bearer secret-token');
      error.config = config;
      error.response = { status: 422, data: { message: 'Invalid image', secret: 'backend-secret' }, config };
      throw error;
    };

    await expect(predictShape(new File(['bytes'], 'shape.jpg'))).rejects.toBe(error);
    expect(errorLog).toHaveBeenCalledWith('Failed to predict shape:', {
      url: `${baseURL}/predict-shape`, status: 422, message: 'Invalid image',
    });
    const logs = JSON.stringify([...log.mock.calls, ...errorLog.mock.calls]);
    expect(logs).not.toContain('secret-token');
    expect(logs).not.toContain('backend-secret');
  });
  it('logs the complete prediction URL, HTTP status, and backend error', async () => {
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    workingMemoryClient.defaults.adapter = async (config) => {
      throw new axios.AxiosError('Request failed with status code 404', 'ERR_BAD_REQUEST', config, {}, {
        data: { error: { message: 'Route not found' } },
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config,
      });
    };

    await expect(workingMemoryClient.post('/predict-shape', new FormData()))
      .rejects.toMatchObject({ response: { status: 404 } });

    const [, details] = errorLog.mock.calls.find(([label]) =>
      label === '[axiosInstance] response interceptor error');
    expect(details).toMatchObject({
      method: 'POST',
      requestURL: `${baseURL}/predict-shape`,
      status: 404,
      backendMessage: 'Route not found',
    });
  });

});
