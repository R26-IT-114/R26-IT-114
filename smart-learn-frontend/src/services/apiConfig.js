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
  const globalUrl = normalizeApiUrl(env?.VITE_API_URL);

  const configuredUrl = [moduleUrl, globalUrl].find((candidate) => !isPlaceholderApiUrl(candidate));

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
    // If no module-specific or global URL provided, default to a relative path
    // allowing use of a Vite dev server proxy (e.g. '/dysgraphia').
    return `/${moduleName}`;
  }

  return url;
};
