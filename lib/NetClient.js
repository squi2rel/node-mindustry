const { EventEmitter } = require("events");
const zlib = require("zlib");
const SaveIO = require("./SaveIO");
const DataStream = require("./DataStream");
const Client = require("./Client");
const PacketSerializer = require("./PacketSerializer");
const Packets = require("./Packets");
const TypeIO = require("./TypeIO");

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
        buf.readString();//TODO Rules
        let map = SaveIO.readStringMap(buf);
        let wave = buf.getInt();
        let wavetime = buf.getFloat();
        let tick = buf.getDouble();
        let seed0 = buf.getLong();
        let seed1 = buf.getLong();

        buf.getInt();//TODO Player
        buf.getShort();
        buf.get();
        buf.get();
        buf.getInt();
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
        for (let i = 0; i < mapped; i++) {
            buf.get();
            let total = buf.getShort();
            for (let j = 0; j < total; j++) {
                buf.readString()
            }
        }

        SaveIO.readMap(buf, this.game.world);

        this.game.events.fire("WorldLoadEvent")
    }
    entitySnapshot(amount, data) {
    }
}

module.exports = NetClient