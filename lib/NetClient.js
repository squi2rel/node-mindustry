const { EventEmitter } = require("events");
const zlib = require("zlib");
const SaveIO = require("./SaveIO");
const DataStream = require("./DataStream");
const Client = require("./Client");
const PacketSerializer = require("./PacketSerializer");
const Packets = require("./Packets");
const TypeIO = require("./TypeIO");
const UnitIO = require("./UnitIO");
const Player = require("./Player");
const JsonIO = require("./JsonIO");

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

const ctypes = [
    "item",
    "block",
    "mech_UNUSED",
    "bullet",
    "liquid",
    "status",
    "unit",
    "weather",
    "effect_UNUSED",
    "sector",
    "loadout_UNUSED",
    "typeid_UNUSED",
    "error",
    "planet",
    "ammo_UNUSED",
    "team",
    "unitCommand",
    "unitStance"
]

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

        let wave = buf.getInt();
        let wavetime = buf.getFloat();
        let tick = buf.getDouble();
        let seed0 = buf.getLong();
        let seed1 = buf.getLong();

        let id = buf.getInt();
        try{
            if(this.player) this.player.stop()
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

        let mapped = buf.get();//TODO readContentHeader
        let cmap = {}
        for (let i = 0; i < mapped; i++) {
            let type = buf.get();
            let total = buf.getShort();
            cmap[ctypes[type]] = []
            for (let j = 0; j < total; j++) {
                let str = buf.readString()
                cmap[ctypes[type]].push(str)
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

        if (Object.keys(this.units).length > maxLength) {
            const keysToRemove = Object.keys(this.units).slice(0, Object.keys(this.units).length - maxLength);
            keysToRemove.forEach((key) => {
                delete this.units[key];
            });
        }
    }
    handleEntitySnapshot(amount, buf) {
        buf = DataStream.from(buf)
        let ulist = {}
        try{
            for(let i = 0; i < amount; i++){
                let id = buf.getInt();
                let typeid = buf.get();
                
                let unit = UnitIO.read(buf, typeid)

                unit.id = id
                ulist[id] = unit
            }
            this.updateUnitList(ulist)
        } catch (e) {
            
        }
    }
}

module.exports = NetClient