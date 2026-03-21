-- =============================================================
-- MAPSEC Location Name Dumper (Dev Tool)
-- =============================================================
-- Self-running BizHawk script. Load a ROM, run this script, and
-- it handles everything automatically:
--   1. Detects ROM size
--   2. Scans for the MAPSEC name table
--   3. Writes a ready-to-paste Lua table to tools/location_dump.lua
--   4. Stops itself when done
--
-- Usage:
--   1. Load your ROM in BizHawk (any screen is fine)
--   2. Tools > Lua Console > Open Script > this file
--   3. Wait for "DONE" in the console (~1-3 minutes)
--   4. Open tools/location_dump.lua and paste into location_lookup.lua
--
-- Output goes to a FILE, not the console, so BizHawk's message
-- cap won't truncate anything.
--
-- NOTE: Anchor MAPSEC IDs (89 = Viridian City, 101 = Route 1)
-- are verified for Radical Red. Other CFRU hacks may use different
-- IDs. If the scanner fails, update the ANCHORS and VERIFY tables
-- below with confirmed in-game MAPSEC values from your ROM.
-- =============================================================

local SCRIPT_DIR = debug.getinfo(1, "S").source:match("@?(.*[\\/])") or "./"
local OUTPUT_FILE = SCRIPT_DIR .. "location_dump.lua"

-- ---- GBA character map (inline, no external dependencies) ----
local GBACharmap = { [0]=
    " ", "À", "Á", "Â", "Ç", "È", "É", "Ê", "Ë", "Ì", "こ", "Î", "Ï", "Ò", "Ó", "Ô",
    "Œ", "Ù", "Ú", "Û", "Ñ", "ß", "à", "á", "ね", "ç", "è", "é", "ê", "ë", "ì", "ま",
    "î", "ï", "ò", "ó", "ô", "œ", "ù", "ú", "û", "ñ", "º", "ª", "", "&", "+", "あ",
    "ぃ", "ぅ", "ぇ", "ぉ", "v", "=", "ょ", "が", "ぎ", "ぐ", "げ", "ご", "ざ", "じ", "ず", "ぜ",
    "ぞ", "だ", "ぢ", "づ", "で", "ど", "ば", "び", "ぶ", "べ", "ぼ", "ぱ", "ぴ", "ぷ", "ぺ", "ぽ",
    "っ", "¿", "¡", "Pk", "Mn", "Po", "Ké", "", "", "", "Í", "%", "(", ")", "セ", "ソ",
    "タ", "チ", "ツ", "テ", "ト", "ナ", "ニ", "ヌ", "â", "ノ", "ハ", "ヒ", "フ", "ヘ", "ホ", "í",
    "ミ", "ム", "メ", "モ", "ヤ", "ユ", "ヨ", "ラ", "リ", "↑", "↓", "←", "→", "ヲ", "ン", "ァ",
    "ィ", "ゥ", "ェ", "ォ", "ャ", "ュ", "ョ", "ガ", "ギ", "グ", "ゲ", "ゴ", "ザ", "ジ", "ズ", "ゼ",
    "ゾ", "ダ", "ヂ", "ヅ", "デ", "ド", "バ", "ビ", "ブ", "ベ", "ボ", "パ", "ピ", "プ", "ペ", "ポ",
    "ッ", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "!", "?", ".", "-", "・",
    "…", "\"", "\"", "'", "'", "♂", "♀", "$", ",", "×", "/", "A", "B", "C", "D", "E",
    "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U",
    "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k",
    "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "▶",
    ":", "Ä", "Ö", "Ü", "ä", "ö", "ü", "↑", "↓", "←", "", "", "", "", "", ""
}

