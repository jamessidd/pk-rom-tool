const MAX_PLAYERS = 4;

const SPECIES_POOL = [
  { name: 'Pikachu',     types: ['Electric'],           dexId: 25 },
  { name: 'Charizard',   types: ['Fire', 'Flying'],     dexId: 6 },
  { name: 'Gardevoir',   types: ['Psychic', 'Fairy'],   dexId: 282 },
  { name: 'Lucario',     types: ['Fighting', 'Steel'],  dexId: 448 },
  { name: 'Gengar',      types: ['Ghost', 'Poison'],    dexId: 94 },
  { name: 'Gyarados',    types: ['Water', 'Flying'],    dexId: 130 },
  { name: 'Dragonite',   types: ['Dragon', 'Flying'],   dexId: 149 },
  { name: 'Scizor',      types: ['Bug', 'Steel'],       dexId: 212 },
  { name: 'Tyranitar',   types: ['Rock', 'Dark'],       dexId: 248 },
  { name: 'Salamence',   types: ['Dragon', 'Flying'],   dexId: 373 },
  { name: 'Metagross',   types: ['Steel', 'Psychic'],   dexId: 376 },
  { name: 'Togekiss',    types: ['Fairy', 'Flying'],    dexId: 468 },
  { name: 'Excadrill',   types: ['Ground', 'Steel'],    dexId: 530 },
  { name: 'Volcarona',   types: ['Bug', 'Fire'],        dexId: 637 },
  { name: 'Aegislash',   types: ['Steel', 'Ghost'],     dexId: 681 },
  { name: 'Mimikyu',     types: ['Ghost', 'Fairy'],     dexId: 778 },
  { name: 'Toxapex',     types: ['Poison', 'Water'],    dexId: 748 },
  { name: 'Corviknight', types: ['Flying', 'Steel'],    dexId: 823 },
  { name: 'Dragapult',   types: ['Dragon', 'Ghost'],    dexId: 887 },
  { name: 'Blaziken',    types: ['Fire', 'Fighting'],   dexId: 257 },
  { name: 'Swampert',    types: ['Water', 'Ground'],    dexId: 260 },
  { name: 'Alakazam',    types: ['Psychic'],             dexId: 65 },
  { name: 'Starmie',     types: ['Water', 'Psychic'],   dexId: 121 },
  { name: 'Arcanine',    types: ['Fire'],                dexId: 59 },
  { name: 'Jolteon',     types: ['Electric'],            dexId: 135 },
  { name: 'Snorlax',     types: ['Normal'],              dexId: 143 },
  { name: 'Heracross',   types: ['Bug', 'Fighting'],    dexId: 214 },
  { name: 'Kingdra',     types: ['Water', 'Dragon'],    dexId: 230 },
];

const NATURES = [
  'Adamant', 'Jolly', 'Modest', 'Timid', 'Bold', 'Calm',
  'Impish', 'Careful', 'Brave', 'Quiet', 'Naive', 'Hasty',
];

const HELD_ITEMS = [
  'Leftovers', 'Choice Band', 'Choice Scarf', 'Life Orb', 'Focus Sash',
  'Assault Vest', 'Rocky Helmet', 'Eviolite', 'None',
];

const HELD_ITEM_IDS = {
  'Leftovers': 234, 'Choice Band': 220, 'Choice Scarf': 287,
  'Life Orb': 270, 'Focus Sash': 275, 'Assault Vest': 640,
  'Rocky Helmet': 540, 'Eviolite': 538, 'None': 0,
};

const ABILITIES = [
  'Intimidate', 'Levitate', 'Thick Fat', 'Mold Breaker', 'Speed Boost',
  'Multiscale', 'Technician', 'Sand Stream', 'Marvel Scale', 'Clear Body',
  'Serene Grace', 'Sand Rush', 'Flame Body', 'Stance Change', 'Disguise',
  'Regenerator', 'Mirror Armor', 'Cursed Body', 'Blaze', 'Torrent',
  'Magic Guard', 'Natural Cure', 'Flash Fire', 'Volt Absorb', 'Immunity',
  'Guts', 'Swift Swim',
];

const MOVE_POOL = [
  'Thunderbolt', 'Flamethrower', 'Ice Beam', 'Earthquake', 'Close Combat',
  'Shadow Ball', 'Psychic', 'Dragon Claw', 'Iron Head', 'Surf',
  'Brave Bird', 'U-turn', 'Stealth Rock', 'Toxic', 'Will-O-Wisp',
  'Swords Dance', 'Calm Mind', 'Dragon Dance', 'Roost', 'Protect',
  'Scald', 'Knock Off', 'Bullet Punch', 'Rapid Spin', 'Volt Switch',
  'Stone Edge', 'Crunch', 'Fire Blast', 'Hydro Pump', 'Focus Blast',
  'Air Slash', 'Dark Pulse', 'Flash Cannon', 'Energy Ball', 'Moonblast',
  'Dazzling Gleam', 'Shadow Sneak', 'Aqua Jet', 'Mach Punch', 'Extreme Speed',
];

