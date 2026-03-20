import { useState } from 'react';
import { getTrainerSpriteUrl } from './TrainerSpritePicker';

function formatMoney(n) {
  return n != null ? `$${Number(n).toLocaleString()}` : null;
}

export default function Controls({
  playerName, onNameChange,
  localUrl, onLocalUrlChange,
  syncUrl, onSyncUrlChange,
  roomCode, onRoomCodeChange,
  onCreate, onJoin, onSolo,
  mode, error, onOpenRouteManager,
  collapsed, onToggleCollapse,
  trainerSpriteId, onOpenSpritePicker,
  money, coins,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const spriteUrl = getTrainerSpriteUrl(trainerSpriteId);

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

      {(money != null || coins != null) && (
        <div className="ctrl-wallet">
          {money != null && <span className="ctrl-wallet-item">{formatMoney(money)}</span>}
          {coins != null && coins > 0 && <span className="ctrl-wallet-item ctrl-wallet-coins">{Number(coins).toLocaleString()} coins</span>}
        </div>
      )}

      <div className="ctrl-sprite-row">
        <span className="ctrl-label">Trainer Sprite</span>
        <button className="ctrl-sprite-btn" onClick={onOpenSpritePicker}>
          {spriteUrl ? (
            <img src={spriteUrl} alt="Trainer" className="ctrl-sprite-preview" />
          ) : (
            <span className="ctrl-sprite-none">Choose</span>
          )}
        </button>
      </div>

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
