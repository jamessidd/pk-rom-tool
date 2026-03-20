import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchLocalStatus, fetchLocalSoulLink } from '../utils/api';

export default function useLocalTracker(localUrl) {
  const [connected, setConnected] = useState(false);
  const [status, setStatus]       = useState(null);
  const [soulLink, setSoulLink]   = useState(null);
  const intervalRef = useRef(null);

  const poll = useCallback(async () => {
    if (!localUrl) return;
    try {
      const [s, sl] = await Promise.all([
        fetchLocalStatus(localUrl),
        fetchLocalSoulLink(localUrl),
      ]);
      setStatus(s);
      setSoulLink(sl);
      setConnected(true);
    } catch {
      setConnected(false);
    }
  }, [localUrl]);

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, 1500);
    return () => clearInterval(intervalRef.current);
  }, [poll]);

  return { connected, status, soulLink, refresh: poll };
}
