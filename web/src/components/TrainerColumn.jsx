import { useMemo, memo } from 'react';
import useSprite from '../hooks/useSprite';

const FALLBACK_SPRITES = [
  'https://play.pokemonshowdown.com/sprites/trainers/red.png',
  'https://play.pokemonshowdown.com/sprites/trainers/blue.png',
  'https://play.pokemonshowdown.com/sprites/trainers/cynthia.png',
  'https://play.pokemonshowdown.com/sprites/trainers/steven.png',
];


const MonDot = memo(function MonDot({ mon }) {
  const species = mon.species_name || mon.species || '';
  const img = useSprite(species);
  const alive = mon.alive !== undefined ? mon.alive : true;
  const hp = mon.current_hp ?? mon.currentHP ?? 0;
  const maxHp = mon.max_hp ?? mon.maxHP ?? 0;
  const hpRatio = maxHp > 0 ? hp / maxHp : 1;
  const hpColor = hpRatio > 0.5 ? '#34d399' : hpRatio > 0.25 ? '#fbbf24' : '#ef4444';

  return (
    <div className={`md ${alive ? '' : 'md-dead'}`}
      title={`${mon.nickname || species} Lv${mon.level || '?'}`}>
      {img ? (
        <img className="md-sprite" src={img} alt="" loading="lazy"
          onError={e => { e.currentTarget.style.display = 'none'; }} />
      ) : (
        <div className="md-fb">?</div>
      )}
      <div className="md-hp">
        <div className="md-hp-fill" style={{
          width: alive ? `${hpRatio * 100}%` : '0%',
          background: alive ? hpColor : '#ef4444'
        }} />
      </div>
    </div>
  );
});

const TrainerBlock = memo(function TrainerBlock({ trainer, index }) {
  const party = trainer.party || [];
  const slots = party.slice(0, 6);
  const fallback = FALLBACK_SPRITES[index % FALLBACK_SPRITES.length];

  return (
    <div className="tb">
      <div className="tb-identity">
        <img className="tb-sprite"
          src={trainer.spriteUrl || fallback}
          alt=""
          loading="lazy"
          onError={e => { e.currentTarget.src = fallback; }} />
        <span className="tb-name">{trainer.name || 'Trainer'}</span>
      </div>
      <div className="tb-team">
        {slots.map((mon, i) => (
          <MonDot key={mon.personality || i} mon={mon} />
        ))}
      </div>
    </div>
  );
});

export default function TrainerColumn({ trainers, players, teamNames, isRaceMode, myTeam }) {
  const safeTrainers = trainers || [];
  const getTeamName = (key) => (teamNames && teamNames[key]) || `Team ${key}`;
  const playerTeamMap = useMemo(() => {
    const next = {};
    for (const p of (players || [])) {
      if (p.team) next[p.player_id] = p.team;
    }
    return next;
  }, [players]);

  if (safeTrainers.length === 0) return null;

  if (isRaceMode) {
    const teamGroups = {};
    for (const t of safeTrainers) {
      const team = playerTeamMap[t.playerId] || '?';
      if (!teamGroups[team]) teamGroups[team] = [];
      teamGroups[team].push(t);
    }
    const enemyTeam = myTeam === 'A' ? 'B' : 'A';
    const teamOrder = [myTeam, enemyTeam].filter(k => teamGroups[k]);

    return (
      <div className="tc-wrap">
        <h3 className="section-title">Trainers</h3>
        {teamOrder.map((team, idx) => {
          const side = idx === 0 ? 'mine' : 'theirs';
          return (
            <div key={team} className="tc-team-group">
              <h4 className={`section-title race-team-header race-team-${side}`}>
                {getTeamName(team)}
              </h4>
              {teamGroups[team].map((t, i) => (
                <TrainerBlock key={t.playerId} trainer={t} index={i} />
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="tc-wrap">
      <h3 className="section-title">Trainers</h3>
      {safeTrainers.map((t, i) => (
        <TrainerBlock key={t.playerId} trainer={t} index={i} />
      ))}
    </div>
  );
}
