import { useState, useEffect, useRef } from 'react';

export default function DebugTicker({ localConnected, syncConnected, mode, roomCode }) {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const prevState = useRef({});

  useEffect(() => {
    const prev = prevState.current;
    const entries = [];

    if (prev.localConnected !== undefined && prev.localConnected !== localConnected) {
      entries.push({ text: localConnected ? 'Tracker connected' : 'Tracker disconnected', type: localConnected ? 'ok' : 'err' });
    }
    if (prev.syncConnected !== undefined && prev.syncConnected !== syncConnected) {
      entries.push({ text: syncConnected ? 'Sync server connected' : 'Sync server disconnected', type: syncConnected ? 'ok' : 'err' });
    }
    if (prev.mode !== undefined && prev.mode !== mode) {
      entries.push({ text: mode === 'room' ? `Joined room ${roomCode}` : 'Switched to solo', type: 'info' });
    }

    prevState.current = { localConnected, syncConnected, mode, roomCode };

    if (entries.length > 0) {
      const timestamped = entries.map(e => ({ ...e, id: Date.now() + Math.random(), ts: new Date().toLocaleTimeString() }));
      setLogs(prev => [...prev, ...timestamped].slice(-50));
    }
  }, [localConnected, syncConnected, mode, roomCode]);

  const dotColor = localConnected ? (syncConnected ? '#34d399' : '#fbbf24') : '#ef4444';

  return (
    <div className="dt-wrap">
      <button className="dt-toggle" onClick={() => setOpen(o => !o)} title="Debug Log">
        <span className="dt-dot" style={{ background: dotColor }} />
        {open ? '✕' : '⬡'}
      </button>
      {open && (
        <div className="dt-panel glass-card">
          <div className="dt-header">
            <span className="dt-title">Connection Log</span>
          </div>
          <div className="dt-status">
            <div className="dt-stat">
              <span className="dt-dot" style={{ background: localConnected ? '#34d399' : '#ef4444' }} />
              Tracker {localConnected ? 'Online' : 'Offline'}
            </div>
            <div className="dt-stat">
              <span className="dt-dot" style={{ background: syncConnected ? '#34d399' : '#ef4444' }} />
              Sync {syncConnected ? 'Online' : 'Offline'}
            </div>
            {mode === 'room' && roomCode && (
              <div className="dt-stat">
                <span className="dt-dot" style={{ background: '#3b82f6' }} />
                Room {roomCode}
              </div>
            )}
          </div>
          <div className="dt-logs">
            {logs.length === 0 && <div className="dt-empty">No events yet</div>}
            {logs.slice().reverse().map(log => (
              <div key={log.id} className={`dt-log dt-log-${log.type}`}>
                <span className="dt-log-time">{log.ts}</span>
                <span className="dt-log-text">{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
