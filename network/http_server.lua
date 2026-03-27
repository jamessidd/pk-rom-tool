-- HTTP Server Core (mGBA version)
-- Uses mGBA's built-in socket API for TCP server functionality

local httpUtils = require("network.http_utils")
local apiHandlers = require("network.api_handlers")

local HttpServer = {}
HttpServer.__index = HttpServer

local DEFAULT_PORT = 8080
local DEFAULT_HOST = "localhost"

function HttpServer:new(memoryReader, port, host)
    local obj = setmetatable({}, HttpServer)
    obj.memoryReader = memoryReader
    obj.port = port or DEFAULT_PORT
    obj.host = host or DEFAULT_HOST
    obj.server = nil
    obj.isRunning = false
    obj.clients = {}
    obj.clientBuffers = {}
    return obj
end

-- MARK: Control

function HttpServer:start()
    if self.isRunning then
        console:log("Server already running on " .. self.host .. ":" .. self.port)
        return true
    end

    local bindAddr = self.host
    if bindAddr == "localhost" then bindAddr = "127.0.0.1" end

    self.server = socket.bind(bindAddr, self.port)
    if not self.server then
        return false, "bind_failed"
    end

    local listenResult = self.server:listen(5)
    -- mGBA socket error codes: 0=OK, 1=AGAIN (non-blocking; treat as success), >=2 is a real error
    if listenResult and listenResult > 1 then
        pcall(function() self.server:close() end)
        self.server = nil
        return false, "listen_failed", tostring(listenResult)
    end

    self.isRunning = true
    console:log("Pokemon Memory Reader API server started on http://" .. self.host .. ":" .. self.port)
    console:log("Available endpoints:")
    console:log("  GET /party - Get current party information")
    console:log("  GET /enemy - Get opponent party (during battles)")
    console:log("  GET /player - Get current player information")
    console:log("  GET /bag - Get current bag information")
    console:log("  GET /soullink/state - Get local Soul Link state")
    console:log("  GET /soullink/events - Get recent Soul Link events")
    console:log("  GET /status - Get server status")
    console:log("  GET / - API documentation")

    return true
end

function HttpServer:stop()
    if not self.isRunning then
        return true
    end

    for i = #self.clients, 1, -1 do
        pcall(function() self.clients[i]:close() end)
        table.remove(self.clients, i)
    end
    self.clientBuffers = {}

    if self.server then
        pcall(function() self.server:close() end)
        self.server = nil
    end

    self.isRunning = false
    console:log("Pokemon Memory Reader API server stopped")
    return true
end

-- MARK: Update (called each frame)

function HttpServer:update()
    if not self.isRunning or not self.server then
        return
    end

    -- Accept new connections (non-blocking in mGBA)
    local client = self.server:accept()
    if client then
        table.insert(self.clients, client)
        self.clientBuffers[client] = ""
    end

    -- Process existing clients
    for i = #self.clients, 1, -1 do
        local client = self.clients[i]
        local done = self:processClient(client)
        if done then
            pcall(function() client:close() end)
            self.clientBuffers[client] = nil
            table.remove(self.clients, i)
        end
    end
end

function HttpServer:processClient(client)
    if not client:hasdata() then
        return false
    end

    local chunk = client:receive(4096)
    if not chunk then
        return true
    end

    local buf = (self.clientBuffers[client] or "") .. chunk
    self.clientBuffers[client] = buf

    -- Check if we have a complete HTTP request (headers end with \r\n\r\n)
    local headerEnd = buf:find("\r\n\r\n", 1, true)
    if not headerEnd then
        return false
    end

    local headerBlock = buf:sub(1, headerEnd - 1)
    local body = buf:sub(headerEnd + 4)

    -- Parse request line
    local requestLine = headerBlock:match("^([^\r\n]+)")
    if not requestLine then
        httpUtils.sendResponse(client, 400, "Bad Request", "text/plain", "Invalid HTTP request")
        return true
    end

    -- Parse headers for content-length
    local contentLength = 0
    for line in headerBlock:gmatch("[^\r\n]+") do
        local key, value = line:match("^([^:]+):%s*(.+)")
        if key and key:lower() == "content-length" then
            contentLength = tonumber(value) or 0
        end
    end

    -- Wait for full body if POST
    if contentLength > 0 and #body < contentLength then
        return false
    end

    self:handleRequest(client, requestLine, body)
    return true
end

-- MARK: Request

function HttpServer:handleRequest(client, requestLine, body)
    local method, path = requestLine:match("^(%S+)%s+(%S+)")

    if not method or not path then
        httpUtils.sendResponse(client, 400, "Bad Request", "text/plain", "Invalid HTTP request")
        return
    end

    if method == "GET" then
        if path == "/party" then
            apiHandlers.handlePartyRequest(client, self.memoryReader)
        elseif path == "/enemy" then
            apiHandlers.handleEnemyPartyRequest(client, self.memoryReader)
        elseif path == "/player" or path == "/trainer" then
            apiHandlers.handlePlayerRequest(client, self.memoryReader)
        elseif path == "/bag" then
            apiHandlers.handleBagRequest(client, self.memoryReader)
        elseif path == "/soullink/state" then
            apiHandlers.handleSoulLinkStateRequest(client, self.memoryReader)
        elseif path == "/soullink/events" then
            apiHandlers.handleSoulLinkEventsRequest(client, self.memoryReader)
        elseif path == "/status" then
            apiHandlers.handleStatusRequest(client, self.memoryReader, self.port, self.host, self.isRunning)
        elseif path == "/" then
            apiHandlers.handleRootRequest(client, self.port, self.host)
        elseif path == "/health" then
            httpUtils.sendResponse(client, 200, "OK", "application/json", '{"status":"ok"}')
        else
            httpUtils.sendResponse(client, 404, "Not Found", "text/plain", "Endpoint not found")
        end
    elseif method == "POST" then
        if path == "/setMoney" then
            apiHandlers.handleSetMoneyRequest(client, self.memoryReader, body or "")
        else
            httpUtils.sendResponse(client, 404, "Not Found", "text/plain", "Endpoint not found")
        end
    elseif method == "OPTIONS" then
        httpUtils.sendResponse(client, 200, "OK", "text/plain", "")
    else
        httpUtils.sendResponse(client, 405, "Method Not Allowed", "text/plain", "Method not supported")
    end
end

return HttpServer
