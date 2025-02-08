const Controller = require("./Controller")
const Packets = require("./Packets");
const Utils = require("./Utils");
const SchemeIO = require("./SchemeIO");

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
		this.nc.on("BeginPlaceCallPacket", p => {
			let tile = this.nc.game.world.get(p.x, p.y)
			tile.setBlock(p.result)
			tile.build[0].team = p.team
			tile.build[0].rotation = p.rotation
			tile.build[0].atConstruct = true
		})
		this.nc.on("BeginBreakCallPacket", p => {
			let tile = this.nc.game.world.get(p.x, p.y)
			tile.build[0].atConstruct = true
		})
		this.nc.on("ConstructFinishCallPacket", p => {
			this.nc.game.world.get(p.tile.x, p.tile.y).setBlock(p.block)
			this.nc.game.world.get(p.tile.x, p.tile.y).build[0].atConstruct = false
			for(let i = 0; i < this.controller.plans.length; i++){
				let plan = this.controller.plans[i]
				if(!plan) continue;
				if(plan.position.x == p.tile.x && plan.position.y == p.tile.y){
					this.controller.plans[i] = null;
				}
			}
		})
		this.nc.on("DeconstructFinishCallPacket", p => {
			this.nc.game.world.get(p.tile.x, p.tile.y).setBlock(0)
			this.nc.game.world.get(p.tile.x, p.tile.y).build[0].atConstruct = false
			for(let i = 0; i < this.controller.plans.length; i++){
				let plan = this.controller.plans[i]
				if(!plan) continue;
				if(plan.position.x == p.tile.x && plan.position.y == p.tile.y){
					this.controller.plans[i] = null;
				}
			}
		})
		this.nc.on("RemoveQueueBlockCallPacket", p => {
			for(let i = 0; i < this.controller.plans.length; i++){
				let plan = this.controller.plans[i]
				if(!plan) continue;
				if(plan.position.x == p.x && plan.position.y == p.y){
					this.controller.plans[i] = null;
				}
			}
		})
		this.nc.on("SetTileCallPacket", p => {
			let tile = this.nc.game.world.get(p.tile.x, p.tile.y)
			tile.setBlock(p.block)
			tile.build[0].team = p.team
			tile.build[0].rotation = p.rotation
		})
		this.nc.on("RotateBlockCallPacket", p => {
			let tile = this.nc.game.world.get(p.build.x, p.build.y)
			tile.build[0].rotation += (p.direction ? 1 : -1)
		})
		this.nc.on("SetFloorCallPacket", p => {
			let tile = this.nc.game.world.get(p.tile.x, p.tile.y)
			tile.setFloor(p.floor)
			tile.setOverlay(p.overlay)
		})
		this.nc.on("SetOverlayCallPacket", p => {
			let tile = this.nc.game.world.get(p.tile.x, p.tile.y)
			tile.setOverlay(p.overlay)
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
		p.plans = this.unit.plans; 
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
	buildScheme(base, x, y){
		let sch = SchemeIO.readBase64(base)
		let plans = SchemeIO.toBuildPlans(sch.res, x, y);

		this.controller.plans = this.controller.plans.concat(plans)
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
	locate(type, target, x, y){
		x = x || this.unit?.position?.x / 8
		y = y || this.unit?.position?.y / 8
		let res = []
		const dst = (x1, y1, x2, y2) => {
		    const dx = x2 - x1;
		    const dy = y2 - y1;
		    return Math.sqrt(dx * dx + dy * dy);
		};
		this.nc.game.world.each((x2, y2, tile) => {
			if(tile[type] == target || tile[type] == Utils.getBlockByName(target)){
				res.push({tile: tile, distance: dst(x, y, x2, y2)})
			}
		})
		return res
	}
	command(unitids, config){
		let buildTarget = config.buildTarget || {x: -1, y: -1}
		let unitTarget = config.unitTarget || [0, 0]
		let posTarget = config.posTarget || {x: 0, y: 0}

		let p = new Packets.CommandUnitsCallPacket();

		p.unitIds = unitids
		p.buildTarget = buildTarget
		p.unitTarget = unitTarget
		p.posTarget = posTarget

		this.nc.send(p, true);
	}
	takeItems(x, y, item, amount = 1){
		let pos = {x, y}
		let it = typeof item == "number" ? item : Utils.getItemByName(item);
		let unit = this.unit.unit

		let p = new Packets.RequestItemCallPacket();

		p.build = pos;
		p.item = it;
		p.amount = amount;

		this.nc.send(p, true);
	}
	dropItem(){
		let p = new Packets.DropItemCallPacket();

		p.angle = 0;

		this.nc.send(p, true);
	}
	transferItemsTo(x, y){
		let pos = {x, y}

		let p = new Packets.TransferInventoryCallPacket();

		p.build = pos;

		this.nc.send(p, true);
	}
	pickupBlock(){
		let build = {x: Math.round(this.unit.position.x / 8), y: Math.round(this.unit.position.y / 8)}

		let p = new Packets.RequestBuildPayloadCallPacket();

		p.build = build

		this.nc.send(p, true);
	}
	pickupUnit(unit){
		let un = !unit ? [0, 0] : [2, unit]

		let p = new Packets.RequestBuildPayloadCallPacket();

		p.target = un

		this.nc.send(p, true);
	}
	dropPayload(){
		let p = new Packets.RequestDropPayloadCallPacket();

		p.x = this.unit.position.x
		p.y = this.unit.position.y

		this.nc.send(p, true);
	}
	control(unit){
		let un = [2, unit]

		let p = new Packets.UnitControlCallPacket();

		p.unit = un

		this.nc.send(p, true);
	}
	respawn(){
		let p = new Packets.UnitClearCallPacket();

		this.nc.send(p, true);
	}
	stop(){
		clearInterval(this.interval)
	}
}

module.exports = Player