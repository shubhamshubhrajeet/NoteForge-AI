import axios from "axios";

const api = axios.create({ baseURL: "/api", timeout: 30000 });

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("sps_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const authAPI = {
  adminLogin: (username, password) =>
    api.post("/auth/admin/login", { username, password }),
  teacherLogin: (username, password) =>
    api.post("/auth/teacher/login", { username, password }),
  studentLogin: (email) => api.post("/auth/student/login", { email }),
  studentRegister: (data) => api.post("/auth/student/register", data),
};

export const adminAPI = {
  createTeacher: (d) => api.post("/admin/teachers", d),
  listTeachers: () => api.get("/admin/teachers"),
  updateTeacher: (id, d) => api.patch(`/admin/teachers/${id}`, d),
  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),
  listStudents: () => api.get("/admin/students"),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
};

export const filesAPI = {
  upload: (fd, onP) =>
    api.post("/files/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) =>
        onP && onP(Math.round((e.loaded * 100) / e.total)),
    }),
  list: (p) => api.get("/files", { params: p }),
  tree: () => api.get("/files/tree"),
  delete: (id) => api.delete(`/files/${id}`),
  update: (id, d) => api.patch(`/files/${id}`, d),
};

export const searchAPI = {
  search: (q) => api.get("/search", { params: { q } }),
};
export const aiAPI = {
  findDuplicates: () => api.get("/ai/duplicates"),
  resolveDuplicate: (k, d) =>
    api.post("/ai/duplicates/resolve", { keep_id: k, delete_id: d }),
  recategorize: (id, r) => api.post(`/ai/recategorize/${id}`, { remarks: r }),
  fixAllUnknown: () => api.post("/ai/fix-unknown"),
};
export const statsAPI = { get: () => api.get("/stats") };
export default api;

export const videosAPI = {
  upload: (fd, onP) =>
    api.post("/videos/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) =>
        onP && onP(Math.round((e.loaded * 100) / e.total)),
    }),
  list: (params) => api.get("/videos", { params }),
  get: (id) => api.get(`/videos/${id}`),
  update: (id, d) => api.patch(`/videos/${id}`, d),
  delete: (id) => api.delete(`/videos/${id}`),
  getComments: (id) => api.get(`/videos/${id}/comments`),
  addComment: (id, data) => api.post(`/videos/${id}/comments`, data),
  deleteComment: (vid, cid) => api.delete(`/videos/${vid}/comments/${cid}`),
  addReply: (vid, cid, data) =>
    api.post(`/videos/${vid}/comments/${cid}/reply`, data),
  deleteReply: (vid, cid, rid) =>
    api.delete(`/videos/${vid}/comments/${cid}/reply/${rid}`),
  streamUrl: (filename) => `/api/videos/stream/${filename}`,
};
