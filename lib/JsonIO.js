const dJSON = require('dirty-json');

class JsonIO{
	static fromString(str){
		str = str.replace("io.anuke.", "")
		let json;
		try{
			json = dJSON.parse(str) //TODO real read
		} catch(e){}
		return json
	}
}

module.exports = JsonIO