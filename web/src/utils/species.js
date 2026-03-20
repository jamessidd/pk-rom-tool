/**
 * Aliases for species names.
 * Radical Red truncates names to 10 chars, removing vowels from the end.
 *
 * TODO: Add aliases for other ROM hacks (Emerald Kaizo, Unbound, etc.)
 */
const EXACT_ALIASES = {
  // Paradox / compound-word Pokemon
  IronBouldr: 'iron-boulder',
  IRONBOULDR: 'iron-boulder',
  IronLeaves: 'iron-leaves',
  IRONLEAVE: 'iron-leaves',
  IronMoth: 'iron-moth',
  IRONMOTH: 'iron-moth',
  IronHands: 'iron-hands',
  IRONHANDS: 'iron-hands',
  IronJuguls: 'iron-jugulis',
  IRONJUGLIS: 'iron-jugulis',
  IronThorns: 'iron-thorns',
  IRONTHORNS: 'iron-thorns',
  IronTreads: 'iron-treads',
  IRONTREADS: 'iron-treads',
  IronBundle: 'iron-bundle',
  IRONBUNDLE: 'iron-bundle',
  IronCrown: 'iron-crown',
  IRONCROWN: 'iron-crown',
  IronValiant: 'iron-valiant',
  IRONVALINT: 'iron-valiant',
  GreatTusk: 'great-tusk',
  GREATTUSK: 'great-tusk',
  ScreamTail: 'scream-tail',
  SCREAMTAIL: 'scream-tail',
  BruteBonnet: 'brute-bonnet',
  BRUTBONNET: 'brute-bonnet',
  FlutterMane: 'flutter-mane',
  FLUTTRMANE: 'flutter-mane',
  SlitherWing: 'slither-wing',
  SLITHRWING: 'slither-wing',
  SandyShocks: 'sandy-shocks',
  SANDYSHCKS: 'sandy-shocks',
  RoaringMoon: 'roaring-moon',
  ROARINGMON: 'roaring-moon',
  WalkingWake: 'walking-wake',
  WALKINGWKE: 'walking-wake',
  RagingBolt: 'raging-bolt',
  RAGINGBOLT: 'raging-bolt',
  GougingFire: 'gouging-fire',
  GOUGINGFRE: 'gouging-fire',

  // Special characters / formatting
  MrMime: 'mr-mime',
  MRMIME: 'mr-mime',
  MimeJr: 'mime-jr',
  MIMEJR: 'mime-jr',
  MrRime: 'mr-rime',
  MRRIME: 'mr-rime',
  Farfetchd: 'farfetchd',
  FARFETCHD: 'farfetchd',
  Sirfetchd: 'sirfetchd',
  SIRFETCHD: 'sirfetchd',
  TypeNull: 'type-null',
  TYPENULL: 'type-null',
  TapuKoko: 'tapu-koko',
  TAPUKOKO: 'tapu-koko',
  TapuLele: 'tapu-lele',
  TAPULELE: 'tapu-lele',
  TapuBulu: 'tapu-bulu',
  TAPUBULU: 'tapu-bulu',
  TapuFini: 'tapu-fini',
  TAPUFINI: 'tapu-fini',

  // Truncated names (10-char limit)
  Corvknight: 'corviknight',
  Corviknig: 'corviknight',
  CORVIKNGHT: 'corviknight',
  Fletchindr: 'fletchinder',
  FLETCHINDR: 'fletchinder',
  Basculegn: 'basculegion',
  BASCULEGN: 'basculegion',
  Annihilap: 'annihilape',
  ANNIHILAPE: 'annihilape',
  Bramblegh: 'brambleghast',
  BRAMBLEGH: 'brambleghast',
  Toedscrul: 'toedscruel',
  TOEDSCRUL: 'toedscruel',
  Houndston: 'houndstone',
  HOUNDSTN: 'houndstone',
  Squawkabi: 'squawkabilly',
  SQUAWKBILY: 'squawkabilly',
  Bombirdir: 'bombirdier',
  BOMBIRDIR: 'bombirdier',
  Scovillai: 'scovillain',
  SCOVILLAIN: 'scovillain',
  Mabosstif: 'mabosstiff',
  MABOSSTIF: 'mabosstiff',
  Oinkologn: 'oinkologne',
  OINKOLOGN: 'oinkologne',
  Tarountul: 'tarountula',
  TAROUNTUL: 'tarountula',
  Dudunsprc: 'dudunsparce',
  DUDUNSPRC: 'dudunsparce',
  Kilowattr: 'kilowattrel',
  KILOWATTR: 'kilowattrel',

  // Gen 8/9 names that may appear verbatim
  Wyrdeer: 'wyrdeer',
  Overqwil: 'overqwil',
  Kleavor: 'kleavor',
  Ursaluna: 'ursaluna',
  Annihilape: 'annihilape',
  Farigiraf: 'farigiraf',
  Kingambit: 'kingambit',
  Clodsire: 'clodsire',
  Dondozo: 'dondozo',
  Tatsugiri: 'tatsugiri',
  Palafin: 'palafin',
  Flamigo: 'flamigo',
  Cetitan: 'cetitan',
  Veluza: 'veluza',
  Dachsbun: 'dachsbun',
  Grafaiai: 'grafaiai',
  Toedscruel: 'toedscruel',
  Rabsca: 'rabsca',
  Espathra: 'espathra',
  Greavard: 'greavard',
  Flittle: 'flittle',
  Glimmora: 'glimmora',
  Orthworm: 'orthworm',
  Revavroom: 'revavroom',
  Varoom: 'varoom',
  Cyclizar: 'cyclizar',
  Tandemaus: 'tandemaus',
  Maushold: 'maushold',
  Squawkabilly: 'squawkabilly',
  Nacli: 'nacli',
  Garganacl: 'garganacl',
  Charcadet: 'charcadet',
  Armarouge: 'armarouge',
  Ceruledge: 'ceruledge',
  Bellibolt: 'bellibolt',
  Wattrel: 'wattrel',
  Kilowattrel: 'kilowattrel',
  Tinkatink: 'tinkatink',
  Tinkatuff: 'tinkatuff',
  Tinkaton: 'tinkaton',
  Wiglett: 'wiglett',
  Wugtrio: 'wugtrio',
  Bombirdier: 'bombirdier',
  Finizen: 'finizen',
  Smoliv: 'smoliv',
  Dolliv: 'dolliv',
  Arboliva: 'arboliva',
  Capsakid: 'capsakid',
  Scovillain: 'scovillain',
  Tadbulb: 'tadbulb',
  Fidough: 'fidough',
  Maschiff: 'maschiff',
  Mabosstiff: 'mabosstiff',
  Shroodle: 'shroodle',
  Pawmi: 'pawmi',
  Pawmo: 'pawmo',
  Pawmot: 'pawmot',
  Lechonk: 'lechonk',
  Oinkologne: 'oinkologne',
  Tarountula: 'tarountula',
  Spidops: 'spidops',
  Nymble: 'nymble',
  Lokix: 'lokix',
  Rellor: 'rellor',
  Dudunsparce: 'dudunsparce',
  Aegislash: 'aegislash',
};

