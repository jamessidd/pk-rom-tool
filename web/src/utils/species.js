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
  Corvknight: 'corviknight',
  Corviknig: 'corviknight',
  Aegislash: 'aegislash',
  Fletchindr: 'fletchinder',
  Basculegn: 'basculegion',
  Wyrdeer: 'wyrdeer',
  Overqwil: 'overqwil',
  Kleavor: 'kleavor',
  Ursaluna: 'ursaluna',
  Annihilape: 'annihilape',
  Annihilap: 'annihilape',
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
  Bramblegh: 'brambleghast',
  Toedscruel: 'toedscruel',
  Toedscrul: 'toedscruel',
  Rabsca: 'rabsca',
  Espathra: 'espathra',
  Greavard: 'greavard',
  Houndston: 'houndstone',
  Flittle: 'flittle',
  Glimmora: 'glimmora',
  Orthworm: 'orthworm',
  Revavroom: 'revavroom',
  Varoom: 'varoom',
  Cyclizar: 'cyclizar',
  Tandemaus: 'tandemaus',
  Maushold: 'maushold',
  Squawkabily: 'squawkabilly',
  Squawkabi: 'squawkabilly',
  Nacli: 'nacli',
  Garganacl: 'garganacl',
  Charcadet: 'charcadet',
  Armarouge: 'armarouge',
  Ceruledge: 'ceruledge',
  Bellibolt: 'bellibolt',
  Wattrel: 'wattrel',
  Kilowattr: 'kilowattrel',
  Tinkatink: 'tinkatink',
  Tinkatuff: 'tinkatuff',
  Tinkaton: 'tinkaton',
  Wiglett: 'wiglett',
  Wugtrio: 'wugtrio',
  Bombirdier: 'bombirdier',
  Bombirdir: 'bombirdier',
  Finizen: 'finizen',
  Smoliv: 'smoliv',
  Dolliv: 'dolliv',
  Arboliva: 'arboliva',
  Capsakid: 'capsakid',
  Scovillain: 'scovillain',
  Scovillai: 'scovillain',
  Tadbulb: 'tadbulb',
  Fidough: 'fidough',
  Maschiff: 'maschiff',
  Mabosstiff: 'mabosstiff',
  Mabosstif: 'mabosstiff',
  Shroodle: 'shroodle',
  Pawmi: 'pawmi',
  Pawmo: 'pawmo',
  Pawmot: 'pawmot',
  Lechonk: 'lechonk',
  Oinkologne: 'oinkologne',
  Oinkologn: 'oinkologne',
  Tarountula: 'tarountula',
  Tarountul: 'tarountula',
  Spidops: 'spidops',
  Nymble: 'nymble',
  Lokix: 'lokix',
  Rellor: 'rellor',
  Flittle: 'flittle',
  Dudunsparce: 'dudunsparce',
  Dudunsprc: 'dudunsparce',
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
