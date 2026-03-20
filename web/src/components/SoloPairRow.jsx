import PokemonCard from './PokemonCard';

export default function SoloPairRow({ route, playerName }) {
  const mons = route.pokemon || [];
  const anyDead = mons.some(m => m.alive === false || (m.currentHP ?? m.current_hp ?? 1) === 0);

  return (
    <div className={`route-row ${anyDead ? 'route-dead' : 'route-alive'}`}>
      <div className="route-label">
        <span className="route-name">{route.locationName || `Location ${route.locationId}`}</span>
        {anyDead && <span className="route-fallen-tag">FALLEN</span>}
      </div>
      <div className="route-cards">
        {mons.map(mon => (
          <PokemonCard
            key={mon.personality}
            mon={mon}
            playerName={playerName}
            dead={anyDead}
          />
        ))}
      </div>
    </div>
  );
}
