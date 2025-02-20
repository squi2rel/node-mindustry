class PlayerCon{
	constructor(nc, con, p){
		this.con = con
		this.nc = nc
		this.id = nc.genId()
		this.name = p.name
		this.uuid = p.uuid
	}
}

module.exports = PlayerCon