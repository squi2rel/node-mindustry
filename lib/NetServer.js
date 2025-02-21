const { EventEmitter } = require("events");
const DataStream = require("./DataStream");
const Server = require("./Server");
const PacketSerializer = require("./PacketSerializer");
const Packets = require("./Packets");
const fs = require('fs');
const SaveIO = require("./SaveIO")
const TypeIO = require("./TypeIO")
const pako = require('pako');
const PlayerCon = require('./PlayerCon')

class NetServer extends EventEmitter {
    clients;
    streams;
    server;
    game;
    constructor(game) {
        super();
        this.game = game;
        this.server = new Server(8192, new PacketSerializer(), (cid, p) => this.handleServerReceived(cid, p), () => this.handleMRequest())
        this.limit = 30
        this.players = {}
        this.entities = {}
    }
    listen(port, config = {}){
        this.server.listen(port)
        this.units = {}
        this.state = {}
    }
    send(client, p, reliable){
        if(reliable){
            this.server.sendTCP(client, p)
        } else {
            this.server.sendUDP(client, p)
        }
    }
    sendBroadcast(p, reliable) {
        for (const [clientId, client] of this.server.getClients()) {
            this.send(clientId, p, reliable);
        }
    }
    sendStream(client, buf, type) {
        let id = this.server.getId();
        let sb = new Packets.StreamBegin();
        sb.id = id
        sb.total = buf.length;
        sb.type = type;
        this.send(client, sb, true);
        const chunkSize = 518;
        let offset = 0;

        while (offset < buf.length) {
            let chunk = new Packets.StreamChunk();
            chunk.id = id;
            chunk.data = buf.slice(offset, offset + chunkSize);

            this.send(client, chunk, true);

            offset += chunkSize;
        }
        
    }
    genId(){
        let newId;
        do {
            newId = this.server.getId();
        } while (this.players[newId] !== undefined || this.entities[newId] !== undefined);
        return newId;
    }
    sendMessage(m, con){
        let p = new Packets.SendMessageCallPacket2();
        p.message = m;
        p.unformatted = m;
        p.playersender = [0, 0];
        if(con){
            this.send(con, p, true)
        } else {
            this.sendBroadcast(p, true)
        }
    }
    close(client){
        this.server.close(client)
        delete this.players[client]
    }
    handleServerReceived(client, packet){
        try{
            packet.handled && packet.handled(this);
            let con = this.server.getC(client)
            if(packet instanceof Packets.ConnectPacket){
                if(!con.status){
                    con.status = "load" // TODO check for nickname & uuid
                    this.players[client] = new PlayerCon(this, client, packet)
                    let buf = this.sendWorld(client)
                    global.b = buf
                    this.sendStream(client, buf, 2)
                }
            } else if(packet instanceof Packets.ConnectConfirmCallPacket){
                if(con.status == "load"){
                    con.status = "ready"
                }
            } else if(packet instanceof Packets.PingCallPacket){
                let p = new Packets.PingResponseCallPacket();
                p.time = packet.time
                this.send(client, p, true)
            }
            super.emit("*", packet.constructor.name, client, packet)
            super.emit(packet.constructor.name, client, packet);
            packet.handleServer(this)
        } catch(e){
        }
    }
    setMap(path){
        let buffer = fs.readFileSync(path);
        let buf = DataStream.from(Buffer.from(pako.inflate(buffer)))
        SaveIO.readWorld(buf, this.game.world, this);
    }
    getConnectedCount() {
        let clientsMap = this.server.getClients();
        let connected = 0;
        try{
        let connected = Array.from(clientsMap.keys())
            .filter(key => this.server.isСonnected(key))
            .length;
        } catch(e){}
        return connected
    }
    setInfo(cfg){
        this.info = cfg
    }
    setPlayerLimit(c){
        this.limit = c
    }
    sendWorld(con){
        let buf = DataStream.allocate(2 ** 15)
        buf.writeString(this.game.world.map.get('rules'))
        SaveIO.writeStringMap(buf, this.game.world.map)
        buf.putInt(this.state.wave || 0)
        buf.putFloat(this.state.wavetime || 0)
        buf.putDouble(this.state.tick || 0)
        buf.putLong(this.state.seed0 || 0)
        buf.putLong(this.state.seed1 || 0)

        buf.putInt(this.players[con].id)

        buf.putShort(1)
        buf.put(this.players[con].admin ? 1 : 0)
        buf.put(0)
        buf.putInt(0)
        buf.put(-1)
        buf.putFloat(0)
        buf.putFloat(0)
        TypeIO.writeString(buf, this.players[con].name)
        buf.put(0)
        buf.put(0)
        buf.put(0)
        buf.put(0)
        buf.putInt(0)
        buf.putFloat(0)
        buf.putFloat(0)
        SaveIO.writeContentHeader(buf, global.contentMap)

        SaveIO.writeWorld(buf, this.game.world)

        SaveIO.writeTeamBlocks(buf, this.game.world.teamBlocks)
        return Buffer.from(pako.deflate(buf._getBuffer()))
    }
    handleMRequest(){
        let buf = new DataStream(500)
        let name = this.info?.name || "Server"
        let map = this.state?.map || ""
        let players = this.getConnectedCount() || 0
        let wave = this.state?.wave || 0
        let version = 146
        let vertype = "official"
        let gamemode = this.state?.gamemode || 0
        let limit = this.limit || 0
        let description = this.info?.description || ""
        let modeName = this.info?.modeName || "0"

        let writeString = (buf, str) => {
            buf.put(str.length);
            buf.put(str);
        };

        writeString(buf, name);
        writeString(buf, map);
        buf.putInt(players);
        buf.putInt(wave);
        buf.putInt(version);
        writeString(buf, vertype);
        buf.put(gamemode);
        buf.putInt(limit);
        writeString(buf, description);
        writeString(buf, modeName);

        return buf._getBuffer();
    }
}

module.exports = NetServer