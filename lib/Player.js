const Controller = require("./Controller")
const Packets = require("./Packets");
const Utils = require("./Utils");

class Player{
	tickTime = 66 // 1/15(66.6)
	constructor(nc, id){
		this.nc = nc
		this.id = id

		this.unit = {}

		this.controller = new Controller(this)

		this.snapid = 0;

		setTimeout(() => {
			this.interval = setInterval(() => this.tick(), this.tickTime)
		}, 100)

		this.setupListeners()
	}
	setupListeners(){
		this.nc.on("ConstructFinishCallPacket", p => {
			this.nc.game.world.tiles.array[p.tile.y * this.nc.game.world.tiles.width + p.tile.x].block = p.block
			for(let i = 0; i < this.controller.plans.length; i++){
				let plan = this.controller.plans[i]
				if(!plan) continue;
				if(plan.position.x == p.tile.x && plan.position.y == p.tile.y){
					this.controller.plans[i] = null;
				}
			}
		})
		this.nc.on("DeconstructFinishCallPacket", p => {
			this.nc.game.world.tiles.array[p.tile.y * this.nc.game.world.tiles.width + p.tile.x].block = 0
			for(let i = 0; i < this.controller.plans.length; i++){
				let plan = this.controller.plans[i]
				if(!plan) continue;
				if(plan.position.x == p.tile.x && plan.position.y == p.tile.y){
					this.controller.plans[i] = null;
				}
			}
		})
	}
	tick(){
		this.unit = this.nc.units[this.id] || {}
		let unit = this.nc.units[this.unit?.unit[1]] || {}

		for (let key in unit) {
            this.unit[key] = unit[key];
        }

		this.controller.doTick()

		this.clientSnap()
	}
	clientSnap(){
		let p = new Packets.ClientSnapshotCallPacket();
		p.snapshotID = this.snapid++;
		p.unitID = this.unit.unit[1]
		p.dead = (this.unit.health > 0) ? 0 : 1
		p.x = this.unit.position.x
		p.y = this.unit.position.y
		p.pointerX = this.unit.px; 
		p.pointerY = this.unit.py; 
		p.rotation = this.unit.rotation; 
		p.baseRotation = this.unit.baserot; 
		p.xVelocity = this.unit.vel.x; 
		p.yVelocity = this.unit.vel.y; 
		p.mining = this.unit.miningpos; 
		p.boosting = this.unit.boost ? 1 : 0; 
		p.shooting = this.unit.shoot ? 1 : 0; 
		p.chatting = this.unit.chat ? 1 : 0; 
		p.building = this.unit.build ? 1 : 0; 
		p.plans = this.unit.plans.filter(plan => plan !== null); 
		p.viewX = this.unit.vx; 
		p.viewY = this.unit.vy; 
		p.viewWidth = this.unit.vw; 
		p.viewHeight = this.unit.vh;
		this.nc.send(p, false);
	}
	build(x, y, block, config){
		let blockid = typeof block == "string" ? Utils.getBlockByName(block) : block

		if(this.nc.game.world.tiles.array[y * this.nc.game.world.tiles.width + x].block == blockid){
			return
		}

		for(let i = 0; i < this.controller.plans.length; i++){
			let plan = this.controller.plans[i]
			if(!plan) continue;
			if(plan.position.x == x && plan.position.y == y){
				return
			}
		}

		let rotation = config?.rotation || 0
		let object = config?.object || [0]
		let pos = {x, y}
		let plan = {
			type: 0,
			position: pos,
			block: blockid,
			rotation,
			hasConfig: 1,
			config: object
		}
		this.controller.plans.push(plan)
	}
	break(x, y){
		if(this.nc.game.world.tiles.array[y * this.nc.game.world.tiles.width + x].block == 0){
			return
		}

		for(let i = 0; i < this.controller.plans.length; i++){
			let plan = this.controller.plans[i]
			if(!plan) continue;
			if(plan.position.x == x && plan.position.y == y){
				return
			}
		}

		let pos = {x, y}

		let plan = {
			type: 1,
			position: pos
		}
		this.controller.plans.push(plan)
	}
	stop(){
		clearInterval(this.interval)
	}
}

module.exports = Player