const BlockIO = require("./BlockIO");
const UnitIO = require("./UnitIO");
const TypeIO = require("./TypeIO");
const DataStream = require("./DataStream");
const blocksTypes = require('./json/BlocksTypes.json')

const ctypes = [
    "item",
    "block",
    "mech_UNUSED",
    "bullet",
    "liquid",
    "status",
    "unit",
    "weather",
    "effect_UNUSED",
    "sector",
    "loadout_UNUSED",
    "typeid_UNUSED",
    "error",
    "planet",
    "ammo_UNUSED",
    "team",
    "unitCommand",
    "unitStance"
]

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
    static writeStringMap(buf, map) {
        buf.putShort(map.size);
        for (const [key, value] of map.entries()) {
            buf.writeString(key);
            buf.writeString(value);
        }
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
    static writeMap(buf, world, nc){
        buf.put("MSAV")
        buf.putInt(7)
        this.writeChunk(buf, this.writeMeta, [world])
        this.writeChunk(buf, this.writeContentHeader, [global.contentMap])
        this.writeChunk(buf, this.writeWorld, [world])
        this.writeChunk(buf, this.writeEntities, [nc, world])
        buf.putInt(4);
        buf.skip(4);
        this.writeChunk(buf, (b) => {
            b.putInt(0)
        }, [])
    }
    static writeChunk(buf, r, args, short = false){
        let start = buf.position()
        let tempbuf = DataStream.from(buf._getBuffer())
        tempbuf.position(start)
        r(tempbuf, ...args)
        let end = tempbuf.position()
        tempbuf.position(start)
        let data = tempbuf.get(end - start)
        short ? buf.putShort(data.length) : buf.putInt(data.length)
        buf.put(data)
    }
    static writeEntities(buf, nc, world){
        buf.putShort(0); // writeEntityMapping
        SaveIO.writeTeamBlocks(buf, world.teamBlocks);
        let keys = Object.keys(nc.units)
        buf.putInt(keys.length)
        for(let i = 0; i < keys.length; i++){
            SaveIO.writeChunk(buf, (buf2) => {
                let id = parseInt(keys[i])
                let unit = nc.units[id]
                let type = unit.type
                buf2.put(type)
                buf2.putInt(id)
                let pos = buf2.position()
                UnitIO.write(buf2, unit, true);
                let end = buf2.position()
                buf2.position(pos)
                let unit2 = UnitIO.read(buf2, type, true);
                let end2 = buf2.position()
            }, [], true)
        }
    }
    static writeWorld(buf, world){
        buf.putShort(world.tiles.width)
        buf.putShort(world.tiles.height)

        for(let i = 0; i < world.tiles.width * world.tiles.height; i++){
            let x = i % world.tiles.width;
            let y = Math.floor(i / world.tiles.width);
            let tile = world.get(x, y)
            buf.putShort(tile.floor)
            buf.putShort(tile.overlay)

            let consecutives = 0;

            for(let j = i + 1; (j < world.tiles.width * world.tiles.height) && (consecutives < 255); j++){
                let x2 = j % world.tiles.width;
                let y2 = Math.floor(j / world.tiles.width);
                let nextTile = world.get(x2, y2)
                if(nextTile.floor != tile.floor || nextTile.overlay != tile.overlay){
                    break
                }
                consecutives++;
            }

            buf.put(consecutives)
            i += consecutives
        }

        for(let i = 0; i < world.tiles.width * world.tiles.height; i++){
            let x = i % world.tiles.width;
            let y = Math.floor(i / world.tiles.width);
            let tile = world.get(x, y)
            buf.putShort(tile.block)

            let data = tile.data

            let build = tile.hasBuild()
            let packed = (build ? 1 : 0) | (data ? 2 : 0)

            buf.put(packed)

            if(build){
                if(Array.isArray(tile.build)){
                    buf.put(1);
                    let start = buf.position();
                    let tempbuf = DataStream.from(buf._getBuffer())
                    tempbuf.position(start)
                    try{
                        tempbuf.put(255)
                        BlockIO.writeAll(tempbuf, tile.build, blocksTypes[global.contentMap['block'][tile.block]], 255)
                    } catch(e){
                        console.log(e)
                    }
                    let end = tempbuf.position()
                    tempbuf.position(start)
                    let data = tempbuf.get(end - start)
                    buf.putUShort(data.length)
                    buf.put(data)
                } else {
                    buf.put(0)
                }
            } else if(data){
                buf.put(data)
            } else {
                let consecutives = 0;

                for(let j = i + 1; (j < world.tiles.width * world.tiles.height) && (consecutives < 255); j++){
                    let x2 = j % world.tiles.width;
                    let y2 = Math.floor(j / world.tiles.width);
                    let nextTile = world.get(x2, y2)
                    if(nextTile.block != tile.block){
                        break
                    }
                    if(nextTile.hasBuild()){
                        break
                    }
                    consecutives++;
                }
                buf.put(consecutives)
                i += consecutives
            }
        }
    }
    static writeMeta(buf, world){
        SaveIO.writeStringMap(buf, world.map)
    }
    static writeContentHeader(buf, contentMap){
        const ctypes = [
            "item",
            "block",
            "mech_UNUSED",
            "bullet",
            "liquid",
            "status",
            "unit",
            "weather",
            "effect_UNUSED",
            "sector",
            "loadout_UNUSED",
            "typeid_UNUSED",
            "error",
            "planet",
            "ammo_UNUSED",
            "team",
            "unitCommand",
            "unitStance"
        ];

        buf.put(Object.keys(contentMap).length);

        for (let type in contentMap) {
            let typeIndex = ctypes.indexOf(type);
            if (typeIndex === -1) {
                throw new Error(`Unknown type: ${type}`);
            }

            buf.put(typeIndex);

            let total = contentMap[type].length;
            buf.putShort(total);

            for (let str of contentMap[type]) {
                buf.writeString(str);
            }
        }
    }
    static writeTeamBlocks(buf, plans) {
        buf.putInt(Object.keys(plans).length);

        for (let team in plans) {
            if (plans.hasOwnProperty(team)) {
                buf.putInt(parseInt(team));
                let blocks = plans[team].length;
                buf.putInt(blocks);
                for (let j = 0; j < blocks; j++) {
                    let plan = plans[team][j];

                    buf.putShort(plan.x);
                    buf.putShort(plan.y);
                    buf.putShort(plan.rot);
                    buf.putShort(plan.bid);
                    TypeIO.writeObject(buf, plan.obj);
                }
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