import { useEffect, useState, useRef, useMemo } from 'react';
import { resolveMoveData } from '../utils/moves';

export default function useMoveData(moveNames) {
  const [data, setData] = useState(new Map());
  const keyRef = useRef('');
  const names = useMemo(() => (moveNames || []).filter(Boolean), [moveNames]);
  const key = names.join(',');

  useEffect(() => {
    if (key === keyRef.current) return;
    keyRef.current = key;

    let active = true;
    if (names.length === 0) {
      Promise.resolve().then(() => {
        if (active) setData(new Map());
      });
      return () => { active = false; };
    }

    Promise.all(names.map(async (name) => [name, await resolveMoveData(name)]))
      .then((entries) => {
        if (!active) return;
        setData(new Map(entries));
      });

    return () => { active = false; };
  }, [key, names]);

  return data;
}
