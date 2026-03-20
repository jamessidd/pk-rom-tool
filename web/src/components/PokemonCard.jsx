import { useState } from 'react';
import { spriteUrl } from '../utils/types';
import TypeBadge from './TypeBadge';

export default function PokemonCard({ mon, playerName, dead }) {
  const [expanded, setExpanded] = useState(false);
  const img = spriteUrl(mon.species_id || mon.speciesId);
  const nickname = mon.nickname || mon.species_name || mon.species || '???';
  const species  = mon.species_name || mon.species || '';
  const level    = mon.level || 0;
  const hp       = mon.current_hp ?? mon.currentHP ?? 0;
  const maxHp    = mon.max_hp ?? mon.maxHP ?? 0;
  const types    = mon.types || [];
  const alive    = dead === true ? false : (mon.alive !== undefined ? mon.alive : hp > 0);

  return (
    <div className={`poke-card ${alive ? '' : 'dead'}`} onClick={() => setExpanded(e => !e)}>
      <div className="poke-owner">{playerName}</div>
      <div className="poke-visual">
        {img && <img className="poke-sprite" src={img} alt={species} loading="lazy" />}
        <div className="poke-info">
          <div className="poke-nickname">{nickname}</div>
          <div className="poke-species">{species}</div>
          <div className="poke-types">
            {types.map(t => <TypeBadge key={t} type={t} />)}
          </div>
          <div className="poke-level">Lv. {level}</div>
          {alive && (
            <div className="hp-bar-wrap">
              <div className="hp-bar" style={{ width: `${maxHp > 0 ? (hp / maxHp) * 100 : 0}%` }} />
              <span className="hp-text">{hp}/{maxHp}</span>
            </div>
          )}
          {!alive && <div className="poke-dead-label">FALLEN</div>}
        </div>
      </div>
      {expanded && (
        <div className="poke-details">
          <Detail label="Met" value={mon.met_location_name || mon.metLocationName || `Loc ${mon.met_location ?? mon.metLocation ?? '?'}`} />
          <Detail label="Met Lv" value={mon.met_level ?? mon.metLevel ?? '?'} />
          {mon.nature && <Detail label="Nature" value={mon.nature} />}
          {mon.isShiny && <Detail label="Shiny" value="Yes" />}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return <div className="poke-detail"><span className="detail-label">{label}</span> {String(value)}</div>;
}
