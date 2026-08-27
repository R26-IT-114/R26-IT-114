import axios from "axios";

const configuredApiUrl =
  import.meta.env.VITE_DYSCALCULIA_ML_URL ||
  import.meta.env.VITE_DYSCALCULIA_API_URL;

// Without an environment URL, Vite proxies this path to the local Flask API.
// A deployed backend is configured once with VITE_DYSCALCULIA_ML_URL.
export const DYSCALCULIA_PREDICTION_API_URL = configuredApiUrl
  ? configuredApiUrl.replace(/\/$/, '')
  : '/ml-api';

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
