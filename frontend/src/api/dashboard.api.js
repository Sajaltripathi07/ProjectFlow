import apiClient from "./apiClient";

const dashboardApi = {
  getStats: () => apiClient.get("/dashboard/stats"),
};

export default dashboardApi;
