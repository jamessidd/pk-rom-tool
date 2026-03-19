const state = {
    playerId: localStorage.getItem("pkrom-player-id") || crypto.randomUUID(),
    playerName: localStorage.getItem("pkrom-player-name") || "",
    localUrl: localStorage.getItem("pkrom-local-url") || "http://localhost:8080",
    syncUrl: localStorage.getItem("pkrom-sync-url") || window.location.origin,
    roomCode: localStorage.getItem("pkrom-room-code") || "",
    mode: localStorage.getItem("pkrom-mode") || "solo",
    localStatus: null,
    localParty: [],
    localSoul: null,
    roomState: null,
    roomWs: null,
    lastSentEventIds: new Set(),
    localPollTimer: null,
    syncTimer: null,
};

localStorage.setItem("pkrom-player-id", state.playerId);

const $ = (id) => document.getElementById(id);

function setMessage(text, isError = false) {
    const el = $("message");
    el.textContent = text || "";
    el.style.color = isError ? "#fca5a5" : "#fcd34d";
}

function setPill(id, text, cls) {
    const el = $(id);
    el.textContent = text;
    el.className = `status-pill ${cls}`;
}

function savePreferences() {
    localStorage.setItem("pkrom-player-name", state.playerName);
    localStorage.setItem("pkrom-local-url", state.localUrl);
    localStorage.setItem("pkrom-sync-url", state.syncUrl);
    localStorage.setItem("pkrom-room-code", state.roomCode);
    localStorage.setItem("pkrom-mode", state.mode);
}

function buildProfile() {
    const game = state.localStatus?.game || {};
    return {
        game_name: game.name || "",
        game_version: game.version || "",
        generation: String(game.generation || ""),
        engine: game.engine || String(game.generation || ""),
        profile_id: game.profileId || "",
        rom_hash: game.romHash || "",
        client_version: "web-bridge-dev",
    };
}

function mapSyncPokemon(mon) {
    return {
        personality: mon.personality,
        species_id: mon.speciesId,
        species_name: mon.species || "",
        nickname: mon.nickname || "",
        level: mon.level || 0,
        current_hp: mon.currentHP || 0,
        max_hp: mon.maxHP || 0,
        met_location: mon.metLocation || 0,
        met_location_name: mon.metLocationName || "",
        met_level: mon.metLevel || 0,
        types: mon.types || [],
        alive: (mon.currentHP || 0) > 0,
        in_party: true,
    };
}

function mapLocalEvent(event) {
    return {
        id: `${state.playerId}:${event.type}:${event.personality}:${event.frame}`,
        type: event.type,
        player_id: state.playerId,
        player_name: state.playerName,
        timestamp: Math.floor(Date.now() / 1000),
        source: "local_browser",
        pokemon: {
            personality: event.personality,
            species_id: event.speciesId,
            species_name: event.species || "",
            nickname: event.nickname || "",
            level: event.level || 0,
            current_hp: event.currentHP || 0,
            max_hp: event.maxHP || 0,
            met_location: event.metLocation || 0,
            met_location_name: event.metLocationName || "",
            met_level: event.metLevel || 0,
            types: event.types || [],
            alive: (event.currentHP || 0) > 0,
            in_party: true,
        },
    };
}

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
    }
    return response.json();
}

async function refreshLocal() {
    state.playerName = $("player-name").value.trim();
    state.localUrl = $("local-url").value.trim().replace(/\/$/, "");
    state.syncUrl = $("sync-url").value.trim().replace(/\/$/, "");
    savePreferences();

    try {
        const [status, party, soul] = await Promise.all([
            fetchJson(`${state.localUrl}/status`),
            fetchJson(`${state.localUrl}/party`),
            fetchJson(`${state.localUrl}/soullink/state`),
        ]);
        state.localStatus = status;
        state.localParty = Array.isArray(party) ? party : [];
        state.localSoul = soul;
        setPill("local-status", "Connected", "connected");
        renderLocal();
    } catch (error) {
        state.localStatus = null;
        state.localParty = [];
        state.localSoul = null;
        setPill("local-status", "Disconnected", "disconnected");
        setMessage(`Local tracker unavailable: ${error.message}`, true);
        renderLocal();
    }
}

