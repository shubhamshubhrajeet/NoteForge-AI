import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// ─── Files ────────────────────────────────────────────────────────────────────
export const uploadFile = (formData, onProgress) =>
  api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / e.total))
  });

export const getFiles = (filters = {}) =>
  api.get('/files', { params: filters }).then((r) => r.data);

export const getFileTree = () =>
  api.get('/files/tree').then((r) => r.data);

export const getStats = () =>
  api.get('/files/stats').then((r) => r.data);

export const deleteFile = (id) =>
  api.delete(`/files/${id}`).then((r) => r.data);

export const updateFile = (id, data) =>
  api.put(`/files/${id}`, data).then((r) => r.data);

export const downloadFile = (id, name) => {
  const link = document.createElement('a');
  link.href = `/api/files/download/${id}`;
  link.download = name;
  link.click();
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const smartSearch = (query) =>
  api.post('/ai/search', { query }).then((r) => r.data);

export const recategorize = (id, hint = '') =>
  api.post(`/ai/recategorize/${id}`, { hint }).then((r) => r.data);

export const bulkCategorize = () =>
  api.post('/ai/bulk-categorize').then((r) => r.data);

export const getDuplicates = () =>
  api.get('/ai/duplicates').then((r) => r.data);

export const deleteDuplicate = (dupId) =>
  api.delete(`/ai/duplicates/${dupId}`).then((r) => r.data);

export const getInsights = () =>
  api.get('/ai/insights').then((r) => r.data);
