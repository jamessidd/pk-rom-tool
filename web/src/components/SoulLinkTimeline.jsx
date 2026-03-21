import useSprite from '../hooks/useSprite';
import { TYPE_COLORS } from '../utils/types';

export default function SoulLinkTimeline({ timeline, encounters, gameName }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="slt">
        <div className="slt-title">Soul Link Timeline</div>
        <div className="slt-empty">No timeline data for this game.</div>
      </div>
    );
  }

  const encounterByName = new Map();
  for (const enc of (encounters || [])) {
    const name = enc.locationName || enc.route_name || '';
    if (name && !encounterByName.has(name)) {
      const mon = enc.pokemon?.[0] || enc;
      encounterByName.set(name, mon);
    }
  }

  return (
    <div className="slt">
      <div className="slt-title">
        Soul Link Timeline
        {gameName && <span className="slt-game-name">{gameName}</span>}
      </div>
      <div className="slt-list">
        {timeline.map((entry, i) => {
          if (entry.type === 'route') {
            const mon = encounterByName.get(entry.name);
            return <RouteRow key={`r-${i}`} entry={entry} mon={mon} />;
          }
          if (entry.type === 'boss') {
            return <BossRow key={`b-${i}`} entry={entry} />;
          }
          if (entry.type === 'rival') {
            return <RivalRow key={`v-${i}`} entry={entry} />;
          }
          return null;
        })}
      </div>
    </div>
  );
}

function RouteRow({ entry, mon }) {
  return (
    <div className={`slt-route ${mon ? '' : 'slt-route-empty'}`}>
      <div className="slt-route-name">{entry.name}</div>
      {mon ? <EncounterPreview mon={mon} /> : (
        <div className="slt-route-placeholder">No encounter</div>
      )}
    </div>
  );
}

function EncounterPreview({ mon }) {
  const species = mon.species_name || mon.species || '';
  const nickname = mon.nickname || species || '???';
  const img = useSprite(species);
  const alive = mon.alive !== undefined ? mon.alive : true;

  return (
    <div className={`slt-enc ${!alive ? 'slt-enc-dead' : ''}`}>
      {img ? (
        <img className="slt-enc-sprite" src={img} alt={species} loading="lazy" />
      ) : (
        <div className="slt-enc-sprite-fb">?</div>
      )}
      <div className="slt-enc-info">
        <span className="slt-enc-name">{nickname}</span>
        {species !== nickname && <span className="slt-enc-species">{species}</span>}
      </div>
      {!alive && <span className="slt-enc-tag-dead">Fallen</span>}
    </div>
  );
}

function BossRow({ entry }) {
  const color = entry.specialty ? (TYPE_COLORS[capitalize(entry.specialty)] || '#666') : 'var(--accent)';

  return (
    <div className="slt-boss" style={{ borderLeftColor: color }}>
      <div className="slt-boss-header">
        <span className="slt-boss-name">{entry.name}</span>
        {entry.specialty && (
          <span className="slt-boss-type" style={{ background: color }}>{entry.specialty}</span>
        )}
      </div>
      <div className="slt-boss-meta">
        <span className="slt-boss-loc">{entry.location}</span>
        {entry.levelCap && <span className="slt-boss-cap">Lv. Cap {entry.levelCap}</span>}
      </div>
    </div>
  );
}

function RivalRow({ entry }) {
  return (
    <div className="slt-rival">
      <span className="slt-rival-icon">VS</span>
      <div className="slt-rival-info">
        <span className="slt-rival-name">{entry.name}</span>
        <span className="slt-rival-loc">{entry.location}</span>
      </div>
    </div>
  );
}

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
