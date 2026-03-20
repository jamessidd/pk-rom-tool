local LocationLookup = {}

-- Kanto Routes 1-25 are confirmed across FireRed/Radical Red.
-- City, dungeon, and landmark IDs need in-game verification per ROM hack.
-- Replace [??] placeholders with verified IDs.
--
-- TODO: Add location tables for other games:
--   - Pokemon Emerald / Emerald Kaizo (Hoenn)
--   - Pokemon Unbound (Borrius)
--   - Inclement Emerald (Hoenn)
--   - Crystal Clear (Johto/Kanto)

local LOCATIONS = {
    -- Kanto Routes (confirmed)
    [101] = "Route 1",
    [102] = "Route 2",
    [103] = "Route 3",
    [104] = "Route 4",
    [105] = "Route 5",
    [106] = "Route 6",
    [107] = "Route 7",
    [108] = "Route 8",
    [109] = "Route 9",
    [110] = "Route 10",
    [111] = "Route 11",
    [112] = "Route 12",
    [113] = "Route 13",
    [114] = "Route 14",
    [115] = "Route 15",
    [116] = "Route 16",
    [117] = "Route 17",
    [118] = "Route 18",
    [119] = "Route 19",
    [120] = "Route 20",
    [121] = "Route 21",
    [122] = "Route 22",
    [123] = "Route 23",
    [124] = "Route 24",
    [125] = "Route 25",

    -- Cities / Towns (verify in-game)
    -- [??] = "Pallet Town",
    -- [??] = "Viridian City",
    -- [??] = "Pewter City",
    -- [??] = "Cerulean City",
    -- [??] = "Lavender Town",
    -- [??] = "Vermilion City",
    -- [??] = "Celadon City",
    -- [??] = "Fuchsia City",
    -- [??] = "Saffron City",
    -- [??] = "Cinnabar Island",
    -- [??] = "Indigo Plateau",

    -- Dungeons / Landmarks (verify in-game)
    -- [??] = "Viridian Forest",
    -- [??] = "Mt. Moon",
    -- [??] = "Rock Tunnel",
    -- [??] = "Diglett's Cave",
    -- [??] = "S.S. Anne",
    -- [??] = "Pokemon Tower",
    -- [??] = "Silph Co.",
    -- [??] = "Pokemon Mansion",
    -- [??] = "Safari Zone",
    -- [??] = "Seafoam Islands",
    -- [??] = "Victory Road",
    -- [??] = "Cerulean Cave",
    -- [??] = "Power Plant",
    -- [??] = "Underground Path",
}

function LocationLookup.getName(id)
    if not id then
        return "Unknown"
    end

    return LOCATIONS[id] or string.format("Location %d", id)
end

return LocationLookup
