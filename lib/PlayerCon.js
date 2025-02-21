const KickReason = require("./KickReason")
const Packets = require("./Packets");

class PlayerCon{
	constructor(nc, con, p){
		this.con = con
		this.nc = nc
		this.id = nc.genId()
		this.name = p.name
		this.uuid = p.uuid
	}

	kick(k){
		if(k instanceof KickReason){
			let p = new Packets.KickCallPacket2();
			p.reason = k
			this.nc.send(this.con, p, true);
		} else {
			let p = new Packets.KickCallPacket();
			p.reason = k
			this.nc.send(this.con, p, true);
		}

		this.nc.close(this.con)
	}
}

module.exports = PlayerCon