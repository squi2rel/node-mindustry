const { EventEmitter } = require("events");
const TCPConnection = require("./TCPConnection");
const UDPConnection = require("./UDPConnection");
const FrameworkMessage = require("./FrameworkMessage");
class Client {
    #TCPRegistered = false;
    #UDPRegistered = false;
    #tcp;
    #udp;
    #event;
    #parser;
    constructor(w, s, p) {
        this.#tcp = new TCPConnection(w, s, data => { this.parse(data) });
        this.#udp = new UDPConnection(w, s, data => { this.parse(data) });
        this.#event = new EventEmitter();
        this.#tcp.on("timeout", () => {
            this.#event.emit("timeout")
        });
        this.#tcp.on("error", e => {
            this.#event.emit("error", e)
        });
        this.#tcp.on("close", () => {
            this.#event.emit("disconnect")
        });
        this.#parser = p
    }
    on(name, func) {
        this.#event.on(name, func)
    }
    once(name, func) {
        this.#event.once(name, func)
    }
    connect(port, ip) {
        this.#tcp.connect(port, ip);
        this.#udp.connect(port, ip);
        setTimeout(() => {
            if (!this.#UDPRegistered) {
                this.close()
            }
        }, 10000)
    }
    sendTCP(obj) {
        return this.#tcp.send(obj)
    }
    sendUDP(obj) {
        return this.#udp.send(obj)
    }
    close() {
        this.#tcp.close();
        this.#udp.close();
        this.#TCPRegistered = false;
        this.#UDPRegistered = false
    }
    connected() {
        return this.#TCPRegistered && this.#UDPRegistered
    }
    parse(packet) {
        if (packet) {
            if (!this.#TCPRegistered) {
                if (packet instanceof FrameworkMessage.RegisterTCP) {
                    this.#TCPRegistered = true;
                    let p = new FrameworkMessage.RegisterUDP();
                    p.connectionID = packet.connectionID;
                    this.sendUDP(p)
                }
            }
            if (!this.#UDPRegistered) {
                if (packet instanceof FrameworkMessage.RegisterUDP) {
                    this.#UDPRegistered = true;
                    this.#event.emit("connect")
                }
            }
            if (!(packet instanceof FrameworkMessage)) {
                this.#parser(packet)
            }
        }
    }
}

module.exports = Client