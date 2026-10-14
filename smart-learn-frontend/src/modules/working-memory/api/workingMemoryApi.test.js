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
  it('combines a domain-only deployment setting with the prediction path correctly', () => {
    const client = axios.create({ baseURL: getApiUrl('workingMemory', {
      VITE_WORKING_MEMORY_API_URL: 'https://working-memory-backend-f7qu.vercel.app',
    }) });
    expect(client.getUri({ url: '/predict-shape', method: 'post' }))
      .toBe(`${baseURL}/predict-shape`);
  });

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

  it('sends prediction to the prefixed URL with the multipart image intact', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const post = vi.spyOn(workingMemoryClient, 'post');
    const image = new File(['image-bytes'], 'shape.jpg', { type: 'image/jpeg' });
    let request;
    workingMemoryClient.defaults.adapter = async (config) => {
      request = config;
      return {
        data: { data: { shape: 'circle', confidence: 0.9 } },
        status: 200, statusText: 'OK', headers: {}, config,
      };
    };

    await predictShape(image);

    expect(workingMemoryClient.getUri(request)).toBe(`${baseURL}/predict-shape`);
    expect(request.method).toBe('post');
    expect(post.mock.calls[0][2]).not.toHaveProperty('headers');
    expect(request.data).toBeInstanceOf(FormData);
    expect([...request.data.keys()]).toEqual(['image']);
    expect(request.data.get('image').name).toBe('shape.jpg');
    expect(request.data.get('image').type).toBe('image/jpeg');
    expect(request.data.get('image').size).toBe(image.size);
  });
});
