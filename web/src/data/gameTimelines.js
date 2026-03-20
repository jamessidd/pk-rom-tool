/**
 * Full game timelines with encounter routes, boss battles, and level caps.
 *
 * Entry types:
 *  - { type: 'route', name: string, id: number|null }
 *  - { type: 'boss',  name: string, specialty: string, location: string, levelCap?: number }
 *  - { type: 'rival', name: string, location: string }
 *
 * TODO: Add timelines for other games:
 *  - Pokemon Emerald / Emerald Kaizo
 *  - Pokemon Unbound
 *  - Inclement Emerald
 *  - Crystal Clear
 */

const RADICAL_RED_TIMELINE = [
  { type: 'route', name: 'Pallet Town',      id: null },
  { type: 'rival', name: 'Gary',             location: "Oak's Laboratory" },
  { type: 'route', name: 'Route 1',          id: 101 },
  { type: 'rival', name: 'Gary',             location: 'Route 1' },
  { type: 'route', name: 'Viridian City',    id: null },
  { type: 'route', name: 'Route 22',         id: 122 },
  { type: 'route', name: 'Route 2',          id: 102 },
  { type: 'route', name: 'Viridian Forest',  id: null },
  { type: 'rival', name: 'Brendan',          location: 'Viridian Forest' },
  { type: 'boss',  name: 'Falkner',          specialty: 'FLYING', location: 'Pewter City Museum' },
  { type: 'boss',  name: 'Brock',            specialty: 'ROCK',   location: 'Pewter City Gym', levelCap: 14 },
  { type: 'route', name: 'Pewter City',      id: null },
  { type: 'route', name: 'Route 3',          id: 103 },
  { type: 'route', name: 'Route 4',          id: 104 },
  { type: 'route', name: 'Mt. Moon',         id: null },
  { type: 'rival', name: 'Admin Archer',     location: 'Mt. Moon' },
  { type: 'route', name: 'Route 24',         id: 124 },
  { type: 'rival', name: 'Gary',             location: 'Route 24' },
  { type: 'route', name: 'Route 25',         id: 125 },
  { type: 'boss',  name: 'Bugsy',            specialty: 'BUG',    location: "Bill's House" },
  { type: 'route', name: 'Cerulean City',    id: null },
  { type: 'boss',  name: 'Misty',            specialty: 'WATER',  location: 'Cerulean City Gym', levelCap: 27 },
  { type: 'route', name: 'Route 5',          id: 105 },
  { type: 'route', name: 'Route 6',          id: 106 },
  { type: 'route', name: 'Vermilion City',   id: null },
  { type: 'boss',  name: 'Lt. Surge',        specialty: 'ELECTRIC', location: 'Vermilion City Gym', levelCap: 34 },
  { type: 'route', name: "Diglett's Cave",   id: null },
  { type: 'route', name: 'S.S. Anne',        id: null },
  { type: 'rival', name: 'Brendan',          location: 'S.S. Anne' },
  { type: 'route', name: 'Route 11',         id: 111 },
  { type: 'boss',  name: 'Whitney',          specialty: 'NORMAL', location: 'Route 11' },
  { type: 'route', name: 'Route 9',          id: 109 },
  { type: 'route', name: 'Rock Tunnel',      id: null },
  { type: 'route', name: 'Route 10',         id: 110 },
  { type: 'boss',  name: 'Morty',            specialty: 'GHOST',  location: 'Lavender Town' },
  { type: 'route', name: 'Pokémon Tower',    id: null },
  { type: 'route', name: 'Route 12',         id: 112 },
  { type: 'route', name: 'Route 8',          id: 108 },
  { type: 'route', name: 'Route 7',          id: 107 },
  { type: 'route', name: 'Celadon City',     id: null },
  { type: 'boss',  name: 'Erika',            specialty: 'GRASS',  location: 'Celadon City Gym', levelCap: 44 },
  { type: 'boss',  name: 'Giovanni',         specialty: null,     location: 'Celadon City Game Corner' },
  { type: 'route', name: 'Saffron City',     id: null },
  { type: 'rival', name: 'Gary',             location: 'Silph Co. Rival' },
  { type: 'boss',  name: 'Archer & Ariana',  specialty: null,     location: 'Silph Co.' },
  { type: 'boss',  name: 'Giovanni',         specialty: null,     location: 'Silph Co.' },
  { type: 'boss',  name: 'Chuck',            specialty: 'FIGHTING', location: 'Saffron City Dojo' },
  { type: 'boss',  name: 'Sabrina',          specialty: 'PSYCHIC', location: 'Saffron City Gym', levelCap: 59 },
  { type: 'route', name: 'Route 16',         id: 116 },
  { type: 'route', name: 'Route 17',         id: 117 },
  { type: 'route', name: 'Route 18',         id: 118 },
  { type: 'route', name: 'Fuchsia City',     id: null },
  { type: 'rival', name: 'Brendan',          location: 'Safari Zone' },
  { type: 'boss',  name: 'Koga',             specialty: 'POISON', location: 'Fuchsia City Gym', levelCap: 68 },
  { type: 'route', name: 'Safari Zone',      id: null },
  { type: 'route', name: 'Route 15',         id: 115 },
  { type: 'route', name: 'Route 14',         id: 114 },
  { type: 'route', name: 'Route 13',         id: 113 },
  { type: 'route', name: 'Power Plant',      id: null },
  { type: 'route', name: 'Route 19',         id: 119 },
  { type: 'route', name: 'Route 20',         id: 120 },
  { type: 'route', name: 'Seafoam Islands',  id: null },
  { type: 'boss',  name: 'Pryce (Team A)',   specialty: 'ICE',    location: 'Seafoam Islands' },
  { type: 'boss',  name: 'Pryce (Team B)',   specialty: 'ICE',    location: 'Seafoam Islands' },
  { type: 'boss',  name: 'Pryce (Team C)',   specialty: 'ICE',    location: 'Seafoam Islands' },
  { type: 'route', name: 'Cinnabar Island',  id: null },
  { type: 'boss',  name: 'Jasmine (Team A)', specialty: 'STEEL',  location: 'Cinnabar Island' },
  { type: 'boss',  name: 'Jasmine (Team B)', specialty: 'STEEL',  location: 'Cinnabar Island' },
  { type: 'boss',  name: 'Jasmine (Team C)', specialty: 'STEEL',  location: 'Cinnabar Island' },
  { type: 'rival', name: 'May',              location: 'Pokémon Mansion Entrance' },
  { type: 'route', name: 'Pokémon Mansion',  id: null },
  { type: 'boss',  name: 'Blaine',           specialty: 'FIRE',   location: 'Cinnabar Island Gym', levelCap: 76 },
  { type: 'route', name: 'Route 21',         id: 121 },
  { type: 'boss',  name: 'Clair',            specialty: 'DRAGON', location: 'Viridian City Gym', levelCap: 81 },
  { type: 'rival', name: 'Gary',             location: 'Route 22' },
  { type: 'route', name: 'Route 23',         id: 123 },
  { type: 'route', name: 'Victory Road',     id: null },
  { type: 'rival', name: 'Brendan',          location: 'Indigo Plateau' },
  { type: 'boss',  name: 'Lorelei (Rain)',   specialty: 'ICE',      location: 'Indigo Plateau', levelCap: 85 },
  { type: 'boss',  name: 'Lorelei (Hail)',   specialty: 'ICE',      location: 'Indigo Plateau', levelCap: 85 },
  { type: 'boss',  name: 'Bruno (Team A)',   specialty: 'FIGHTING', location: 'Indigo Plateau', levelCap: 85 },
  { type: 'boss',  name: 'Bruno (Team B)',   specialty: 'FIGHTING', location: 'Indigo Plateau', levelCap: 85 },
  { type: 'boss',  name: 'Agatha (Team A)',  specialty: 'GHOST',    location: 'Indigo Plateau', levelCap: 85 },
  { type: 'boss',  name: 'Agatha (Team B)',  specialty: 'GHOST',    location: 'Indigo Plateau', levelCap: 85 },
  { type: 'boss',  name: 'Lance (Team A)',   specialty: 'DRAGON',   location: 'Indigo Plateau', levelCap: 85 },
  { type: 'boss',  name: 'Lance (Team B)',   specialty: 'DRAGON',   location: 'Indigo Plateau', levelCap: 85 },
  { type: 'boss',  name: 'Champion Gary',    specialty: null,       location: 'Champion', levelCap: 85 },

  // Post-game
  { type: 'route', name: 'Three Island',     id: null },
  { type: 'route', name: 'Mt. Ember',        id: null },
  { type: 'route', name: 'Treasure Beach',   id: null },
  { type: 'route', name: 'Berry Forest',     id: null },
  { type: 'route', name: 'Bond Bridge',      id: null },
  { type: 'route', name: 'Cape Brink',       id: null },
  { type: 'route', name: 'Kindle Road',      id: null },
  { type: 'boss',  name: 'Brock (Rematch)',      specialty: 'ROCK',     location: 'Pewter City Gym' },
  { type: 'boss',  name: 'Misty (Rematch)',      specialty: 'WATER',    location: 'Cerulean City Gym' },
  { type: 'boss',  name: 'Lt. Surge (Rematch)',  specialty: 'ELECTRIC', location: 'Vermilion City Gym' },
  { type: 'boss',  name: 'Erika (Rematch)',      specialty: 'GRASS',    location: 'Celadon City Gym' },
  { type: 'route', name: 'Cerulean Cave',    id: null },
  { type: 'boss',  name: 'Admin Archer',     specialty: null, location: 'Cerulean Cave' },
  { type: 'boss',  name: 'Admin Ariana',     specialty: null, location: 'Cerulean Cave' },
  { type: 'boss',  name: 'Giovanni',         specialty: null, location: 'Cerulean Cave' },
];

const GAME_TIMELINES = {
  'radical red': RADICAL_RED_TIMELINE,
  'fire red':    RADICAL_RED_TIMELINE,
  'firered':     RADICAL_RED_TIMELINE,
};

export function getTimeline(gameName) {
  if (!gameName) return null;
  return GAME_TIMELINES[gameName.toLowerCase().trim()] || null;
}
