import { useEffect, useState } from 'react';
import { resolvePokeApiData } from '../utils/species';

export default function usePokemonData(speciesName) {
  const [data, setData] = useState({ sprite: null, baseStats: null });

  useEffect(() => {
    let active = true;
    setData({ sprite: null, baseStats: null });
    resolvePokeApiData(speciesName).then((resolved) => {
      if (active) setData(resolved);
    });
    return () => { active = false; };
  }, [speciesName]);

  return data;
}
