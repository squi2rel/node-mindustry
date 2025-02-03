const blocksTypes = require('./json/BlocksTypes.json')

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
        let rows = buf._getBuffer(buf.position()).read();
        buf.position(buf.position() + 1);

        let strings = [];
        for (let i = 0; i < rows; i++) {
            strings[i] = [];
            let columns = buf._getBuffer(buf.position()).read();
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
    static readVecNullable(buf) {
        let x = buf.getFloat();
        let y = buf.getFloat();
        return (isNaN(x) || isNaN(y)) ? null : [x, y]
    }
    static readVec2(buf) {
        let x = buf.getFloat();
        let y = buf.getFloat();
        return [x, y]
    }
    static readAbilities(buf) {
        let len = buf.get()
        let abils = []
        for(let i = 0; i < len; i++){
            let data = buf.getFloat();
            abils[i] = data
        }
        return abils
    }
    static readController(buf) {
        let type = buf.get();
        if(type == 0){
            let id = buf.getInt();
            return [type, id]
        } else if(type == 1){
            buf.skip(4);
            return [type]
        } else if(type == 3){
            let pos = buf.getInt();
            return [type, pos]
        } else if(type == 4 || type == 6 || type == 7 || type == 8){
            let hasAttack = buf.get();
            let hasPos = buf.get();
            let pos;
            if(hasPos){
                pos = this.readVec2(buf);
            }
            let attack;
            if(hasAttack){
                let entityType = buf.get();
                attack = buf.getInt();
            }
            let id;
            if(type == 6 || type == 7 || type == 8){
                id = buf.get()
            }
            let attackinfo = {}
            if(type == 7 || type == 8){
                let length = buf.get()
                for(let i = 0; i < length; i++){
                    let ctype = buf.get();
                    if(ctype == 0){
                        attackinfo.build = buf.getInt()
                    } else if(ctype == 1){
                        attackinfo.unit = buf.getInt()
                    } else if(ctype == 2){
                        attackinfo.vec = this.readVec2(buf);
                    }
                }
            }
            let stance;
            if(type == 8){
                stance = this.readStance(buf);
            }
            let result = {
                hasAttack,
                hasPos,
                pos,
                attackinfo,
                attack,
                id,
                stance
            }

            return [type, result]
        }
    }
    static readStance(buf) {
        let val = buf.get();
        return val == 255 ? null : val
    }
    static readTile(buf) {
        let x = buf.getShort();
        let y = buf.getShort();
        return [x, y]
    }
    static readCommand(buf) {
        let val = buf.get();
        return val == 255 ? null : val
    }
    static readMounts(buf){
        let len = buf.get();
        let mounts = []
        for(let i = 0; i < len; i++){
            let state = buf.get();
            let ax = buf.getFloat();
            let ay = buf.getFloat();

            mounts[i] = [state, ax, ay]
        }
        return mounts
    }
    static readPayload(buf){
        let ex = buf.get();
        if(!ex){
            return null
        }
        let type = buf.get()
        if(type == 1){
            const BlockIO = require("./BlockIO");
            let id = buf.getShort()
            let ver = buf.get()

            let block = BlockIO.readAll(buf, global.contentMap['block'][id], blocksTypes[global.contentMap['block'][id]], ver)
            return [id, block]
        } else {
            const UnitIO = require("./UnitIO");
            let typeid = buf.get();
            let unit = UnitIO.read(buf, typeid);

            return unit
        }
    }
    static readObject(buf){
        let type = buf.get();

        if (type == 0) {
            return [type, null];
        } else if (type == 1) {
            return [type, buf.getInt()];
        } else if (type == 2) {
            return [type, buf.getLong(buf)];
        } else if (type == 3) {
            return [type, buf.getFloat()];
        } else if (type == 4) {
            return [type, rbs(buf)];
        } else if (type == 5) {
            return [type, [buf.get(), buf.getShort()]];
        } else if (type == 6 || type == 21) {
            let len = buf.getShort();
            let seq = [];
            for (let i = 0; i < len; i++) {
                seq.push(buf.getInt());
            }
            return [type, seq];
        } else if (type == 7) {
            return [type, [buf.getInt(), buf.getInt()]];
        } else if (type == 8) {
            let len = buf.getShort();
            let out = [];
            for (let i = 0; i < len; i++) {
                out.push(buf.getInt());
            }
            return [type, out];
        } else if (type == 9) {
            return [type, [buf.get(), buf.getShort()]];
        } else if (type == 10) {
            return [type, buf.get()];
        } else if (type == 11) {
            return [type, buf.getDouble()];
        } else if (type == 12 || type == 17) {
            return [type, buf.getInt()];
        } else if (type == 13) {
            return [type, buf.getShort()];
        } else if (type == 14 || type == 16) {
            let blen = buf.getShort();
            let seq = [];
            for (let i = 0; i < blen; i++) {
                seq.push(buf.get());
            }
            return [type, seq];
        } else if (type == 15) {
            return [type, buf.get()];
        } else if (type == 18) {
            let len = buf.getShort();
            let out = [];
            for (let i = 0; i < len; i++) {
                out.push([buf.getFloat(), buf.getFloat()]);
            }
            return [type, out];
        } else if (type == 19) {
            return [type, [buf.getFloat(), buf.getFloat()]];
        } else if (type == 20) {
            return [type, buf.get()];
        } else if (type == 22) {
            let len = buf.getShort();
            let out = [];
            for (let i = 0; i < len; i++) {
                out.push(robj(buf));
            }
            return [type, out];
        } else if (type == 23) {
            return [type, buf.get()];
        } else {
            return [undefined, undefined];
        }
    }
    static readPlan(buf){
        let type = buf.get();
        let position = buf.getInt();

        if(type == 1){
            return {
                type,
                position
            }
        } else {
            let block = buf.getShort();
            let rotation = buf.get();
            let hasConfig = buf.get();
            let config = this.readObject(buf);
            return {
                type,
                position,
                block,
                rotation,
                hasConfig,
                config
            }
        }
    }
    static readPlansQueue(buf){
        let used = buf.getInt();
        let plans = []
        for(let i = 0; i < used; i++){
            let plan = this.readPlan(buf);
            plans.push(plan)
        }
        return plans
    }
    static readItems(buf){
        let id = buf.getShort();
        let count = buf.getInt()
        return [id, count]
    }
    static readBytes(buf) {
        let length = buf.getShort();
        let data = buf.get(length);
        return data
    }
    static readUnit(buf){
        let type = buf.get();
        let id = buf.getInt();
        return [type, id]
    }
    static readStatus(buf) {
        let id = buf.getShort()
        let time = buf.getFloat()
        return [id, time]
    }
    static writePlansQueueNet(buf, plans) {
        buf.putInt(-1);//TODO plans
    }
}

module.exports = TypeIO