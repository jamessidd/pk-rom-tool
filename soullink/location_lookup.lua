local gameUtils = require("utils.gameutils")
local charmaps = require("data.charmaps")

local LocationLookup = {}

local _cache = nil
local _scanAttempted = false

-- GBA charmap byte values for uppercase letters (0xBB=A .. 0xD4=Z), space=0x00, terminator=0xFF
-- "PALLET TOWN" encoded: P(0xCA) A(0xBB) L(0xC6) L(0xC6) E(0xBF) T(0xCE) ' '(0x00) T(0xCE) O(0xC9) W(0xD1) N(0xC8) FF
local PALLET_BYTES = {0xCA, 0xBB, 0xC6, 0xC6, 0xBF, 0xCE, 0x00, 0xCE, 0xC9, 0xD1, 0xC8, 0xFF}
local PALLET_MAPSEC = 0x58 -- 88

-- CFRU static fallback: used if ROM scan fails
local CFRU_FALLBACK = {
    [88]  = "Pallet Town",
    [89]  = "Viridian City",
    [90]  = "Pewter City",
    [91]  = "Cerulean City",
    [92]  = "Lavender Town",
    [93]  = "Vermilion City",
    [94]  = "Celadon City",
    [95]  = "Fuchsia City",
    [96]  = "Cinnabar Island",
    [97]  = "Indigo Plateau",
    [98]  = "Saffron City",
    [99]  = "Route 4",       -- Route 4 PokeCenter fly dup
    [100] = "Route 10",      -- Route 10 PokeCenter fly dup
    [101] = "Route 1",   [102] = "Route 2",   [103] = "Route 3",
    [104] = "Route 4",   [105] = "Route 5",   [106] = "Route 6",
    [107] = "Route 7",   [108] = "Route 8",   [109] = "Route 9",
    [110] = "Route 10",  [111] = "Route 11",  [112] = "Route 12",
    [113] = "Route 13",  [114] = "Route 14",  [115] = "Route 15",
    [116] = "Route 16",  [117] = "Route 17",  [118] = "Route 18",
    [119] = "Route 19",  [120] = "Route 20",  [121] = "Route 21",
    [122] = "Route 22",  [123] = "Route 23",  [124] = "Route 24",
    [125] = "Route 25",
    [126] = "Viridian Forest",
    [127] = "Mt. Moon",
    [128] = "S.S. Anne",
    [129] = "Underground Path",
    [130] = "Underground Path",
    [131] = "Diglett's Cave",
    [132] = "Victory Road",
    [133] = "Rocket Hideout",
    [134] = "Silph Co.",
    [135] = "Pokemon Mansion",
    [136] = "Safari Zone",
    [137] = "Pokemon League",
    [138] = "Rock Tunnel",
    [139] = "Seafoam Islands",
    [140] = "Pokemon Tower",
    [141] = "Cerulean Cave",
    [142] = "Power Plant",
    [143] = "One Island",
    [144] = "Two Island",
    [145] = "Three Island",
    [146] = "Four Island",
    [147] = "Five Island",
    [148] = "Seven Island",
    [149] = "Six Island",
    [150] = "Kindle Road",
    [151] = "Treasure Beach",
    [152] = "Cape Brink",
    [153] = "Bond Bridge",
    [154] = "Three Isle Port",
    [175] = "Mt. Ember",
    [176] = "Berry Forest",
    [195] = "Ember Spa",
    [196] = "Celadon Dept.",
}

