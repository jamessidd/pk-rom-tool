import { useState, useCallback } from 'react';
import StatusBar from './components/StatusBar';
import Controls from './components/Controls';
import RoutePairRow from './components/RoutePairRow';
import SoloPairRow from './components/SoloPairRow';
import EventFeed from './components/EventFeed';
import RouteManager from './components/RouteManager';
import useLocalTracker from './hooks/useLocalTracker';
import useRoom from './hooks/useRoom';
import {
  getPlayerId, getPlayerName, setPlayerName as saveName,
  getLocalUrl, setLocalUrl as saveLocal,
  getSyncUrl, setSyncUrl as saveSync,
  getSoloAssignments, setSoloAssignments,
} from './utils/api';

function mergeLocalDetails(base, details, routeLabel) {
  return {
    ...base,
    ...details,
    routeName: routeLabel || base.routeName || base.route_name,
    route_name: routeLabel || base.route_name || base.routeName,
    metLocationName:
      details?.metLocationName ||
      details?.met_location_name ||
      base.metLocationName ||
      base.met_location_name ||
      routeLabel,
  };
}

function applySoloFirstCatch(routes, assignments) {
  return routes.map(route => {
    const mons = route.pokemon || [];
    if (mons.length <= 1) return route;
    const assignedPersonality = assignments[String(route.locationId)] ?? assignments[route.locationId];
    const assigned = assignedPersonality
      ? mons.find(m => m.personality === assignedPersonality) || mons[0]
      : mons[0];
    return { ...route, pokemon: [assigned], allPokemon: mons };
  });
}

export default function App() {
  const [playerName, setPlayerName] = useState(getPlayerName());
  const [localUrl, setLocalUrl]     = useState(getLocalUrl());
  const [syncUrl, setSyncUrl]       = useState(getSyncUrl());
  const [soloAssignments, _setSoloAssignments] = useState(getSoloAssignments);
  const [routeManagerOpen, setRouteManagerOpen] = useState(false);
  const [focusRoute, setFocusRoute] = useState(null);

  const { connected: localOk, status, soulLink, party: localParty } = useLocalTracker(localUrl);
  const room = useRoom(syncUrl, playerName, status, soulLink, localParty);

  function handleNameChange(n)     { setPlayerName(n); saveName(n); }
  function handleLocalChange(u)    { setLocalUrl(u);   saveLocal(u); }
  function handleSyncChange(u)     { setSyncUrl(u);    saveSync(u); }

  const updateSoloAssignments = useCallback((newAssignments) => {
    _setSoloAssignments(newAssignments);
    setSoloAssignments(newAssignments);
  }, []);

  const soloRoutes = soulLink?.routes || [];
  const soloEvents = soulLink?.recentEvents || [];
  const roomPairs  = room.roomState?.pairs || [];
  const roomEvents = room.roomState?.events || [];
  const roomPlayers = room.roomState?.players || [];
  const roomCatches = room.roomState?.catches || [];

  const localPartyByPersonality = new Map((localParty || []).map(mon => [mon.personality, mon]));
  const snapshotByPlayer = new Map(
    Object.entries(room.roomState?.player_snapshots || {}).map(([playerId, snapshot]) => [
      playerId,
      new Map((snapshot.current_party || []).map(mon => [mon.personality, mon])),
    ])
  );

  const enrichedSoloRoutes = soloRoutes.map(route => ({
    ...route,
    pokemon: (route.pokemon || []).map(mon =>
      mergeLocalDetails(mon, localPartyByPersonality.get(mon.personality), route.locationName)
    ),
  }));

  const filteredSoloRoutes = applySoloFirstCatch(enrichedSoloRoutes, soloAssignments);

  const allSoloCatches = enrichedSoloRoutes.flatMap(r => r.pokemon || []);

  const enrichedRoomPairs = roomPairs.map(pair => {
    const mergedPokemon = {};
    Object.entries(pair.pokemon || {}).forEach(([playerId, mon]) => {
      const snapMap = snapshotByPlayer.get(playerId);
      const snapMon = snapMap?.get(mon.personality);
      mergedPokemon[playerId] = {
        ...mon,
        ...snapMon,
        route_name: pair.route_name,
        routeName: pair.route_name,
        met_location_name: snapMon?.met_location_name || pair.route_name,
      };
    });
    return { ...pair, pokemon: mergedPokemon };
  });

  const isRoom = room.mode === 'room' && room.roomState;
  const activeRoutes = isRoom ? enrichedRoomPairs.filter(p => Object.values(p.pokemon || {}).some(m => m.alive !== false)) : [];
  const fallenRoutes = isRoom ? enrichedRoomPairs.filter(p => Object.values(p.pokemon || {}).some(m => m.alive === false)) : [];

  function handleOpenReassign(routeId) {
    setFocusRoute(routeId ?? null);
    setRouteManagerOpen(true);
  }

  function handleSoloAssign(routeId, personality) {
    const next = { ...soloAssignments, [String(routeId)]: personality };
    updateSoloAssignments(next);
  }

  function handleRoomAssign(routeId, personality) {
    room.reassign(routeId, personality);
  }

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
          onOpenRouteManager={() => { setFocusRoute(null); setRouteManagerOpen(true); }}
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
                {filteredSoloRoutes.length === 0 && <p className="muted">No encounters tracked yet. Start playing!</p>}
                {filteredSoloRoutes.map(route => (
                  <SoloPairRow
                    key={route.locationId}
                    route={route}
                    playerName={playerName || 'You'}
                    onOpenReassign={handleOpenReassign}
                  />
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
                  <RoutePairRow
                    key={pair.route}
                    pair={pair}
                    players={roomPlayers}
                    onUndoDeath={room.undoDeath}
                    onMarkDead={room.markDead}
                    onOpenReassign={handleOpenReassign}
                  />
                ))}
              </section>
              {fallenRoutes.length > 0 && (
                <section className="section graveyard">
                  <h2 className="section-title">Fallen Links</h2>
                  {fallenRoutes.map(pair => (
                    <RoutePairRow
                      key={pair.route}
                      pair={pair}
                      players={roomPlayers}
                      onUndoDeath={room.undoDeath}
                      onMarkDead={room.markDead}
                      onOpenReassign={handleOpenReassign}
                    />
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

      {routeManagerOpen && (() => {
        const playerId = getPlayerId();
        const roomAssignments = room.roomState?.route_assignments?.[playerId] || {};
        const intKeyedRoomAssignments = {};
        for (const [k, v] of Object.entries(roomAssignments)) {
          intKeyedRoomAssignments[Number(k)] = v;
        }
        return (
          <RouteManager
            routes={isRoom ? enrichedRoomPairs.map(p => ({ locationId: p.route, locationName: p.route_name, pokemon: Object.values(p.pokemon || {}) })) : enrichedSoloRoutes}
            allCatches={isRoom ? roomCatches.filter(c => c.player_id === playerId) : allSoloCatches}
            assignments={isRoom ? intKeyedRoomAssignments : soloAssignments}
            onAssign={isRoom ? handleRoomAssign : handleSoloAssign}
            onClose={() => setRouteManagerOpen(false)}
            focusRoute={focusRoute}
          />
        );
      })()}
    </div>
  );
}
