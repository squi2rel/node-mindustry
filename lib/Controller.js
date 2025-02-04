const TypeIO = require("./TypeIO");

class Controller{
	constructor(player){
		this.player = player

		this.xdelta = 0;
		this.ydelta = 0;

		this.xvel = 0;
		this.yvel = 0;

		this.px = 0;
		this.py = 0;

		this.rot = null
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

		this.status = null
	}
	calcStatus(){
		let targetx, targety;
		let cposx = this.player.unit.position.x
	    let cposy = this.player.unit.position.y

	    if(this.status == "move" || this.status == "follow"){
	        if(this.status == "move"){
	            targetx = this.tx
	            targety = this.ty
	        } else if(this.status == "follow"){
	            let t1 = Object.entries(this.player.nc.units).filter(([k, v]) => v.name == this.pl)
	            let tunit = t1.length > 0 ? (t1[0].length > 0 ? t1[0][1] : null) : null
	            if(tunit){
	                targetx = tunit.position.x
	                targety = tunit.position.y
	            }
	        }

	        let dx = targetx - cposx;
	        let dy = targety - cposy;
	        
	        let distance = Math.sqrt(dx * dx + dy * dy);
	        let speed = this.speed;
	        
	        if (distance > 8) {
	            dx /= distance;
	            dy /= distance;
	            dx *= Math.min(distance, speed);
	            dy *= Math.min(distance, speed);
	            this.move(dx, dy)
	        } else {
	        	if(this.status == "move") this.status = null;
	        }
	    }
	}
	doTick(){

		this.plans = this.plans.filter(plan => plan !== null)

		this.player.unit.position.x = this.player.unit.position.x + this.xdelta
		this.player.unit.position.y = this.player.unit.position.y + this.ydelta

		this.xdelta = 0;
		this.ydelta = 0;

		this.calcStatus()

		this.player.unit.px = this.px
		this.player.unit.py = this.py

		this.player.unit.rotation = (this.player.unit.rotation + this.rotdelta) % 360;
		if (this.player.unit.rotation < 0) {
		  	this.player.unit.rotation += 360;
		}
		if(this.rot){
			this.player.unit.rotation = this.rot
			this.rot = null
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
	moveTo(x, y, speed = 8){
		this.status = "move"
		this.speed = speed
		this.tx = x
		this.ty = y
	}
	follow(pl, speed = 8){
		this.status = "follow"
		this.speed = speed
		this.pl = pl
	}
	clearStatus(){
		this.status = null
	}
	rotate(rot, s){
		if(s){
			this.rot = rot
		} else {
			this.rotdelta += rot
		}
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
	target(x, y){
		this.status = "target"
		let cposx = this.player.unit.position.x
	    let cposy = this.player.unit.position.y
        let deltax = x - cposx;
	    let deltay = y - cposy;

	    let angler = Math.atan2(deltay, deltax);

	    let angled = angler * (180 / Math.PI);

	    this.rotate(angled, true)
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