

class DataStream {
    #pos = 0;
    #buf;
    #lim;
    constructor(length) {
        this.#buf = Buffer.alloc(length);
        this.#lim = length
    }
    static allocate(length) {
        return new this(length)
    }
    static from(buffer) {
        let obj = new this(buffer.length);
        obj.put(buffer);
        obj.position(0);
        return obj
    }
    clear() {
        this.#pos = 0;
        this.#lim = this.#buf.length;
        return this
    }
    get(bytes, offset, length) {
        if (Buffer.isBuffer(bytes)) {
            this.#buf.copy(bytes, offset, this.#pos, this.#pos + length);
            this.#pos += length
        } else {
            let o = this.#pos;
            this.#pos = o + (bytes ? bytes : 1);
            return bytes ? this.#buf.slice(o, bytes + o) : this.#buf.slice(o, o + 1)[0]
        }
    }
    getInt() {
        return this.get(4).readInt32BE()
    }
    limit(limit) {
        if (limit !== undefined) {
            this.#lim = limit;
            this.#pos = Math.min(this.#pos, limit);
            return this
        } else {
            return this.#lim
        }
    }
    remaining() {
        return this.#lim - this.#pos
    }
    getShort() {
        return this.get(2).readInt16BE()
    }
    getUShort() {
        return this.get(2).readUInt16BE()
    }
    position(pos) {
        if (pos !== undefined) {
            this.#pos = pos;
            return this
        } else {
            return this.#pos
        }
    }
    flip() {
        this.#lim = this.#pos;
        this.#pos = 0;
        return this
    }
    put(data) {
        if (Buffer.isBuffer(data)) {
            let writeBytes = Math.min(this.remaining(), data.length);
            data.copy(this.#buf, this.#pos, 0, writeBytes);
            this.#pos += writeBytes;
            return writeBytes
        } else if (typeof (data) == "string") {
            return this.put(Buffer.from(data))
        } else if (data instanceof Array) {
            return this.put(Buffer.from(data))
        } else if (data instanceof DataStream) {
            data.position(data.position() + this.put(data._getBuffer(data.position())))
            return this
        } else {
            this.#buf[this.#pos] = data;
            this.#pos++;
            return this
        }
    }
    hasRemaining() {
        return this.remaining() != 0
    }
    capacity() {
        return this.#buf.length
    }
    putShort(data) {
        this.#buf.writeInt16BE(data, this.#pos);
        this.#pos += 2;
        return this
    }
    putUShort(data) {
        this.#buf.writeUInt16BE(data, this.#pos);
        this.#pos += 2;
        return this
    }
    array() {
        return this.#buf.toJSON().data
    }
    putInt(data) {
        this.#buf.writeInt32BE(data, this.#pos);
        this.#pos += 4;
        return this
    }
    getInt() {
        let o = this.#pos ? this.#pos : 0;
        this.#pos = o + 4;
        return this.#buf.readInt32BE(o)
    }
    toString() {
        return `DataStream[pos=${this.#pos},lim=${this.#lim},cap=${this.#buf.length}]`
    }
    _getBuffer(offset) {
        return this.#buf.slice(offset === undefined ? 0 : offset, this.#lim)
    }
    putLong(data) {
        this.#buf.writeInt32BE((data & 0xffffffff00000000) >> 32, this.#pos);
        this.#buf.writeInt32BE(data >> 32, this.#pos + 4);
        this.#pos += 8;
        return this
    }
    putFloat(data) {
        this.#buf.writeFloatBE(data, this.#pos);
        this.#pos += 4;
        return this
    }
    getFloat() {
        let o = this.#pos ? this.#pos : 0;
        this.#pos = o + 4;
        return this.#buf.readFloatBE(o)
    }
    getDouble() {
        let o = this.#pos ? this.#pos : 0;
        this.#pos = o + 8;
        return this.#buf.readDoubleBE(o)
    }
    getLong() {
        let o = this.#pos ? this.#pos : 0;
        this.#pos = o + 8;
        let value = this.#buf.readInt32BE(o) << 32;
        return value | this.#buf.readInt32BE(o + 4)
    }
    readString() {
        return this.get(this.getUShort()).toString()
    }
    writeString(buf) {
        if (Buffer.isBuffer(buf)) {
            this.putUShort(buf.length);
            this.put(buf)
        } else {
            this.writeString(Buffer.from(buf))
        }
    }
}

module.exports = DataStream