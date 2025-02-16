const unitProps = require('./json/UnitProps.json')

class Phys{
	static getProps(unit){
		let type = global.contentMap['unit'][unit.utype]
		let props = unitProps[type]
		return props
	}
	static collLayer(unit){
		let props = this.getProps(unit)
		if(props == undefined) return
		if(props.legCount > 0){
			return 1
		} else {
			if(unit.elv < 0.001){
				return 0
			} else {
				return 2
			}
		}
	}
	static mass(unit){
		let props = this.getProps(unit);
		if(props == undefined) return
		let hitsize = parseInt(props.hitSize)
		return hitsize * hitsize * Math.PI
	}
	static radius(unit){
		let props = this.getProps(unit);
		if(props == undefined) return
		let hitsize = parseInt(props.hitSize)
		return hitsize * 0.6
	}
	static collide(unit, o){
		for (let i = 0; i < o.length; i++) {
		    let other = o[i];
		    if (unit.id === other.id) continue;
		    if (this.collLayer(unit) != this.collLayer(other)) continue;

		    let rs = this.radius(unit) + this.radius(other);

		    const distance = (x1, y1, x2, y2) => {
		        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
		    };

		    let dst = distance(unit.position.x, unit.position.y, other.position.x, other.position.y);

		    let scl = 1.25

		    if (dst < rs) {
		        let vec = {
		            x: unit.position.x - other.position.x,
		            y: unit.position.y - other.position.y
		        };

		        let length = Math.sqrt(vec.x ** 2 + vec.y ** 2);
		        vec.x /= length;
		        vec.y /= length;
		        vec.x *= (rs - dst);
		        vec.y *= (rs - dst);

		        let ms = this.mass(unit) + this.mass(other);
		        let m1 = this.mass(other) / ms;
		        let m2 = this.mass(unit) / ms;

		        unit.position.x += vec.x * m1 / scl;
		        unit.position.y += vec.y * m1 / scl;
		    }
		}
	}
}

module.exports = Phys