-- HTTP Server for Pokemon Memory Reader (mGBA version)
-- Uses mGBA's built-in socket API instead of LuaSocket

local HttpServer = require("network.http_server")

local Server = {}
Server.__index = Server

function Server:new(memoryReader, port, host)
    local obj = setmetatable({}, Server)
    obj.httpServer = HttpServer:new(memoryReader, port, host)
    return obj
end

function Server:start()
    return self.httpServer:start()
end

function Server:stop()
    return self.httpServer:stop()
end

function Server:update()
    self.httpServer:update()
end

return Server
