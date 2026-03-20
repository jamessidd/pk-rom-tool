import { useState } from 'react';
import { getTrainerSpriteUrl } from './TrainerSpritePicker';

export default function SettingsModal({
  playerName, onNameChange,
  localUrl, onLocalUrlChange,
  syncUrl, onSyncUrlChange,
  roomCode, onRoomCodeChange,
  onCreate, onJoin, onSolo,
  mode, error,
  trainerSpriteId, onOpenSpritePicker,
  onClose,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const spriteUrl = getTrainerSpriteUrl(trainerSpriteId);

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
                <button className="btn-primary" onClick={onCreate}>Create Room</button>
                <div className="join-row">
                  <input
                    className="sm-input code-input"
                    value={roomCode}
                    onChange={e => onRoomCodeChange(e.target.value.toUpperCase())}
                    placeholder="CODE"
                    maxLength={6}
                  />
                  <button onClick={() => onJoin(roomCode)}>Join</button>
                </div>
              </>
            ) : (
              <div className="sm-room-info">
                <span className="sm-room-code">Room: {roomCode}</span>
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
