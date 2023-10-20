class SaveIO {
    static readStringMap(buf) {
        let map = new Map();
        let size = buf.getShort();
        for (let i = 0; i < size; i++) {
            map.set(buf.readString(), buf.readString())
        }
        return map
    }
    static readMap(buf, world) {
        let width = buf.getUShort();
        let height = buf.getUShort();
        world.resize(width, height);
        let l = width * height;
        for (let i = 0; i < l; i++) {
            let x = i % width, y = Math.floor(i / width);
            let floorid = buf.getShort();
            let oreid = buf.getShort();
            let consecutives = buf.get();
            world.create(x, y, floorid, oreid, 0);
            let l = i + 1 + consecutives;
            for (let j = i + 1; j < l; j++) {
                let x = j % width, y = Math.floor(j / width);
                world.create(x, y, floorid, oreid, 0)
            }
            i += consecutives
        }
    }
}

module.exports = SaveIO