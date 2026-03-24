import { useRef, useEffect } from 'react';
import useSprite from '../hooks/useSprite';
import { TYPE_COLORS } from '../utils/types';

const DEFAULT_TEAM_COLORS = { A: '#3b82f6', B: '#ef4444' };

function getTeamColors(myTeam) {
  const enemy = myTeam === 'A' ? 'B' : 'A';
  return { [myTeam]: '#3b82f6', [enemy]: '#ef4444' };
}

function buildTeamProgress(teams, timeline) {
  if (!teams || !timeline) return null;
  const { links } = teams;
  const routeTeams = new Map();
  for (const link of (links || [])) {
    const name = link.routeName || link.route_name || '';
    if (name) {
      const existing = routeTeams.get(name) || new Set();
      existing.add(link.team || '');
      routeTeams.set(name, existing);
    }
  }

  const teamLast = {};
  for (let i = 0; i < timeline.length; i++) {
    const entry = timeline[i];
    if (entry.type !== 'route') continue;
    const routeTeamSet = routeTeams.get(entry.name);
    if (routeTeamSet) {
      for (const t of routeTeamSet) {
        if (t) teamLast[t] = i;
      }
    }
  }
  return teamLast;
}

export default function SoulLinkTimeline({ timeline, encounters, gameName, teams, battlesByTeam, myTeam }) {
  const TEAM_COLORS = myTeam ? getTeamColors(myTeam) : DEFAULT_TEAM_COLORS;
  const listRef = useRef(null);
  const prevProgressKey = useRef('');

  if (!timeline || timeline.length === 0) {
    return (
      <div className="slt">
        <div className="slt-header-block">
          <div className="slt-title">Soul Link Timeline</div>
        </div>
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

  const isRace = !!teams;
  const teamProgress = buildTeamProgress(teams, timeline);
  const allTeams = teamProgress ? Object.keys(teamProgress).sort() : [];

  const lastEncIdx = (() => {
    let last = -1;
    for (let i = 0; i < timeline.length; i++) {
      if (timeline[i].type === 'route' && encounterByName.has(timeline[i].name)) last = i;
    }
    return last;
  })();
  const progressKey = isRace
    ? allTeams.map(t => `${t}:${teamProgress[t] ?? -1}`).join(',')
    : `solo:${lastEncIdx}`;
  useEffect(() => {
    if (!listRef.current || progressKey === prevProgressKey.current) return;
    prevProgressKey.current = progressKey;
    requestAnimationFrame(() => {
      let targetRow;
      if (isRace) {
        const dots = listRef.current?.querySelectorAll('.slt-progress-dot');
        if (dots?.length > 0) {
          targetRow = dots[dots.length - 1].closest('.slt-route, .slt-boss, .slt-rival');
        }
      } else {
        const rows = listRef.current?.querySelectorAll('.slt-route:not(.slt-route-empty)');
        if (rows?.length > 0) targetRow = rows[rows.length - 1];
      }
      if (!targetRow) return;
      const container = listRef.current.closest('.col-timeline') || listRef.current.parentElement;
      if (container && container.scrollHeight > container.clientHeight) {
        const rowTop = targetRow.offsetTop - listRef.current.offsetTop;
        const scrollTo = rowTop - container.clientHeight / 2 + targetRow.clientHeight / 2;
        container.scrollTo({ top: Math.max(0, scrollTo), behavior: 'smooth' });
      }
    });
  }, [progressKey]);
  const teamBattleIdx = {};
  if (battlesByTeam && teamProgress) {
    for (const team of Object.keys(battlesByTeam)) {
      const lastRoute = teamProgress[team];
      if (lastRoute !== undefined) {
        for (let i = lastRoute + 1; i < timeline.length; i++) {
          if (timeline[i].type === 'boss' || timeline[i].type === 'rival') {
            teamBattleIdx[team] = i;
            break;
          }
        }
        if (teamBattleIdx[team] === undefined) {
          teamBattleIdx[team] = lastRoute;
        }
      }
    }
  }

  return (
    <div className="slt">
      <div className="slt-header-block">
        <div className="slt-title">{isRace ? 'Race Timeline' : 'Soul Link Timeline'}</div>
        {gameName && <div className="slt-game-label">{gameName}</div>}
        {isRace && allTeams.length > 0 && (
          <div className="slt-team-legend">
            {allTeams.map(team => (
              <span key={team} className="slt-team-tag" style={{ background: TEAM_COLORS[team] || '#666' }}>
                {teams?.teamNames?.[team] || `Team ${team}`}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="slt-list" ref={listRef}>
        {timeline.map((entry, i) => {
          const teamMarkersHere = allTeams.filter(t => teamProgress[t] === i);
          const teamLineState = {};
          for (const t of allTeams) {
            const prog = teamProgress[t];
            const battleAt = teamBattleIdx[t];
            if (prog === undefined) {
              teamLineState[t] = 'none';
            } else if (i <= prog) {
              teamLineState[t] = 'passed';
            } else if (battleAt !== undefined && i === battleAt) {
              teamLineState[t] = 'battle';
            } else {
              teamLineState[t] = 'ahead';
            }
          }

          const isBattleHighlight = allTeams.some(t => teamBattleIdx[t] === i && battlesByTeam?.[t]);

          const myPassed = myTeam && teamLineState[myTeam] === 'passed';

          if (entry.type === 'route') {
            const mon = encounterByName.get(entry.name);
            return (
              <RouteRow
                key={`r-${i}`}
                entry={entry}
                mon={mon}
                teamMarkers={teamMarkersHere}
                teamLineState={teamLineState}
                allTeams={allTeams}
                isBattleHighlight={isBattleHighlight}
                isRace={isRace}
                teamColors={TEAM_COLORS}
                passed={myPassed}
              />
            );
          }
          if (entry.type === 'boss') {
            return (
              <BossRow
                key={`b-${i}`}
                entry={entry}
                teamMarkers={teamMarkersHere}
                teamLineState={teamLineState}
                allTeams={allTeams}
                isBattleHighlight={isBattleHighlight}
                isRace={isRace}
                teamColors={TEAM_COLORS}
                passed={myPassed}
              />
            );
          }
          if (entry.type === 'rival') {
            return (
              <RivalRow
                key={`v-${i}`}
                entry={entry}
                teamMarkers={teamMarkersHere}
                teamLineState={teamLineState}
                allTeams={allTeams}
                isBattleHighlight={isBattleHighlight}
                isRace={isRace}
                teamColors={TEAM_COLORS}
                passed={myPassed}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

function TeamProgressLines({ teamLineState, allTeams, markers, teamColors }) {
  if (!allTeams || allTeams.length === 0) return null;
  return (
    <div className="slt-progress-lines">
      {allTeams.map(t => {
        const state = teamLineState[t];
        const color = (teamColors || DEFAULT_TEAM_COLORS)[t] || '#666';
        const isMarker = markers.includes(t);
        return (
          <div key={t} className="slt-progress-lane">
            <div
              className={`slt-progress-bar slt-progress-${state} ${isMarker ? 'slt-progress-current' : ''}`}
              style={{ '--team-color': color }}
            />
            {isMarker && (
              <div className="slt-progress-dot" style={{ background: color }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function RouteRow({ entry, mon, teamMarkers, teamLineState, allTeams, isBattleHighlight, isRace, teamColors, passed }) {
  return (
    <div className={`slt-route ${mon ? '' : 'slt-route-empty'} ${isBattleHighlight ? 'slt-battle-active' : ''} ${passed ? 'slt-passed' : ''}`}>
      {isRace && <TeamProgressLines teamLineState={teamLineState} allTeams={allTeams} markers={teamMarkers} teamColors={teamColors} />}
      <div className="slt-route-content">
        <div className="slt-route-name">{entry.name}</div>
        {mon ? <EncounterPreview mon={mon} /> : (
          <div className="slt-route-placeholder">No encounter</div>
        )}
      </div>
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

function BossRow({ entry, teamMarkers, teamLineState, allTeams, isBattleHighlight, isRace, teamColors, passed }) {
  const color = entry.specialty ? (TYPE_COLORS[capitalize(entry.specialty)] || '#666') : 'var(--accent)';

  return (
    <div className={`slt-boss ${isBattleHighlight ? 'slt-battle-active' : ''} ${passed ? 'slt-passed' : ''}`} style={{ borderLeftColor: isRace ? 'transparent' : color }}>
      {isRace && <TeamProgressLines teamLineState={teamLineState} allTeams={allTeams} markers={teamMarkers} teamColors={teamColors} />}
      <div className="slt-boss-content">
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
    </div>
  );
}

function RivalRow({ entry, teamMarkers, teamLineState, allTeams, isBattleHighlight, isRace, teamColors, passed }) {
  return (
    <div className={`slt-rival ${isBattleHighlight ? 'slt-battle-active' : ''} ${passed ? 'slt-passed' : ''}`}>
      {isRace && <TeamProgressLines teamLineState={teamLineState} allTeams={allTeams} markers={teamMarkers} teamColors={teamColors} />}
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
