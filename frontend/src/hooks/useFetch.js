import { useState, useEffect, useCallback } from "react";

/**
 * Generic data-fetching hook.
 * @param {Function} fetchFn  - Async function returning an axios response
 * @param {Array}    deps     - Re-run when these values change
 */
const useFetch = (fetchFn, deps = []) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, isLoading, error, refetch: execute };
};

export default useFetch;
