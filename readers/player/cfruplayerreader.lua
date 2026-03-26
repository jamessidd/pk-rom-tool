local PlayerReader = require("readers.player.playerreader")
local gameUtils = require("utils.gameutils")
local charmaps = require("data.charmaps")
local pokemonData = require("readers.pokemondata")

local CFRUPlayerReader = {}
CFRUPlayerReader.__index = CFRUPlayerReader
setmetatable(CFRUPlayerReader, {__index = PlayerReader})

function CFRUPlayerReader:new()
    local obj = PlayerReader:new()
    setmetatable(obj, CFRUPlayerReader)
    return obj
end

function CFRUPlayerReader:getSaveBlocks()
    local gameData = MemoryReader.currentGame
    local trainerPointers = gameData.trainerPointers

    local saveBlock1Addr = gameUtils.hexToNumber(trainerPointers.saveBlock1)
    local saveBlock2Addr = gameUtils.hexToNumber(trainerPointers.saveBlock2)

    if trainerPointers.isPointer then
        saveBlock1Addr = gameUtils.read32(gameUtils.hexToNumber(trainerPointers.saveBlock1))
        saveBlock2Addr = gameUtils.read32(gameUtils.hexToNumber(trainerPointers.saveBlock2))
    end

    return saveBlock1Addr, saveBlock2Addr
end

function CFRUPlayerReader:updateTrainerInfo()
    if not MemoryReader.isInitialized or not MemoryReader.currentGame then
        console:log("MemoryReader is not initialized or no game detected.")
        return false
    end

    local gameData = MemoryReader.currentGame
    if not gameData or not gameData.trainerPointers or not gameData.trainerOffsets then
        console:log("No CFRU trainer data available for this game.")
        return false
    end

    local domain = "EWRAM"
    local trainerOffsets = gameData.trainerOffsets
    local saveBlock1Addr, saveBlock2Addr = self:getSaveBlocks()

    local money = gameUtils.read32(saveBlock1Addr + trainerOffsets.money, domain)
    local coins = gameUtils.read16(saveBlock1Addr + trainerOffsets.coins, domain)

    local nameBytes = gameUtils.readBytes(saveBlock2Addr + trainerOffsets.name, 8, domain)
    local name = charmaps.decryptText(nameBytes)
    local gender = gameUtils.read8(saveBlock2Addr + trainerOffsets.gender, domain)
    local trainerID = gameUtils.read32(saveBlock2Addr + trainerOffsets.trainerID, domain)
    local publicID = trainerID & 0xFFFF
    local secretID = (trainerID >> 16) & 0xFFFF

    local encryptionKey = nil
    if trainerOffsets.encryptionKey then
        encryptionKey = gameUtils.read32(saveBlock2Addr + trainerOffsets.encryptionKey, domain)
        money = money ~ encryptionKey
        coins = coins ~ (encryptionKey & 0xFFFF)
    end

    local badgeList = {}
    if trainerOffsets.flags and trainerOffsets.badgeFlags then
        local badgeAddr = saveBlock1Addr + trainerOffsets.flags + trainerOffsets.badgeFlags
        local badgeBits = gameUtils.read8(badgeAddr, domain)
        badgeList = {
            {badgeNum = 1, name = "Boulder Badge", earned = (badgeBits & 0x01) ~= 0},
            {badgeNum = 2, name = "Cascade Badge", earned = (badgeBits & 0x02) ~= 0},
            {badgeNum = 3, name = "Thunder Badge", earned = (badgeBits & 0x04) ~= 0},
            {badgeNum = 4, name = "Rainbow Badge", earned = (badgeBits & 0x08) ~= 0},
            {badgeNum = 5, name = "Soul Badge", earned = (badgeBits & 0x10) ~= 0},
            {badgeNum = 6, name = "Marsh Badge", earned = (badgeBits & 0x20) ~= 0},
            {badgeNum = 7, name = "Volcano Badge", earned = (badgeBits & 0x40) ~= 0},
            {badgeNum = 8, name = "Earth Badge", earned = (badgeBits & 0x80) ~= 0},
        }
    end

    self.trainerInfo = {
        name = name,
        gender = gender,
        money = money,
        coins = coins,
        trainerID = {
            id = trainerID,
            public = publicID,
            secret = secretID,
        },
        badges = badgeList,
        encryptionKey = encryptionKey or nil,
    }

    return self.trainerInfo