-- ---- Anchor strings for cross-verification ----
-- These MAPSEC IDs are confirmed for Radical Red (CFRU).
-- Other hacks may assign different IDs to the same locations.
-- If the scanner fails for your game, catch a Pokemon in a known
-- city, check its metLocation byte, and update these values.
local ANCHORS = {
    { mapsec = 89, label = "Viridian City", patterns = {
        {0xD0,0xDD,0xE6,0xDD,0xD8,0xDD,0xD5,0xE2,0x00,0xBD,0xDD,0xE8,0xED,0xFF},
        {0xD0,0xC3,0xCC,0xC3,0xBE,0xC3,0xBB,0xC8,0x00,0xBD,0xC3,0xCE,0xD3,0xFF},
    }},
    { mapsec = 101, label = "Route 1", patterns = {
        {0xCC,0xE3,0xE9,0xE8,0xD9,0x00,0xA2,0xFF},
        {0xCC,0xC9,0xCF,0xCE,0xBF,0x00,0xA2,0xFF},
    }},
}

local VERIFY = {
    { mapsec = 89,  exact = "Viridian City", alt = "VIRIDIAN CITY" },
    { mapsec = 101, exact = "Route 1",       alt = "ROUTE 1" },
}

-- ---- Helpers ----

local function readStr(addr)
    local chars = {}
    for i = 0, 30 do
        local b = memory.read_u8((addr + i) & 0x1FFFFFF, "ROM")
        if b == 0xFF then break end
        local ch = GBACharmap[b]
        if ch then chars[#chars + 1] = ch end
    end
    return table.concat(chars):gsub("%s*$", "")
end

local function isROMPtr(v) return v >= 0x08000000 and v < 0x0A000000 end

local function isLocationName(s)
    if #s == 0 or #s > 22 then return false end
    if s:match("^%s") then return false end
    if not s:match("^[A-Z0-9]") then return false end
    return true
end

local function yield()
    if emu and emu.frameadvance then emu.frameadvance() end
end

local function findAll(pattern, romSize)
    local results = {}
    for addr = 0, romSize - #pattern do
        local ok = true
        for i = 1, #pattern do
            if memory.read_u8(addr + i - 1, "ROM") ~= pattern[i] then ok = false; break end
        end
        if ok then results[#results + 1] = addr end
        if addr % 0x10000 == 0 then yield() end
    end
    return results
end

local function findPtrs(target, romSize)
    local b1, b2, b3, b4 = target & 0xFF, (target>>8) & 0xFF, (target>>16) & 0xFF, (target>>24) & 0xFF
    local results = {}
    local off = target - 0x08000000

    -- Search near the string first (±2MB), then full ROM if nothing found
    local ranges = {
        { math.max(0, off - 0x200000), math.min(romSize - 4, off + 0x200000) },
        { 0, romSize - 4 },
    }
    for _, range in ipairs(ranges) do
        if #results > 0 then break end
        local lo = range[1] - (range[1] % 4)
        for addr = lo, range[2], 4 do
            if memory.read_u8(addr,"ROM")==b1 and memory.read_u8(addr+1,"ROM")==b2 and
               memory.read_u8(addr+2,"ROM")==b3 and memory.read_u8(addr+3,"ROM")==b4 then
                results[#results+1] = addr
            end
            if addr % 0x40000 == 0 then yield() end
        end
    end
    return results
end

local function tryTable(ptrOffset, anchorMapsec, romSize)
    for stride = 4, 32, 2 do
        for nameOff = 0, math.min(stride - 4, 12), 4 do
            local base = ptrOffset - nameOff - (anchorMapsec * stride)
            if base >= 0 and base + 255 * stride < romSize then
                local good = true
                for _, vp in ipairs(VERIFY) do
                    if vp.mapsec ~= anchorMapsec then
                        local ca = base + vp.mapsec * stride + nameOff
                        if ca + 4 <= romSize then
                            local p = memory.read_u32_le(ca, "ROM")
                            if isROMPtr(p) then
                                local n = readStr(p & 0x1FFFFFF)
                                if n ~= vp.exact and n ~= vp.alt then good = false end
                            else good = false end
                        else good = false end
                    end
                end
                if good then
                    return base, stride, nameOff
                end
            end
        end
    end
    return nil
end

-- ---- Main scan ----

local function run()
    console.clear()
    console.log("=========================================")
    console.log("  MAPSEC Location Name Dumper")
    console.log("=========================================")
    console.log("")

    -- Detect ROM size
    local romSize = 0x01000000
    local ok, _ = pcall(function() memory.read_u8(0x01800000, "ROM") end)
    if ok then romSize = 0x02000000 end
    console.log(string.format("ROM size: %d MB", romSize / 0x100000))
    console.log("Output: " .. OUTPUT_FILE)
    console.log("")
    console.log("Scanning... emulator will stutter but won't freeze.")
    console.log("")

    for _, anchor in ipairs(ANCHORS) do
        for _, pattern in ipairs(anchor.patterns) do
            console.log(string.format("[scan] Searching for '%s' (MAPSEC %d)...", anchor.label, anchor.mapsec))
            local strings = findAll(pattern, romSize)
            console.log(string.format("[scan]   %d match(es)", #strings))

            for _, soff in ipairs(strings) do
                local absAddr = 0x08000000 + soff
                console.log(string.format("[scan]   String at 0x%08X — finding pointers...", absAddr))
                local ptrs = findPtrs(absAddr, romSize)
                console.log(string.format("[scan]   %d pointer(s)", #ptrs))

                for _, poff in ipairs(ptrs) do
                    local base, stride, nameOff = tryTable(poff, anchor.mapsec, romSize)
                    if base then
                        console.log(string.format("[scan] TABLE FOUND at ROM+0x%06X (stride=%d)", base, stride))

                        -- Collect entries, filtering out descriptions and garbage
                        local entries = {}
                        local skipped = 0
                        for m = 0, 255 do
                            local ea = base + m * stride + nameOff
                            if ea + 4 <= romSize then
                                local np = memory.read_u32_le(ea, "ROM")
                                if isROMPtr(np) then
                                    local name = readStr(np & 0x1FFFFFF)
                                    if isLocationName(name) then
                                        entries[#entries + 1] = { id = m, name = name }
                                    elseif name ~= "" then
                                        skipped = skipped + 1
                                    end
                                end
                            end
                        end
                        if skipped > 0 then
                            console.log(string.format("[scan] Filtered out %d non-name entries (descriptions/garbage)", skipped))
                        end

                        -- Write to file
                        local f = io.open(OUTPUT_FILE, "w")
                        f:write("-- =================================================\n")
                        f:write("-- MAPSEC Location Dump (auto-generated)\n")
                        f:write(string.format("-- Date: %s\n", os.date("%Y-%m-%d %H:%M:%S")))
                        f:write(string.format("-- Table: ROM+0x%06X, stride=%d, %d entries\n", base, stride, #entries))
                        f:write("-- =================================================\n")
                        f:write("--\n")
                        f:write("-- HOW TO USE:\n")
                        f:write("--   1. Copy the table below\n")
                        f:write("--   2. Open soullink/location_lookup.lua\n")
                        f:write('--   3. Replace CHANGE_ME with your game name (e.g. "radical red")\n')
                        f:write("--   4. Paste it alongside the other GAME_LOCATIONS tables\n")
                        f:write("--\n\n")
                        f:write('GAME_LOCATIONS["CHANGE_ME"] = {\n')
                        for _, e in ipairs(entries) do
                            local safe = e.name:gsub('"', '\\"')
                            f:write(string.format('    [%d] = "%s",\n', e.id, safe))
                        end
                        f:write("}\n")
                        f:close()

                        console.log("")
                        console.log(string.format("DONE! Wrote %d entries to:", #entries))
                        console.log("  " .. OUTPUT_FILE)
                        console.log("")
                        console.log('Rename CHANGE_ME to your game name and paste')
                        console.log("into soullink/location_lookup.lua")
                        console.log("=========================================")
                        return true
                    end
                end
            end
        end
    end

    console.log("")
    console.log("FAILED: Could not find MAPSEC name table in this ROM.")
    console.log("You may need to add location entries manually.")
    console.log("=========================================")
    return false
end

-- ---- Auto-run (like main.lua) ----
local success, err = pcall(run)
if not success then
    console.log("ERROR: " .. tostring(err))
end
