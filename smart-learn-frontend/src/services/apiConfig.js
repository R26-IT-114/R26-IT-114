export const API_URLS = {
  dyscalculia: import.meta.env.VITE_DYSCALCULIA_API_URL,
  dysgraphia: import.meta.env.VITE_DYSGRAPHIA_API_URL,
  dyslexia: import.meta.env.VITE_DYSLEXIA_API_URL,
  workingMemory: import.meta.env.VITE_WORKING_MEMORY_API_URL,
};

export const getApiUrl = (moduleName) => {
  const url = API_URLS[moduleName];

  if (!url) {
    throw new Error(`Missing API URL for module: ${moduleName}`);
  }

  return url;
};
