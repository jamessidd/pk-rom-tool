import usePokemonData from '../hooks/usePokemonData';
import TypeBadge from './TypeBadge';

function hpColor(ratio) {
  if (ratio > 0.5) return '#34d399';
  if (ratio > 0.25) return '#fbbf24';
  return '#ef4444';
}

function statColor(value) {
  if (value >= 150) return '#00c2b8';
  if (value >= 120) return '#23cd5e';
  if (value >= 90)  return '#a0e515';
  if (value >= 60)  return '#ffdd57';
  if (value >= 30)  return '#ff7f0f';
  return '#f34444';
}

const STATUS_META = {
  Poisoned:  { label: 'PSN', cls: 'pc-status-psn' },
  Toxic:     { label: 'TOX', cls: 'pc-status-tox' },
  Burned:    { label: 'BRN', cls: 'pc-status-brn' },
  Paralyzed: { label: 'PAR', cls: 'pc-status-par' },
  Asleep:    { label: 'SLP', cls: 'pc-status-slp' },
  Frozen:    { label: 'FRZ', cls: 'pc-status-frz' },
};

export default function PartyCard({ mon, routeName }) {
  const species    = mon.species_name || mon.species || '';
  const { sprite: img, baseStats } = usePokemonData(species);
  const nickname   = mon.nickname || species || '???';
  const level      = mon.level || 0;
  const hp         = mon.current_hp ?? mon.currentHP ?? 0;
  const maxHp      = mon.max_hp ?? mon.maxHP ?? 0;
  const types      = mon.types || [];
  const alive      = mon.alive !== undefined ? mon.alive : hp > 0;
  const hasHp      = maxHp > 0;
  const nature     = mon.nature;
  const heldItem   = mon.held_item || mon.heldItem;
  const friendship = mon.friendship;
  const hpRatio    = maxHp > 0 ? hp / maxHp : 0;
  const route      = routeName || mon.met_location_name || mon.metLocationName || mon.route_name || mon.routeName || '';
  const statusRaw  = mon.status;
  const statusInfo = statusRaw && statusRaw !== 'Healthy' ? STATUS_META[statusRaw] : null;

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
            {statusInfo && <span className={`pc-status ${statusInfo.cls}`}>{statusInfo.label}</span>}
          </div>
          {alive && hasHp && (
            <div className="pc-hp-row">
              <div className="pc-hp-track">
                <div className="pc-hp-fill" style={{ width: `${hpRatio * 100}%`, background: hpColor(hpRatio) }} />
              </div>
              <span className="pc-hp-val">{hp}/{maxHp}</span>
            </div>
          )}
          {!alive && <div className="pc-fallen">FALLEN</div>}
          {friendship !== undefined && friendship !== null && (
            <div className="pc-friend-row">
              <span className="pc-friend-label">Friendship</span>
              <div className="pc-friend-track">
                <div className="pc-friend-fill" style={{ width: `${Math.min(100, (friendship / 255) * 100)}%` }} />
              </div>
              <span className="pc-friend-val">{friendship}</span>
            </div>
          )}
        </div>
        <div className="pc-sprite-col">
          {img ? (
            <img className="pc-sprite" src={img} alt={species} loading="lazy"
              onError={e => { e.currentTarget.style.display = 'none'; }} />
          ) : (
            <div className="pc-sprite-fb">?</div>
          )}
          {heldItem && heldItem !== 'None' && (
            <div className="pc-held-item" title={heldItem}>{heldItem}</div>
          )}
        </div>
      </div>

      {baseStats && <BaseStatChart stats={baseStats} />}
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

const BST_MAX = 255;

function BaseStatChart({ stats }) {
  const rows = [
    ['HP',  stats.hp],
    ['ATK', stats.attack],
    ['DEF', stats.defense],
    ['SPA', stats.specialAttack],
    ['SPD', stats.specialDefense],
    ['SPE', stats.speed],
  ];

  return (
    <div className="bst">
      <div className="bst-title">Base Stats <span className="bst-total">{stats.total}</span></div>
      {rows.map(([label, val]) => (
        <div key={label} className="bst-row">
          <span className="bst-label">{label}</span>
          <span className="bst-val">{val}</span>
          <div className="bst-track">
            <div
              className="bst-fill"
              style={{
                width: `${Math.min(100, (val / BST_MAX) * 100)}%`,
                background: statColor(val),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
