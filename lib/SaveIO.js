class SaveIO {
    static readStringMap(buf) {
        let map = new Map();
        let size = buf.getShort();
        for (let i = 0; i < size; i++) {
            let key = buf.readString();
            let value = buf.readString();
            map.set(key, value)
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
        for (let i = 0; i < l; i++) {
            let x = i % width, y = Math.floor(i / width);
            let block = buf.getShort();
            let isCenter = true;
            let packedCheck = buf.get();
            let hadEntity = (packedCheck & 1) != 0;
            let hadData = (packedCheck & 2) != 0;
            if(hadEntity){
                isCenter = buf.get() == 1;
            }
            if(isCenter){
                world.tiles.array[y * world.tiles.width + x].block = block;
            }
            if(hadEntity){
                if(isCenter){
                    //TODO check for building
                    let length = buf.getUShort();
                    //let ver = buf.get();
                    buf.skip(length)
                }
            } else if(hadData){
                world.tiles.array[y * world.tiles.width + x].block = block;
                world.tiles.array[y * world.tiles.width + x].data = buf.get();
            } else {
                let consecutives = buf.get()
                let l = i + 1 + consecutives;
                for (let j = i + 1; j < l; j++) {
                    let x = j % width, y = Math.floor(j / width);
                    world.tiles.array[y * world.tiles.width + x].block = block;
                }
                i += consecutives
            }
        }
    }
}

module.exports = SaveIO