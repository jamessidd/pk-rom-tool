/**
 * Game-agnostic route progression framework.
 *
 * Adding a new game:
 *  1. Add an entry to GAME_PROGRESSIONS keyed by `gameName` (lowercased).
 *  2. List routes in the order the player normally encounters them.
 *  3. Use `{ divider: 'label' }` for gym / milestone markers.
 *
 * TODO: Add progression data for other games
 *  - Pokemon Emerald / Emerald Kaizo
 *  - Crystal Clear
 *  - Pokemon Unbound
 *  - Inclement Emerald
 */

// Route IDs 101-125 are confirmed. City/dungeon IDs need in-game verification.
// Replace `null` with the correct numeric ID once verified.
const KANTO_PROGRESSION = [
  { name: 'Pallet Town',     id: null },
  { name: 'Route 1',         id: 101 },
  { name: 'Viridian City',   id: null },
  { name: 'Route 22',        id: 122 },
  { name: 'Route 2',         id: 102 },
  { name: 'Viridian Forest', id: null },
  { name: 'Pewter City',     id: null },
  { name: "Diglett's Cave",  id: null },
  { divider: 'Gym 1 — Brock (Pewter)' },

  { name: 'Route 3',         id: 103 },
  { name: 'Route 4',         id: 104 },
  { name: 'Mt. Moon',        id: null },
  { name: 'Cerulean City',   id: null },
  { name: 'Route 24',        id: 124 },
  { name: 'Route 25',        id: 125 },
  { divider: 'Gym 2 — Misty (Cerulean)' },

  { name: 'Route 5',         id: 105 },
  { name: 'Underground Path', id: null },
  { name: 'Route 6',         id: 106 },
  { name: 'Vermilion City',  id: null },
  { name: 'S.S. Anne',       id: null },
  { name: 'Route 11',        id: 111 },
  { divider: 'Gym 3 — Lt. Surge (Vermilion)' },

  { name: 'Route 9',         id: 109 },
  { name: 'Route 10',        id: 110 },
  { name: 'Rock Tunnel',     id: null },
  { name: 'Lavender Town',   id: null },
  { name: 'Route 12',        id: 112 },
  { name: 'Route 8',         id: 108 },
  { name: 'Route 7',         id: 107 },
  { name: 'Celadon City',    id: null },
  { name: 'Route 16',        id: 116 },
  { name: 'Saffron City',    id: null },
  { divider: 'Gym 4 — Erika (Celadon)' },

  { name: 'Pokémon Tower',   id: null },
  { name: 'Silph Co.',       id: null },
  { divider: 'Gym 5 — Sabrina (Saffron)' },

  { name: 'Route 17',        id: 117 },
  { name: 'Route 13',        id: 113 },
  { name: 'Route 14',        id: 114 },
  { name: 'Route 15',        id: 115 },
  { name: 'Fuchsia City',    id: null },
  { name: 'Safari Zone',     id: null },
  { name: 'Route 18',        id: 118 },
  { divider: 'Gym 6 — Koga (Fuchsia)' },

  { name: 'Power Plant',     id: null },
  { name: 'Route 23',        id: 123 },
  { name: 'Route 19',        id: 119 },
  { name: 'Route 20',        id: 120 },
  { name: 'Seafoam Islands', id: null },
  { name: 'Cinnabar Island', id: null },
  { name: 'Pokémon Mansion', id: null },
  { name: 'Route 21',        id: 121 },
  { divider: 'Gym 7 — Blaine (Cinnabar)' },

  { name: 'Cerulean Cave',   id: null },
  { divider: 'Gym 8 — Giovanni (Viridian)' },
  { name: 'Victory Road',    id: null },
  { name: 'Indigo Plateau',  id: null },
  { divider: 'Elite Four' },
];

const GAME_PROGRESSIONS = {
  'radical red': KANTO_PROGRESSION,
  'fire red':    KANTO_PROGRESSION,
  'firered':     KANTO_PROGRESSION,
  'leaf green':  KANTO_PROGRESSION,
  'leafgreen':   KANTO_PROGRESSION,
};

export function getProgression(gameName) {
  if (!gameName) return null;
  return GAME_PROGRESSIONS[gameName.toLowerCase().trim()] || null;
}

export function buildProgressionIndex(progression) {
  const idx = new Map();
  let order = 0;
  for (const step of progression) {
    if (step.id != null) idx.set(step.id, order++);
  }
  return idx;
}

export function sortRoutesWithDividers(routes, progression) {
  if (!progression || !routes?.length) {
    return routes.map(r => ({ type: 'route', route: r }));
  }

  const idx = buildProgressionIndex(progression);
  const routeById = new Map();
  const uncategorized = [];

  for (const r of routes) {
    const locId = r.locationId ?? r.location_id;
    if (locId != null && idx.has(locId)) {
      routeById.set(locId, r);
    } else {
      uncategorized.push(r);
    }
  }

  const result = [];
  for (const step of progression) {
    if (step.divider) {
      result.push({ type: 'divider', label: step.divider });
    } else if (step.id != null && routeById.has(step.id)) {
      result.push({ type: 'route', route: routeById.get(step.id) });
    }
  }

  for (const r of uncategorized) {
    result.push({ type: 'route', route: r });
  }

  return result;
}
