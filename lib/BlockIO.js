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
			let plans = TypeIO.readPlans(buf);
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
	static writePayloadSeq(buf, ent) {
	    buf.putShort(-ent.length);
	    for (let e of ent) {
	        buf.put(e.type);
	        buf.putShort(e.entr);
	        buf.putInt(e.count);
	    }
	}
	static writeMain(buf, type, ver, data) {
	    if (type == "GenericCrafter" || type == "Separator" || type == "HeatProducer" || type == "HeatCrafter") {
	        buf.putFloat(data.progress);
	        buf.putFloat(data.warmup);

	        if (type == "HeatProducer") {
	            buf.putFloat(data.heat);
	        }

	        if (type == "Separator" || ver == 1) {
	            buf.putInt(data.seed);
	        }
	    } else if (type == "Door" || type == "AutoDoor") {
	        buf.put(data.open);
	    } else if (type == "ShieldWall") {
	        buf.putFloat(data.shield);
	    } else if (type == "MendProjector" || type == "OverdriveProjector") {
	        buf.putFloat(data.heat);
	        buf.putFloat(data.pheat);
	    } else if (type == "ForceProjector") {
	        buf.put(data.broken);
	        buf.putFloat(data.buildup);
	        buf.putFloat(data.radscl);
	        buf.putFloat(data.warmup);
	        buf.putFloat(data.pheat);
	    } else if (type == "Radar") {
	        buf.putFloat(data.progress);
	    } else if (type == "BuildTurret") {
	        buf.putFloat(data.rotation);
	        TypeIO.writePlans(buf, data.plans);
	    } else if (type == "BaseShield") {
	        buf.putFloat(data.sradius);
	        buf.put(data.broken);
	    } else if (type == "Conveyor" || type == "ArmoredConveyor") {
	        buf.putInt(data.map.length);
	        for (let i = 0; i < data.map.length; i++) {
	            if (ver == 0) {
	                let val = (data.map[i].id << 24) | ((data.map[i].x * 127) << 16) | ((data.map[i].y * 255 - 128) << 8);
	                buf.putInt(val);
	            } else {
	                buf.putShort(data.map[i].id);
	                buf.put(data.map[i].x * 127);
	                buf.put(data.map[i].y * 255 - 128);
	            }
	        }
	    } else if (type == "StackConveyor") {
	        buf.putInt(data.link);
	        buf.putFloat(data.cooldown);
	    } else if (type == "Junction") {
	        for (let i = 0; i < 4; i++) {
	            buf.put(data.indexes[i]);
	            buf.put(data.buffers[i].length);
	            for (let j = 0; j < data.buffers[i].length; j++) {
	                buf.putLong(data.buffers[i][j]);
	            }
	        }
	    } else if (type == "BufferedItemBridge" || type == "ItemBridge" || type == "LiquidBridge") {
	        buf.putInt(data.link);
	        buf.putFloat(data.warmup);
	        buf.put(data.incoming.length);
	        for (let i = 0; i < data.incoming.length; i++) {
	            buf.putInt(data.incoming[i]);
	        }
	        if (ver >= 1) {
	            buf.put(data.moved);
	        }
	        if (type == "BufferedItemBridge") {
	            buf.put(data.index);
	            buf.put(data.buffer.length);
	            for (let i = 0; i < data.buffer.length; i++) {
	                buf.putLong(data.buffer[i]);
	            }
	        }
	    } else if (type == "Sorter") {
	        buf.putShort(data.sortitem);
	        if (ver == 1) {
	            for (let i = 0; i < 4; i++) {
	                buf.put(data.indexes[i]);
	                buf.put(data.buffers[i].length);
	                for (let j = 0; j < data.buffers[i].length; j++) {
	                    buf.putLong(data.buffers[i][j]);
	                }
	            }
	        }
	    } else if (type == "OverflowGate") {
	        if (ver == 1) {
	            for (let i = 0; i < 4; i++) {
	                buf.put(data.indexes[i]);
	                buf.put(data.buffers[i].length);
	                for (let j = 0; j < data.buffers[i].length; j++) {
	                    buf.putLong(data.buffers[i][j]);
	                }
	            }
	        } else if (ver == 3) {
	            buf.skip(4);
	        }
	    } else if (type == "MassDriver") {
	        buf.putInt(data.link);
	        buf.putFloat(data.rotation);
	        buf.put(data.state);
	    } else if (type == "Duct") {
	        if (ver >= 1) {
	            buf.put(data.recDir);
	        }
	    } else if (type == "DuctRouter") {
	        if (ver >= 1) {
	            buf.putShort(data.sitem);
	        }
	    } else if (type == "DirectionalUnloader") {
	        buf.putShort(data.id);
	        buf.putShort(data.off);
	    } else if (type == "UnitCargoLoader") {
	        buf.putInt(data.unitid);
	    } else if (type == "UnitCargoUnloadPoint") {
	        buf.putShort(data.item);
	        buf.put(data.stale);
	    } else if (type == "NuclearReactor" || type == "ImpactReactor" || type == "VariableReactor") {
	        buf.putFloat(data.peff);
	        if (ver >= 1) {
	            buf.putFloat(data.gentime);
	        }
	        if (type == "NuclearReactor" || type == "VariableReactor") {
	            buf.putFloat(data.heat);
	        }
	        if (type == "VariableReactor") {
	            buf.putFloat(data.instability);
	        }
	        if (type == "ImpactReactor" || type == "VariableReactor") {
	            buf.putFloat(data.warmup);
	        }
	    } else if (type == "HeaterGenerator") {
	        buf.putFloat(data.heat);
	    } else if (type == "Drill" || type == "BeamDrill" || type == "BurstDrill") {
	        if (ver >= 1) {
	            if (type == "Drill" || type == "BurstDrill") {
	                buf.putFloat(data.progress);
	            } else {
	                buf.putFloat(data.time);
	            }
	            buf.putFloat(data.warmup);
	        }
	    } else if (type == "Unloader") {
	        if (ver == 1) {
	            buf.putShort(data.id);
	        } else {
	            buf.put(data.id);
	        }
	    } else if (type == "ItemTurret") {
	        buf.putFloat(data.reloadc);
	        buf.putFloat(data.rotation);
	        buf.put(data.ammo.length);
	        for (let i = 0; i < data.ammo.length; i++) {
	            buf.putShort(data.ammo[i][0]);
	            buf.putShort(data.ammo[i][1]);
	        }
	    } else if (type == "TractorBeamTurret" || type == "PointDefenseTurret") {
	        buf.putFloat(data.rotation);
	    } else if (type == "ContinuousTurret" || type == "ContinuousLiquidTurret") {
	        if (ver >= 1) {
	            buf.putFloat(data.reloadc);
	            buf.putFloat(data.rotation);
	        }
	        if (ver >= 3) {
	            buf.putFloat(data.ll);
	        }
	    } else if (type == "UnitFactory" || type == "Reconstructor") {
	        buf.putFloat(data.px);
	        buf.putFloat(data.py);
	        buf.putFloat(data.prot);
	        TypeIO.writePayload(buf, data.payload);
	        if (type == "UnitFactory") {
	            buf.putFloat(data.progress);
	        } else if (ver >= 1) {
	            buf.putFloat(data.progress);
	        }
	        if (type == "UnitFactory") {
	            buf.putShort(data.currentplan);
	        }
	        if (ver >= 2) {
	            TypeIO.writeVecNullable(buf, data.commandpos);
	        }
	        if (ver >= 3) {
	            TypeIO.writeCommand(buf, data.command);
	        }
	    } else if (type == "RepairTurret") {
	        buf.putFloat(data.rotation);
	    } else if (type == "UnitAssembler") {
	        buf.putFloat(data.px);
	        buf.putFloat(data.py);
	        buf.putFloat(data.prot);
	        TypeIO.writePayload(buf, data.payload);
	        buf.putFloat(data.progress);
	        buf.put(data.units.length);
	        for (let i = 0; i < data.units.length; i++) {
	            buf.putInt(data.units[i]);
	        }
	        this.writePayloadSeq(buf, data.pay);
	        if (ver >= 2) {
	            TypeIO.writeVecNullable(buf, data.commandpos);
	        }
	    } else if (type == "PayloadConveyor" || type == "PayloadRouter") {
	        buf.putFloat(data.progress);
	        buf.putFloat(data.itemrotation);
	        TypeIO.writePayload(buf, data.item);
	        if (type == "PayloadRouter") {
	            buf.put(data.ctype);
	            buf.putShort(data.sort);
	            buf.put(data.recdir);
	        }
	    } else if (type == "PayloadMassDriver") {
	        buf.putFloat(data.px);
	        buf.putFloat(data.py);
	        buf.putFloat(data.prot);
	        TypeIO.writePayload(buf, data.payload);
	        buf.putInt(data.link);
	        buf.putFloat(data.rotation);
	        buf.put(data.state);
	        buf.putFloat(data.reloadc);
	        buf.putFloat(data.charge);
	        buf.put(data.loaded);
	        buf.put(data.charging);
	    } else if (type == "PayloadDeconstructor") {
	        buf.putFloat(data.px);
	        buf.putFloat(data.py);
	        buf.putFloat(data.prot);
	        TypeIO.writePayload(buf, data.payload);
	        buf.putFloat(data.progress);
	        buf.putShort(data.accum.length);
	        for (let i = 0; i < data.accum.length; i++) {
	            buf.putFloat(data.accum[i]);
	        }
	        this.writePayloadSeq(buf, data.decp);
	    } else if (type == "Constructor") {
	        buf.putFloat(data.px);
	        buf.putFloat(data.py);
	        buf.putFloat(data.prot);
	        TypeIO.writePayload(buf, data.payload);
	        buf.putFloat(data.progress);
	        buf.putShort(data.rec);
	    } else if (type == "PayloadLoader") {
	        buf.putFloat(data.px);
	        buf.putFloat(data.py);
	        buf.putFloat(data.prot);
	        TypeIO.writePayload(buf, data.payload);
	        buf.put(data.exporting);
	    } else if (type == "ItemSource") {
	        buf.putShort(data.item);
	    } else if (type == "LiquidSource") {
	        buf.putShort(data.id);
	    } else if (type == "PayloadSource") {
	        buf.putFloat(data.px);
	        buf.putFloat(data.py);
	        buf.putFloat(data.prot);
	        TypeIO.writePayload(buf, data.payload);
	        buf.putShort(data.unit);
	        buf.putShort(data.block);
	    } else if (type == "LightBlock") {
	        buf.putInt(data.color);
	    } else if (type == "LaunchPad") {
	        buf.putFloat(data.lc);
	    } else if (type == "Accelerator") {
	        buf.putFloat(data.progress);
	    } else if (type == "MessageBlock") {
	        buf.writeString(data.str);
	    } else if (type == "SwitchBlock") {
	        buf.put(data.en);
	    } else if (type == "ConsumeGenerator" || type == "ThermalGenerator" || type == "SolarGenerator") {
	        buf.putFloat(data.pe);
	        buf.putFloat(data.gentime);
	    } else if (type == "StackRouter") {
	        buf.putShort(data.sortitem);
	    } else if (type == "LiquidTurret" || type == "PowerTurret" || type == "LaserTurret") {
	        buf.putFloat(data.reloadc);
	        buf.putFloat(data.rotation);
	    } else if (type == "UnitAssemblerModule") {
	        buf.putFloat(data.px);
	        buf.putFloat(data.py);
	        buf.putFloat(data.prot);
	        TypeIO.writePayload(buf, data.payload);
	    } else if (type == "MemoryBlock") {
	        buf.putInt(data.memory.length);
	        for (let i = 0; i < data.memory.length; i++) {
	            buf.putDouble(data.memory[i]);
	        }
	    } else if (type == "LogicDisplay") {
	        buf.put(data.ht);
	        if (data.ht) {
	            for (let i = 0; i < 9; i++) {
	                buf.putFloat(data.map[i]);
	            }
	        }
	    } else if (type == "CanvasBlock") {
	        buf.putInt(data.data.length);
	        buf.put(data.data);
	    }
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
		    moduleBitmask,
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
	static writeBase(buf, data) {
	    buf.putFloat(data.health);
	    let rot = data.rotation & 0b01111111;
	    if (!data.legacy) {
	        rot |= 0b10000000;
	    }
	    buf.put(rot);
	    buf.put(data.team);

	    let ver = data.ver;
	    if (!data.legacy) {
	        buf.put(ver);
	        if (ver >= 1) {
	            buf.put(data.on);
	        }
	        if (ver >= 2) {
	            buf.put(data.moduleBitmask);
	        }
	    }

	    if ((data.moduleBitmask & 1) != 0) {
	        this.writeItemsM(buf, data.items, data.legacy);
	    }
	    if ((data.moduleBitmask & 2) != 0) {
	        this.writePowerM(buf, data.power);
	    }
	    if ((data.moduleBitmask & 4) != 0) {
	        this.writeLiquidsM(buf, data.liquids);
	    }

	    if (ver <= 2) {
	        buf.put(0);
	    }

	    if (ver >= 3) {
	        buf.put(data.eff);
	        buf.put(data.opteff);
	    }
	}

	static writeItemsM(buf, items, legacy) {
	    let count = Object.keys(items).length;
	    legacy ? buf.put(count) : buf.putShort(count)

	    for (let itemid in items) {
	    	itemid = parseInt(itemid)
	    	legacy ? buf.put(itemid) : buf.putShort(itemid)
	        buf.putInt(items[itemid]);
	    }
	}

	static writeLiquidsM(buf, liquids, legacy) {
	    let count = Object.keys(liquids).length;
	    legacy ? buf.put(count) : buf.putShort(count)

	    for (let liqid in liquids) {
	    	liqid = parseInt(liqid)
	        legacy ? buf.put(liqid) : buf.putShort(liqid)
	        buf.putInt(liquids[liqid]);
	    }
	}

	static writePowerM(buf, power) {
	    let [links, status] = power;
	    buf.putShort(links.length);
	    for (let link of links) {
	        buf.putInt(link);
	    }
	    buf.putFloat(status);
	}
	static readAll(buf, id, type, ver){
		let base = this.readBase(buf, id);

		let main = this.readMain(buf, type, ver);
		return [base, main]
	}
	static writeAll(buf, build, type, ver){
		this.writeBase(buf, build[0]);

		this.writeMain(buf, type, ver, build[1]);
	}
}

module.exports = BlockIO