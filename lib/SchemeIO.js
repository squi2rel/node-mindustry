const DataStream = require("./DataStream");
const Utils = require("./Utils");
const TypeIO = require("./TypeIO");
const zlib = require("zlib");

class SchemeIO{
	static readBase64(str){
		let buf = Buffer.from(str, 'base64')
		buf = DataStream.from(buf)
		return this.read(buf)
	}
	static read(buf){
		let header = 'msch'
		for(let i = 0; i < header.length; i++){
			let l = header[i]
			let s = String.fromCharCode(buf.get())
			if(l != s){
				throw new Error('header incorrect')
			}
		}
		let ver = buf.get()

		let b = buf._getBuffer(buf.position())
		buf = DataStream.from(zlib.inflateSync(b))

		let width = buf.getShort()
		let height = buf.getShort()

		let tags = buf.get()

		let map = {}

		for(let i = 0; i < tags; i++){
			let key = buf.readString()
			let value = buf.readString()
			map[key] = value
		}

		let blocks = []
		let len = buf.get()
		for(let i = 0; i < len; i++){
			let name = buf.readString()
			blocks.push(Utils.getBlockByName(name))
		}

		let total = buf.getInt()

		let res = []
		
		for(let i = 0; i < total; i++){
			let block = blocks[buf.get()]
			let position = TypeIO.readTile(buf)
			let config = TypeIO.readObject(buf)
			let rotation = buf.get();
			res.push({
				block,
				position,
				config,
				rotation
			})
		}

		return {
			map,
			res
		}
	}
	static toBuildPlans(sch, x, y, rotation = 0) {
	    let plans = [];
	    
	    const angles = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];
	    let angle = angles[rotation % 4];
	    
	    for (let i = 0; i < sch.length; i++) {
	        let blk = sch[i];
	        let plan = {};
	        
	        let originalX = blk.position.x;
	        let originalY = blk.position.y;
	        
	        let rotatedX = originalX * Math.cos(angle) - originalY * Math.sin(angle);
	        let rotatedY = originalX * Math.sin(angle) + originalY * Math.cos(angle);
	        
	        plan.position = {
	            x: Math.round(x + rotatedX),
	            y: Math.round(y + rotatedY)
	        };
	        
	        plan.type = 0;
	        plan.block = blk.block;
	        
	        plan.rotation = (blk.rotation + rotation) % 4;
	        
	        plan.hasConfig = 1;
	        plan.config = blk.config;
	        
	        plans.push(plan);
	    }
	    return plans
	}
}

module.exports = SchemeIO