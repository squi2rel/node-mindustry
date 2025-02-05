const dJSON = require('dirty-json');

class JsonIO{
	static fromString(str){
		str = str.replace("io.anuke.", "")
		let json = dJSON.parse(str)
		return json
	}
}

module.exports = JsonIO