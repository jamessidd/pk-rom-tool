-- Pokemon Memory Reader - Main Script (mGBA version)
-- Uses mGBA's callback-based scripting API instead of BizHawk's blocking loop

MemoryReader = {}
MemoryReader.currentGame = nil
MemoryReader.gameAddresses = nil
MemoryReader.isInitialized = false
MemoryReader.partyReader = nil
MemoryReader.playerReader = nil
MemoryReader.server = nil
MemoryReader.serverEnabled = true
MemoryReader.serverPort = 8080
MemoryReader.serverHost = "localhost"
MemoryReader.serverAutoNext = false
MemoryReader.soulLink = nil
MemoryReader.battleReader = nil

local gameDetection = require("core.gamedetection")
local CFRUPartyReader = require("readers.party.cfrupartyreader")

local Gen3PartyReader = require("readers.party.gen3partyreader")
local Gen2PartyReader = require("readers.party.gen2partyreader")
local Gen1PartyReader = require("readers.party.gen1partyreader")

local CFRUPlayerReader = require("readers.player.cfruplayerreader")
local Gen3PlayerReader = require("readers.player.gen3playerreader")
local Gen2PlayerReader = require("readers.player.gen2playerreader")
local Gen1PlayerReader = require("readers.player.gen1playerreader")

local gameUtils = require("utils.gameutils")
local debugTools = require("debug.debugtools")
local Server = require("network.server")
local gamesDB = require("data.gamesdb")
local SoulLinkState = require("soullink.state")
local BattleReader = require("readers.battle.battlereader")

local function parseAutoNext(value)
    if value == true or value == 1 then
        return true
    end
    if type(value) == "string" then
        local normalized = value:lower()
        return normalized == "true" or normalized == "1" or normalized == "yes" or normalized == "auto"
    end
    return false
end

local function normalizeServerOptions(port, autoNext, host)
    local desiredPort = tonumber(port) or MemoryReader.serverPort or 8080
    local desiredHost = host or MemoryReader.serverHost or "localhost"
    local shouldAutoNext = autoNext ~= nil and parseAutoNext(autoNext) or MemoryReader.serverAutoNext or false
    return math.floor(desiredPort), shouldAutoNext, desiredHost
end

local function tryStartServerOnPort(port, host)
    local server = Server:new(MemoryReader, port, host)
    local success, reason, detail = server:start()
    if success then
        MemoryReader.server = server
        MemoryReader.serverPort = port
        MemoryReader.serverHost = host
        return true
    end
    return false, reason, detail
end


function MemoryReader.initialize()
    console:log("----- Pokemon Memory Reader (mGBA) -----")
    console:log("Initializing...")

    local detectedGame = gameDetection.detectGame()

    if detectedGame and detectedGame.gameInfo then
        local gameName = detectedGame.gameInfo.gameName or "Unknown Game"
        console:log("Game found: " .. gameName)

        MemoryReader.currentGame = detectedGame
        MemoryReader.isInitialized = true

        local generation = detectedGame.gameInfo.generation

        if generation == "CFRU" then
            MemoryReader.partyReader = CFRUPartyReader:new()
            MemoryReader.playerReader = CFRUPlayerReader:new()
        elseif generation == 3 then
            MemoryReader.partyReader = Gen3PartyReader:new()
            MemoryReader.playerReader = Gen3PlayerReader:new()
        elseif generation == 2 then
            MemoryReader.partyReader = Gen2PartyReader:new()
            MemoryReader.playerReader = Gen2PlayerReader:new()
        elseif generation == 1 then
            MemoryReader.partyReader = Gen1PartyReader:new()
            MemoryReader.playerReader = Gen1PlayerReader:new()
        else
            console:log("Unsupported generation: " .. tostring(generation))
            return false
        end

        if MemoryReader.serverEnabled then
            MemoryReader.startServer()
        end

        MemoryReader.soulLink = SoulLinkState:new()
        MemoryReader.battleReader = BattleReader:new()

        return true
    else
        local supportedGames = gameDetection.getSupportedGames()
        console:log("No supported Pokemon game detected!")
        console:log("Supported games: " .. table.concat(supportedGames, ", "))
        return false
    end
end

function MemoryReader.update()
    if not MemoryReader.isInitialized then
        return
    end

    if MemoryReader.server then
        MemoryReader.server:update()
    end

    if MemoryReader.soulLink then
        MemoryReader.soulLink:update(MemoryReader)
    end
end

function MemoryReader.getEnemyPartyData()
    if not MemoryReader.isInitialized then return nil end
    if not MemoryReader.partyReader then return nil end

    local gen = MemoryReader.currentGame.gameInfo.generation
    if gen ~= "CFRU" and gen ~= 3 then return nil end
    if not MemoryReader.currentGame.addresses.enemyPartyAddr then return nil end

    local flagsAddr = MemoryReader.currentGame.addresses.gBattleTypeFlags
    if flagsAddr then
        local flags = gameUtils.read32(gameUtils.hexToNumber(flagsAddr))
        if flags == 0 then
            if MemoryReader.battleReader then
                MemoryReader.battleReader:resetStructSize()
            end
            return nil
        end
    end

    local enemyAddr = gameUtils.hexToNumber(MemoryReader.currentGame.addresses.enemyPartyAddr)
    return MemoryReader.partyReader:readEnemyParty({enemyPartyAddr = enemyAddr})
