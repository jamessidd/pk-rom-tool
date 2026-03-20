const DEFAULT_LOCAL = 'http://localhost:8080';
const DEFAULT_SYNC  = 'http://localhost:8000';

function stored(key, fallback) {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}
function store(key, value) {
  try { localStorage.setItem(key, value); } catch { /* noop */ }
}

export function getPlayerId() {
  let id = stored('pkrom-pid', '');
  if (!id) { id = crypto.randomUUID(); store('pkrom-pid', id); }
  return id;
}
export function getPlayerName()  { return stored('pkrom-name', ''); }
export function setPlayerName(n) { store('pkrom-name', n); }
export function getLocalUrl()    { return stored('pkrom-local', DEFAULT_LOCAL); }
export function setLocalUrl(u)   { store('pkrom-local', u); }
export function getSyncUrl()     { return stored('pkrom-sync', DEFAULT_SYNC); }
export function setSyncUrl(u)    { store('pkrom-sync', u); }
export function getRoomCode()    { return stored('pkrom-room', ''); }
export function setRoomCode(c)   { store('pkrom-room', c); }

async function json(url, opts) {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}

export async function fetchLocalStatus(base) {
  return json(`${base}/status`);
}
export async function fetchLocalParty(base) {
  return json(`${base}/party`);
}
export async function fetchLocalSoulLink(base) {
  return json(`${base}/soullink/state`);
}
export async function fetchLocalEvents(base) {
  return json(`${base}/soullink/events`);
}

export async function createRoom(syncBase) {
  return json(`${syncBase}/rooms`, { method: 'POST' });
}
export async function joinRoom(syncBase, code, playerId, playerName, profile) {
  return json(`${syncBase}/rooms/${code}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      player_id: playerId,
      player_name: playerName,
      profile,
      source: 'local_browser',
    }),
  });
}
export async function fetchRoomState(syncBase, code) {
  return json(`${syncBase}/rooms/${code}/state`);
}
export async function sendReconcile(syncBase, code, payload) {
  return json(`${syncBase}/rooms/${code}/reconcile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
export async function overrideDeath(syncBase, code, route, alive) {
  return json(`${syncBase}/rooms/${code}/override-death`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ route, alive }),
  });
}
