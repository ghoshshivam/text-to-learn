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

// Converts error responses that arrive as binary Blobs back into JSON
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const data = error.response?.data;
    if (data instanceof Blob && data.type.includes("application/json")) {
      try {
        error.response.data = JSON.parse(await data.text());
      } catch {
        /* leave as is */
      }
    }
    return Promise.reject(error);
  }
);

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

export const videoApi = {
  find: (query) => api.get("/youtube", { params: { query } }).then(unwrap),
};

export const audioApi = {
  // Returns a Blob (audio/wav). First generation can take up to a minute.
  generate: (lessonId) =>
    api
      .post(`/lessons/${lessonId}/audio`, null, {
        responseType: "blob",
        timeout: 240_000,
      })
      .then((res) => res.data),
};