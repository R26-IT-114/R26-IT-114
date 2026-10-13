import { describe, expect, it } from 'vitest';
import { getApiUrl } from './apiConfig';

describe('getApiUrl', () => {
  it('resolves the canonical working-memory environment key', () => {
    expect(getApiUrl('workingMemory', {
      VITE_WORKING_MEMORY_API_URL: 'https://working-memory.example.com/api/working-memory',
    })).toBe('https://working-memory.example.com/api/working-memory');
  });

  it('retains support for the legacy working-memory environment key', () => {
    expect(getApiUrl('workingMemory', {
      VITE_WORKINGMEMORY_API_URL: 'https://legacy-working-memory.example.com/api/working-memory',
    })).toBe('https://legacy-working-memory.example.com/api/working-memory');
  });

  it('falls back to a module-relative path when the configured URL is a placeholder', () => {
    const env = {
      VITE_API_URL: '',
      VITE_DYSGRAPHIA_API_URL: 'https://your-dysgraphia-backend-url',
    };

    expect(getApiUrl('dysgraphia', env)).toBe('/api/dysgraphia');
  });

  it('uses the configured URL when it is a real endpoint', () => {
    const env = {
      VITE_API_URL: '',
      VITE_DYSGRAPHIA_API_URL: 'https://api.example.com',
    };

    expect(getApiUrl('dysgraphia', env)).toBe('https://api.example.com');
  });

  it('trims whitespace around the configured URL', () => {
    const env = {
      VITE_API_URL: '',
      VITE_DYSGRAPHIA_API_URL: ' http://localhost:5000 ',
    };

    expect(getApiUrl('dysgraphia', env)).toBe('http://localhost:5000');
  });
});
