from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request


DEFAULT_BASE_URL = "http://localhost:8000"
PROFILE = {
    "game_name": "Pokemon Radical Red",
    "game_version": "4.1",
    "generation": "3",
    "engine": "3",
    "profile_id": "sim-profile",
    "rom_hash": "sim-rom-hash",
    "client_version": "sim-v1",
}


def request_json(method: str, url: str, payload: dict | None = None, expected_status: int = 200):
    body = None
    headers = {}
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request) as response:
            raw = response.read().decode("utf-8")
            if response.status != expected_status:
                raise RuntimeError(f"{method} {url} returned {response.status}, expected {expected_status}")
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8")
        detail = raw
        try:
            parsed = json.loads(raw)
            detail = parsed.get("detail", parsed)
        except json.JSONDecodeError:
            pass
        if exc.code != expected_status:
            raise RuntimeError(f"{method} {url} returned {exc.code}: {detail}") from exc
        return {"detail": detail, "status": exc.code}


def create_room(base_url: str, mode: str = "soullink", max_players: int = 0):
    return request_json(
        "POST",
        f"{base_url}/rooms",
        {"mode": mode, "max_players": max_players, "team_names": {}},
    )["code"]


def join_room(base_url: str, code: str, player_id: str, player_name: str, team: str = ""):
    return request_json(
        "POST",
        f"{base_url}/rooms/{code}/join",
        {
            "player_id": player_id,
            "player_name": player_name,
            "profile": PROFILE,
            "source": "local_browser",
            "team": team,
        },
    )


def fetch_state(base_url: str, code: str):
    return request_json("GET", f"{base_url}/rooms/{code}/state")


def reconcile(base_url: str, code: str, player_id: str, player_name: str, current_party: list[dict], events: list[dict]):
    return request_json(
        "POST",
        f"{base_url}/rooms/{code}/reconcile",
        {
            "player_id": player_id,
            "player_name": player_name,
            "timestamp": 1710000000,
            "current_party": current_party,
            "enemy_party": [],
            "recent_events": events,
        },
    )


def make_mon(personality: int, species_id: int, species_name: str, route: int, route_name: str, level: int = 5):
    return {
        "personality": personality,
        "species_id": species_id,
        "species_name": species_name,
        "nickname": species_name,
        "level": level,
        "current_hp": 20,
        "max_hp": 20,
        "met_location": route,
        "met_location_name": route_name,
        "met_level": level,
        "types": ["normal"],
        "alive": True,
        "in_party": True,
        "nature": "Hardy",
        "ivs": {"hp": 1},
        "evs": {"hp": 0},
        "held_item": "",
        "held_item_id": 0,
        "hidden_power": "",
        "friendship": 70,
        "move_names": [],
        "ability": "",
        "status": "Healthy",
        "is_shiny": False,
    }


def make_catch_event(player_id: str, player_name: str, event_id: str, mon: dict):
    return {
        "id": event_id,
        "type": "catch",
        "player_id": player_id,
        "player_name": player_name,
        "timestamp": 1710000000,
        "source": "simulator",
        "pokemon": mon,
    }


def scenario_basic(base_url: str):
    code = create_room(base_url, "soullink", 2)
    join_room(base_url, code, "p1", "Player One")
    join_room(base_url, code, "p2", "Player Two")

    mon1 = make_mon(1111, 1, "Bulbasaur", 1, "Route 1")
    mon2 = make_mon(2222, 4, "Charmander", 1, "Route 1")
    reconcile(base_url, code, "p1", "Player One", [mon1], [make_catch_event("p1", "Player One", "p1-catch-1", mon1)])
    reconcile(base_url, code, "p2", "Player Two", [mon2], [make_catch_event("p2", "Player Two", "p2-catch-1", mon2)])

    state = fetch_state(base_url, code)
    assert len(state["players"]) == 2, state
    assert len(state["catches"]) == 2, state
    assert len(state["pairs"]) == 1, state
    pair_players = sorted(state["pairs"][0]["pokemon"].keys())
    assert pair_players == ["p1", "p2"], state
    print(f"[basic] ok room={code} catches={len(state['catches'])} pairs={len(state['pairs'])}")


def scenario_rejoin(base_url: str):
    missing = request_json(
        "POST",
        f"{base_url}/rooms/MISSING/join",
        {
            "player_id": "ghost",
            "player_name": "Ghost",
            "profile": PROFILE,
            "source": "local_browser",
            "team": "",
        },
        expected_status=404,
    )
    assert missing["status"] == 404, missing

    code = create_room(base_url, "soullink", 2)
    join_room(base_url, code, "p1", "Original Name")
    join_room(base_url, code, "p1", "Renamed Player")
    state = fetch_state(base_url, code)
    assert len(state["players"]) == 1, state
    assert state["players"][0]["player_name"] == "Renamed Player", state
    print(f"[rejoin] ok room={code} players={len(state['players'])}")


def scenario_race(base_url: str):
    code = create_room(base_url, "race", 2)
    join_room(base_url, code, "p1", "Team A", "A")
    join_room(base_url, code, "p2", "Team B", "B")

    mon1 = make_mon(3333, 7, "Squirtle", 22, "Route 22")
    mon2 = make_mon(4444, 25, "Pikachu", 22, "Route 22")
    reconcile(base_url, code, "p1", "Team A", [mon1], [make_catch_event("p1", "Team A", "p1-race-catch", mon1)])
    reconcile(base_url, code, "p2", "Team B", [mon2], [make_catch_event("p2", "Team B", "p2-race-catch", mon2)])

    state = fetch_state(base_url, code)
    assert len(state["pairs"]) == 2, state
    teams = sorted(pair["team"] for pair in state["pairs"])
    assert teams == ["A", "B"], state
    print(f"[race] ok room={code} teams={teams}")


def main():
    parser = argparse.ArgumentParser(description="Deterministic room-system simulation harness")
    parser.add_argument("scenario", choices=["basic", "rejoin", "race", "all"])
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    args = parser.parse_args()

    scenarios = {
        "basic": scenario_basic,
        "rejoin": scenario_rejoin,
        "race": scenario_race,
    }

    try:
        if args.scenario == "all":
            for scenario in scenarios.values():
                scenario(args.base_url)
        else:
            scenarios[args.scenario](args.base_url)
    except AssertionError as exc:
        print(f"simulation failed: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
    except Exception as exc:
        print(f"simulation error: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()