const HIDDEN_POWER_TYPES = [
  'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting',
  'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock',
  'Ghost', 'Dragon', 'Dark', 'Steel',
];

const TRAINER_NAMES = ['Ash', 'Misty', 'Brock', 'Gary', 'Cynthia', 'Steven', 'Lance', 'Red'];

const SHOWDOWN_TRAINERS = 'https://play.pokemonshowdown.com/sprites/trainers';
const MOCK_SPRITES = [
  `${SHOWDOWN_TRAINERS}/leaf.png`,
  `${SHOWDOWN_TRAINERS}/ethan.png`,
  `${SHOWDOWN_TRAINERS}/brendan.png`,
  `${SHOWDOWN_TRAINERS}/dawn.png`,
  `${SHOWDOWN_TRAINERS}/hilbert.png`,
  `${SHOWDOWN_TRAINERS}/hilda.png`,
  `${SHOWDOWN_TRAINERS}/serena.png`,
  `${SHOWDOWN_TRAINERS}/calem.png`,
];

const ROUTE_NAMES = [
  'Route 1', 'Route 2', 'Route 3', 'Route 4', 'Route 5',
  'Viridian Forest', 'Mt. Moon', 'Rock Tunnel', 'Safari Zone',
  'Route 11', 'Route 12', 'Cerulean Cave',
];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  const shuffled = shuffle(arr);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let personalityCounter = 900000;

function generateMockMon(level, routeIdx) {
  const sp = pick(SPECIES_POOL);
  const maxHp = rand(40, 200);
  const alive = Math.random() > 0.15;
  const hp = alive ? rand(1, maxHp) : 0;
  const itemName = pick(HELD_ITEMS);
  personalityCounter++;

  const metRoute = routeIdx != null ? routeIdx : rand(101, 112);
  const metRouteName = ROUTE_NAMES[metRoute - 101] || `Route ${metRoute}`;
  const metLevel = rand(2, Math.max(3, (level || 30) - 5));

  return {
    personality: personalityCounter,
    speciesId: sp.dexId,
    species_name: sp.name,
    species: sp.name,
    nickname: Math.random() > 0.4 ? sp.name : pick(['Buddy', 'Shadow', 'Tank', 'Zippy', 'Flash', 'Rex', 'Luna']),
    level: level || rand(5, 65),
    current_hp: hp,
    max_hp: maxHp,
    types: sp.types,
    alive,
    in_party: true,
    nature: pick(NATURES),
    held_item: itemName,
    heldItem: itemName,
    heldItemId: HELD_ITEM_IDS[itemName] || 0,
    abilityName: pick(ABILITIES),
    ability: pick(ABILITIES),
    friendship: rand(0, 255),
    isShiny: Math.random() < 0.05,
    status: alive ? (Math.random() < 0.85 ? 'Healthy' : pick(['Poisoned', 'Burned', 'Paralyzed'])) : 'Healthy',
    moveNames: pickN(MOVE_POOL, rand(2, 4)),
    hiddenPower: pick(HIDDEN_POWER_TYPES),
    met_location: metRoute,
    met_location_name: metRouteName,
    metLocation: metRoute,
    metLocationName: metRouteName,
    met_level: metLevel,
    metLevel: metLevel,
    ivs: {
      hp: rand(0, 31), attack: rand(0, 31), defense: rand(0, 31),
      specialAttack: rand(0, 31), specialDefense: rand(0, 31), speed: rand(0, 31),
    },
    evs: {
      hp: rand(0, 3) * 84, attack: rand(0, 3) * 84, defense: rand(0, 3) * 84,
      specialAttack: rand(0, 3) * 84, specialDefense: rand(0, 3) * 84, speed: rand(0, 3) * 84,
    },
  };
}

function generateMockParty(avgLevel) {
  const size = rand(3, 6);
  const party = [];
  for (let i = 0; i < size; i++) {
    const lv = avgLevel ? rand(avgLevel - 5, avgLevel + 5) : rand(5, 65);
    party.push(generateMockMon(lv));
  }
  return party;
}

function generateMockRoutes(playerIds) {
  const routeCount = rand(5, 10);
  const routes = shuffle(ROUTE_NAMES).slice(0, routeCount);
  const pairs = [];

  for (let i = 0; i < routeCount; i++) {
    const pokemon = {};
    for (const pid of playerIds) {
      pokemon[pid] = generateMockMon(rand(5, 50), 101 + i);
    }
    pairs.push({
      route: 101 + i,
      route_name: routes[i],
      pokemon,
    });
  }
  return pairs;
}

function generateMockEvents(playerNames) {
  const events = [];
  const count = rand(3, 8);
  for (let i = 0; i < count; i++) {
    const sp = pick(SPECIES_POOL);
    const playerName = pick(playerNames);
    const isCatch = Math.random() > 0.3;
    events.push({
      id: `mock-ev-${i}`,
      type: isCatch ? 'catch' : 'faint',
      player_name: playerName,
      pokemon: {
        species_name: sp.name,
        nickname: sp.name,
        met_location_name: pick(ROUTE_NAMES),
      },
    });
  }
  return events;
}

