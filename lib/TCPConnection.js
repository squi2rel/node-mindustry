const DataStream = require("./DataStream");
const net = require("net");
const FrameworkMessage = require("./FrameworkMessage");
class TCPConnection {
    #readBuffer;
    #writeBuffer;
    #serializer;
    #tcp;
    #connected;
    #timer;
    #objectLength;
    constructor(w, s, p) {
        this.#writeBuffer = DataStream.allocate(w);
        this.#serializer = s;
        this.#tcp = new net.Socket();
        this.#tcp.setNoDelay(true);
        this.#connected = false;
        this.#tcp.on("connect", () => {
            this.#timer = setInterval(() => {
                this.send(new FrameworkMessage.KeepAlive())
            }, 8000)
        });
        this.#tcp.on("data", d => {
            let res = this.readObject(d);
            p(res);
            while (res) {
                res = this.readObject();
                p(res)
            }
        });
        this.#tcp.on("close", () => {
            clearInterval(this.#timer)
        })
    }
    on(name, func) {
        this.#tcp.on(name, func)
    }
    connect(port, ip) {
        if (!this.#connected) {
            this.#readBuffer = Buffer.alloc(0);
            this.#objectLength = 0;
            this.#tcp.setTimeout(12000);
            this.#tcp.connect(port, ip);
            this.#tcp.ref();
            this.#connected = true
        } else {
            console.error("TCP already connected!")
        }
    }
    close() {
        if (this.#connected) {
            this.#connected = false;
            this.#tcp.end();
            this.#tcp.unref()
        }
    }
    readObject(d) {
        try {
            if (d) {
                this.#readBuffer = Buffer.concat([this.#readBuffer, d])
            }
            let readBuffer = this.#readBuffer;
            if (this.#objectLength == 0) {
                if (readBuffer.length < 2) {
                    return null
                }
                this.#objectLength = readBuffer.readInt16BE()
            }
            let length = this.#objectLength;
            if (length <= 0) {
                throw new Error("Invalid object length: " + length)
            }
            if (readBuffer.length < length) {
                return null
            }
            let buf = DataStream.from(readBuffer).position(2);
            buf.limit(length + 2);
            let object = this.#serializer.read(buf);
            if (buf.position() - 2 != length) {
                this.#objectLength = 0;
                this.#readBuffer = Buffer.alloc(0);
                return null
            }
            this.#objectLength = 0;
            this.#readBuffer = readBuffer.slice(buf.position());
            return object
        } catch (e) {
            console.error(e.stack);
            this.#objectLength = 0;
            this.#readBuffer = Buffer.alloc(0);
            return null
        }
    }
    send(object) {
        this.#writeBuffer.clear();
        this.#writeBuffer.position(2);
        this.#serializer.write(this.#writeBuffer, object);
        let length = this.#writeBuffer.position() - 2;
        this.#writeBuffer.position(0);
        this.#writeBuffer.putShort(length);
        this.#writeBuffer.position(length + 2);
        this.#writeBuffer.flip();
        this.#tcp.write(this.#writeBuffer._getBuffer());
        return length + 2
    }
}

module.exports = TCPConnection