import { useState, useCallback } from "react";

/**
 * Hook for async mutations (create, update, delete).
 * Returns { execute, isLoading, error }.
 */
const useAsync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFn) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      const message = err.response?.data?.message || "Something went wrong.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { execute, isLoading, error };
};

export default useAsync;
