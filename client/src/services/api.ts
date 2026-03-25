import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

const apiBase = import.meta.env.VITE_API_URL;
const baseURL = apiBase ? `${apiBase}/api` : "/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Resolves once Firebase has restored auth state (avoids 401s on first load)
const authReady = new Promise<void>((resolve) => {
  const unsub = onAuthStateChanged(auth, () => {
    unsub();
    resolve();
  });
});

api.interceptors.request.use(async (config) => {
  await authReady;
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  },
);

export default api;
