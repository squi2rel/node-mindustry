const DataStream = require("./DataStream");
const dgram = require("dgram");
const FrameworkMessage = require("./FrameworkMessage");
class UDPConnection {
    #writeBuffer;
    #serializer;
    #udp;
    #connected;
    #timer;
    constructor(w, s, p) {
        this.#writeBuffer = DataStream.allocate(w);
        this.#serializer = s;
        this.#connected = false;
        this.#udp = dgram.createSocket("udp4", d => {
            p(this.readObject(d))
        })
    }
    on(name, func) {
        this.#udp.on(name, func)
    }
    connect(port, ip) {
        if (!this.#connected) {
            this.#writeBuffer.clear();
            this.#udp.connect(port, ip);
            this.#udp.ref();
            this.#connected = true;
            this.#timer = setInterval(() => {
                this.send(new FrameworkMessage.KeepAlive())
            }, 19000)
        } else {
            console.error("UDP already connected!")
        }
    }
    close() {
        if (this.#connected) {
            this.#connected = false;
            this.#udp.disconnect();
            this.#udp.unref();
            clearInterval(this.#timer)
        }
    }
    readObject(d) {
        let buf = DataStream.from(d);
        let obj = this.#serializer.read(buf);
        if (buf.hasRemaining()) {
            return null
        }
        return obj
    }
    send(object) {
        this.#writeBuffer.clear();
        this.#serializer.write(this.#writeBuffer, object);
        this.#writeBuffer.flip();
        let length = this.#writeBuffer.limit();
        this.#udp.send(this.#writeBuffer._getBuffer());
        return length
    }
}

module.exports = UDPConnection