const TypeIO = require("./TypeIO");

const unitTypes = require('./json/UnitTypes.json')

class UnitIO{
	static read(buf, type, rev){
		let revis;
		if(rev){
			revis = buf.getShort();
		}
		let unit = this.readMain(buf, unitTypes[type])
		return unit
	}
	static readMain(buf, t){
		if (t == "MechUnit" || t == "CrawlUnit" || t == "ElevationMoveUnit" || t == "TankUnit" || t == "UnitEntity" || t == "BlockUnitUnit" || t == "UnitWaterMove" || t == "LegsUnit" || t == "TimedKillUnit" || t == "PayloadUnit" || t == "BuildingTetherPayloadUnit") {
		    let abils = TypeIO.readAbilities(buf);
		    
		    let ammo = buf.getFloat()
		    let building;
		    if(t == "BuildingTetherPayloadUnit"){
		    	building = buf.getInt()
		    }
		    let baserot;
		    if (t == "MechUnit") {
		        baserot = buf.getFloat()
		    }

		    let contr = TypeIO.readController(buf);
		    let elv = buf.getFloat()
		    let flag = buf.getDouble()
		    let health = buf.getFloat()
		    let shoot = buf.get()
		    let lifetime;
		    if(t == "TimedKillUnit"){
		    	lifetime = buf.getFloat()
		    }
		    let miningpos = TypeIO.readTile(buf)
		    let mounts = TypeIO.readMounts(buf);
		    let pl;
		    let payloads = [];
		    if(t == "PayloadUnit" || t == "BuildingTetherPayloadUnit"){
		    	pl = buf.getInt()
		    	for(let i = 0; i < pl; i++){
		    		let pld = TypeIO.readPayload(buf)
		    		payloads.push(pld)
		    	}
		    }
		    let plans = TypeIO.readPlansQueue(buf);
		    
		    let rotation = buf.getFloat()
		    let shield = buf.getFloat()
		    let spbycore = buf.get()
		    
		    let items = TypeIO.readItems(buf);
		    let slen = buf.getInt()
		    
		    let statuses = [];
		    for (let i = 0; i < slen; i++) {
		        let stat = TypeIO.readStatus(buf);
		        statuses.push(stat);
		    }
		    
		    let team = buf.get()
		    let time
		    if(t == "TimedKillUnit"){
		    	time = buf.getFloat()
		    }
		    let type = buf.getShort()

		    let updbuilding = buf.get()
		    
		    let vel = TypeIO.readVec2(buf);
		    let x = buf.getFloat()
		    let y = buf.getFloat()

		    let result = {
		        abils,
		        ammo,
		        building: t === "BuildingTetherPayloadUnit" ? building : undefined,
		        baserot: t === "MechUnit" ? baserot : undefined,
		        contr,
		        elv,
		        flag,
		        health,
		        shoot,
		        lifetime: t === "TimedKillUnit" ? lifetime : undefined,
		        miningpos,
		        mounts,
		        payloads: t === "PayloadUnit" ? payloads : undefined,
		        plans,
		        rotation,
		        shield,
		        spbycore,
		        items,
		        statuses,
		        team,
		        time: t === "TimedKillUnit" ? time : undefined,
		        type,
		        updbuilding,
		        vel,
		        position: { x, y }
		    };
		    return result;
		} else if(t == "Fire"){
			let lifetime = buf.getFloat()
			let tile = TypeIO.readTile(buf)
			let time = buf.getFloat()
			let x = buf.getFloat()
		    let y = buf.getFloat()

		    let result = {
			    lifetime,
			    tile,
			    time,
			    position: { x, y }
			};

			return result
		} else if(t == "Puddle"){
			let amount = buf.getFloat()
			let liquid = buf.getShort()
			let tile = TypeIO.readTile(buf)
			let x = buf.getFloat()
		    let y = buf.getFloat()

		    let result = {
			    amount,
			    liquid,
			    tile,
			    position: { x, y }
			};

			return result
		} else if(t == "Player"){
			let admin = buf.get()
		    let boost = buf.get()
		    let color = buf.getInt()
		    let mouseX = buf.getFloat()
		    let mouseY = buf.getFloat()
		    let name = TypeIO.readString(buf);
		    let shoot = buf.get()
		    let team = buf.get()
		    let typing = buf.get()
		    let unit = TypeIO.readUnit(buf);
		    let x = buf.getFloat()
		    let y = buf.getFloat()

		    let result = {
			    admin,
			    boost,
			    color,
			    mouse: { x: mouseX, y: mouseY },
			    name,
			    shoot,
			    team,
			    typing,
			    unit,
			    position: { x, y }
			}
			return result
		} else if(t == "WeatherState"){
			let effectt = buf.getFloat()
			let intensity = buf.getFloat()
			let life = buf.getFloat()
			let opacity = buf.getFloat()
			let weather = buf.getShort()
			let wind = TypeIO.readVec2(buf)

			let result = {
			    effectt,
			    intensity,
			    life,
			    opacity,
			    weather,
			    wind
			};
			return result
		} else if(t == "WorldLabel"){
			let flags = buf.get()
			let fonts = buf.getFloat()
			let str = TypeIO.readString();
			let x = buf.getFloat()
		    let y = buf.getFloat()

		    let result = {
			    flags,
			    fonts,
			    str,
			    position: { x, y }
			}
			return result
		} else {
			return [{}, offset]
		}
	}
}

module.exports = UnitIO