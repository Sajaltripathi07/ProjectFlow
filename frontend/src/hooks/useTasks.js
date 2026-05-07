import { useCallback } from "react";
import useFetch from "./useFetch";
import tasksApi from "../api/tasks.api";

const useTasks = (projectId, params) => {
  const fetchFn = useCallback(
    () => tasksApi.getByProject(projectId, params),
    [projectId, JSON.stringify(params)]
  );
  return useFetch(fetchFn, [projectId, JSON.stringify(params)]);
};

export default useTasks;
