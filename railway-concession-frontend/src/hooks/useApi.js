import { useState, useEffect, useCallback } from 'react';

export const useApi = (apiFunction, immediate = true, ...initialArgs) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [args, setArgs] = useState(initialArgs);

  const execute = useCallback(async (...executeArgs) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...executeArgs);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    if (immediate) {
      execute(...args);
    }
  }, [execute, immediate, args]);

  const refetch = useCallback((...newArgs) => {
    if (newArgs.length > 0) {
      setArgs(newArgs);
    }
    return execute(...(newArgs.length > 0 ? newArgs : args));
  }, [execute, args]);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    setData
  };
};