-- Debug script: dump raw type IDs from the species data table
-- Run this AFTER main.lua is loaded in BizHawk (dofile from console)

local gameUtils = require("utils.gameutils")
local constants = require("data.constants")
local pokemonData = require("readers.pokemondata")

local gameData = MemoryReader.currentGame
if not gameData then
    print("ERROR: No game loaded. Make sure main.lua has initialized.")
    return
end

print("========================================")
print("TYPE DIAGNOSTIC DUMP")
print("Game: " .. (gameData.gameInfo.name or "?"))
print("Gen:  " .. (gameData.gameInfo.generation or "?"))
print("========================================")

print("\n--- Constants type table (typeId -> name) ---")
for i = 0, 30 do
    local name = constants.pokemonData.type[i + 1]
    if name then
        print(string.format("  typeId %2d  ->  index %2d  ->  %s", i, i + 1, name))
    end
end

print("\n--- Species with known Fairy typing (National Dex IDs) ---")

local testSpecies = {
    {id = 35,  name = "Clefairy"},
    {id = 36,  name = "Clefable"},
    {id = 39,  name = "Jigglypuff"},
    {id = 173, name = "Cleffa"},
    {id = 175, name = "Togepi"},
    {id = 176, name = "Togetic"},
    {id = 183, name = "Marill"},
    {id = 209, name = "Snubbull"},
    {id = 280, name = "Ralts"},
    {id = 282, name = "Gardevoir"},
    {id = 303, name = "Mawile"},
}

local speciesDataAddr = gameData.addresses.speciesDataTable
if not speciesDataAddr then
    print("ERROR: No speciesDataTable address found.")
    return
end

local isCFRU = gameData.gameInfo.generation == "CFRU"
local tableAddr = gameUtils.hexToNumber(speciesDataAddr)
local structSize = 28

for _, entry in ipairs(testSpecies) do
    local sid = entry.id
    local rawType1, rawType2

    if isCFRU then
        local addr = tableAddr + ((sid - 1) * structSize)
        local bytes = gameUtils.readBytesCFRU(addr, structSize)
        rawType1 = bytes[7]
        rawType2 = bytes[8]
    else
        local addr = tableAddr + (sid * structSize)
        rawType1 = gameUtils.read8(addr + 6, "ROM")
        rawType2 = gameUtils.read8(addr + 7, "ROM")
    end

    local name1 = pokemonData.getTypeName(rawType1)
    local name2 = pokemonData.getTypeName(rawType2)

    print(string.format("  #%03d %-12s  type1=%2d (%s)  type2=%2d (%s)",
        sid, entry.name, rawType1, name1, rawType2, name2))
end

print("\n--- All unique type IDs across first 500 species ---")
local uniqueTypes = {}
for sid = 1, 500 do
    local rawType1, rawType2

    if isCFRU then
        local addr = tableAddr + ((sid - 1) * structSize)
        local ok, bytes = pcall(gameUtils.readBytesCFRU, addr, structSize)
        if ok and bytes then
            rawType1 = bytes[7]
            rawType2 = bytes[8]
        end
    else
        local addr = tableAddr + (sid * structSize)
        local ok1, t1 = pcall(gameUtils.read8, addr + 6, "ROM")
        local ok2, t2 = pcall(gameUtils.read8, addr + 7, "ROM")
        if ok1 then rawType1 = t1 end
        if ok2 then rawType2 = t2 end
    end

    if rawType1 then uniqueTypes[rawType1] = true end
    if rawType2 then uniqueTypes[rawType2] = true end
end

local sorted = {}
for tid, _ in pairs(uniqueTypes) do table.insert(sorted, tid) end
table.sort(sorted)

for _, tid in ipairs(sorted) do
    local name = pokemonData.getTypeName(tid)
    local tag = (name == "Unknown") and "  <-- UNMAPPED!" or ""
    print(string.format("  typeId %3d  ->  %s%s", tid, name, tag))
end

print("\n--- Player party types (live) ---")
local party = MemoryReader.getPartyData()
if party then
    for i, mon in ipairs(party) do
        if mon and mon.speciesName and mon.speciesName ~= "" then
            local t1 = mon.type1 or "?"
            local t2 = mon.type2 or "?"
            local t1n = mon.type1Name or "?"
            local t2n = mon.type2Name or "?"
            print(string.format("  Slot %d: %-12s  type1=%s (%s)  type2=%s (%s)",
                i, mon.speciesName or mon.species or "?",
                tostring(t1), t1n, tostring(t2), t2n))
        end
    end
else
    print("  (no party data available)")
end

print("\n========================================")
print("DONE. Check for any 'UNMAPPED' entries above.")
print("========================================")
