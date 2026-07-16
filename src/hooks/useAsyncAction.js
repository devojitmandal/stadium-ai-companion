import { useState, useCallback } from 'react';

const DEFAULT_ERROR_MESSAGE = "Couldn't reach AI right now — try again.";

/**
 * Owns the loading + error state and try/catch/finally control flow shared
 * by every AI-backed action in this app. Each call site only needs to
 * provide the async function to run and what to do with its result —
 * the loading/error bookkeeping is handled once, here, instead of being
 * hand-written at every call site.
 *
 * @example
 * const { loading, error, run } = useAsyncAction();
 * const handleClick = () => run(() => askGemini(prompt), {
 *   onSuccess: setResult,
 *   errorMessage: "Couldn't generate your recap — try again.",
 * });
 */
export function useAsyncAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (asyncFn, { onSuccess, errorMessage } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      onSuccess?.(result);
      return result;
    } catch (err) {
      console.error(errorMessage ?? DEFAULT_ERROR_MESSAGE, err);
      setError(errorMessage ?? DEFAULT_ERROR_MESSAGE);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, setError, run };
}
