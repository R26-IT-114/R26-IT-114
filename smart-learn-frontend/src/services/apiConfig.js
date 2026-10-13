const PLACEHOLDER_URL_PATTERN = /your-[a-z-]+-backend-url|<[^>]+>/i;

const MODULE_ENV_KEYS = {
  workingMemory: [
    'VITE_WORKING_MEMORY_API_URL',
    'VITE_WORKINGMEMORY_API_URL',
  ],
};

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
  const moduleEnvKeys = MODULE_ENV_KEYS[moduleName] || [
    `VITE_${moduleName.toUpperCase()}_API_URL`,
  ];
  const moduleUrls = moduleEnvKeys.map((key) => normalizeApiUrl(env?.[key]));
  const globalUrl = normalizeApiUrl(env?.VITE_API_URL);

  const configuredUrl = [...moduleUrls, globalUrl].find(
    (candidate) => !isPlaceholderApiUrl(candidate)
  );

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
    return `/api/${moduleName}`;
  }

  return url;
};
