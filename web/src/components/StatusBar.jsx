export default function StatusBar({ localConnected, syncConnected, mode, roomCode, gameInfo }) {
  const gameName = gameInfo?.game?.name;
  const gameVersion = gameInfo?.game?.version;
  const gen = gameInfo?.game?.generation;
  const hasGame = gameName && gameName !== 'None';

  return (
    <header className="status-bar">
      <div className="brand">
        <h1>Soul Link</h1>
        <span className="brand-sub">PK ROM Tool</span>
        {hasGame && (
          <span className="brand-game">
            {gameName}
            {gameVersion && gameVersion !== 'None' && ` — ${gameVersion}`}
            {gen > 0 && <span className="brand-gen">Gen {gen}</span>}
          </span>
        )}
      </div>
      <div className="indicators">
        <Pill label="Tracker" ok={localConnected} />
        <Pill label="Sync" ok={syncConnected} />
        <Pill label={mode === 'room' ? `Room ${roomCode}` : 'Solo'} ok={mode === 'room'} variant={mode === 'solo' ? 'neutral' : undefined} />
      </div>
    </header>
  );
}

function Pill({ label, ok, variant }) {
  const cls = variant === 'neutral' ? 'pill neutral' : ok ? 'pill on' : 'pill off';
  return <span className={cls}>{label}</span>;
}
