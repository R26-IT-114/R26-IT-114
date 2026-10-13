// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadEnv } from 'vite';
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
    expect(env.VITE_WORKING_MEMORY_API_URL).toBe(baseURL);
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

  it('sends prediction to the prefixed URL with the multipart image intact', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
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
    expect(request.data).toBeInstanceOf(FormData);
    expect([...request.data.keys()]).toEqual(['image']);
    expect(request.data.get('image').name).toBe('shape.jpg');
    expect(request.data.get('image').type).toBe('image/jpeg');
    expect(request.data.get('image').size).toBe(image.size);
  });
});
