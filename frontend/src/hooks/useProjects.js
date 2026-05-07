import { useCallback } from "react";
import useFetch from "./useFetch";
import projectsApi from "../api/projects.api";

const useProjects = (params) => {
  const fetchFn = useCallback(() => projectsApi.getAll(params), [JSON.stringify(params)]);
  return useFetch(fetchFn, [JSON.stringify(params)]);
};

export default useProjects;
