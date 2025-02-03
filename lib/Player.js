const Controller = require("./Controller")
const Packets = require("./Packets");

class Player{
	tickTime = 66 // 1/15
	constructor(nc, id){
		this.nc = nc
		this.id = id

		this.unit = {}

		this.controller = new Controller(this)

		this.snapid = 0;

		this.interval = setInterval(() => this.tick(), this.tickTime)
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
	stop(){
		clearInterval(this.interval)
	}
}

module.exports = Player