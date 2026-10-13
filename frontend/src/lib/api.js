import { useStore } from "../store/useStore";

export const API_BASE = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, form, auth = false } = {}) {
  const headers = {};
  const token = useStore.getState().token;
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (form) {
    payload = new URLSearchParams(form);
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, { method, headers, body: payload });
  if (res.status === 401 && auth) useStore.getState().logout();
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = typeof data.detail === "string" ? data.detail : "Request failed";
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, detail);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  projects: (category) =>
    request(`/api/projects${category && category !== "all" ? `?category=${category}` : ""}`),
  skills: () => request("/api/skills"),
  sendMessage: (data) => request("/api/messages", { method: "POST", body: data }),
  login: (email, password) =>
    request("/api/auth/login", { method: "POST", form: { username: email, password } }),
  messages: () => request("/api/messages", { auth: true }),
  createProject: (data) => request("/api/projects", { method: "POST", body: data, auth: true }),
  deleteProject: (id) => request(`/api/projects/${id}`, { method: "DELETE", auth: true }),
};

export function wsUrl() {
  if (API_BASE) return API_BASE.replace(/^http/, "ws") + "/ws/live";
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}/ws/live`;
}
