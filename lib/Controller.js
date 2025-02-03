const TypeIO = require("./TypeIO");

class Controller{
	xdelta;
	ydelta;
	px; // pointer x/y
	py;
	constructor(player){
		this.player = player

		this.xdelta = 0;
		this.ydelta = 0;

		this.xvel = 0;
		this.yvel = 0;

		this.px = 0;
		this.py = 0;

		this.rotdelta = 0;

		this.miningpos = null;

		this.boost = false;
		this.shoot = false;
		this.chat = false;
		this.build = true;

		this.plans = [];

		this.vx = 0;
		this.vy = 0;
		this.vw = 0;
		this.vh = 0;
	}
	doTick(){
		this.player.unit.position.x = this.player.unit.position.x + this.xdelta
		this.player.unit.position.y = this.player.unit.position.y + this.ydelta

		this.xdelta = 0;
		this.ydelta = 0;

		this.player.unit.px = this.px
		this.player.unit.py = this.py

		this.player.unit.rotation = (this.player.unit.rotation + this.rotdelta) % 360;
		if (this.player.unit.rotation < 0) {
		  	this.player.unit.rotation += 360;
		}

		this.rotdelta = 0

		this.player.unit.baserot = this.player.unit.rotation

		if(!this.player.unit.vel) this.player.unit.vel = {x: 0, y: 0}

		this.player.unit.vel.x = this.xvel
		this.player.unit.vel.y = this.yvel

		this.player.unit.miningpos = this.miningpos ? this.miningpos : {x: -1, y: -1}

		this.player.unit.boost = this.boost
		this.player.unit.shoot = this.shoot
		this.player.unit.chat = this.chat
		this.player.unit.build = this.build

		this.player.unit.plans = this.plans

		this.player.unit.vx = this.vx
		this.player.unit.vy = this.vy
		this.player.unit.vw = this.vx
		this.player.unit.vh = this.vy
	}
	move(x, y){
		this.xdelta += x
		this.ydelta += y
	}
	rotate(rot){
		this.rotdelta += rot
	}
	chating(arg){
		this.chat = arg === undefined ? !this.chat : arg
	}
	building(arg){
		this.build = arg === undefined ? !this.build : arg
	}
	boosting(arg){
		this.boost = arg === undefined ? !this.boost : arg
	}
	shooting(arg){
		this.shoot = arg === undefined ? !this.shoot : arg
	}
	velocity(x, y){
		this.xvel = x
		this.yvel = y
	}
	mine(x, y){
		if(x == -1 || y == -1){
			this.miningpos = null
		} else {
			this.miningpos = {}
			this.miningpos.x = x
			this.miningpos.y = y
		}
	}
}

module.exports = Controller