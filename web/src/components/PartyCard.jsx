import { Fragment } from 'react';
import useSprite from '../hooks/useSprite';
import TypeBadge from './TypeBadge';

function hpColor(ratio) {
  if (ratio > 0.5) return '#34d399';
  if (ratio > 0.25) return '#fbbf24';
  return '#ef4444';
}

export default function PartyCard({ mon, routeName }) {
  const species  = mon.species_name || mon.species || '';
  const img = useSprite(species);
  const nickname = mon.nickname || species || '???';
  const level    = mon.level || 0;
  const hp       = mon.current_hp ?? mon.currentHP ?? 0;
  const maxHp    = mon.max_hp ?? mon.maxHP ?? 0;
  const types    = mon.types || [];
  const alive    = mon.alive !== undefined ? mon.alive : hp > 0;
  const hasHp    = maxHp > 0;
  const ivs      = mon.ivs || mon.IVs;
  const evs      = mon.evs || mon.EVs;
  const nature   = mon.nature;
  const heldItem = mon.held_item || mon.heldItem;
  const hpRatio  = maxHp > 0 ? hp / maxHp : 0;
  const route    = routeName || mon.met_location_name || mon.metLocationName || mon.route_name || mon.routeName || '';

  return (
    <div className={`pc ${alive ? '' : 'pc-dead'}`}>
      <div className="pc-top">
        {route && <span className="pc-route-badge">{route}</span>}
        <span className="pc-level">Lv.{level}</span>
      </div>
      <div className="pc-body">
        <div className="pc-info">
          <div className="pc-name-row">
            <span className="pc-nickname">{nickname}</span>
            {mon.isShiny && <span className="pc-shiny">&#9733;</span>}
          </div>
          {species !== nickname && <div className="pc-species">{species}</div>}
          <div className="pc-chips">
            {types.map(t => <TypeBadge key={t} type={t} />)}
            {nature && <span className="pc-nature">{nature}</span>}
          </div>
          {alive && hasHp && (
            <div className="pc-hp-wrap">
              <div className="pc-hp-bar" style={{ width: `${hpRatio * 100}%`, background: hpColor(hpRatio) }} />
              <span className="pc-hp-text">{hp}/{maxHp}</span>
            </div>
          )}
          {!alive && <div className="pc-fallen">FALLEN</div>}
        </div>
        <div className="pc-sprite-col">
          {img ? (
            <img className="pc-sprite" src={img} alt={species} loading="lazy"
              onError={e => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <div className="pc-sprite-fb">?</div>
          )}
        </div>
      </div>

      {heldItem && <div className="pc-item">Item: {heldItem}</div>}

      {(ivs || evs) && (
        <div className="pc-stats">
          <StatTable ivs={ivs} evs={evs} />
        </div>
      )}
    </div>
  );
}

export function EmptySlot() {
  return (
    <div className="pc pc-empty">
      <div className="pc-empty-inner">Empty</div>
    </div>
  );
}

function StatTable({ ivs, evs }) {
  const stats = [
    ['HP',  ivs?.hp,  evs?.hp],
    ['ATK', ivs?.attack, evs?.attack],
    ['DEF', ivs?.defense, evs?.defense],
    ['SPA', ivs?.specialAttack, evs?.specialAttack],
    ['SPD', ivs?.specialDefense, evs?.specialDefense],
    ['SPE', ivs?.speed, evs?.speed],
  ];
  const row1 = stats.slice(0, 3);
  const row2 = stats.slice(3);

  return (
    <table className="pc-stat-table">
      <thead>
        <tr>
          {row1.map(([label]) => (
            <th key={label} colSpan={2}>{label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr className="pc-stat-vals">
          {row1.map(([label, iv, ev]) => (
            <Fragment key={label}>
              <td className={iv === 31 ? 'iv-perfect' : 'iv'}>{iv ?? '-'}</td>
              <td className={ev > 0 ? 'ev-active' : 'ev'}>{ev ?? '-'}</td>
            </Fragment>
          ))}
        </tr>
        <tr className="pc-stat-hdr">
          {row2.map(([label]) => (
            <th key={label} colSpan={2}>{label}</th>
          ))}
        </tr>
        <tr className="pc-stat-vals">
          {row2.map(([label, iv, ev]) => (
            <Fragment key={label}>
              <td className={iv === 31 ? 'iv-perfect' : 'iv'}>{iv ?? '-'}</td>
              <td className={ev > 0 ? 'ev-active' : 'ev'}>{ev ?? '-'}</td>
            </Fragment>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