const POKEAPI_DATA_CACHE = new Map();
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

function extractBaseStats(data) {
  if (!data?.stats) return null;
  const map = {};
  let total = 0;
  for (const s of data.stats) {
    const val = s.base_stat ?? 0;
    total += val;
    switch (s.stat?.name) {
      case 'hp': map.hp = val; break;
      case 'attack': map.attack = val; break;
      case 'defense': map.defense = val; break;
      case 'special-attack': map.specialAttack = val; break;
      case 'special-defense': map.specialDefense = val; break;
      case 'speed': map.speed = val; break;
    }
  }
  map.total = total;
  return map;
}

async function fetchPokeApiData(speciesName) {
  for (const candidate of spriteCandidates(speciesName)) {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${candidate}`);
      if (!response.ok) continue;
      const data = await response.json();
      return {
        sprite: data?.sprites?.front_default ||
          data?.sprites?.other?.['official-artwork']?.front_default || null,
        baseStats: extractBaseStats(data),
      };
    } catch {
      // Try next candidate
    }
  }
  return { sprite: null, baseStats: null };
}

export async function resolvePokeApiData(speciesName) {
  if (!speciesName) return { sprite: null, baseStats: null };
  if (POKEAPI_DATA_CACHE.has(speciesName)) return POKEAPI_DATA_CACHE.get(speciesName);
  const promise = fetchPokeApiData(speciesName);
  POKEAPI_DATA_CACHE.set(speciesName, promise);
  return promise;
}

export async function resolvePokeApiSprite(speciesName) {
  if (!speciesName) return null;
  if (POKEAPI_CACHE.has(speciesName)) return POKEAPI_CACHE.get(speciesName);
  const promise = resolvePokeApiData(speciesName).then(d => d.sprite);
  POKEAPI_CACHE.set(speciesName, promise);
  return promise;
}
