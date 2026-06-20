import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "";

const api = axios.create({ baseURL: BASE });

export const generateVideo = (script) =>
  api.post("/api/generate", { script }).then((r) => r.data);

export const getStatus = (jobId) =>
  api.get(`/api/status/${jobId}`).then((r) => r.data);

export const schedulePost = (jobId, postTime) =>
  api.post("/api/schedule", { job_id: jobId, post_time: postTime }).then((r) => r.data);

export const postNow = (jobId) =>
  api.post("/api/post-now", { job_id: jobId }).then((r) => r.data);

export const getScheduledJobs = () =>
  api.get("/api/scheduled-jobs").then((r) => r.data);

export const connectInstagram = (username, password) =>
  api.post("/api/instagram/connect", { username, password }).then((r) => r.data);

export const getInstagramStatus = () =>
  api.get("/api/instagram/status").then((r) => r.data);
