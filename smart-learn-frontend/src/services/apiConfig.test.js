import { describe, expect, it } from 'vitest';
import { getApiUrl } from './apiConfig';

describe('getApiUrl', () => {
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
