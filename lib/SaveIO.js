const BlockIO = require("./BlockIO");
const TypeIO = require("./TypeIO");
const blocksTypes = require('./json/BlocksTypes.json')

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
                world.get(x, y).setBlock(block)
            }
            if(hadEntity){
                if(isCenter){
                    //TODO check for building
                    let length = buf.getUShort();
                    let offset = buf.position();
                    try{
                        let ver = buf.get();
                        let build = BlockIO.readAll(buf, global.contentMap['block'][block], blocksTypes[global.contentMap['block'][block]], ver)
                        world.get(x, y).setBuild(build);
                    } catch (e) {
                        console.log(e)
                    }
                    buf.position(offset + length)
                }
            } else if(hadData){
                world.get(x, y).setBlock(block);
                world.get(x, y).setData(buf.get())
            } else {
                let consecutives = buf.get()
                let l = i + 1 + consecutives;
                for (let j = i + 1; j < l; j++) {
                    let x = j % width, y = Math.floor(j / width);
                    world.get(x, y).setBlock(block);
                }
                i += consecutives
            }
        }
    }
    static readTeamBlocks(buf){
        let teamc = buf.getInt();
        let plans = {}
        for(let i = 0; i < teamc; i++){
            let team = buf.getInt()
            plans[team] = []
            let blocks = buf.getInt()
            for(let j = 0; j < blocks; j++){
                let x = buf.getShort()
                let y = buf.getShort()
                let rot = buf.getShort()
                let bid = buf.getShort()
                let obj = TypeIO.readObject(buf)
                let plan = {
                    x,
                    y,
                    rot,
                    bid,
                    obj
                }
                plans[team].push(plan)
            }
        }
        return plans
    }
}

module.exports = SaveIO