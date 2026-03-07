import { useRef } from 'react';

export function useMutationCloseGuard() {
  const isInFlightRef = useRef(false);
  const closeAfterRef = useRef(false);

  const start = () => {
    if (isInFlightRef.current) {
      return false;
    }

    isInFlightRef.current = true;
    closeAfterRef.current = false;
    return true;
  };

  const finish = () => {
    isInFlightRef.current = false;
    closeAfterRef.current = false;
  };

  const markCloseAfter = () => {
    closeAfterRef.current = true;
  };

  return {
    isInFlightRef,
    closeAfterRef,
    start,
    finish,
    markCloseAfter,
  };
}
