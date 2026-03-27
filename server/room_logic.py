from __future__ import annotations

from collections import defaultdict
from datetime import datetime

from models import CatchRecord, PairGroup, PlayerSnapshot, Room


def catch_identity(player_id: str, personality: int) -> tuple[str, int]:
    return (player_id, personality)


def auto_assign_catch(room: Room, catch: CatchRecord):
    player_map = room.route_assignments.setdefault(catch.player_id, {})
    if catch.route not in player_map:
        player_map[catch.route] = catch.personality


def get_player_team(room: Room, player_id: str) -> str:
    presence = room.players.get(player_id)
    return (presence.team if presence else "") or ""


def find_catch(room: Room, player_id: str, personality: int) -> CatchRecord | None:
    key = catch_identity(player_id, personality)
    for catch in room.catches:
        if catch_identity(catch.player_id, catch.personality) == key:
            return catch
    return None


def upsert_catch(room: Room, incoming: CatchRecord) -> tuple[CatchRecord, bool]:
    existing = find_catch(room, incoming.player_id, incoming.personality)
    if existing:
        existing.player_name = incoming.player_name
        existing.species_id = incoming.species_id
        existing.species_name = incoming.species_name
        existing.nickname = incoming.nickname
        existing.route = incoming.route
        existing.route_name = incoming.route_name
        existing.level = incoming.level
        existing.met_level = incoming.met_level
        existing.types = incoming.types
        existing.alive = incoming.alive
        existing.in_party = incoming.in_party
        existing.nature = incoming.nature
        existing.ivs = incoming.ivs
        existing.evs = incoming.evs
        existing.held_item = incoming.held_item
        existing.held_item_id = incoming.held_item_id
        existing.hidden_power = incoming.hidden_power
        existing.friendship = incoming.friendship
        existing.timestamp = incoming.timestamp
        auto_assign_catch(room, existing)
        return existing, False

    room.catches.append(incoming)
    auto_assign_catch(room, incoming)
    return incoming, True


def ensure_snapshot_catches(room: Room, snapshot: PlayerSnapshot):
    for pokemon in snapshot.current_party:
        existing = find_catch(room, snapshot.player_id, pokemon.personality)
        if existing:
            existing.player_name = snapshot.player_name
            existing.species_id = pokemon.species_id
            existing.species_name = pokemon.species_name or pokemon.nickname or f"Pokemon #{pokemon.species_id}"
            existing.nickname = pokemon.nickname
            existing.route = pokemon.met_location
            existing.route_name = pokemon.met_location_name
            existing.level = pokemon.level
            existing.met_level = pokemon.met_level
            existing.types = pokemon.types
            if existing.alive:
                existing.alive = pokemon.current_hp > 0
            existing.in_party = True
            existing.nature = pokemon.nature
            existing.ivs = pokemon.ivs
            existing.evs = pokemon.evs
            existing.held_item = pokemon.held_item
            existing.held_item_id = pokemon.held_item_id
            existing.hidden_power = pokemon.hidden_power
            existing.friendship = pokemon.friendship
            auto_assign_catch(room, existing)
            continue

        inferred = CatchRecord(
            id=f"reconcile-{snapshot.player_id}-{pokemon.personality}",
            player_id=snapshot.player_id,
            player_name=snapshot.player_name,
            species_id=pokemon.species_id,
            species_name=pokemon.species_name or pokemon.nickname or f"Pokemon #{pokemon.species_id}",
            nickname=pokemon.nickname,
            route=pokemon.met_location,
            route_name=pokemon.met_location_name,
            level=pokemon.level,
            personality=pokemon.personality,
            met_level=pokemon.met_level,
            types=pokemon.types,
            alive=pokemon.current_hp > 0,
            in_party=True,
            nature=pokemon.nature,
            ivs=pokemon.ivs,
            evs=pokemon.evs,
            held_item=pokemon.held_item,
            held_item_id=pokemon.held_item_id,
            hidden_power=pokemon.hidden_power,
            friendship=pokemon.friendship,
            timestamp=datetime.utcnow(),
        )
        room.catches.append(inferred)
        auto_assign_catch(room, inferred)


def update_in_party_flags(room: Room, snapshot: PlayerSnapshot):
    party_personalities = {pokemon.personality for pokemon in snapshot.current_party}
    for catch in room.catches:
        if catch.player_id == snapshot.player_id:
            catch.in_party = catch.personality in party_personalities


def rebuild_pairs(room: Room):
    catch_index: dict[tuple[str, int], CatchRecord] = {}
    routes_seen: dict[int, str] = {}
    for catch in room.catches:
        catch_index[catch_identity(catch.player_id, catch.personality)] = catch
        if catch.route not in routes_seen and catch.route_name:
            routes_seen[catch.route] = catch.route_name
        auto_assign_catch(room, catch)

    is_race = room.settings.mode == "race"
    if is_race:
        teams: dict[str, list[str]] = defaultdict(list)
        for pid in room.players:
            teams[get_player_team(room, pid) or "A"].append(pid)
        team_groups = list(teams.items())
    else:
        team_groups = [("", list(room.players.keys()))]

    room.pairs = []
    for team_label, team_pids in team_groups:
        all_routes: set[int] = set()
        for pid in team_pids:
            all_routes.update(room.route_assignments.get(pid, {}).keys())

        for route in sorted(all_routes):
            route_name = routes_seen.get(route, "")
            player_catches: dict[str, CatchRecord] = {}
            for player_id in team_pids:
                personality = room.route_assignments.get(player_id, {}).get(route)
                if personality is None:
                    continue
                catch = catch_index.get(catch_identity(player_id, personality))
                if catch:
                    player_catches[player_id] = catch
                    if not route_name and catch.route_name:
                        route_name = catch.route_name
            if player_catches:
                room.pairs.append(
                    PairGroup(route=route, route_name=route_name, pokemon=player_catches, team=team_label)
                )

    room.pairs.sort(
        key=lambda pair: min(
            (catch.timestamp for catch in pair.pokemon.values() if catch.timestamp),
            default=datetime(2000, 1, 1),
        )
    )
