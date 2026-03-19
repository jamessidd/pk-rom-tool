local LocationLookup = require("soullink.location_lookup")

local SoulLinkState = {}
SoulLinkState.__index = SoulLinkState

local DEFAULT_EVENT_LIMIT = 50
local DEFAULT_POLL_INTERVAL = 30

local function shallowCopy(tbl)
    local copy = {}
    for k, v in pairs(tbl or {}) do
        copy[k] = v
    end
    return copy
end

local function buildTypes(pokemon)
    local types = {}
    if pokemon.type1Name and pokemon.type1Name ~= "Unknown" then
        table.insert(types, pokemon.type1Name)
    end
    if pokemon.type2Name and pokemon.type2Name ~= "Unknown" and pokemon.type2Name ~= pokemon.type1Name then
        table.insert(types, pokemon.type2Name)
    end
    return types
end

function SoulLinkState:new(opts)
    local obj = {
        frameCount = 0,
        pollInterval = (opts and opts.pollInterval) or DEFAULT_POLL_INTERVAL,
        eventLimit = (opts and opts.eventLimit) or DEFAULT_EVENT_LIMIT,
        baselineEstablished = false,
        currentParty = {},
        trackedPokemon = {},
        routeOrder = {},
        routeIndex = {},
        recentEvents = {},
        nextEventId = 1,
    }
    setmetatable(obj, SoulLinkState)
    return obj
end

function SoulLinkState:normalizePokemon(pokemon)
    return {
        personality = pokemon.personality,
        speciesId = pokemon.speciesID,
        species = pokemon.speciesName,
        nickname = pokemon.nickname,
        level = pokemon.level,
        currentHP = pokemon.curHP,
        maxHP = pokemon.maxHP,
        isShiny = pokemon.isShiny or false,
        metLocation = pokemon.metLocation,
        metLocationName = LocationLookup.getName(pokemon.metLocation),
        metLevel = pokemon.metLevel,
        heldItem = pokemon.heldItem,
        heldItemId = pokemon.heldItemId,
        types = buildTypes(pokemon),
    }
end

function SoulLinkState:trackPokemon(pokemon, firstSeenFrame)
    local record = shallowCopy(pokemon)
    record.firstSeenFrame = firstSeenFrame or self.frameCount
    record.lastSeenFrame = self.frameCount
    record.lastKnownHP = pokemon.currentHP
    record.alive = pokemon.currentHP > 0
    record.inParty = true
    self.trackedPokemon[pokemon.personality] = record

    local locationId = pokemon.metLocation or -1
    if not self.routeIndex[locationId] then
        self.routeIndex[locationId] = {
            locationId = locationId,
            locationName = pokemon.metLocationName,
            personalities = {},
        }
        table.insert(self.routeOrder, locationId)
    end
    table.insert(self.routeIndex[locationId].personalities, pokemon.personality)
end

function SoulLinkState:pushEvent(eventType, pokemon, extra)
    local event = {
        id = self.nextEventId,
        frame = self.frameCount,
        type = eventType,
        personality = pokemon.personality,
        speciesId = pokemon.speciesId,
        species = pokemon.species,
        nickname = pokemon.nickname,
        level = pokemon.level,
        currentHP = pokemon.currentHP,
        maxHP = pokemon.maxHP,
        metLocation = pokemon.metLocation,
        metLocationName = pokemon.metLocationName,
        metLevel = pokemon.metLevel,
        types = shallowCopy(pokemon.types),
    }
    self.nextEventId = self.nextEventId + 1

    if extra then
        for k, v in pairs(extra) do
            event[k] = v
        end
    end

    table.insert(self.recentEvents, event)
    if #self.recentEvents > self.eventLimit then
        table.remove(self.recentEvents, 1)
    end

    console.log(string.format(
        "[SoulLink] %s: %s (%s) at %s",
        eventType,
        event.nickname or event.species,
        event.species or "?",
        event.metLocationName or "Unknown"
    ))
end

function SoulLinkState:classifyNewPokemon(pokemon)
    if pokemon.metLocation == 157 and pokemon.metLevel and pokemon.metLevel <= 5 then
        return "starter"
    end
    if pokemon.metLevel and pokemon.level and pokemon.metLevel == pokemon.level then
        return "new_encounter"
    end
    return "new_party_member"
end

function SoulLinkState:buildSnapshot(memoryReader)
    local rawParty = memoryReader.getPartyData() or {}
    local snapshot = {}

    for i = 1, 6 do
        local pokemon = rawParty[i]
        if pokemon and pokemon.speciesID and pokemon.speciesID > 0 and pokemon.personality and pokemon.personality > 0 then
            local normalized = self:normalizePokemon(pokemon)
            normalized.slot = i
            snapshot[normalized.personality] = normalized
        end
    end

    return snapshot
