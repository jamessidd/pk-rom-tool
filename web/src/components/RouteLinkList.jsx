import useSprite from '../hooks/useSprite';

export default function RouteLinkList({ links, players }) {
  if (!links || links.length === 0) return null;

  return (
    <div className="rll">
      <div className="rll-header">Route Links</div>
      <div className="rll-rows">
        {links.map(link => (
          <div key={link.route} className={`rll-row ${link.anyDead ? 'rll-dead' : ''}`}>
            <div className="rll-route">{link.routeName || `Location ${link.route}`}</div>
            <div className="rll-mons">
              {(players || []).map(p => {
                const pid = p.player_id || p;
                const pname = p.player_name || p;
                const mon = link.pokemon?.[pid];
                if (!mon) {
                  return (
                    <div key={pid} className="rll-slot rll-empty-slot">
                      <span className="rll-pname">{pname}</span>
                      <span className="rll-waiting">--</span>
                    </div>
                  );
                }
                return <LinkEntry key={pid} mon={mon} playerName={pname} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SoloRouteLinkList({ routes }) {
  if (!routes || routes.length === 0) return null;

  return (
    <div className="rll">
      <div className="rll-header">Encounters by Route</div>
      <div className="rll-rows">
        {routes.map(route => {
          const mon = route.pokemon?.[0];
          const anyDead = (route.pokemon || []).some(m => m.alive === false || (m.currentHP ?? m.current_hp ?? 1) === 0);
          return (
            <div key={route.locationId} className={`rll-row ${anyDead ? 'rll-dead' : ''}`}>
              <div className="rll-route">{route.locationName || `Location ${route.locationId}`}</div>
              <div className="rll-mons">
                {mon ? <LinkEntry mon={mon} /> : <span className="rll-waiting">--</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LinkEntry({ mon, playerName }) {
  const species = mon.species_name || mon.species || '';
  const name = mon.nickname || species || '???';
  const img = useSprite(species);
  const alive = mon.alive !== undefined ? mon.alive : true;
  const inParty = mon.in_party ?? mon.inParty ?? true;

  return (
    <div className={`rll-slot ${!alive ? 'rll-slot-dead' : ''}`}>
      {playerName && <span className="rll-pname">{playerName}</span>}
      <div className="rll-mon">
        {img ? (
          <img className="rll-sprite" src={img} alt={species} loading="lazy" />
        ) : (
          <div className="rll-sprite-fb">?</div>
        )}
        <span className="rll-name">{name}</span>
        {!inParty && <span className="rll-box-tag">boxed</span>}
        {!alive && <span className="rll-dead-tag">fallen</span>}
      </div>
    </div>
  );
}
