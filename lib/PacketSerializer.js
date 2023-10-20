const lz4 = require("lz4");
const Packet = require("./Packet");
const DataStream = require("./DataStream");
const FrameworkMessage = require("./FrameworkMessage");
const Packets = require("./Packets");
class PacketSerializer {
    #temp;
    constructor() {
        this.#temp = DataStream.allocate(32768)
    }
    read(buf) {
        try {
            let id = buf.get();
            if (id == 254) {
                return this.readFramework(buf)
            } else {
                if (Packets.get(id)) {
                    let packet = new (Packets.get(id))();
                    let length = buf.getShort();
                    let compressed = buf.get();
                    this.#temp.clear();
                    if (compressed) {
                        let size = buf.remaining();
                        lz4.decodeBlock(buf._getBuffer(buf.position()), this.#temp._getBuffer());
                        this.#temp.position(0);
                        this.#temp.limit(length);
                        try {
                            packet.read(this.#temp, length);
                        } catch (ignored) { }
                        buf.position(buf.position() + size)
                    } else {
                        this.#temp.position(0).limit(length);
                        this.#temp.put(buf._getBuffer(buf.position()));
                        this.#temp.position(0);
                        try {
                            packet.read(this.#temp, length);
                        } catch (ignored) { }
                        buf.position(buf.position() + this.#temp.position())
                    }
                    return packet
                }
                buf.clear();
            }
        } catch (e) {
            console.error(e.stack)
        }
    }
    write(buf, object) {
        if (Buffer.isBuffer(object) || (object instanceof DataStream)) {
            buf.put(object)
        } else if (object instanceof FrameworkMessage) {
            buf.put(-2);
            this.writeFramework(buf, object)
        } else if (object instanceof Packet) {
            buf.put(object._id);
            this.#temp.clear();
            object.write(this.#temp);
            let length = this.#temp.position();
            buf.putShort(length);
            this.#temp.flip();
            if (length < 36 || object instanceof Packets.StreamChunk) {
                buf.put(0);
                buf.put(this.#temp)
            } else {
                buf.put(1);
                let size = lz4.encodeBlock(this.#temp._getBuffer(), buf._getBuffer(buf.position()));
                buf.position(buf.position() + size)
            }
        } else {
            console.error("Invaild type:" + object.toString())
        }
    }
    writeLength(buf, len) {
        buf.putShort(len)
    }
    writeFramework(buf, msg) {
        if (msg instanceof FrameworkMessage.KeepAlive) {
            buf.put(2)
        } else if (msg instanceof FrameworkMessage.RegisterUDP) {
            buf.put(3);
            buf.putInt(msg.connectionID)
        } else if (msg instanceof FrameworkMessage.RegisterTCP) {
            buf.put(4);
            buf.putInt(msg.connectionID)
        }
    }
    readFramework(buf) {
        let id = buf.get();
        if (id == 0) {

        } else if (id == 1) {

        } else if (id == 2) {
            return new FrameworkMessage.KeepAlive()
        } else if (id == 3) {
            let p = new FrameworkMessage.RegisterUDP();
            p.connectionID = buf.getInt();
            return p
        } else if (id == 4) {
            let p = new FrameworkMessage.RegisterTCP();
            p.connectionID = buf.getInt();
            return p
        } else {
            console.error("Unknown FrameworkMessage!")
        }
    }
}

module.exports = PacketSerializer