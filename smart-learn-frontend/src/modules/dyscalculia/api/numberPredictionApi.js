import axios from "axios";

const configuredApiUrl =
  import.meta.env.VITE_DYSCALCULIA_ML_URL ||
  import.meta.env.VITE_DYSCALCULIA_API_URL;

// In development, always use the same-origin Vite proxy. This prevents an
// HTTPS frontend from making a browser-blocked request to an HTTP ML server.
// Deployed builds must configure an HTTPS backend URL.
export const DYSCALCULIA_PREDICTION_API_URL = import.meta.env.DEV
  ? '/ml-api'
  : configuredApiUrl?.replace(/\/$/, '') || '/ml-api';

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
