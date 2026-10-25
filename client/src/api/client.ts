import axios from "axios";
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api", timeout: 15000 });
api.interceptors.request.use(config => {
  const token = localStorage.getItem("dealership_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export function setSession(token: string | null) {
  if (token) localStorage.setItem("dealership_token", token);
  else localStorage.removeItem("dealership_token");
}