end

function MemoryReader.getActiveSlots(playerParty, enemyParty)
    if not MemoryReader.isInitialized then return nil end
    if not MemoryReader.battleReader then return nil end

    local addr = MemoryReader.currentGame.addresses.gBattleMons
    if not addr then return nil end

    local flagsAddr = MemoryReader.currentGame.addresses.gBattleTypeFlags
    if flagsAddr then
        local flags = gameUtils.read32(gameUtils.hexToNumber(flagsAddr))
        if flags == 0 then return nil end
    end

    return MemoryReader.battleReader:getActiveSlots(addr, playerParty, enemyParty)
end

function MemoryReader.getPartyData()
    if not MemoryReader.isInitialized then
        console:log("Memory Reader not initialized! Please restart the script.")
        return nil
    end

    if not MemoryReader.partyReader then
        console:log("Party reader not available for this game!")
        return nil
    end

    local gameCode = MemoryReader.currentGame.gameInfo.gameCode
    local party

    if MemoryReader.currentGame.gameInfo.generation == 1 or MemoryReader.currentGame.gameInfo.generation == 2 then
        party = MemoryReader.partyReader:readParty(MemoryReader.currentGame.addresses, gameCode)
    else
        if not MemoryReader.currentGame.addresses.partyAddr then
            console:log("Player party address not available!")
            return nil
        end
        local partyAddr = gameUtils.hexToNumber(MemoryReader.currentGame.addresses.partyAddr)
        party = MemoryReader.partyReader:readParty({partyAddr = partyAddr}, gameCode)
    end

    return party
end

function MemoryReader.startServer(port, autoNext, host)
    if MemoryReader.server then
        console:log("Server is already running on http://" .. MemoryReader.serverHost .. ":" .. MemoryReader.serverPort)
        return true
    end

    local desiredPort, shouldAutoNext, desiredHost = normalizeServerOptions(port, autoNext, host)
    local maxAttempts = shouldAutoNext and 10 or 1
    MemoryReader.serverPort = desiredPort
    MemoryReader.serverHost = desiredHost
    MemoryReader.serverAutoNext = shouldAutoNext

    for offset = 0, maxAttempts - 1 do
        local tryPort = desiredPort + offset
        local success, reason, detail = tryStartServerOnPort(tryPort, desiredHost)
        if success then
            if offset > 0 then
                console:log("Requested port " .. desiredPort .. " was unavailable. Using http://" .. desiredHost .. ":" .. tryPort)
            end
            return true
        end

        if reason == "bind_failed" and shouldAutoNext and offset < maxAttempts - 1 then
            console:log("Port " .. tryPort .. " is already in use. Trying " .. (tryPort + 1) .. "...")
        elseif reason == "bind_failed" then
            console:log("Port " .. tryPort .. " is already in use.")
        elseif reason == "listen_failed" then
            console:log("Failed to listen on http://" .. desiredHost .. ":" .. tryPort .. " - " .. tostring(detail or "unknown error"))
        else
            console:log("Failed to start server on http://" .. desiredHost .. ":" .. tryPort)
        end
    end

    if shouldAutoNext then
        console:log("No open port found in range " .. desiredPort .. "-" .. (desiredPort + maxAttempts - 1))
    else
        console:log("Tip: try startServer(" .. (desiredPort + 1) .. ") or startServer(" .. desiredPort .. ", true)")
    end
    return false
end

function MemoryReader.stopServer()
    if not MemoryReader.server then
        console:log("Server is not running!")
        return true
    end

    local success = MemoryReader.server:stop()
    MemoryReader.server = nil
    return success
end

function MemoryReader.toggleServer(port, autoNext, host)
    if MemoryReader.server then
        MemoryReader.stopServer()
        console:log("Server disabled")
    else
        if MemoryReader.startServer(port, autoNext, host) then
            console:log("Server enabled")
        else
            console:log("Failed to start server")
        end
    end
end

function MemoryReader.shutdown()
    console:log("Pokemon Memory Reader shutting down...")

    if MemoryReader.server then
        MemoryReader.stopServer()
    end

    MemoryReader.soulLink = nil
    MemoryReader.isInitialized = false
end

-- Register user commands
local UserCommands = require("commands.usercommands")
for name, func in pairs(UserCommands) do
    if type(func) == "function" then
        _G[name] = func
    end
end

-- Initialize and register mGBA callbacks
if MemoryReader.initialize() then
    console:log("----- PMR Ready (mGBA) -----")
    console:log("Type help() for a list of commands!")

    callbacks:add("frame", function()
        MemoryReader.update()
    end)

    callbacks:add("shutdown", function()
        MemoryReader.shutdown()
    end)
else
    console:log("Initialization failed!")
end
