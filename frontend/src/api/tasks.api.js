import apiClient from "./apiClient";

const tasksApi = {
  getByProject: (projectId, params) =>
    apiClient.get(`/tasks/project/${projectId}`, { params }),
  getById: (id) => apiClient.get(`/tasks/${id}`),
  getMyTasks: (params) => apiClient.get("/tasks/my-tasks", { params }),
  create: (data) => apiClient.post("/tasks", data),
  update: (id, data) => apiClient.put(`/tasks/${id}`, data),
  delete: (id) => apiClient.delete(`/tasks/${id}`),
};

export default tasksApi;
