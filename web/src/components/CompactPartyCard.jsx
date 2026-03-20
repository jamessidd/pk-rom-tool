import usePokemonData from '../hooks/usePokemonData';
import TypeBadge from './TypeBadge';
import { TYPE_COLORS } from '../utils/types';

function hpColor(ratio) {
  if (ratio > 0.5) return '#34d399';
  if (ratio > 0.25) return '#fbbf24';
  return '#ef4444';
}

function typeGradient(types) {
  if (!types || types.length === 0) return 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))';
  const c1 = TYPE_COLORS[types[0]] || '#666';
  if (types.length === 1) return `linear-gradient(135deg, ${c1}55, ${c1}18)`;
  const c2 = TYPE_COLORS[types[1]] || '#666';
  return `linear-gradient(135deg, ${c1}55, ${c2}55)`;
}

const STATUS_META = {
  Poisoned:  { label: 'PSN', cls: 'pc-status-psn' },
  Toxic:     { label: 'TOX', cls: 'pc-status-tox' },
  Burned:    { label: 'BRN', cls: 'pc-status-brn' },
  Paralyzed: { label: 'PAR', cls: 'pc-status-par' },
  Asleep:    { label: 'SLP', cls: 'pc-status-slp' },
  Frozen:    { label: 'FRZ', cls: 'pc-status-frz' },
};

export default function CompactPartyCard({ mon }) {
  const species    = mon.species_name || mon.species || '';
  const { sprite: img } = usePokemonData(species);
  const nickname   = mon.nickname || species || '???';
  const level      = mon.level || 0;
  const hp         = mon.current_hp ?? mon.currentHP ?? 0;
  const maxHp      = mon.max_hp ?? mon.maxHP ?? 0;
  const types      = mon.types || [];
  const alive      = mon.alive !== undefined ? mon.alive : hp > 0;
  const hasHp      = maxHp > 0;
  const nature     = mon.nature;
  const hpRatio    = maxHp > 0 ? hp / maxHp : 0;
  const statusRaw  = mon.status;
  const statusInfo = statusRaw && statusRaw !== 'Healthy' ? STATUS_META[statusRaw] : null;

  return (
    <div className={`cpc ${alive ? '' : 'cpc-dead'}`}>
      <div className="cpc-header" style={{ background: typeGradient(types) }}>
        <span className="cpc-level">{level}</span>
        <div className="cpc-sprite-anchor">
          {img ? (
            <img className="cpc-sprite" src={img} alt={species} loading="lazy"
              onError={e => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <div className="cpc-sprite-fb">?</div>
          )}
        </div>
      </div>
      <div className="cpc-body">
        <div className="cpc-name">{nickname}</div>
        {species !== nickname && <div className="cpc-species">{species}</div>}
        <div className="cpc-chips">
          {types.map(t => <TypeBadge key={t} type={t} />)}
          {nature && <span className="pc-nature">{nature}</span>}
          {statusInfo && <span className={`pc-status ${statusInfo.cls}`}>{statusInfo.label}</span>}
        </div>
        {alive && hasHp && (
          <div className="cpc-hp-row">
            <div className="cpc-hp-track">
              <div className="cpc-hp-fill" style={{ width: `${hpRatio * 100}%`, background: hpColor(hpRatio) }} />
            </div>
            <span className="cpc-hp-val">{hp}/{maxHp}</span>
          </div>
        )}
        {!alive && <div className="pc-fallen">FALLEN</div>}
      </div>
    </div>
  );
}

export function CompactEmptySlot() {
  return (
    <div className="cpc cpc-empty">
      <div className="pc-empty-inner">Empty</div>
    </div>
  );
}