function renderLocal() {
    const meta = $("local-game");
    const party = $("local-party");
    const events = $("local-events");

    if (!state.localStatus) {
        meta.innerHTML = '<div class="meta-item muted">Local PMR not connected.</div>';
        party.innerHTML = "";
        events.innerHTML = "";
        return;
    }

    const game = state.localStatus.game || {};
    const soul = state.localSoul || {};

    meta.innerHTML = [
        `<div class="meta-item"><strong>Game:</strong> ${game.name || "Unknown"} <span class="muted">${game.version || ""}</span></div>`,
        `<div class="meta-item"><strong>Profile:</strong> ${game.profileId || "unknown"}</div>`,
        `<div class="meta-item"><strong>ROM Hash:</strong> <span class="muted">${game.romHash || "unavailable"}</span></div>`,
        `<div class="meta-item"><strong>Soul Link:</strong> ${soul.initialized ? "Initialized" : "Waiting for baseline"} </div>`,
    ].join("");

    party.innerHTML = (soul.currentParty || []).map(mon => `
        <div class="party-card ${mon.currentHP === 0 ? "dead" : ""}">
            <h4>${escapeHtml(mon.nickname || mon.species || "Unknown")}</h4>
            <div>${escapeHtml(mon.species || "")}</div>
            <div class="muted">Lv. ${mon.level || 0} | HP ${mon.currentHP || 0}/${mon.maxHP || 0}</div>
            <div class="route-tag">${escapeHtml(mon.metLocationName || `Location ${mon.metLocation || 0}`)}</div>
        </div>
    `).join("");

    events.innerHTML = (soul.recentEvents || []).slice().reverse().map(event => `
        <div class="event-item">
            <strong>${escapeHtml(event.type)}</strong> ${escapeHtml(event.nickname || event.species || "")}
            <div class="muted">${escapeHtml(event.metLocationName || "")}</div>
        </div>
    `).join("");
}

async function createRoom() {
    await refreshLocal();
    if (!state.localStatus?.game?.initialized) {
        setMessage("Local game is not initialized yet.", true);
        return;
    }
    if (!state.playerName) {
        setMessage("Enter a display name first.", true);
        return;
    }

    try {
        const created = await fetchJson(`${state.syncUrl}/rooms`, {method: "POST"});
        state.roomCode = created.code;
        $("room-code").value = state.roomCode;
        await joinRoom(state.roomCode);
    } catch (error) {
        setMessage(`Failed to create room: ${error.message}`, true);
    }
}

async function joinRoom(roomCodeArg) {
    await refreshLocal();
    const roomCode = (roomCodeArg || $("room-code").value.trim()).toUpperCase();
    if (!roomCode) {
        setMessage("Enter a room code.", true);
        return;
    }
    if (!state.localStatus?.game?.initialized) {
        setMessage("Local game is not initialized yet.", true);
        return;
    }
    if (!state.playerName) {
        setMessage("Enter a display name first.", true);
        return;
    }

    state.roomCode = roomCode;
    savePreferences();

    const payload = {
        player_id: state.playerId,
        player_name: state.playerName,
        profile: buildProfile(),
        source: "local_browser",
    };

    try {
        const result = await fetchJson(`${state.syncUrl}/rooms/${roomCode}/join`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload),
        });

        if (!result.compatibility?.compatible) {
            setPill("room-status", "Blocked", "warning");
            setMessage(result.compatibility?.reason || "Compatibility check failed.", true);
            return;
        }

        state.mode = "room";
        savePreferences();
        setPill("room-status", `Room ${roomCode}`, "connected");
        setMessage(`Joined room ${roomCode}.`);
        await refreshRoomState();
        connectRoomSocket();
        startSyncLoop();
    } catch (error) {
        setPill("sync-status", "Disconnected", "disconnected");
        setMessage(`Failed to join room: ${error.message}`, true);
    }
}

async function refreshRoomState() {
    if (!state.roomCode) return;
    try {
        state.roomState = await fetchJson(`${state.syncUrl}/rooms/${state.roomCode}/state`);
        renderRoom();
        setPill("sync-status", "Connected", "connected");
    } catch (error) {
        setPill("sync-status", "Disconnected", "disconnected");
        setMessage(`Failed to fetch room state: ${error.message}`, true);
    }
}

function connectRoomSocket() {
    if (!state.roomCode) return;
    if (state.roomWs) {
        state.roomWs.close();
    }

    const wsUrl = state.syncUrl.replace(/^http/, "ws") + `/rooms/${state.roomCode}/ws`;
    state.roomWs = new WebSocket(wsUrl);
    state.roomWs.onopen = () => setPill("sync-status", "Connected", "connected");
    state.roomWs.onmessage = async () => {
        await refreshRoomState();
    };
    state.roomWs.onclose = () => setPill("sync-status", "Disconnected", "disconnected");
    state.roomWs.onerror = () => setPill("sync-status", "Disconnected", "disconnected");
}

