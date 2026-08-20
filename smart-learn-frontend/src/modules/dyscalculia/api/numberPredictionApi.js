import axios from "axios";

// Always use the Vite dev-server proxy path so requests go through the same
// origin — this eliminates CORS problems when opening the app from a phone or
// any device on the local network (hotspot, LAN, etc.).
//
// Vite forwards  /ml-api/*  →  http://localhost:5001/*
// See vite.config.js server.proxy for the rule.
//
// Override with VITE_DYSCALCULIA_ML_URL only when the Flask server lives on a
// different machine (e.g. production / staging deployment).
const API_BASE_URL =
  import.meta.env.VITE_DYSCALCULIA_ML_URL
    ? import.meta.env.VITE_DYSCALCULIA_ML_URL.replace(/\/$/, '')
    : '/ml-api';

export const predictNumber = async (data) => {
  const endpoint = `${API_BASE_URL}/predict`;
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