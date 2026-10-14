const PLACEHOLDER_URL_PATTERN = /your-[a-z-]+-backend-url|<[^>]+>/i;

const normalizeApiUrl = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const isPlaceholderApiUrl = (value) => {
  const trimmed = normalizeApiUrl(value);
  return trimmed.length === 0 || PLACEHOLDER_URL_PATTERN.test(trimmed);
};

const resolveConfiguredApiUrl = (moduleName, env = import.meta.env) => {
  const moduleEnvKey = `VITE_${moduleName.toUpperCase()}_API_URL`;
  const moduleUrl = normalizeApiUrl(env?.[moduleEnvKey]);
  const workingMemoryAliasUrl = moduleName === 'workingMemory'
    ? normalizeApiUrl(env?.VITE_WORKING_MEMORY_API_URL)
    : '';
  const globalUrl = normalizeApiUrl(env?.VITE_API_URL);

  const configuredUrl = [moduleUrl, workingMemoryAliasUrl, globalUrl].find((candidate) => !isPlaceholderApiUrl(candidate));

  // Working Memory's public Express routes are mounted below this prefix.
  // Accept a backend origin from deployment settings without sending requests
  // to domain-root endpoints such as /predict-shape.
  if (moduleName === 'workingMemory' && configuredUrl && /^https?:\/\/[^/?#]+\/?$/i.test(configuredUrl)) {
    return `${configuredUrl.replace(/\/$/, '')}/api/working-memory`;
  }

  return configuredUrl || '';
};

export const API_URLS = {
  dyscalculia: resolveConfiguredApiUrl('dyscalculia'),
  dysgraphia: resolveConfiguredApiUrl('dysgraphia'),
  dyslexia: resolveConfiguredApiUrl('dyslexia'),
  workingMemory: resolveConfiguredApiUrl('workingMemory'),
};

export const getApiUrl = (moduleName, env = import.meta.env) => {
  const url = resolveConfiguredApiUrl(moduleName, env);

  if (!url) {
    // If no module-specific or global URL provided, default to a relative API path
    // so Vite can proxy requests to the backend in local development.
    return moduleName === 'workingMemory' ? '/api/working-memory' : `/api/${moduleName}`;
  }

  return url;
};
