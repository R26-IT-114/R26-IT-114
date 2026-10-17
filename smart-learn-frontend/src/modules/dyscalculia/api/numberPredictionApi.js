import axios from "axios";

const configuredApiUrl =
  import.meta.env.VITE_DYSCALCULIA_ML_URL ||
  import.meta.env.VITE_DYSCALCULIA_API_URL;

const configuredHttpsApiUrl = configuredApiUrl?.startsWith('https://')
  ? configuredApiUrl.replace(/\/$/, '')
  : null;

// Use a configured HTTPS backend directly; proxy local HTTP services through
// Vite to avoid mixed-content requests from its HTTPS development server.
export const DYSCALCULIA_PREDICTION_API_URL =
  configuredHttpsApiUrl ||
  (import.meta.env.DEV
    ? '/ml-api'
    : configuredApiUrl?.replace(/\/$/, '') || '/ml-api');

export const predictNumber = async (data) => {
  const endpoint = `${DYSCALCULIA_PREDICTION_API_URL}/api/dyscalculia/tracing/predict`;
  const response = await axios.post(
    endpoint,
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};
