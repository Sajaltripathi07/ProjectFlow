import apiClient from "./apiClient";

const usersApi = {
  getAll: () => apiClient.get("/users"),
  getById: (id) => apiClient.get(`/users/${id}`),
};

export default usersApi;
