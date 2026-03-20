const EXACT_ALIASES = {
  IronBouldr: 'iron-boulder',
  IronLeaves: 'iron-leaves',
  IronMoth: 'iron-moth',
  IronHands: 'iron-hands',
  IronJuguls: 'iron-jugulis',
  IronThorns: 'iron-thorns',
  IronTreads: 'iron-treads',
  IronBundle: 'iron-bundle',
  GreatTusk: 'great-tusk',
  ScreamTail: 'scream-tail',
  BruteBonnet: 'brute-bonnet',
  FlutterMane: 'flutter-mane',
  SlitherWing: 'slither-wing',
  SandyShocks: 'sandy-shocks',
  RoaringMoon: 'roaring-moon',
  WalkingWake: 'walking-wake',
  RagingBolt: 'raging-bolt',
  GougingFire: 'gouging-fire',
  IronCrown: 'iron-crown',
  IronValiant: 'iron-valiant',
  MrMime: 'mr-mime',
  MimeJr: 'mime-jr',
  Farfetchd: 'farfetchd',
  Sirfetchd: 'sirfetchd',
  TypeNull: 'type-null',
};

const POKEAPI_CACHE = new Map();

function tidySpeciesName(name = '') {
  return String(name).trim();
}

function basicSlug(name) {
  return name
    .toLowerCase()
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/['’:.]/g, '')
    .replace(/\s+/g, '-')
    .replace(/_/g, '-')
    .replace(/--+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '');
}

export function spriteCandidates(speciesName = '') {
  const clean = tidySpeciesName(speciesName);
  if (!clean) return [];

  const candidates = [];
  const exact = EXACT_ALIASES[clean];
  if (exact) candidates.push(exact);

  const slug = basicSlug(clean);
  if (slug) candidates.push(slug);

  const strippedRegional = slug
    .replace(/-sevii$/i, '')
    .replace(/-alola$/i, '')
    .replace(/-galar$/i, '')
    .replace(/-hisui$/i, '')
    .replace(/-paldea$/i, '')
    .replace(/-paldean$/i, '')
    .replace(/-mega.*$/i, '')
    .replace(/-gmax$/i, '');
  if (strippedRegional && strippedRegional !== slug) candidates.push(strippedRegional);

  return [...new Set(candidates)];
}

export async function resolvePokeApiSprite(speciesName) {
  if (!speciesName) return null;
  if (POKEAPI_CACHE.has(speciesName)) return POKEAPI_CACHE.get(speciesName);

  const promise = (async () => {
    for (const candidate of spriteCandidates(speciesName)) {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${candidate}`);
        if (!response.ok) continue;
        const data = await response.json();
        return (
          data?.sprites?.front_default ||
          data?.sprites?.other?.['official-artwork']?.front_default ||
          null
        );
      } catch {
        // Try next candidate
      }
    }
    return null;
  })();

  POKEAPI_CACHE.set(speciesName, promise);
  return promise;
}
