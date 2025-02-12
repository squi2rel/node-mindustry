const { EventEmitter } = require("events");
const zlib = require("zlib");
const SaveIO = require("./SaveIO");
const DataStream = require("./DataStream");
const Client = require("./Client");
const PacketSerializer = require("./PacketSerializer");
const Packets = require("./Packets");
const TypeIO = require("./TypeIO");
const UnitIO = require("./UnitIO");
const BlockIO = require("./BlockIO");
const Player = require("./Player");
const JsonIO = require("./JsonIO");
const blocksTypes = require('./json/BlocksTypes.json')
const contentTypes = require('./json/ContentTypes.json').contentTypes

class StreamBuilder {
    id;
    type;
    total;
    stream;
    length;
    #buf;
    constructor(packet) {
        this.length = 0;
        this.id = packet.id;
        this.type = packet.type;
        this.total = packet.total;
        this.#buf = []
    }
    add(data) {
        if (!data instanceof Buffer) throw new TypeError("data must be a buffer.")
        this.length += data.length;
        this.#buf.push(data)
    }
    isDone() {
        return this.length >= this.total
    }
    build() {
        let s = new (Packets.get(this.type))();
        s.stream = this.stream = Buffer.concat(this.#buf);
        return s
    }
}

class NetClient extends EventEmitter {
    #client;
    streams;
    game;
    player;
    constructor(game) {
        super();
        this.#client = new Client(8192, new PacketSerializer(), p => this.handleClientReceived(p));
        this.#client.on("timeout", () => {
            console.log("timeout!");
            this.reset();
            this.emit("timeout")
        });
        this.#client.on("error", e => {
            this.reset();
            console.error(e.stack);
            this.emit("error", e)
        });
        this.#client.on("connect", () => {
            console.log("connected!");
            this.emit("connect")
        });
        this.#client.on("disconnect", () => {
            console.log("disconnected!");
            this.reset();
            this.emit("disconnect")
        });
        this.game = game;
        this.state = {};
        this.streams = new Map()
    }
    connect(port, ip) {
        this.#client.connect(port, ip)
    }
    send(packet, reliabale) {
        if (reliabale) {
            this.#client.sendTCP(packet)
        } else {
            this.#client.sendUDP(packet)
        }
    }
    reset() {
        this.#client.close()
        this.player && this.player.stop()
    }
    join(name, uuid, usid) {
        let p = new Packets.ConnectPacket();
        p.name = name;
        p.uuid = uuid ? uuid : "AAAAAAAAAAA=";
        p.usid = usid ? usid : "AAAAAAAAAAA=";
        this.send(p, true)
    }
    sendChatMessage(msg) {
        this.game.call.sendChatMessage(msg)
    }
    connectConfirm() {
        this.send(new Packets.ConnectConfirmCallPacket(), true)
        this.units = {}
    }
    client() {
        return this.#client.connected()
    }
    async ping(){
        let p =  new Packets.PingCallPacket()

        p.time = Date.now().valueOf()

        this.send(p, true)

        const pingPromise = new Promise((resolve) => {
            this.once("PingResponseCallPacket", (value) => {
                resolve(value.time);
            });
        });

        const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve(null); 
            }, 10000);
        });

        return Promise.race([pingPromise, timeoutPromise]);
    }
    handleClientReceived(packet) {
        try {
            packet.handled(this);
            if (packet instanceof Packets.StreamBegin) {
                this.streams.set(packet.id, new StreamBuilder(packet));
            } else if (packet instanceof Packets.StreamChunk) {
                let builder = this.streams.get(packet.id);
                if (builder) {
                    let buf = packet.data;
                    builder.add(Buffer.from(buf.parent.slice(buf.offset, buf.offset + buf.length).slice(0)));//copy
                    //console.log(builder.length + "/" + builder.total + " " + Math.floor(builder.length / builder.total * 100) + "%");
                    if (builder.isDone()) {
                        console.log(`Received world data: ${builder.total} bytes.`);
                        this.streams.delete(builder.id);
                        this.handleClientReceived(builder.build())
                    }
                } else {
                    console.error("Received stream chunk without a StreamBegin beforehand!")
                }
            } else {
                super.emit("*", packet.constructor.name, packet)
                super.emit(packet.constructor.name, packet);
                packet.handleClient(this)
            }
        } catch (ignored) { }
    }
    loadWorld(packet) {
        let buf = DataStream.from(zlib.inflateSync(packet.stream));
        let rules = JsonIO.fromString(buf.readString())
        this.game.rules = rules

        let map = SaveIO.readStringMap(buf);
        this.game.world.map = map

        let wave = buf.getInt();
        let wavetime = buf.getFloat();
        let tick = buf.getDouble();
        let seed0 = buf.getLong();
        let seed1 = buf.getLong();

        let id = buf.getInt();
        try{
            if(this.player){
                this.player.stop()
                this.connectConfirm()
            }
            this.player = new Player(this, id)
        } catch (e) {
            console.log(e)
        }
        
        this.game.events.fire("PlayerCreatedEvent")

        buf.getShort();
        buf.get();
        buf.get();
        buf.getInt();
        buf.get();
        buf.getFloat();
        buf.getFloat();
        TypeIO.readString(buf);
        buf.get();
        buf.get();
        buf.get();
        buf.get();
        buf.getInt();
        buf.getFloat();
        buf.getFloat();

        let mapped = buf.get();
        let cmap = {}
        for (let i = 0; i < mapped; i++) {
            let type = buf.get();
            let total = buf.getShort();
            cmap[contentTypes[type]] = []
            for (let j = 0; j < total; j++) {
                let str = buf.readString()
                cmap[contentTypes[type]].push(str)
            }
        }
        global.contentMap = cmap

        SaveIO.readMap(buf, this.game.world);

        this.game.world.teamBlocks = SaveIO.readTeamBlocks(buf);

        this.game.events.fire("WorldLoadEvent")
    }
    updateUnitList(data) {
        for (let key in data) {
            this.units[key] = data[key];
        }

        const maxLength = 2 ** 14;
        const entityRemoveTimeout = 1000 * 10;

        this.units = this.units.filter(unit => (Date.now() - unit.lastUpdate) <= entityRemoveTimeout)

        if (Object.keys(this.units).length > maxLength) {
            const keysToRemove = Object.keys(this.units).slice(0, Object.keys(this.units).length - maxLength);
            keysToRemove.forEach((key) => {
                delete this.units[key];
            });
        }
    }
    entitySnapshot(amount, buf) {
        buf = DataStream.from(buf)
        let ulist = {}
        try{
            for(let i = 0; i < amount; i++){
                let id = buf.getInt();
                let typeid = buf.get();
                
                let unit = UnitIO.read(buf, typeid)

                unit.id = id
                unit.lastUpdate = Date.now()
                ulist[id] = unit
            }
            this.updateUnitList(ulist)
        } catch (e) {
            
        }
    }
    blockSnapshot(amount, buf) {
        buf = DataStream.from(buf)
        for(let i = 0; i < amount; i++){
            let pos = TypeIO.readTile(buf)
            let block = buf.getShort()
            let build;
            try{
                build = BlockIO.readAll(buf, global.contentMap['block'][block], blocksTypes[global.contentMap['block'][block]], 999)
            } catch(e){
                
            }
            let tile = this.game.world.get(pos.x, pos.y)
            tile.setBuild(build)
        }
    }
    stateSnapshot(waveTime, wave, enemies, paused, gameOver, timeData, tps, rand0, rand1, coreData){
        let state = {}
        state.waveTime = waveTime;
        state.wave = wave;
        state.enemies = enemies;
        state.paused = paused;
        state.gameOver = gameOver;
        state.timeData = timeData;
        state.tps = tps;
        state.rand0 = rand0;
        state.rand1 = rand1;
        let buf = DataStream.from(coreData);
        let teams = buf.get()
        let t = {}
        for(let i = 0; i < teams; i++){
            let team = buf.get()
            let items = BlockIO.readItemsM(buf, false)
            t[team] = items
        }
        state.teams = t
        state.coreData = coreData;
        this.state = state
    }
}

module.exports = NetClient