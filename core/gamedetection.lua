-- Game Detection Module for Pokemon Memory Reader (mGBA version)
-- Detects which Pokemon game is currently loaded

local gameDetection = {}
local GamesDB = require("data.gamesdb")
local gameUtils = require("utils.gameutils")

function gameDetection.detectGame()
    console:log("Detecting game...")

    local systemID = gameUtils.getSystem()
    if not systemID or systemID == "NULL" then
        console:log("No system detected")
        return nil
    end

    -- mGBA: try game code first (most reliable)
    local gameCode = emu:getGameCode()
    if gameCode then
        console:log("Game code: " .. gameCode)
        local gameData = gameUtils.getGameDataByCode(gameCode)
        if gameData then
            console:log("Matched via game code: " .. (gameData.gameInfo.gameName or "Unknown"))
            return gameData
        end
    end

    -- Fallback: try CRC32 hash lookup
    local romHash = gameUtils.getROMHash()
    if romHash then
        console:log("ROM checksum: " .. romHash)
        local gameData = GamesDB.getGameByHash(romHash)
        if gameData then
            return gameData
        end
    end

    -- Fallback: read game code from memory (GBA ROM header at 0x080000AC)
    local memCode = gameDetection.findGameCode()
    if memCode then
        console:log("Game code from ROM header: " .. memCode)
        local gameData = gameUtils.getGameDataByCode(memCode)
        if gameData then
            console:log("Matched via ROM header code: " .. (gameData.gameInfo.gameName or "Unknown"))
            return gameData
        end
    end

    console:log("Unknown " .. systemID .. " game detected")
    console:log("Game code: " .. (gameCode or "N/A"))
    return nil
end

function gameDetection.findGameCode()
    -- GBA ROM header: game code at 0x080000AC (4 bytes)
    local b1 = emu:read8(0x080000AC)
    local b2 = emu:read8(0x080000AD)
    local b3 = emu:read8(0x080000AE)
    local b4 = emu:read8(0x080000AF)
    if b1 == 0 and b2 == 0 then return nil end
    return string.char(b1, b2, b3, b4)
end

function gameDetection.getSupportedGames()
    return GamesDB.getSupportedGamesList()
end

function gameDetection.isGameSupported()
    local gameCode = emu:getGameCode()
    if gameCode then
        local data = gameUtils.getGameDataByCode(gameCode)
        if data then return true end
    end
    return false
end

return gameDetection
