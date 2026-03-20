export const TYPE_COLORS = {
  Normal:   '#929da3',
  Fire:     '#ff9c54',
  Water:    '#4d90d5',
  Electric: '#f3d23b',
  Grass:    '#5fbd58',
  Ice:      '#73cec0',
  Fighting: '#ce4069',
  Poison:   '#ab6ac8',
  Ground:   '#d97746',
  Flying:   '#8fa8dd',
  Psychic:  '#f97176',
  Bug:      '#90c12c',
  Rock:     '#c7b78b',
  Ghost:    '#5269ac',
  Dragon:   '#0a6dc4',
  Dark:     '#5a5366',
  Steel:    '#5a8ea1',
  Fairy:    '#ec8fe6',
};

export const SPRITE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

export function spriteUrl(speciesId) {
  return speciesId > 0 ? `${SPRITE_URL}/${speciesId}.png` : null;
}
