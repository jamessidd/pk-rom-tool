import { useState } from 'react';

export default function Controls({
  playerName, onNameChange,
  localUrl, onLocalUrlChange,
  syncUrl, onSyncUrlChange,
  roomCode, onRoomCodeChange,
  onCreate, onJoin, onSolo,
  mode, error, onOpenRouteManager,
  collapsed, onToggleCollapse,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (collapsed) {
    return (
      <aside className="controls controls-collapsed">
        <button className="sidebar-toggle" onClick={onToggleCollapse} title="Expand sidebar">
          &#9776;
        </button>
      </aside>
    );
  }

  return (
    <aside className="controls">
      <div className="controls-top">
        <span className="controls-title">Controls</span>
        <button className="sidebar-toggle" onClick={onToggleCollapse} title="Collapse sidebar">
          &#10005;
        </button>
      </div>

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

      {onOpenRouteManager && (
        <button className="btn-secondary" onClick={onOpenRouteManager}>
          Manage Routes
        </button>
      )}

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