local function readGBAString(addr)
    local chars = {}
    local charmap = charmaps.GBACharmap
    for i = 0, 24 do
        local byte = memory.read_u8((addr + i) & 0x1FFFFFF, "ROM")
        if byte == 0xFF then break end
        local ch = charmap[byte]
        if ch then
            chars[#chars + 1] = ch
        end
    end
    local str = table.concat(chars)
    return str:gsub("%s*$", "")
end

local function isROMPointer(val)
    return val >= 0x08000000 and val < 0x0A000000
end

local function scanROM()
    if _scanAttempted then return _cache end
    _scanAttempted = true

    console.log("[LocationLookup] Scanning ROM for MAPSEC name table...")

    -- Step 1: find "PALLET TOWN" string in ROM (search in 64KB chunks)
    local palletAddr = nil
    local patternLen = #PALLET_BYTES
    local CHUNK = 0x10000

    for base = 0, 0x01FFFFFF - CHUNK, CHUNK do
        for offset = 0, CHUNK - patternLen do
            local addr = base + offset
            local match = true
            for i = 1, patternLen do
                if memory.read_u8(addr + i - 1, "ROM") ~= PALLET_BYTES[i] then
                    match = false
                    break
                end
            end
            if match then
                palletAddr = 0x08000000 + addr
                break
            end
        end
        if palletAddr then break end
    end

    if not palletAddr then
        console.log("[LocationLookup] Could not find 'PALLET TOWN' in ROM, using fallback table")
        _cache = CFRU_FALLBACK
        return _cache
    end

    console.log(string.format("[LocationLookup] Found 'PALLET TOWN' at 0x%08X", palletAddr))

    -- Step 2: find 4-byte pointer to that string in ROM
    local b1 = palletAddr & 0xFF
    local b2 = (palletAddr >> 8) & 0xFF
    local b3 = (palletAddr >> 16) & 0xFF
    local b4 = (palletAddr >> 24) & 0xFF
    local ptrLocations = {}

    for base = 0, 0x01FFFFFF - CHUNK, CHUNK do
        for offset = 0, CHUNK - 4 do
            local addr = base + offset
            if memory.read_u8(addr, "ROM") == b1 and
               memory.read_u8(addr + 1, "ROM") == b2 and
               memory.read_u8(addr + 2, "ROM") == b3 and
               memory.read_u8(addr + 3, "ROM") == b4 then
                ptrLocations[#ptrLocations + 1] = addr
            end
        end
    end

    console.log(string.format("[LocationLookup] Found %d pointer candidates", #ptrLocations))

    -- Step 3: determine table base and struct size
    -- Pallet Town is at MAPSEC index 0x58 (88).
    -- Try struct sizes of 4, 8, and 12 bytes.
    for _, ptrOffset in ipairs(ptrLocations) do
        for _, structSize in ipairs({8, 4, 12}) do
            local tableBase = ptrOffset - (PALLET_MAPSEC * structSize)
            if tableBase >= 0 then
                -- verify: entry 89 (Viridian City) should also be a valid ROM pointer to a name string
                local nextEntryAddr = tableBase + 89 * structSize
                local nextPtr = memory.read_u32_le(nextEntryAddr, "ROM")
                if isROMPointer(nextPtr) then
                    local testName = readGBAString(nextPtr & 0x1FFFFFF)
                    if testName:upper():find("VIRIDIAN") then
                        console.log(string.format(
                            "[LocationLookup] FOUND name table at ROM+0x%06X (struct size=%d)",
                            tableBase, structSize
                        ))

                        -- Step 4: dump all entries (MAPSEC 0-255)
                        local locations = {}
                        local count = 0
                        for mapsec = 0, 255 do
                            local entryAddr = tableBase + mapsec * structSize
                            if entryAddr + 4 <= 0x02000000 then
                                local namePtr = memory.read_u32_le(entryAddr, "ROM")
                                if isROMPointer(namePtr) then
                                    local name = readGBAString(namePtr & 0x1FFFFFF)
                                    if name ~= "" then
                                        locations[mapsec] = name
                                        count = count + 1
                                    end
                                end
                            end
                        end

                        console.log(string.format("[LocationLookup] Loaded %d location names from ROM", count))
                        _cache = locations
                        return _cache
                    end
                end
            end
        end
    end

    console.log("[LocationLookup] ROM scan could not determine table structure, using fallback")
    _cache = CFRU_FALLBACK
    return _cache
end

function LocationLookup.init()
    scanROM()
end

function LocationLookup.getName(id)
    if not id then
        return "Unknown"
    end

    local locations = _cache or CFRU_FALLBACK
    return locations[id] or string.format("Location %d", id)
end

function LocationLookup.getAll()
    return _cache or CFRU_FALLBACK
end

function LocationLookup.dumpToConsole()
    local locations = _cache or CFRU_FALLBACK
    console.log("--- MAPSEC Location Dump ---")
    local keys = {}
    for k in pairs(locations) do keys[#keys + 1] = k end
    table.sort(keys)
    for _, k in ipairs(keys) do
        console.log(string.format("  [%3d] (0x%02X) = %s", k, k, locations[k]))
    end
    console.log(string.format("--- Total: %d entries ---", #keys))
end

return LocationLookup
