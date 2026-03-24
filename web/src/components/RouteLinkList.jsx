import { useState, useRef, useEffect } from 'react';
import useSprite from '../hooks/useSprite';
import { getProgression, sortRoutesWithDividers } from '../data/routeProgression';

const STATUS_CONFIG = {
  team:   { label: 'Team',   color: '#34d399', dot: '#34d399' },
  box:    { label: 'Box',    color: '#60a5fa', dot: '#3b82f6' },
  fallen: { label: 'Fallen', color: '#fca5a5', dot: '#ef4444' },
};

function getMonStatus(mon) {
  if (!mon) return null;
  const alive = mon.alive !== undefined ? mon.alive : true;
  if (!alive) return 'fallen';
  const inParty = mon.in_party ?? mon.inParty ?? true;
  if (inParty) return 'team';
  return 'box';
}

function SpriteCell({ species }) {
  const img = useSprite(species);
  if (!species) return <div className="et-mini-sprite-fb">--</div>;
  return img
    ? <img className="et-mini-sprite" src={img} alt={species} title={species} loading="lazy" />
    : <div className="et-mini-sprite-fb">?</div>;
}

function StatusDot({ status }) {
  if (!status) return null;
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;
  return (
    <span className="et-status-inline" style={{ color: cfg.color }}>
      <span className="et-dot" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

export default function RouteLinkList({ links, players }) {
  const [search, setSearch] = useState('');
  const bodyRef = useRef(null);

  const count = links?.length || 0;
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [count]);

  if (!links || links.length === 0) return null;

  const pids = (players || []).map(p => p.player_id || p);

  const filtered = search.trim()
    ? links.filter(link => {
        const q = search.toLowerCase();
        const routeMatch = (link.routeName || '').toLowerCase().includes(q);
        const monMatch = pids.some(pid => {
          const mon = link.pokemon?.[pid];
          if (!mon) return false;
          const sp = (mon.species_name || mon.species || '').toLowerCase();
          const nn = (mon.nickname || '').toLowerCase();
          return sp.includes(q) || nn.includes(q);
        });
        return routeMatch || monMatch;
      })
    : links;

  return (
    <div className="et-wrap">
      <div className="et glass-card">
        <div className="et-toolbar">
          <input
            className="et-search"
            type="text"
            placeholder="Search encounters..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="et-legend">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <span key={key} className="et-legend-item">
                <span className="et-dot" style={{ background: cfg.dot }} />
                {cfg.label}
              </span>
            ))}
          </div>
        </div>

        <div className="et-head-row">
          <div className="et-col et-col-origin et-hdr">Origin</div>
          {(players || []).map(p => (
            <div key={p.player_id || p} className="et-col et-col-player et-hdr">
              {p.player_name || p}
            </div>
          ))}
        </div>

        <div className="et-body" ref={bodyRef}>
          {filtered.map((link, idx) => {
            const anyDead = pids.some(pid => getMonStatus(link.pokemon?.[pid]) === 'fallen');

            return (
              <div key={link.route} className={`et-row ${anyDead ? 'et-row-dead' : ''} ${idx % 2 === 1 ? 'et-row-alt' : ''}`}>
                <div className="et-col et-col-origin">{link.routeName || `Loc ${link.route}`}</div>
                {pids.map(pid => {
                  const mon = link.pokemon?.[pid];
                  const species = mon?.species_name || mon?.species || '';
                  const nickname = mon?.nickname || '';
                  const status = getMonStatus(mon);
                  return (
                    <div key={pid} className="et-col et-col-player">
                      <SpriteCell species={species} />
                      <div className="et-player-info">
                        <span className="et-player-nick">{nickname || <span className="et-empty">--</span>}</span>
                        <StatusDot status={status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="et-row et-row-empty">No matches found</div>
          )}
          <div className="et-row et-row-incoming">
            <div className="et-col et-col-origin et-incoming-label">···</div>
            {pids.map(pid => (
              <div key={pid} className="et-col et-col-player et-incoming-slot" />
            ))}
          </div>
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
          <div className="et-col et-col-origin et-hdr">Route</div>
          <div className="et-col et-col-player et-hdr">Pokemon</div>
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
            const species = mon?.species_name || mon?.species || '';
            const nickname = mon?.nickname || '';
            const status = getMonStatus(mon);
            const isDead = status === 'fallen';
            const alt = rowIdx++ % 2 === 1;
            return (
              <div key={route.locationId} className={`et-row ${isDead ? 'et-row-dead' : ''} ${alt ? 'et-row-alt' : ''}`}>
                <div className="et-col et-col-origin">{route.locationName || `Loc ${route.locationId}`}</div>
                <div className="et-col et-col-player">
                  <SpriteCell species={species} />
                  <div className="et-player-info">
                    <span className="et-player-nick">{nickname || <span className="et-empty">--</span>}</span>
                    <StatusDot status={status} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
