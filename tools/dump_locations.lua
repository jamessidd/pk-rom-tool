-- =============================================================
-- MAPSEC Location Name Dumper (Dev Tool)
-- =============================================================
-- Standalone script for BizHawk. Scans the currently loaded ROM
-- to discover all MAPSEC location name mappings.
--
-- Usage:
--   1. Load your ROM in BizHawk
--   2. Tools > Lua Console > Open Script > this file
--   3. Wait for scan to complete (may take 1-3 minutes)
--   4. Open the generated file: tools/location_dump.lua
--   5. Copy the table into soullink/location_lookup.lua
--
-- Output is written to a file (NOT the console) to avoid
-- BizHawk's console message cap truncating results.
--
-- Works for any CFRU-based ROM hack (Radical Red, Unbound, etc.)
-- =============================================================

local SCRIPT_DIR = debug.getinfo(1, "S").source:match("@?(.*[\\/])")
local OUTPUT_FILE = SCRIPT_DIR .. "location_dump.lua"

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

local function findAll(pattern, romSize)
    local results = {}
    for addr = 0, romSize - #pattern do
        local ok = true
        for i = 1, #pattern do
            if memory.read_u8(addr + i - 1, "ROM") ~= pattern[i] then ok = false; break end
        end
        if ok then results[#results + 1] = addr end
        if addr % 0x10000 == 0 then emu.frameadvance() end
    end
    return results
end

local function findPtrs(target, romSize)
    local b1, b2, b3, b4 = target & 0xFF, (target>>8) & 0xFF, (target>>16) & 0xFF, (target>>24) & 0xFF
    local results = {}
    local off = target - 0x08000000
    local lo = math.max(0, off - 0x200000) - (math.max(0, off - 0x200000) % 4)
    local hi = math.min(romSize - 4, off + 0x200000)
    for addr = lo, hi, 4 do
        if memory.read_u8(addr,"ROM")==b1 and memory.read_u8(addr+1,"ROM")==b2 and
           memory.read_u8(addr+2,"ROM")==b3 and memory.read_u8(addr+3,"ROM")==b4 then
            results[#results+1] = addr
        end
        if addr % 0x40000 == 0 then emu.frameadvance() end
    end
    if #results == 0 then
        console.log("  Widening pointer search to full ROM...")
        for addr = 0, romSize - 4, 4 do
            if memory.read_u8(addr,"ROM")==b1 and memory.read_u8(addr+1,"ROM")==b2 and
               memory.read_u8(addr+2,"ROM")==b3 and memory.read_u8(addr+3,"ROM")==b4 then
                results[#results+1] = addr
            end
            if addr % 0x40000 == 0 then emu.frameadvance() end
        end
    end
    return results
end

-- Main scan
console.clear()
console.log("=== MAPSEC Location Name Dumper ===")
console.log("Scanning ROM... this may take a few minutes.")
console.log("Output will be written to: " .. OUTPUT_FILE)
console.log("")

local romSize = 0x01000000
local ok, _ = pcall(function() memory.read_u8(0x01800000, "ROM") end)
if ok then romSize = 0x02000000 end
console.log(string.format("ROM size: %dMB", romSize / 0x100000))

for _, anchor in ipairs(ANCHORS) do
    for _, pattern in ipairs(anchor.patterns) do
        console.log(string.format("Searching for '%s' (MAPSEC %d)...", anchor.label, anchor.mapsec))
        local strings = findAll(pattern, romSize)
        console.log(string.format("  Found %d terminated match(es)", #strings))

        for _, soff in ipairs(strings) do
            local absAddr = 0x08000000 + soff
            console.log(string.format("  String at 0x%08X", absAddr))
            local ptrs = findPtrs(absAddr, romSize)
            console.log(string.format("  Found %d pointer candidate(s)", #ptrs))

            for _, poff in ipairs(ptrs) do
                for stride = 4, 32, 2 do
                    for nameOff = 0, math.min(stride-4, 12), 4 do
                        local base = poff - nameOff - (anchor.mapsec * stride)
                        if base >= 0 and base + 255*stride < romSize then
                            local good = true
                            for _, vp in ipairs(VERIFY) do
                                if vp.mapsec ~= anchor.mapsec then
                                    local ca = base + vp.mapsec*stride + nameOff
                                    if ca+4 <= romSize then
                                        local p = memory.read_u32_le(ca, "ROM")
                                        if isROMPtr(p) then
                                            local n = readStr(p & 0x1FFFFFF)
                                            if n ~= vp.exact and n ~= vp.alt then good = false end
                                        else good = false end
                                    else good = false end
                                end
                            end
                            if good then
                                console.log(string.format("TABLE FOUND at ROM+0x%06X (stride=%d)", base, stride))

                                -- Collect all entries
                                local entries = {}
                                for m = 0, 255 do
                                    local ea = base + m*stride + nameOff
                                    if ea+4 <= romSize then
                                        local np = memory.read_u32_le(ea, "ROM")
                                        if isROMPtr(np) then
                                            local name = readStr(np & 0x1FFFFFF)
                                            if name ~= "" then
                                                entries[#entries+1] = { id = m, name = name }
                                            end
                                        end
                                    end
                                end

                                -- Write to file (immune to console flood cap)
                                local f = io.open(OUTPUT_FILE, "w")
                                f:write("-- =====================================================\n")
                                f:write("-- MAPSEC Location Dump\n")
                                f:write("-- Generated by tools/dump_locations.lua\n")
                                f:write(string.format("-- Table at ROM+0x%06X, stride=%d, %d entries\n", base, stride, #entries))
                                f:write(string.format("-- Date: %s\n", os.date("%Y-%m-%d %H:%M:%S")))
                                f:write("-- =====================================================\n")
                                f:write("--\n")
                                f:write("-- Paste this table into soullink/location_lookup.lua\n")
                                f:write("-- as: GAME_LOCATIONS[\"your game name\"] = { ... }\n")
                                f:write("--\n\n")
                                f:write("GAME_LOCATIONS[\"CHANGE_ME\"] = {\n")
                                for _, e in ipairs(entries) do
                                    -- Escape quotes in location names
                                    local safe = e.name:gsub('"', '\\"')
                                    f:write(string.format('    [%d] = "%s",\n', e.id, safe))
                                end
                                f:write("}\n")
                                f:close()

                                console.log(string.format("Wrote %d entries to %s", #entries, OUTPUT_FILE))
                                console.log("")
                                console.log("DONE! Open that file, rename CHANGE_ME to your game,")
                                console.log("and paste the table into soullink/location_lookup.lua")
                                return
                            end
                        end
                    end
                end
            end
        end
    end
end

console.log("")
console.log("Could not find MAPSEC name table in this ROM.")
console.log("You may need to add entries manually to location_lookup.lua.")
