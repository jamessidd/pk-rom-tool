import useSprite from '../hooks/useSprite';
import { getProgression, sortRoutesWithDividers } from '../data/routeProgression';

export default function RouteLinkList({ links, players }) {
  if (!links || links.length === 0) return null;

  return (
    <div className="et-wrap">
      <div className="et glass-card">
        <div className="et-head-row">
          <div className="et-col-route et-hdr">Route</div>
          {(players || []).map(p => (
            <div key={p.player_id || p} className="et-col-trainer et-hdr">
              {p.player_name || p}
            </div>
          ))}
        </div>
        <div className="et-body">
          {links.map((link, idx) => (
            <div key={link.route} className={`et-row ${link.anyDead ? 'et-row-dead' : ''} ${idx % 2 === 1 ? 'et-row-alt' : ''}`}>
              <div className="et-col-route">{link.routeName || `Loc ${link.route}`}</div>
              {(players || []).map(p => {
                const pid = p.player_id || p;
                const mon = link.pokemon?.[pid];
                return (
                  <div key={pid} className="et-col-trainer">
                    {mon ? <EncounterCell mon={mon} /> : <span className="et-empty">--</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SoloRouteLinkList({ routes, gameName }) {
  if (!routes || routes.length === 0) return null;

  const progression = getProgression(gameName);
  const items = sortRoutesWithDividers(routes, progression);

  let rowIdx = 0;

  return (
    <div className="et-wrap et-wrap-solo">
      <div className="et glass-card">
        <div className="et-head-row">
          <div className="et-col-route et-hdr">Route</div>
          <div className="et-col-trainer et-hdr">Pokemon</div>
          <div className="et-col-status et-hdr">Status</div>
        </div>
        <div className="et-body">
          {items.map((item, i) => {
            if (item.type === 'divider') {
              return (
                <div key={`div-${i}`} className="et-divider">
                  <span className="et-divider-label">{item.label}</span>
                </div>
              );
            }
            const route = item.route;
            const mon = route.pokemon?.[0];
            const anyDead = (route.pokemon || []).some(m => m.alive === false || (m.currentHP ?? m.current_hp ?? 1) === 0);
            const alt = rowIdx++ % 2 === 1;
            return (
              <div key={route.locationId} className={`et-row ${anyDead ? 'et-row-dead' : ''} ${alt ? 'et-row-alt' : ''}`}>
                <div className="et-col-route">{route.locationName || `Loc ${route.locationId}`}</div>
                <div className="et-col-trainer">
                  {mon ? <EncounterCell mon={mon} /> : <span className="et-empty">--</span>}
                </div>
                <div className="et-col-status">
                  {mon && (mon.alive === false ? <span className="et-tag-dead">Fallen</span>
                    : (mon.in_party ?? mon.inParty) === false ? <span className="et-tag-box">Boxed</span>
                    : <span className="et-tag-party">Party</span>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EncounterCell({ mon }) {
  const species = mon.species_name || mon.species || '';
  const nickname = mon.nickname || '';
  const img = useSprite(species);
  const alive = mon.alive !== undefined ? mon.alive : true;
  const inParty = mon.in_party ?? mon.inParty ?? true;
  const heldItem = mon.held_item || mon.heldItem;
  const hasNickname = nickname && nickname !== species;

  return (
    <div className={`et-cell ${!alive ? 'et-cell-dead' : ''}`}>
      {img ? (
        <img className="et-sprite" src={img} alt={species} loading="lazy" />
      ) : (
        <div className="et-sprite-fb">?</div>
      )}
      <div className="et-cell-info">
        <span className="et-cell-name">{species || '???'}</span>
        {hasNickname && <span className="et-cell-nick">"{nickname}"</span>}
        <div className="et-cell-tags">
          {!alive && <span className="et-tag-dead">Fallen</span>}
          {alive && inParty && <span className="et-tag-equipped">Equipped</span>}
          {alive && !inParty && <span className="et-tag-box">Boxed</span>}
          {heldItem && heldItem !== 'None' && <span className="et-tag-item">{heldItem}</span>}
        </div>
      </div>
    </div>
  );
}
