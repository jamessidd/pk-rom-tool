import { useState } from 'react';
import { getTrainerSpriteUrl } from './TrainerSpritePicker';

export default function SettingsModal({
  playerName, onNameChange,
  localUrl, onLocalUrlChange,
  syncUrl, onSyncUrlChange,
  roomCode, onRoomCodeChange,
  onCreate, onJoin, onSolo, onSetTeamNames,
  mode, error,
  roomSettings,
  trainerSpriteId, onOpenSpritePicker,
  onClose,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [createMode, setCreateMode] = useState('soullink');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [joinTeam, setJoinTeam] = useState('A');
  const [teamNameA, setTeamNameA] = useState(roomSettings?.team_names?.A || '');
  const [teamNameB, setTeamNameB] = useState(roomSettings?.team_names?.B || '');
  const spriteUrl = getTrainerSpriteUrl(trainerSpriteId);
  const isRaceRoom = roomSettings?.mode === 'race';

  return (
    <div className="sm-backdrop" onClick={onClose}>
      <div className="sm-modal glass-card" onClick={e => e.stopPropagation()}>
        <div className="sm-header">
          <h2>Settings</h2>
          <button className="rm-close" onClick={onClose}>&times;</button>
        </div>
        <div className="sm-body">
          <label>
            <span className="sm-label">Display Name</span>
            <input className="sm-input" value={playerName} onChange={e => onNameChange(e.target.value)} placeholder="Your name" />
          </label>

          <div className="sm-section">
            <span className="sm-label">Trainer Sprite</span>
            <button className="ctrl-sprite-btn" onClick={onOpenSpritePicker}>
              {spriteUrl ? (
                <img src={spriteUrl} alt="Trainer" className="ctrl-sprite-preview" />
              ) : (
                <span className="ctrl-sprite-none">Choose</span>
              )}
            </button>
          </div>

          <div className="sm-divider" />

          <span className="sm-label">Multiplayer</span>
          <div className="sm-room-actions">
            {mode !== 'room' ? (
              <>
                <div className="sm-mode-row">
                  <button className={`sm-mode-btn ${createMode === 'soullink' ? 'sm-mode-active' : ''}`} onClick={() => setCreateMode('soullink')}>Soul Link</button>
                  <button className={`sm-mode-btn ${createMode === 'race' ? 'sm-mode-active' : ''}`} onClick={() => setCreateMode('race')}>Race</button>
                </div>
                {createMode === 'race' && (
                  <div className="sm-race-opts">
                    <label className="sm-inline-label">
                      Max players
                      <select className="sm-select" value={maxPlayers} onChange={e => setMaxPlayers(Number(e.target.value))}>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                      </select>
                    </label>
                    <div className="sm-team-names">
                      <label className="sm-inline-label">
                        Team A
                        <input className="sm-input sm-team-input" value={teamNameA} onChange={e => setTeamNameA(e.target.value)} placeholder="Team A" maxLength={24} />
                      </label>
                      <label className="sm-inline-label">
                        Team B
                        <input className="sm-input sm-team-input" value={teamNameB} onChange={e => setTeamNameB(e.target.value)} placeholder="Team B" maxLength={24} />
                      </label>
                    </div>
                  </div>
                )}
                <button className="btn-primary" onClick={() => {
                  const names = createMode === 'race' ? { A: teamNameA || 'Team A', B: teamNameB || 'Team B' } : {};
                  onCreate(createMode, createMode === 'race' ? maxPlayers : 0, names);
                }}>Create Room</button>
                <div className="sm-divider-thin" />
                <div className="join-row">
                  <input
                    className="sm-input code-input"
                    value={roomCode}
                    onChange={e => onRoomCodeChange(e.target.value.toUpperCase())}
                    placeholder="CODE"
                    maxLength={6}
                  />
                  <select className="sm-select sm-team-select" value={joinTeam} onChange={e => setJoinTeam(e.target.value)} title="Team">
                    <option value="A">Team A</option>
                    <option value="B">Team B</option>
                  </select>
                  <button onClick={() => onJoin(roomCode, joinTeam)}>Join</button>
                </div>
              </>
            ) : (
              <div className="sm-room-info">
                <span className="sm-room-code">Room: {roomCode}</span>
                {isRaceRoom && <span className="sm-room-mode">Race Mode</span>}
                {isRaceRoom && (
                  <div className="sm-team-names">
                    <label className="sm-inline-label">
                      Team A
                      <input className="sm-input sm-team-input" value={teamNameA} onChange={e => setTeamNameA(e.target.value)} placeholder="Team A" maxLength={24}
                        onBlur={() => onSetTeamNames?.({ A: teamNameA || 'Team A', B: teamNameB || 'Team B' })} />
                    </label>
                    <label className="sm-inline-label">
                      Team B
                      <input className="sm-input sm-team-input" value={teamNameB} onChange={e => setTeamNameB(e.target.value)} placeholder="Team B" maxLength={24}
                        onBlur={() => onSetTeamNames?.({ A: teamNameA || 'Team A', B: teamNameB || 'Team B' })} />
                    </label>
                  </div>
                )}
                <button onClick={onSolo}>Leave Room</button>
              </div>
            )}
          </div>

          {error && <div className="ctrl-error">{error}</div>}

          <div className="sm-divider" />

          <button className="btn-text" onClick={() => setShowAdvanced(s => !s)}>
            {showAdvanced ? 'Hide Advanced' : 'Advanced Settings'}
          </button>
          {showAdvanced && (
            <div className="sm-advanced">
              <label>
                <span className="sm-label">Local Tracker URL</span>
                <input className="sm-input" value={localUrl} onChange={e => onLocalUrlChange(e.target.value)} />
              </label>
              <label>
                <span className="sm-label">Sync Server URL</span>
                <input className="sm-input" value={syncUrl} onChange={e => onSyncUrlChange(e.target.value)} />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
