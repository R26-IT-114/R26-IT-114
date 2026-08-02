import axios from "axios";

const API_BASE_URL = "http://localhost:5001";

export const predictNumber = async (data) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/predict-number`,
    data,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};