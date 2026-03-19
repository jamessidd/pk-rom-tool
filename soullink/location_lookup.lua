local LocationLookup = {}

local RADICAL_RED_LOCATIONS = {
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
    [123] = "Treasure Beach",
    [124] = "Kindle Road",
    [125] = "Mt. Ember",
    [126] = "Viridian Forest",
    [127] = "Mt. Moon",
    [130] = "Rock Tunnel",
    [131] = "Cape Brink",
    [132] = "Bond Bridge",
    [133] = "Three Isle Port",
    [134] = "Icefall Cave",
    [135] = "Rocket Warehouse",
    [137] = "Lost Cave",
    [139] = "Water Path",
    [140] = "Ruin Valley",
    [141] = "Dotted Hole",
    [142] = "Pokemon Mansion",
    [143] = "Sevault Canyon",
    [144] = "Tanoby Ruins",
    [145] = "Cerulean Cave",
    [146] = "Victory Road",
    [147] = "Safari Zone",
    [157] = "Pallet Town",
    [158] = "Viridian City",
    [159] = "Pewter City",
    [160] = "Cerulean City",
    [163] = "Celadon City",
    [164] = "One Island",
    [165] = "Two Island",
    [166] = "Three Island",
    [167] = "Four Island",
    [168] = "Five Island",
    [169] = "Six Island",
    [170] = "Seven Island",
    [171] = "Navel Rock",
    [172] = "Birth Island",
}

function LocationLookup.getName(id)
    if not id then
        return "Unknown"
    end

    return RADICAL_RED_LOCATIONS[id] or string.format("Location %d", id)
end

return LocationLookup
