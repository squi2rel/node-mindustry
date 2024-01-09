const { EventEmitter } = require("events");
const Packets = require("./lib/Packets");
const NetClient = require("./lib/NetClient");
const DataStream = require("./lib/DataStream");
const Call = require("./lib/Call");
const World = require("./lib/World");
const dgram = require("dgram");

const mindustry = {};

class Events {
    #em;
    constructor() {
        this.#em = new EventEmitter();
        this.#em.setMaxListeners(Infinity)
    }
    on(a, b) {
        this.#em.on(a, b)
    }
    fire(a, b) {
        this.#em.emit(a, b)
    }
}

var pingHost = (port, ip, callback) => {
    let client = dgram.createSocket("udp4", (msg, info) => {
        client.disconnect();
        client.unref();
        let readString = buf => {
            return buf.get(buf.get()).toString()
        };
        let bbuf = DataStream.from(msg);
        callback({
            name: readString(bbuf),
            map: readString(bbuf),
            players: bbuf.getInt(),
            wave: bbuf.getInt(),
            version: bbuf.getInt(),
            vertype: readString(bbuf),
            gamemode: bbuf.get(),
            limit: bbuf.getInt(),
            description: readString(bbuf),
            modeName: readString(bbuf),
            ip: info.address,
            port: info.port
        })
    });
    client.on("connect", () => {
        client.send(Buffer.from([-2, 1]))
    });
    client.on('error', e => {
        callback(null, e)
    });
    client.connect(port, ip);
    setTimeout(() => {
        if (client.connectState == 2) {
            client.disconnect();
            client.unref();
            callback(null, new Error("Timed out"))
        }
    }, 2000)
}

class Mindustry {
    netClient;
    world;
    events;
    call;
    constructor() {
        this.netClient = new NetClient(this);
        this.world = new World();
        this.events = new Events();
        this.call = new Call(this);
    }
}

module.exports = {
    pingHost,
    NetClient,
    Mindustry,
    Packets
}