async function syncRoom() {
    if (state.mode !== "room" || !state.roomCode || !state.localSoul) return;

    try {
        const recentEvents = (state.localSoul.recentEvents || [])
            .map(mapLocalEvent)
            .filter(event => {
                if (state.lastSentEventIds.has(event.id)) {
                    return false;
                }
                return true;
            });

        const reconcilePayload = {
            player_id: state.playerId,
            player_name: state.playerName,
            timestamp: Math.floor(Date.now() / 1000),
            current_party: (state.localSoul.currentParty || []).map(mapSyncPokemon),
            recent_events: recentEvents,
        };

        await fetchJson(`${state.syncUrl}/rooms/${state.roomCode}/reconcile`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(reconcilePayload),
        });

        recentEvents.forEach(event => state.lastSentEventIds.add(event.id));
        await refreshRoomState();
    } catch (error) {
        setPill("sync-status", "Disconnected", "disconnected");
        setMessage(`Sync failed: ${error.message}`, true);
    }
}

function startSyncLoop() {
    if (state.syncTimer) {
        clearInterval(state.syncTimer);
    }
    state.syncTimer = setInterval(async () => {
        await refreshLocal();
        await syncRoom();
    }, 2000);
}

function stopSyncLoop() {
    if (state.syncTimer) {
        clearInterval(state.syncTimer);
        state.syncTimer = null;
    }
}

function setSoloMode() {
    state.mode = "solo";
    savePreferences();
    setPill("room-status", "Solo", "idle");
    stopSyncLoop();
    if (state.roomWs) {
        state.roomWs.close();
        state.roomWs = null;
    }
    state.roomState = null;
    renderRoom();
    setMessage("Solo mode active.");
}

function renderRoom() {
    const meta = $("room-meta");
    const players = $("room-players");
    const pairs = $("room-pairs");
    const events = $("room-events");

    if (!state.roomState) {
        meta.innerHTML = '<div class="meta-item muted">No room connected.</div>';
        players.innerHTML = "";
        pairs.innerHTML = "";
        events.innerHTML = "";
        return;
    }

    meta.innerHTML = [
        `<div class="meta-item"><strong>Room:</strong> ${escapeHtml(state.roomState.code)}</div>`,
        `<div class="meta-item"><strong>Required Profile:</strong> ${escapeHtml(state.roomState.required_profile?.profile_id || state.roomState.required_profile?.game_name || "unset")}</div>`,
    ].join("");

    players.innerHTML = (state.roomState.players || []).map(player => `
        <div class="player-item">
            <strong>${escapeHtml(player.player_name)}</strong>
            <div class="muted">${escapeHtml(player.profile?.game_name || "")}</div>
        </div>
    `).join("");

    pairs.innerHTML = (state.roomState.pairs || []).map(pair => {
        const mons = Object.values(pair.pokemon || {}).map(mon => `
            <div class="party-card ${mon.alive ? "" : "dead"}">
                <h4>${escapeHtml(mon.nickname || mon.species_name || "Unknown")}</h4>
                <div>${escapeHtml(mon.species_name || "")}</div>
                <div class="muted">${escapeHtml(mon.player_name || "")} | Lv. ${mon.level || 0}</div>
            </div>
        `).join("");
        return `
            <div class="pair-card">
                <h4>${escapeHtml(pair.route_name || `Location ${pair.route}`)}</h4>
                <div class="party-grid">${mons}</div>
            </div>
        `;
    }).join("");

    events.innerHTML = (state.roomState.events || []).slice().reverse().slice(0, 30).map(event => `
        <div class="event-item">
            <strong>${escapeHtml(event.player_name || "")}</strong> ${escapeHtml(event.type)}
            <div class="muted">${escapeHtml(event.pokemon?.nickname || event.pokemon?.species_name || "")} @ ${escapeHtml(event.pokemon?.met_location_name || "")}</div>
        </div>
    `).join("");
}

function escapeHtml(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function bindUi() {
    $("player-name").value = state.playerName;
    $("local-url").value = state.localUrl;
    $("sync-url").value = state.syncUrl;
    $("room-code").value = state.roomCode;

    $("refresh-btn").addEventListener("click", refreshLocal);
    $("solo-btn").addEventListener("click", setSoloMode);
    $("create-room-btn").addEventListener("click", createRoom);
    $("join-room-btn").addEventListener("click", () => joinRoom());
}

async function bootstrap() {
    bindUi();
    await refreshLocal();
    if (state.mode === "room" && state.roomCode) {
        await joinRoom(state.roomCode);
    } else {
        setSoloMode();
    }
    state.localPollTimer = setInterval(refreshLocal, 1500);
}

bootstrap();
