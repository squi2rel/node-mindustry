const Packets = require('./Packets')

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

module.exports = StreamBuilder