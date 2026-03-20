import { useState, useRef, useEffect } from 'react';
import PokemonCard from './PokemonCard';

export default function SoloPairRow({ route, playerName, onOpenReassign }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const mons = route.pokemon || [];
  const anyDead = mons.some(m => m.alive === false || (m.currentHP ?? m.current_hp ?? 1) === 0);

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
        <span className="route-name">{route.locationName || `Location ${route.locationId}`}</span>
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
                {onOpenReassign && (
                  <button
                    className="route-menu-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onOpenReassign(route.locationId);
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