end

function CFRUPlayerReader:readPocket(pocketAddr, count, quantityKey)
    local items = {}
    if not pocketAddr then
        return items
    end

    local domain = "EWRAM"
    for i = 0, count - 1 do
        local itemID = gameUtils.read16(pocketAddr + i * 4, domain)
        local quantity = gameUtils.read16(pocketAddr + i * 4 + 2, domain)
        if quantityKey then
            quantity = quantity ~ quantityKey
        end
        if itemID ~= 0 then
            table.insert(items, {
                id = itemID,
                quantity = quantity,
                name = pokemonData.getItemName(itemID),
            })
        end
    end

    return items
end

function CFRUPlayerReader:readTmhmPocket(pocketAddr, count, quantityKey)
    local tmhms = {tms = {}, hms = {}}
    if not pocketAddr then
        return tmhms
    end

    local domain = "EWRAM"
    for i = 0, count - 1 do
        local itemID = gameUtils.read16(pocketAddr + i * 4, domain)
        local quantity = gameUtils.read16(pocketAddr + i * 4 + 2, domain)
        if quantityKey then
            quantity = quantity ~ quantityKey
        end
        if itemID ~= 0 then
            local name = pokemonData.getItemName(itemID)
            local entry = {id = itemID, quantity = quantity, name = name}

            if name and name:match("^TM") and MemoryReader.currentGame.addresses.tmToMoveTable then
                local number = tonumber(name:match("%d+"))
                if number then
                    local moveID = pokemonData.getTMMoveID(number)
                    local moveName = pokemonData.getMoveName(moveID)
                    entry.name = string.format("%s: %s", name, moveName or "Unknown Move")
                end
                table.insert(tmhms.tms, entry)
            elseif name and name:match("^HM") and MemoryReader.currentGame.addresses.tmToMoveTable then
                local number = tonumber(name:match("%d+"))
                if number then
                    local moveID = pokemonData.getTMMoveID(number + 50)
                    local moveName = pokemonData.getMoveName(moveID)
                    entry.name = string.format("%s: %s", name, moveName or "Unknown Move")
                end
                table.insert(tmhms.hms, entry)
            elseif name and name:match("^TM") then
                table.insert(tmhms.tms, entry)
            elseif name and name:match("^HM") then
                table.insert(tmhms.hms, entry)
            end
        end
    end

    return tmhms
end

function CFRUPlayerReader:readBag()
    self:updateTrainerInfo()

    if not self.trainerInfo then
        console:log("Unable to read trainer info. Cannot read bag.")
        return false
    end

    local gameData = MemoryReader.currentGame
    local pockets = gameData.addresses and gameData.addresses.pockets or {}
    local trainerOffsets = gameData.trainerOffsets
    local saveBlock1Addr = self:getSaveBlocks()

    local quantityKey = nil
    if self.trainerInfo.encryptionKey then
        quantityKey = self.trainerInfo.encryptionKey & 0xFFFF
    end

    local bag = {
        items = self:readPocket(gameUtils.hexToNumber(pockets.itemsPocket), gameData.pocketSize.itemsPocket, quantityKey),
        keyItems = self:readPocket(gameUtils.hexToNumber(pockets.keyItemsPocket), gameData.pocketSize.keyItemsPocket, quantityKey),
        pokeballs = self:readPocket(gameUtils.hexToNumber(pockets.ballsPocket), gameData.pocketSize.ballsPocket, quantityKey),
        berries = self:readPocket(gameUtils.hexToNumber(pockets.berriesPocket), gameData.pocketSize.berriesPocket, quantityKey),
        tmhms = self:readTmhmPocket(gameUtils.hexToNumber(pockets.tmhmPocket), gameData.pocketSize.tmhmPocket, quantityKey),
        pcItems = self:readPocket(saveBlock1Addr + trainerOffsets.pcItems, gameData.pocketSize.pcCount, quantityKey),
    }

    self.bag = bag
    return self.bag
end

return CFRUPlayerReader
