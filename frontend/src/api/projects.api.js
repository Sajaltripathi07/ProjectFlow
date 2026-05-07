import apiClient from "./apiClient";

const projectsApi = {
  getAll: (params) => apiClient.get("/projects", { params }),
  getById: (id) => apiClient.get(`/projects/${id}`),
  create: (data) => apiClient.post("/projects", data),
  update: (id, data) => apiClient.put(`/projects/${id}`, data),
  delete: (id) => apiClient.delete(`/projects/${id}`),
  addMember: (projectId, userId) =>
    apiClient.post(`/projects/${projectId}/members`, { userId }),
  removeMember: (projectId, userId) =>
    apiClient.delete(`/projects/${projectId}/members/${userId}`),
};

export default projectsApi;
