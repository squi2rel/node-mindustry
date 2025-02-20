const DataStream = require("./DataStream");
const dgram = require("dgram");
const FrameworkMessage = require("./FrameworkMessage");
class UDPConnection {
    #writeBuffer;
    #serializer;
    #udp;
    #connected;
    #timer;
    constructor(w, s, p, sock, port, ip, msg2) {
        this.#writeBuffer = DataStream.allocate(w);
        this.#serializer = s;
        this.#connected = false;
        if(!sock){
            this.#udp = dgram.createSocket("udp4", d => {
                p(this.readObject(d))
            })
        } else {
            this.#udp = sock
            this.#udp.on('message', (msg, rinfo) => {
                p(this.readObject(msg))
            })
            this.port = port;
            this.ip = ip;
            p(this.readObject(msg2))
        }
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
            this.#udp.unref && this.#udp.unref();
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
        if(this.port && this.ip){
            this.#udp.send(this.#writeBuffer._getBuffer(), 0, this.#writeBuffer._getBuffer().length, this.port, this.ip, (e) => {
                console.error("Err while sending udp: ", e)
            })
        } else {
            this.#udp.send(this.#writeBuffer._getBuffer());
        }
        return length
    }
}

module.exports = UDPConnection