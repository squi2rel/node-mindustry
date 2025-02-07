const { jsonrepair } = require('jsonrepair')

class JsonIO{
	static fromString(str){
		str = str.replace("io.anuke.", "")
		let json;
		try{
			json = JSON.parse(jsonrepair(str))
		} catch(e){}
		return json
	}
}

module.exports = JsonIO