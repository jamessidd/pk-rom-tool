import { useState } from 'react';
import StatusBar from './components/StatusBar';
import Controls from './components/Controls';
import RoutePairRow from './components/RoutePairRow';
import SoloPairRow from './components/SoloPairRow';
import EventFeed from './components/EventFeed';
import useLocalTracker from './hooks/useLocalTracker';
import useRoom from './hooks/useRoom';
import {
  getPlayerName, setPlayerName as saveName,
  getLocalUrl, setLocalUrl as saveLocal,
  getSyncUrl, setSyncUrl as saveSync,
  getRoomCode,
} from './utils/api';

export default function App() {
  const [playerName, setPlayerName] = useState(getPlayerName());
  const [localUrl, setLocalUrl]     = useState(getLocalUrl());
  const [syncUrl, setSyncUrl]       = useState(getSyncUrl());

  const { connected: localOk, status, soulLink } = useLocalTracker(localUrl);
  const room = useRoom(syncUrl, playerName, status, soulLink);

  function handleNameChange(n)     { setPlayerName(n); saveName(n); }
  function handleLocalChange(u)    { setLocalUrl(u);   saveLocal(u); }
  function handleSyncChange(u)     { setSyncUrl(u);    saveSync(u); }

  const soloRoutes = soulLink?.routes || [];
  const soloEvents = soulLink?.recentEvents || [];
  const roomPairs  = room.roomState?.pairs || [];
  const roomEvents = room.roomState?.events || [];
  const roomPlayers = room.roomState?.players || [];

  const isRoom = room.mode === 'room' && room.roomState;
  const activeRoutes = isRoom ? roomPairs.filter(p => Object.values(p.pokemon || {}).some(m => m.alive !== false)) : [];
  const fallenRoutes = isRoom ? roomPairs.filter(p => Object.values(p.pokemon || {}).some(m => m.alive === false)) : [];

  return (
    <div className="app-shell">
      <StatusBar
        localConnected={localOk}
        syncConnected={room.syncConnected}
        mode={room.mode}
        roomCode={room.roomCode}
      />

      <div className="app-body">
        <Controls
          playerName={playerName}
          onNameChange={handleNameChange}
          localUrl={localUrl}
          onLocalUrlChange={handleLocalChange}
          syncUrl={syncUrl}
          onSyncUrlChange={handleSyncChange}
          roomCode={room.roomCode}
          onRoomCodeChange={room.setRoomCode}
          onCreate={room.create}
          onJoin={room.join}
          onSolo={room.goSolo}
          mode={room.mode}
          error={room.error}
        />

        <main className="main-area">
          {!localOk && (
            <div className="empty-state">
              <h2>Waiting for Local Tracker</h2>
              <p>Start BizHawk with the pk-rom-tool script, then refresh.</p>
            </div>
          )}

          {localOk && !isRoom && (
            <>
              <section className="section">
                <h2 className="section-title">Encounters</h2>
                {soloRoutes.length === 0 && <p className="muted">No encounters tracked yet. Start playing!</p>}
                {soloRoutes.map(route => (
                  <SoloPairRow key={route.locationId} route={route} playerName={playerName || 'You'} />
                ))}
              </section>
              <section className="section feed-section">
                <h2 className="section-title">Events</h2>
                <EventFeed events={soloEvents} />
              </section>
            </>
          )}

          {isRoom && (
            <>
              <section className="section">
                <h2 className="section-title">Active Links</h2>
                {activeRoutes.length === 0 && fallenRoutes.length === 0 && (
                  <p className="muted">No encounters tracked yet.</p>
                )}
                {activeRoutes.map(pair => (
                  <RoutePairRow key={pair.route} pair={pair} players={roomPlayers} />
                ))}
              </section>
              {fallenRoutes.length > 0 && (
                <section className="section graveyard">
                  <h2 className="section-title">Fallen Links</h2>
                  {fallenRoutes.map(pair => (
                    <RoutePairRow key={pair.route} pair={pair} players={roomPlayers} />
                  ))}
                </section>
              )}
              <section className="section feed-section">
                <h2 className="section-title">Room Events</h2>
                <EventFeed events={roomEvents} />
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