export function getMockPlayerCount() {
  try {
    const params = new URLSearchParams(window.location.search);
    const val = parseInt(params.get('mock'), 10);
    if (isNaN(val) || val < 1) return 0;
    return Math.min(val, MAX_PLAYERS - 1);
  } catch {
    return 0;
  }
}

export function isMockEnabled() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.has('mock');
  } catch {
    return false;
  }
}

export function isMockRaceMode() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('race') !== null;
  } catch {
    return false;
  }
}

export function generateMockStatus() {
  return {
    game: {
      name: 'Radical Red',
      version: 'v4.1',
      generation: 3,
      engine: '3',
      initialized: true,
      profileId: 'mock-profile-001',
      romHash: 'MOCK-ROM-HASH-RR41',
    },
  };
}

export function generateMockTrainerInfo() {
  return {
    name: 'Red',
    money: rand(5000, 99999),
    coins: rand(0, 5000),
  };
}

export function generateMockSoulLink(party) {
  const routeCount = rand(6, 12);
  const usedRoutes = shuffle(ROUTE_NAMES).slice(0, routeCount);

  const routes = usedRoutes.map((routeName, i) => {
    const routeId = 101 + i;
    const pokemonFromParty = party[i] ? [{ ...party[i], met_location: routeId, met_location_name: routeName }] : [];
    const extraMon = Math.random() > 0.5 ? [generateMockMon(rand(5, 40), routeId)] : [];
    return {
      locationId: routeId,
      locationName: routeName,
      pokemon: [...pokemonFromParty, ...extraMon],
    };
  });

  const recentEvents = [];
  const eventCount = rand(3, 6);
  for (let i = 0; i < eventCount; i++) {
    const mon = pick(party) || generateMockMon(rand(10, 50));
    recentEvents.push({
      type: Math.random() > 0.3 ? 'catch' : 'faint',
      personality: mon.personality,
      speciesId: mon.speciesId,
      species: mon.species_name,
      nickname: mon.nickname,
      level: mon.level,
      currentHP: mon.current_hp,
      maxHP: mon.max_hp,
      types: mon.types,
      frame: Date.now() - rand(1000, 60000),
    });
  }

  return {
    routes,
    currentParty: party.map(mon => ({
      personality: mon.personality,
      speciesId: mon.speciesId,
      species: mon.species_name,
      nickname: mon.nickname,
      level: mon.level,
      currentHP: mon.current_hp,
      maxHP: mon.max_hp,
      types: mon.types,
      alive: mon.alive,
      in_party: true,
    })),
    recentEvents,
  };
}

export function generateMockEnemyParty() {
  const size = rand(1, 3);
  const party = [];
  for (let i = 0; i < size; i++) {
    party.push(generateMockMon(rand(20, 60)));
  }
  return party;
}

export function generateMockLocalData() {
  const party = generateMockParty(35);
  const status = generateMockStatus();
  const soulLink = generateMockSoulLink(party);
  const trainerInfo = generateMockTrainerInfo();
  return { status, soulLink, party, trainerInfo };
}

export function generateMockData(localPlayer) {
  const mockCount = getMockPlayerCount();
  if (mockCount === 0) return null;

  const raceMode = isMockRaceMode();
  const availableNames = shuffle(TRAINER_NAMES);
  const mockPlayers = [];

  for (let i = 0; i < mockCount; i++) {
    const pid = `mock-player-${i + 1}`;
    mockPlayers.push({
      name: availableNames[i] || `Player ${i + 2}`,
      playerId: pid,
      party: generateMockParty(rand(20, 50)),
      spriteUrl: MOCK_SPRITES[i % MOCK_SPRITES.length],
      money: rand(500, 99999),
      coins: rand(0, 5000),
    });
  }

  const allPlayers = [localPlayer, ...mockPlayers];
  const allPlayerIds = allPlayers.map(p => p.playerId);
  const playerNames = allPlayers.map(p => p.name);

  const teamAssignments = {};
  if (raceMode) {
    allPlayers.forEach((p, i) => {
      teamAssignments[p.playerId] = i % 2 === 0 ? 'A' : 'B';
    });
  }

  const roomPairs = generateMockRoutes(allPlayerIds);
  const roomEvents = generateMockEvents(playerNames);

  if (raceMode) {
    roomPairs.forEach((pair, i) => {
      pair.team = i % 2 === 0 ? 'A' : 'B';
    });
  }

  const roomPlayers = allPlayers.map(p => ({
    player_id: p.playerId,
    player_name: p.name,
    team: raceMode ? (teamAssignments[p.playerId] || '') : '',
  }));

  const roomLinks = roomPairs.map(pair => ({
    route: pair.route,
    routeName: pair.route_name,
    pokemon: pair.pokemon,
    team: pair.team || '',
    anyDead: Object.values(pair.pokemon).some(m => !m.alive),
  }));

  return {
    trainerParties: allPlayers,
    roomLinks,
    roomPlayers,
    roomEvents,
    roomPairs,
    raceMode,
  };
}
