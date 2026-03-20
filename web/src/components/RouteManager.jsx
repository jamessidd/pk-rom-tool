import useSprite from '../hooks/useSprite';

export default function RouteManager({ routes, allCatches, assignments, onAssign, onClose, focusRoute }) {
  const assignedPersonalities = new Set(Object.values(assignments));

  const routeGroups = routes.map(route => {
    const routeId = route.locationId ?? route.route ?? route.route_id;
    const routeName = route.locationName || route.route_name || `Location ${routeId}`;
    const assignedPersonality = assignments[String(routeId)] ?? assignments[routeId];

    const routeCatches = allCatches.filter(m => {
      const metLoc = m.metLocation ?? m.met_location ?? m.route;
      return Number(metLoc) === Number(routeId);
    });

    const assigned = routeCatches.find(m => m.personality === assignedPersonality) || routeCatches[0] || null;
    const alternatives = routeCatches.filter(m => m !== assigned);

    return { routeId, routeName, assigned, alternatives };
  });

  const unassigned = allCatches.filter(m => !assignedPersonalities.has(m.personality));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Route Assignments</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          {routeGroups.map(({ routeId, routeName, assigned, alternatives }) => (
            <div
              key={routeId}
              className={`rm-route ${focusRoute === routeId ? 'rm-route-focus' : ''}`}
            >
              <div className="rm-route-header">{routeName}</div>
              {assigned && (
                <MiniMonRow mon={assigned} tag="ASSIGNED" />
              )}
              {!assigned && (
                <div className="rm-empty">No Pokemon assigned</div>
              )}
              {alternatives.map(m => (
                <MiniMonRow
                  key={m.personality}
                  mon={m}
                  tag="available"
                  action={
                    <button
                      className="rm-assign-btn"
                      onClick={() => onAssign(routeId, m.personality)}
                    >
                      Assign
                    </button>
                  }
                />
              ))}
            </div>
          ))}

          {unassigned.length > 0 && (
            <div className="rm-route">
              <div className="rm-route-header">Unassigned Pokemon</div>
              {unassigned.map(m => {
                const metLoc = m.metLocation ?? m.met_location ?? m.route;
                const metName = m.metLocationName || m.met_location_name || m.route_name || `Loc ${metLoc}`;
                return (
                  <MiniMonRow
                    key={m.personality}
                    mon={m}
                    tag={`from ${metName}`}
                    action={
                      <button
                        className="rm-assign-btn"
                        onClick={() => onAssign(metLoc, m.personality)}
                      >
                        Assign
                      </button>
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniMonRow({ mon, tag, action }) {
  const species = mon.species_name || mon.species || '';
  const name = mon.nickname || species || '???';
  const img = useSprite(species);

  return (
    <div className="rm-mon-row">
      <div className="rm-mon-sprite-wrap">
        {img ? (
          <img className="rm-mon-sprite" src={img} alt={species} loading="lazy" />
        ) : (
          <div className="rm-mon-sprite-fallback">?</div>
        )}
      </div>
      <div className="rm-mon-info">
        <span className="rm-mon-name">{name}</span>
        <span className="rm-mon-level">Lv. {mon.level || 0}</span>
      </div>
      {tag && <span className={`rm-tag ${tag === 'ASSIGNED' ? 'rm-tag-assigned' : 'rm-tag-alt'}`}>{tag}</span>}
      {action && <div className="rm-mon-action">{action}</div>}
    </div>
  );
}
