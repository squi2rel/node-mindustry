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
        buf.putShort(tile.x);
        buf.putShort(tile.y);
    }
    static readVecNullable(buf) {
        let x = buf.getFloat();
        let y = buf.getFloat();
        return (isNaN(x) || isNaN(y)) ? null : {x, y}
    }
    static readVec2(buf) {
        let x = buf.getFloat();
        let y = buf.getFloat();
        return {x, y}
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
        return {x, y}
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
            let unit = UnitIO.read(buf, typeid, true);

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
            return [type, this.readString(buf)];
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
                out.push(this.readObject(buf));
            }
            return [type, out];
        } else if (type == 23) {
            return [type, buf.get()];
        } else {
            return [undefined, undefined];
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
    static readPlan(buf){
        let type = buf.get();
        let position = this.readTile(buf);

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
    static writeObject(buf, obj) {
        let type = obj[0];
        buf.put(type);

        if (type == 0) {
            
        } else if (type == 1) {
            buf.putInt(obj[1]);
        } else if (type == 2) {
            buf.putLong(obj[1]); 
        } else if (type == 3) {
            buf.putFloat(obj[1]);
        } else if (type == 4) {
            this.writeString(buf, obj[1]);
        } else if (type == 5) {
            buf.put(obj[1][0]);
            buf.putShort(obj[1][1]);
        } else if (type == 6 || type == 21) {
            buf.putShort(obj[1].length);
            for (let i = 0; i < obj[1].length; i++) {
                buf.putInt(obj[1][i]);
            }
        } else if (type == 7) {
            buf.putInt(obj[1][0]);
            buf.putInt(obj[1][1]);
        } else if (type == 8) {
            buf.putShort(obj[1].length);
            for (let i = 0; i < obj[1].length; i++) {
                buf.putInt(obj[1][i]);
            }
        } else if (type == 9) {
            buf.put(obj[1][0]);
            buf.putShort(obj[1][1]);
        } else if (type == 10) {
            buf.put(obj[1]);
        } else if (type == 11) {
            buf.putDouble(obj[1]);
        } else if (type == 12 || type == 17) {
            buf.putInt(obj[1]);
        } else if (type == 13) {
            buf.putShort(obj[1]);
        } else if (type == 14 || type == 16) {
            buf.putShort(obj[1].length);
            for (let i = 0; i < obj[1].length; i++) {
                buf.put(obj[1][i]);
            }
        } else if (type == 15) {
            buf.put(obj[1]);
        } else if (type == 18) {
            buf.putShort(obj[1].length);
            for (let i = 0; i < obj[1].length; i++) {
                buf.putFloat(obj[1][i][0]);
                buf.putFloat(obj[1][i][1]);
            }
        } else if (type == 19) {
            buf.putFloat(obj[1][0]);
            buf.putFloat(obj[1][1]);
        } else if (type == 20) {
            buf.put(obj[1]);
        } else if (type == 22) {
            buf.putShort(obj[1].length);
            for (let i = 0; i < obj[1].length; i++) {
                this.writeObject(buf, obj[1][i]);
            }
        } else if (type == 23) {
            buf.put(obj[1]);
        }
    }
    static writePlan(buf, plan){
        buf.put(plan.type);
        this.writeTile(buf, plan.position);
        if(!plan.type){
            buf.putShort(plan.block)
            buf.put(plan.rotation)
            buf.put(plan.hasConfig)
            this.writeObject(buf, plan.config);
        }
    }
    static readBlock(buf){
        let block = buf.getShort()
        return block
    }
    static readUnit(buf){
        let type = buf.get()
        let id = buf.getInt();
        return [type, id]
    }
    static readTeam(buf){
        let team = buf.get()
        return team
    }
    static writeEntity(buf, id){
        buf.putInt(id)
    }
    static writeUnit(buf, unit){
        buf.put(unit[0])
        buf.putInt(unit[1])
    }
    static writeInts(buf, ints){
        buf.putShort(ints.length)
        for(let i = 0; i < ints.length; i++){
            buf.putInt(ints[i])
        }
    }
    static writeBuilding(buf, build){
        if(build.x == -1 || build.y == -1){
            buf.putInt(-1);
            return
        }
        buf.putShort(build.x)
        buf.putShort(build.y)
    }
    static writeVec2(buf, vec){
        buf.putFloat(vec.x)
        buf.putFloat(vec.y)
    }
    static writeItem(buf, item){
        buf.putShort(item)
    }
    static writePlansQueueNet(buf, plans) {
        buf.putInt(plans.length);
        for(let i = 0; i < plans.length; i++){
            this.writePlan(buf, plans[i]);
        }
    }
}

module.exports = TypeIO