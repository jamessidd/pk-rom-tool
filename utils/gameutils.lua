-- Game Utility Functions (mGBA version)
-- Common utilities for game code conversion, address handling, etc.
local gamesDB = require("data.gamesdb")
local constants = require("data.constants")
local charmaps = require("data.charmaps")

local gameUtils = {}

-- MARK: mGBA API

function gameUtils.getSystem()
    local plat = emu:platform()
    if plat == C.PLATFORM.GBA then return "GBA"
    elseif plat == C.PLATFORM.GB then return "GB"
    else return "NULL" end
end

function gameUtils.getROMHash()
    return emu:checksum(C.CHECKSUM.CRC32)
end

function gameUtils.getGameCode()
    return emu:getGameCode()
end

function gameUtils.getGameData()
    local code = gameUtils.getGameCode()
    if code then
        local data = gamesDB.getGameByCode(code)
        if data then return data end
    end
    local hash = gameUtils.getROMHash()
    return gamesDB.getGameByHash(hash)
end

function gameUtils.getGameDataByCode(gameCode)
    return gamesDB.getGameByCode(gameCode)
end

-- Convert numeric game code to string
function gameUtils.gameCodeToString(gameCodeNum)
    if not gameCodeNum then
        return nil
    end

    if type(gameCodeNum) == "string" then
        return gameCodeNum
    end

    return string.char(
        gameCodeNum % 256,
        (gameCodeNum >> 8) % 256,
        (gameCodeNum >> 16) % 256,
        (gameCodeNum >> 24) % 256
    )
end

-- Convert hex string to number
function gameUtils.hexToNumber(hexStr)
    if type(hexStr) == "number" then
        return hexStr & 0xFFFFFFFF
    end
    if type(hexStr) == "string" then
        local s = hexStr:gsub("^0[xX]", ""):gsub("[^%x]", "")
        if s == "" then return nil end
        local n = tonumber(s, 16)
        if not n then return nil end
        return n & 0xFFFFFFFF
    end
    return nil
end

-- MARK: Read

-- mGBA uses full bus addresses directly (0x02XXXXXX for EWRAM, 0x08XXXXXX for ROM, etc.)
function gameUtils.readMemory(addr, size)
    if type(addr) == "string" then
        addr = gameUtils.hexToNumber(addr)
    end
    if not addr then return 0 end

    if size == 1 then
        return emu:read8(addr)
    elseif size == 2 then
        return emu:read16(addr)
    else
        return emu:read32(addr)
    end
end

function gameUtils.getBits(value, start, length)
    return (value >> start) & ((1 << length) - 1)
end

function gameUtils.read8(addr)
    return gameUtils.readMemory(addr, 1)
end

function gameUtils.read16(addr)
    return gameUtils.readMemory(addr, 2)
end

function gameUtils.read32(addr)
    return gameUtils.readMemory(addr, 4)
end

function gameUtils.readBytes(startAddr, size)
    if type(startAddr) == "string" then
        startAddr = gameUtils.hexToNumber(startAddr)
    end
    local bytes = {}
    for i = 0, size - 1 do
        table.insert(bytes, emu:read8(startAddr + i))
    end
    return bytes
end

function gameUtils.readByteRange(startAddr, endAddr)
    if type(startAddr) == "string" then
        startAddr = gameUtils.hexToNumber(startAddr)
    end
    if type(endAddr) == "string" then
        endAddr = gameUtils.hexToNumber(endAddr)
    end
    local bytes = {}
    for i = startAddr, endAddr do
        table.insert(bytes, emu:read8(i))
    end
    return bytes
end

-- CFRU ROM reads use 28-bit addressing mapped to 0x08XXXXXX bus space
function gameUtils.readBytesCFRU(startAddr, size)
    local offset = startAddr & 0xFFFFFFF
    local bytes = {}
    for i = 0, size - 1 do
        local romAddr = 0x08000000 + ((offset + i) & 0xFFFFFFF)
        table.insert(bytes, emu:read8(romAddr))
    end
    return bytes
end

function gameUtils.readVariableLength(startAddr, maxLength)
    if type(startAddr) == "string" then
        startAddr = gameUtils.hexToNumber(startAddr)
    end
    local bytes = {}
    for i = 0, maxLength - 1 do
        local byte = emu:read8(startAddr + i)
        if byte == 0x50 then
            break
        end
        table.insert(bytes, byte)
    end
    return {bytes, #bytes}
end


-- MARK: Write
function gameUtils.writeMemory(startAddr, value, size)
    if type(startAddr) == "string" then
        startAddr = gameUtils.hexToNumber(startAddr)
    end
    if not startAddr then return end

    if size == 1 then
        emu:write8(startAddr, value)
    elseif size == 2 then
        emu:write16(startAddr, value)
    else
        emu:write32(startAddr, value)
    end
end

function gameUtils.write8(startAddr, value)
    gameUtils.writeMemory(startAddr, value, 1)
end

function gameUtils.write16(startAddr, value)
    gameUtils.writeMemory(startAddr, value, 2)
end

function gameUtils.write24(startAddr, value)
    -- mGBA has no write24; write as 16+8
    if type(startAddr) == "string" then
        startAddr = gameUtils.hexToNumber(startAddr)
    end
    emu:write16(startAddr, value & 0xFFFF)
    emu:write8(startAddr + 2, (value >> 16) & 0xFF)
end

function gameUtils.write32(startAddr, value)
    gameUtils.writeMemory(startAddr, value, 4)
end

function gameUtils.writeBytes(startAddr, byteArray)
    if type(startAddr) == "string" then
        startAddr = gameUtils.hexToNumber(startAddr)
    end
    for i = 0, #byteArray - 1 do
        emu:write8(startAddr + i, byteArray[i + 1])
    end
end

-- MARK: Helpers

function gameUtils.hasValue(table, value)
    for _, v in ipairs(table) do
        if v == value then
            return true
        end
    end
    return false
end

function gameUtils.clamp(value, min, max)
    if value < min then
        return min
    elseif value > max then
        return max
    else
        return value
    end
end

function gameUtils.bcdToDecimal(bcdBytes)
    local decimal = 0
    for i = 1, #bcdBytes do
        local byte = bcdBytes[i]
        local highNibble = (byte >> 4) & 0x0F
        local lowNibble = byte & 0x0F
        decimal = decimal * 100 + highNibble * 10 + lowNibble
    end
    return decimal
end

function gameUtils.bytesToNumber(byteArray)
    local number = 0
    for i = 1, #byteArray do
        number = (number << 8) | byteArray[i]
    end
    return number
end

-- MARK: Print

function gameUtils.printTable(table, format)
    for k, v in pairs(table) do
        console:log(string.format(format or "%s: %s", k, v))
    end
end

function gameUtils.printHex(value)
    console:log(string.format("%X", value))
end

function gameUtils.printHexTable(table1)
    local result = ""
    for i, v in ipairs(table1) do
        result = result .. string.format("%X", v)
        if i < #table1 then
            result = result .. ", "
        end
    end
    console:log("Hex Table: " .. result)
end

return gameUtils