end

function SoulLinkState:establishBaseline(snapshot)
    self.currentParty = {}
    for personality, pokemon in pairs(snapshot) do
        self.currentParty[personality] = shallowCopy(pokemon)
        if not self.trackedPokemon[personality] then
            self:trackPokemon(pokemon, self.frameCount)
        end
    end
    self.baselineEstablished = true
end

function SoulLinkState:applySnapshot(snapshot)
    for personality, pokemon in pairs(snapshot) do
        local previous = self.currentParty[personality]
        local tracked = self.trackedPokemon[personality]

        if not tracked then
            self:trackPokemon(pokemon, self.frameCount)
            self:pushEvent("catch", pokemon, {source = self:classifyNewPokemon(pokemon)})
        else
            tracked.lastSeenFrame = self.frameCount
            tracked.inParty = true
            tracked.lastKnownHP = pokemon.currentHP
            tracked.alive = pokemon.currentHP > 0
            tracked.speciesId = pokemon.speciesId
            tracked.species = pokemon.species
            tracked.level = pokemon.level
            tracked.nickname = pokemon.nickname
            tracked.currentHP = pokemon.currentHP
            tracked.maxHP = pokemon.maxHP
            tracked.metLocation = pokemon.metLocation
            tracked.metLocationName = pokemon.metLocationName
            tracked.metLevel = pokemon.metLevel
            tracked.heldItem = pokemon.heldItem
            tracked.heldItemId = pokemon.heldItemId
            tracked.isShiny = pokemon.isShiny
            tracked.types = shallowCopy(pokemon.types)
        end

        if previous and previous.currentHP > 0 and pokemon.currentHP == 0 then
            self:pushEvent("faint", pokemon)
        end
    end

    for personality, previous in pairs(self.currentParty) do
        if not snapshot[personality] and self.trackedPokemon[personality] then
            self.trackedPokemon[personality].inParty = false
            self.trackedPokemon[personality].lastSeenFrame = self.frameCount
        end
    end

    self.currentParty = {}
    for personality, pokemon in pairs(snapshot) do
        self.currentParty[personality] = shallowCopy(pokemon)
    end
end

function SoulLinkState:update(memoryReader)
    self.frameCount = self.frameCount + 1
    if self.frameCount % self.pollInterval ~= 0 then
        return
    end

    local snapshot = self:buildSnapshot(memoryReader)
    if not self.baselineEstablished then
        self:establishBaseline(snapshot)
        return
    end

    self:applySnapshot(snapshot)
end

function SoulLinkState:getCurrentParty()
    local party = {}
    for _, pokemon in pairs(self.currentParty) do
        table.insert(party, shallowCopy(pokemon))
    end
    table.sort(party, function(a, b)
        return (a.slot or 99) < (b.slot or 99)
    end)
    return party
end

function SoulLinkState:getRoutes()
    local routes = {}
    for _, locationId in ipairs(self.routeOrder) do
        local route = self.routeIndex[locationId]
        local pokemonList = {}
        for _, personality in ipairs(route.personalities) do
            local tracked = self.trackedPokemon[personality]
            if tracked then
                table.insert(pokemonList, {
                    personality = tracked.personality,
                    speciesId = tracked.speciesId,
                    species = tracked.species,
                    nickname = tracked.nickname,
                    level = tracked.level,
                    alive = tracked.alive,
                    inParty = tracked.inParty,
                    metLevel = tracked.metLevel,
                    types = shallowCopy(tracked.types),
                })
            end
        end
        table.insert(routes, {
            locationId = route.locationId,
            locationName = route.locationName,
            pokemon = pokemonList,
        })
    end
    return routes
end

function SoulLinkState:getRecentEvents()
    local events = {}
    for _, event in ipairs(self.recentEvents) do
        table.insert(events, shallowCopy(event))
    end
    return events
end

function SoulLinkState:getState()
    local trackedCount = 0
    for _ in pairs(self.trackedPokemon) do
        trackedCount = trackedCount + 1
    end

    return {
        initialized = self.baselineEstablished,
        frame = self.frameCount,
        summary = {
            trackedPokemon = trackedCount,
            currentPartyCount = #self:getCurrentParty(),
            routeCount = #self.routeOrder,
            eventCount = #self.recentEvents,
        },
        currentParty = self:getCurrentParty(),
        routes = self:getRoutes(),
        recentEvents = self:getRecentEvents(),
    }
end

return SoulLinkState
