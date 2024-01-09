class TypeIO {
    static writeString(buf, string) {
        if (string) {
            buf.put(1);
            let strbuf = Buffer.from(string);
            buf.put(strbuf.length >> 8);
            buf.put(strbuf.length & 0xff);
            buf.put(strbuf)
        } else {
            buf.put(0)
        }
    }
    static readString(buf) {
        let str = buf.get();
        if (str) {
            return buf.get(buf.getUShort()).toString()
        } else {
            return null
        }
    }
    static writeKick(buf, reason) {
        buf.put(reason.id)
    }
    static readKick(buf) {
        return KickReason[buf.get()]
    }
    static readStrings(buf) {
        let rows = buf._getBuffer(buf.position()).readUInt8();
        buf.position(buf.position() + 1);

        let strings = [];
        for (let i = 0; i < rows; i++) {
            strings[i] = [];
            let columns = buf._getBuffer(buf.position()).readUInt8();
            buf.position(buf.position() + 1);
            for (let j = 0; j < columns; j++) {
                strings[i][j] = this.readString(buf)
            }
        }
        return strings
    }
    static writeTile(buf, tile) {
        buf.putInt(tile == null ? -1 : tile.pos());
    }
    static writePlansQueueNet(buf, plans) {
        buf.putInt(-1);//TODO plans
    }
}

module.exports = TypeIO