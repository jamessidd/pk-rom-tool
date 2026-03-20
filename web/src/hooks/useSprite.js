import { useEffect, useState } from 'react';
import { resolvePokeApiSprite } from '../utils/species';

export default function useSprite(speciesName) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let active = true;
    setUrl(null);
    resolvePokeApiSprite(speciesName).then((resolved) => {
      if (active) setUrl(resolved);
    });
    return () => {
      active = false;
    };
  }, [speciesName]);

  return url;
}
