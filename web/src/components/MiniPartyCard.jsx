import usePokemonData from '../hooks/usePokemonData';
import TypeBadge from './TypeBadge';
import { TYPE_COLORS } from '../utils/types';

function hpColor(ratio) {
  if (ratio > 0.5) return '#34d399';
  if (ratio > 0.25) return '#fbbf24';
  return '#ef4444';
}

function typeGrad(types) {
  if (!types || types.length === 0) return 'rgba(255,255,255,0.04)';
  const c1 = TYPE_COLORS[types[0]] || '#666';
  if (types.length === 1) return `linear-gradient(135deg, ${c1}30, ${c1}10)`;
  const c2 = TYPE_COLORS[types[1]] || '#666';
  return `linear-gradient(135deg, ${c1}30, ${c2}30)`;
}

export default function MiniPartyCard({ mon }) {
  const species = mon.species_name || mon.species || '';
  const { sprite: img } = usePokemonData(species);
  const nickname = mon.nickname || species || '???';
  const level = mon.level || 0;
  const hp = mon.current_hp ?? mon.currentHP ?? 0;
  const maxHp = mon.max_hp ?? mon.maxHP ?? 0;
  const types = mon.types || [];
  const alive = mon.alive !== undefined ? mon.alive : hp > 0;
  const hpRatio = maxHp > 0 ? hp / maxHp : 0;
  const route = mon.met_location_name || mon.metLocationName || mon.route_name || mon.routeName || '';

  return (
    <div className={`mpc ${alive ? '' : 'mpc-dead'}`} style={{ background: typeGrad(types) }}>
      <div className="mpc-sprite-wrap">
        {img ? (
          <img className="mpc-sprite" src={img} alt={species} loading="lazy"
            onError={e => { e.currentTarget.style.display = 'none'; }} />
        ) : (
          <div className="mpc-sprite-fb">?</div>
        )}
      </div>
      <div className="mpc-info">
        <div className="mpc-top-row">
          <span className="mpc-nick">{nickname}</span>
          <span className="mpc-lv">Lv{level}</span>
        </div>
        <div className="mpc-types">
          {types.map(t => <TypeBadge key={t} type={t} />)}
        </div>
        {alive && maxHp > 0 && (
          <div className="mpc-hp">
            <div className="mpc-hp-track">
              <div className="mpc-hp-fill" style={{ width: `${hpRatio * 100}%`, background: hpColor(hpRatio) }} />
            </div>
          </div>
        )}
        {!alive && <div className="mpc-fallen">FALLEN</div>}
        {route && <div className="mpc-route">{route}</div>}
      </div>
    </div>
  );
}

export function MiniEmptySlot() {
  return <div className="mpc mpc-empty" />;
}
