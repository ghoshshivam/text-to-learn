import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 120_000,
});

let getToken = null;

export const setTokenGetter = (fn) => {
  getToken = fn;
};

api.interceptors.request.use(async (config) => {
  if (getToken) {
    const token = await getToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getErrorMessage = (error) =>
  error?.response?.data?.error?.message ||
  (error?.code === "ECONNABORTED"
    ? "This is taking longer than expected. The AI may be busy. Try again in a minute."
    : null) ||
  (error?.code === "ERR_NETWORK"
    ? "Cannot reach the server. Is the backend running?"
    : null) ||
  error?.message ||
  "Something went wrong";

const unwrap = (res) => res.data.data;

export const courseApi = {
  list: () => api.get("/user-courses").then(unwrap),
  get: (id) => api.get(`/courses/${id}`).then(unwrap),
  generate: (topic) => api.post("/generate-course", { topic }).then(unwrap),
  remove: (id) => api.delete(`/courses/${id}`).then(unwrap),
};

export const lessonApi = {
  generate: (lessonId) =>
    api.post("/generate-lesson", { lessonId }).then(unwrap),
};
