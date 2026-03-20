import { useState } from 'react';

export default function Controls({
  playerName, onNameChange,
  localUrl, onLocalUrlChange,
  syncUrl, onSyncUrlChange,
  roomCode, onRoomCodeChange,
  onCreate, onJoin, onSolo,
  mode, error,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <aside className="controls">
      <label>
        <span className="ctrl-label">Display Name</span>
        <input value={playerName} onChange={e => onNameChange(e.target.value)} placeholder="Your name" />
      </label>

      <div className="ctrl-actions">
        {mode !== 'room' ? (
          <>
            <button className="btn-primary" onClick={onCreate}>Create Room</button>
            <div className="join-row">
              <input
                className="code-input"
                value={roomCode}
                onChange={e => onRoomCodeChange(e.target.value.toUpperCase())}
                placeholder="CODE"
                maxLength={6}
              />
              <button onClick={() => onJoin(roomCode)}>Join</button>
            </div>
          </>
        ) : (
          <button onClick={onSolo}>Leave Room</button>
        )}
      </div>

      {error && <div className="ctrl-error">{error}</div>}

      <button className="btn-text" onClick={() => setShowAdvanced(s => !s)}>
        {showAdvanced ? 'Hide' : 'Advanced'}
      </button>
      {showAdvanced && (
        <div className="ctrl-advanced">
          <label>
            <span className="ctrl-label">Local Tracker</span>
            <input value={localUrl} onChange={e => onLocalUrlChange(e.target.value)} />
          </label>
          <label>
            <span className="ctrl-label">Sync Server</span>
            <input value={syncUrl} onChange={e => onSyncUrlChange(e.target.value)} />
          </label>
        </div>
      )}
    </aside>
  );
}
