const TypeIO = require("./TypeIO");

const blocksParams = require('./json/BlocksParams.json')

class BlockIO {
	static readMain(buf, type, ver){
		if(type == "GenericCrafter" || type == "Separator" || type == "HeatProducer" || type == "HeatCrafter"){
			let progress = buf.getFloat()
			let warmup = buf.getFloat()

			let heat;
			if(type == "HeatProducer"){
				heat = buf.getFloat()
			}

			let seed;
			if(type == "Separator" || ver == 1){
				seed = buf.getInt()
			}

			let result = {
				progress,
				warmup,
				seed,
				heat
			}
			return result
		} else if(type == "Door" || type == "AutoDoor"){
			let open = buf.get()
			let result = {
				open
			}
			return result
		} else if(type == "ShieldWall"){
			let shield = buf.getFloat()
			let result = {
				shield
			}
			return result
		} else if(type == "MendProjector" || type == "OverdriveProjector"){
			let heat = buf.getFloat()
			let pheat = buf.getFloat()
			let result = {
				heat,
				pheat
			}
			return result
		} else if(type == "ForceProjector"){
			let broken = buf.get()
			let buildup = buf.getFloat()
			let radscl = buf.getFloat()
			let warmup = buf.getFloat()
			let pheat = buf.getFloat()
			let result = {
				broken,
				buildup,
				radscl,
				warmup,
				pheat
			}
			return result
		} else if(type == "Radar"){
			let progress = buf.getFloat()
			let result = {
				progress
			}
			return result
		} else if(type == "BuildTurret"){
			let rotation = buf.getFloat()
			let plans;
			[plans, offset] = TypeIO.readPlans(buf, offset);
			let result = {
				rotation,
				plans
			}
			return result
		} else if(type == "BaseShield"){
			let sradius = buf.getFloat()
			let broken = buf.get()
			let result = {
				sradius,
				broken
			}
			return result
		} else if(type == "Conveyor" || type == "ArmoredConveyor"){
			let amount = buf.getInt()
			let map = []
			for(let i = 0; i < amount; i++){
				let id;
				let x, y;
				if(ver == 0){
					let val = buf.getInt()
					id = (val >> 24) & 0xff;
	    			x = ((val >> 16) & 0xff) / 127;
	    			y = (((val >> 8) & 0xff) + 128) / 255;
				} else {
					let id = buf.getShort()
					x = buf.get() / 127;
					y = (buf.get() + 128) / 255
				}
				let res = {
					id,
					x,
					y
				}
				map[i] = res
			}
			let result = {
				map
			}
			return result
		} else if(type == "StackConveyor"){
			let link = buf.getInt()
			let cooldown = buf.getFloat()
			let result = {
				link,
				cooldown
			}
			return result
		} else if(type == "Junction"){
			let buffers = []
			let indexes = []
			for(let i = 0; i < 4; i++){
				buffers[i] = []
				indexes[i] = buf.get()
				let length = buf.get()
				for(let j = 0; j < length; j++){
					let value = buf.getLong();
					buffers[i][j] = value
				}
			}
			let result = {
				buffers,
				indexes
			}
			return result
		} else if(type == "BufferedItemBridge" || type == "ItemBridge" || type == "LiquidBridge"){
			let link = buf.getInt()
			let warmup = buf.getFloat()
			let links = buf.get()
			let incoming = [];
			let moved;
			for(let i = 0; i < links; i++){
				incoming.push(buf.getInt());
			}
			if(ver >= 1){
				moved = buf.get()
			}
			let index, length, buffer;
			if(type == "BufferedItemBridge"){
				index = buf.get()
				length = buf.get()
				buffer = [];
				for(let i = 0; i < length; i++){
					let l = buf.getLong();
					buffer[i] = l;
				}
			}
			let result = {
				link,
				warmup,
				incoming,
				index,
				buffer
			}
			return result
		} else if(type == "Sorter"){
			let sortitem = buf.getShort()
			let buffers = []
			let indexes = []
			if(ver == 1){
				for(let i = 0; i < 4; i++){
					buffers[i] = []
					indexes[i] = buf.get()
					let length = buf.get()
					for(let j = 0; j < length; j++){
						let value = buf.getLong();
						buffers[i][j] = value
					}
				}
			}
			let result = {
				sortitem,
				buffers
			}
			return result
		} else if(type == "OverflowGate"){
			let buffers = []
			let indexes = []
			if(ver == 1){
				for(let i = 0; i < 4; i++){
					buffers[i] = []
					indexes[i] = buf.get()
					let length = buf.get()
					for(let j = 0; j < length; j++){
						let value = buf.getLong();
						buffers[i][j] = value
					}
				}
			} else if(ver == 3){
				buf.skip(4);
			}
			let result = {
				buffers
			}
			return result
		} else if(type == "MassDriver"){
			let link = buf.getInt()
			let rotation = buf.getFloat()
			let state = buf.get()
			let result = {
				link,
				rotation,
				state
			}
			return result
		} else if(type == "Duct"){
			let recDir;
			if(ver >= 1){
				recDir = buf.get()
			}
			let result = {
				recDir
			}
			return result
		} else if(type == "DuctRouter"){
			let sitem;
			if(ver >= 1){
				sitem = buf.getShort()
			}
			let result = {
				sitem
			}
			return result
		} else if(type == "DirectionalUnloader"){
			let id = buf.getShort()
			let off = buf.getShort()
			let result = {
				id,
				off
			}
			return result
		} else if(type == "UnitCargoLoader"){
			let unitid = buf.getInt()
			let result = {
				unitid
			}
			return result
		} else if(type == "UnitCargoUnloadPoint"){
			let item = buf.getShort()
			let stale = buf.get()
			let result = {
				item,
				stale
			}
			return result
		} else if(type == "NuclearReactor" || type == "ImpactReactor" || type == "VariableReactor"){
			let peff = buf.getFloat()
			let gentime;
			if(ver >= 1){
				gentime = buf.getFloat()
			}
			let heat, warmup, instability;
			if(type == "NuclearReactor" || type == "VariableReactor"){
				heat = buf.getFloat()
			}
			if(type == "VariableReactor"){
				instability = buf.getFloat()
			}
			if(type == "ImpactReactor" || type == "VariableReactor"){
				warmup = buf.getFloat()
			}
			let result = {
				peff,
				gentime,
				heat,
				warmup,
				instability
			}
			return result
		} else if(type == "HeaterGenerator"){
			let heat = buf.getFloat()
			let result = {
				heat
			}
			return result
		} else if(type == "Drill" || type == "BeamDrill" || type == "BurstDrill"){
			let progress, warmup, time;
			if(ver >= 1){
				if(type == "Drill" || type == "BurstDrill"){
					progress = buf.getFloat()
				} else {
					time = buf.getFloat()
				}
				warmup = buf.getFloat()
			}
			let result = {
				progress,
				warmup,
				time
			}
			return result
		} else if(type == "Unloader"){
			let id;
			if(ver == 1){
				id = buf.getShort()
			} else {
				id = buf.get()
			}
			let result = {
				id
			}
			return result
		} else if(type == "ItemTurret"){
			let reloadc = buf.getFloat()
			let rotation = buf.getFloat()
			let ammo = []
			let amount = buf.get()
			for(let i = 0; i < amount; i++){
				let item = buf.getShort()
				let a = buf.getShort()
				ammo[i] = [item, a]
			}
			let result = {
				reloadc,
				rotation,
				ammo
			}
			return result
		} else if(type == "TractorBeamTurret" || type == "PointDefenseTurret"){
			let rotation = buf.getFloat()
			let result = {
				rotation
			}
			return result
		} else if(type == "ContinuousTurret" || type == "ContinuousLiquidTurret"){
			let reloadc, rotation;
			if(ver >= 1){
				reloadc = buf.getFloat()
				rotation = buf.getFloat()
			}
			let ll;
			if(ver >= 3){
				ll = buf.getFloat()
			}
			let result = {
				ll
			}
			return result
		} else if(type == "UnitFactory" || type == "Reconstructor"){
			let px = buf.getFloat()
			let py = buf.getFloat()
			let prot = buf.getFloat()
			let payload = TypeIO.readPayload(buf);
			let progress;
			if(type == "UnitFactory"){
				progress = buf.getFloat()
			} else if(ver >= 1){
				progress = buf.getFloat()
			}
			let currentplan;
			if(type == "UnitFactory"){
				currentplan = buf.getShort()
			}
			let commandpos;
			let command;
			if(ver >= 2){
				commandpos = TypeIO.readVecNullable(buf);
			}
			if(ver >= 3){
				command = TypeIO.readCommand(buf)
			}
			let result = {
				px,
				py,
				prot,
				payload,
				progress,
				currentplan,
				commandpos,
				command
			}
			return result
		} else if(type == "RepairTurret"){
			let rotation = buf.getFloat()
			let result = {
				rotation
			}
			return result
		} else if(type == "UnitAssembler"){
			let px = buf.getFloat()
			let py = buf.getFloat()
			let prot = buf.getFloat()
			let payload = TypeIO.readPayload(buf);
			let progress = buf.getFloat()
			let count = buf.get()
			let units = [];
			for(let i = 0; i < count; i++){
				let unit = buf.getInt()
				units.push(unit)
			}
			let pay = this.readPayloadSeq(buf);
			let commandpos;
			if(ver >= 2){
				commandpos = TypeIO.readVecNullable(buf);
			}
			let result = {
				px,
				py,
				prot,
				payload,
				progress,
				units,
				pay,
				commandpos
			}
			return result
		} else if(type == "PayloadConveyor" || type == "PayloadRouter"){
			let progress = buf.getFloat()
			let itemrotation = buf.getFloat()
			let item = TypeIO.readPayload(buf);
			let sort, recdir;
			if(type == "PayloadRouter"){
				let ctype = buf.get()
				sort = buf.getShort()
				recdir = buf.get()
			}
			let result = {
				progress,
				itemrotation,
				item,
				sort,
				recdir
			}
			return result
		} else if(type == "PayloadMassDriver"){
			let px = buf.getFloat()
			let py = buf.getFloat()
			let prot = buf.getFloat()
			let payload = TypeIO.readPayload(buf);
			let link = buf.getInt()
			let rotation = buf.getFloat()
			let state = buf.get()
			let reloadc = buf.getFloat()
			let charge = buf.getFloat()
			let loaded = buf.get()
			let charging = buf.get()
			let result = {
				px,
				py,
				prot,
				payload,
				link,
				rotation,
				state,
				reloadc,
				charge,
				loaded,
				charging
			}
			return result
		} else if(type == "PayloadDeconstructor"){
			let px = buf.getFloat()
			let py = buf.getFloat()
			let prot = buf.getFloat()
			let payload = TypeIO.readPayload(buf);
			let progress = buf.getFloat()
			let accums = buf.getShort()
			let accum = [];
			for(let i = 0; i < accums; i++){
				accum[i] = buf.getFloat()
			}
			let decp;
			[decp, offset] = rpl(buf, offset);
			let result = {
				px,
				py,
				prot,
				payload,
				progress,
				accum,
				decp
			}
			return result
		} else if(type == "Constructor"){
			let px = buf.getFloat()
			let py = buf.getFloat()
			let prot = buf.getFloat()
			let payload = TypeIO.readPayload(buf);
			let progress = buf.getFloat()
			let rec = buf.getShort()
			let result = {
				px,
				py,
				prot,
				payload,
				progress,
				rec
			}
			return result
		} else if(type == "PayloadLoader"){
			let px = buf.getFloat()
			let py = buf.getFloat()
			let prot = buf.getFloat()
			let payload = TypeIO.readPayload(buf);
			let exporting = buf.get()
			let result = {
				px,
				py,
				prot,
				payload,
				exporting
			}
			return result
		} else if(type == "ItemSource"){
			let item = buf.getShort()
			let result = {
				item
			}
			return result
		} else if(type == "LiquidSource"){
			let id = buf.getShort()
			let result = {
				id
			}
			return result
		} else if(type == "PayloadSource"){
			let px = buf.getFloat()
			let py = buf.getFloat()
			let prot = buf.getFloat()
			let payload = TypeIO.readPayload(buf);
			let unit = buf.getShort()
			let block = buf.getShort()
			let result = {
				px,
				py,
				prot,
				payload,
				unit,
				block
			}
			return result
		} else if(type == "LightBlock"){
			let color = buf.getInt()
			let result = {
				color
			}
			return result
		} else if(type == "LaunchPad"){
			let lc = buf.getFloat()
			let result = {
				lc
			}
			return result
		} else if(type == "Accelerator"){
			let progress = buf.getFloat()
			let result = {
				progress
			}
			return result
		} else if(type == "MessageBlock"){
			let str = buf.readString()
			let result = {
				str
			}
			return result
		} else if(type == "SwitchBlock"){
			let en = buf.get()
			let result = {
				en
			}
			return result
		} else if(type == "ConsumeGenerator" || type == "ThermalGenerator" || type == "SolarGenerator"){
			let pe = buf.getFloat()
			let gentime = buf.getFloat()
			let result = {
				pe,
				gentime
			}
			return result
		} else if(type == "StackRouter"){
			let sortitem = buf.getShort()
			let result = {
				sortitem
			}
			return result
		} else if(type == "LiquidTurret" || type == "PowerTurret" || type == "LaserTurret"){
			let reloadc = buf.getFloat()
			let rotation = buf.getFloat()
			let result = {
				reloadc,
				rotation
			}
			return result
		} else if(type == "UnitAssemblerModule"){
			let px = buf.getFloat()
			let py = buf.getFloat()
			let prot = buf.getFloat()
			let payload = TypeIO.readPayload(buf);
			let result = {
				px,
				py,
				prot,
				payload
			}
			return result
		} else if(type == "MemoryBlock"){
			let amount = buf.getInt()
			let memory = [];
			for(let i = 0; i < amount; i++){
				let value = buf.getDouble()
				memory[i] = value
			}
			let result = {
				memory
			}
			return result
		} else if(type == "LogicDisplay"){
			let ht = buf.get()
			let map = [];
			if(ht){
				for(let i = 0; i < 9; i++){
					let val = buf.getFloat()
					map[i] = val
				}
			}
			let result = {
				map
			}
			return result
		} else if(type == "CanvasBlock"){
			let len = buf.getInt()
			let data = buf.get(len)
			let result = {
				data
			}
			return result
		} else {
			return null
		}
	}
	static readPayloadSeq(buf){
		let amount = buf.getShort()
		let ent = []
		for(let i = 0; i < -amount; i++){
			let type = buf.get();
			let entr = buf.getShort();
			let count = buf.getInt();
		}
		return ent
	}
	static readBase(buf, id){
		let health = buf.getFloat();
		let rot = buf.get();
		let team = buf.get();
		let rotation = rot & 0b01111111;
		let ver = 0;

		let legacy = true;
		let on;

		let moduleBitmask = 0;
		if(blocksParams[id]){
			moduleBitmask = this.getModuleBitmask(id)
		}

		if((rot & 0b10000000) != 0){
			ver = buf.get()
			if(ver >= 1){
				on = buf.get();
			}
			if(ver >= 2){
				moduleBitmask = buf.get();
			}
			legacy = false;
		}
		let items;
		if((moduleBitmask & 1) != 0){
			items = this.readItemsM(buf, legacy);
		}
		let power;
		if((moduleBitmask & 2) != 0){
			power = this.readPowerM(buf, legacy);
		}
		let liquids;
		if((moduleBitmask & 4) != 0){
			liquids = this.readLiquidsM(buf, legacy);
		}

		if(ver <= 2) buf.get()

		let eff, opteff;
		if(ver >= 3){
			eff = buf.get()
			opteff = buf.get()
		}
		
		let result = {
		    health,
		    rotation,
		    team,
		    ver,
		    legacy,
		    on,
		    items,
		    power,
		    liquids,
		    eff,
		    opteff
		}

		return result
	}
	static getModuleBitmask(id){
		return (blocksParams[id].hasItems ? 1 : 0 | (blocksParams[id].hasPower ? 2 : 0) | (blocksParams[id].hasLiquids ? 4 : 0)) | 8
	}
	static readItemsM(buf, legacy){
		let count = legacy ? buf.get() : buf.getShort()

		let items = {}
		for(let j = 0; j < count; j++){
			let itemid = legacy ? buf.get() : buf.getShort()
			let iamount = buf.getInt();
			items[itemid] = iamount
		}
		return items
	}
	static readLiquidsM(buf, legacy){
		let count = legacy ? buf.get() : buf.getShort()

		let liquids = {}
		for(let j = 0; j < count; j++){
			let liqid = legacy ? buf.get() : buf.getShort()
			let liqamount = buf.getInt();
			liquids[liqid] = liqamount
		}
		return liquids
	}
	static readPowerM(buf, legacy){
		let amount = buf.getShort();
		let links = []

		for(let i = 0; i < amount; i++){
			let link  = buf.getInt()
			links.push(link)
		}

		let status = buf.getFloat();
		return [links, status]
	}
	static readAll(buf, id, type, ver){
		let base = this.readBase(buf, id);

		let main = this.readMain(buf, type, ver);
		return [base, main]
	}
}

module.exports = BlockIO