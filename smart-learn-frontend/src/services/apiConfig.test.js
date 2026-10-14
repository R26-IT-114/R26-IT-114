import { describe, expect, it } from 'vitest';
import { getApiUrl } from './apiConfig';

describe('getApiUrl', () => {
  it('supports the variable spelling used by the deployed frontend', () => {
    expect(getApiUrl('workingMemory', {
      VITE_WORKING_MEMORY_API_URL: 'https://working-memory-backend-f7qu.vercel.app',
    })).toBe('https://working-memory-backend-f7qu.vercel.app/api/working-memory');
  });

  it('prefers the canonical Working Memory variable over its alias', () => {
    expect(getApiUrl('workingMemory', {
      VITE_WORKINGMEMORY_API_URL: 'https://canonical.example/api/working-memory',
      VITE_WORKING_MEMORY_API_URL: 'https://alias.example',
      VITE_API_URL: 'https://global.example',
    })).toBe('https://canonical.example/api/working-memory');
  });

  it.each([
    'https://working-memory-backend-f7qu.vercel.app',
    'https://working-memory-backend-f7qu.vercel.app/',
    ' https://working-memory-backend-f7qu.vercel.app/ ',
    'https://working-memory-backend-f7qu.vercel.app/api/working-memory',
  ])('resolves Working Memory deployment base %s to the public route prefix', (url) => {
    expect(getApiUrl('workingMemory', { VITE_WORKINGMEMORY_API_URL: url }))
      .toBe('https://working-memory-backend-f7qu.vercel.app/api/working-memory');
  });

  it('applies the Working Memory prefix when falling back to a global backend origin', () => {
    expect(getApiUrl('workingMemory', { VITE_API_URL: 'https://backend.example/' }))
      .toBe('https://backend.example/api/working-memory');
  });

  it('preserves an explicitly configured Working Memory route prefix', () => {
    expect(getApiUrl('workingMemory', { VITE_WORKINGMEMORY_API_URL: 'https://backend.example/api/workingMemory' }))
      .toBe('https://backend.example/api/workingMemory');
  });

  it('uses the canonical Working Memory prefix without a configured backend', () => {
    expect(getApiUrl('workingMemory', {})).toBe('/api/working-memory');
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
