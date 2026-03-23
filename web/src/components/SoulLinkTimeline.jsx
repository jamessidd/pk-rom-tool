import useSprite from '../hooks/useSprite';
import { TYPE_COLORS } from '../utils/types';

const TEAM_COLORS = { A: '#3b82f6', B: '#ef4444' };

function buildTeamProgress(teams, timeline) {
  if (!teams || !timeline) return null;
  const { links } = teams;
  const routeNames = new Map();
  for (const link of (links || [])) {
    const name = link.routeName || link.route_name || '';
    if (name) routeNames.set(name, link.team || '');
  }

  const teamLast = {};
  for (let i = 0; i < timeline.length; i++) {
    const entry = timeline[i];
    if (entry.type !== 'route') continue;
    const team = routeNames.get(entry.name);
    if (team) teamLast[team] = i;
  }
  return teamLast;
}

export default function SoulLinkTimeline({ timeline, encounters, gameName, teams }) {
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

  const teamProgress = buildTeamProgress(teams, timeline);

  return (
    <div className="slt">
      <div className="slt-title">
        {teams ? 'Race Timeline' : 'Soul Link Timeline'}
        {gameName && <span className="slt-game-name">{gameName}</span>}
        {teamProgress && (
          <span className="slt-team-legend">
            {Object.entries(teamProgress).map(([team]) => (
              <span key={team} className="slt-team-tag" style={{ background: TEAM_COLORS[team] || '#666' }}>
                {team}
              </span>
            ))}
          </span>
        )}
      </div>
      <div className="slt-list">
        {timeline.map((entry, i) => {
          const teamMarkers = teamProgress
            ? Object.entries(teamProgress).filter(([, idx]) => idx === i).map(([t]) => t)
            : [];
          if (entry.type === 'route') {
            const mon = encounterByName.get(entry.name);
            return <RouteRow key={`r-${i}`} entry={entry} mon={mon} teamMarkers={teamMarkers} />;
          }
          if (entry.type === 'boss') {
            return <BossRow key={`b-${i}`} entry={entry} teamMarkers={teamMarkers} />;
          }
          if (entry.type === 'rival') {
            return <RivalRow key={`v-${i}`} entry={entry} teamMarkers={teamMarkers} />;
          }
          return null;
        })}
      </div>
    </div>
  );
}

function TeamMarkers({ markers }) {
  if (!markers || markers.length === 0) return null;
  return (
    <div className="slt-team-markers">
      {markers.map(t => (
        <span key={t} className="slt-team-marker" style={{ background: TEAM_COLORS[t] || '#666' }} title={`Team ${t} is here`}>
          {t}
        </span>
      ))}
    </div>
  );
}

function RouteRow({ entry, mon, teamMarkers }) {
  const hasMarker = teamMarkers && teamMarkers.length > 0;
  return (
    <div className={`slt-route ${mon ? '' : 'slt-route-empty'} ${hasMarker ? 'slt-route-marked' : ''}`}>
      <TeamMarkers markers={teamMarkers} />
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

function BossRow({ entry, teamMarkers }) {
  const color = entry.specialty ? (TYPE_COLORS[capitalize(entry.specialty)] || '#666') : 'var(--accent)';
  const hasMarker = teamMarkers && teamMarkers.length > 0;

  return (
    <div className={`slt-boss ${hasMarker ? 'slt-route-marked' : ''}`} style={{ borderLeftColor: color }}>
      <TeamMarkers markers={teamMarkers} />
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

function RivalRow({ entry, teamMarkers }) {
  const hasMarker = teamMarkers && teamMarkers.length > 0;
  return (
    <div className={`slt-rival ${hasMarker ? 'slt-route-marked' : ''}`}>
      <TeamMarkers markers={teamMarkers} />
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
