import { useState, useRef, useEffect } from 'react';
import PokemonCard from './PokemonCard';

export default function RoutePairRow({ pair, players, onUndoDeath, onMarkDead, onOpenReassign }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const pokemon = pair.pokemon || {};
  const anyDead = Object.values(pokemon).some(m => m.alive === false);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  return (
    <div className={`route-row ${anyDead ? 'route-dead' : 'route-alive'}`}>
      <div className="route-label">
        <span className="route-name">{pair.route_name || `Location ${pair.route}`}</span>
        <div className="route-actions">
          {anyDead && <span className="route-fallen-tag">FALLEN</span>}
          <div className="route-menu-wrap" ref={menuRef}>
            <button
              className="route-menu-btn"
              onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
              title="Actions"
            >
              &#8942;
            </button>
            {menuOpen && (
              <div className="route-menu">
                {anyDead && onUndoDeath && (
                  <button
                    className="route-menu-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onUndoDeath(pair.route);
                    }}
                  >
                    Undo Faint
                  </button>
                )}
                {!anyDead && onMarkDead && (
                  <button
                    className="route-menu-item route-menu-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      if (window.confirm(`Mark all Pokemon on ${pair.route_name || `Location ${pair.route}`} as fallen?`)) {
                        onMarkDead(pair.route);
                      }
                    }}
                  >
                    Mark Dead
                  </button>
                )}
                {onOpenReassign && (
                  <button
                    className="route-menu-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onOpenReassign(pair.route);
                    }}
                  >
                    Reassign Pokemon
                  </button>
                )}
                <button className="route-menu-item route-menu-disabled" disabled>
                  Dupes Clause
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="route-cards">
        {(players || []).map(p => {
          const mon = pokemon[p.player_id || p];
          if (!mon) {
            return (
              <div key={p.player_id || p} className="poke-card waiting">
                <div className="poke-owner">{p.player_name || p}</div>
                <div className="poke-waiting">Waiting for catch...</div>
              </div>
            );
          }
          return (
            <PokemonCard
              key={mon.personality || mon.id}
              mon={mon}
              playerName={mon.player_name || p.player_name || p}
              dead={anyDead}
            />
          );
        })}
      </div>
    </div>
  );
}
