class Utils{
	static getBlockByName(block){
		return global.contentMap['block'].indexOf(block)
	}
	static getItemByName(item){
		let it = global.contentMap['item'].indexOf(item)
		if(it == -1) it = parseInt(item)
		return it
	}
}

module.exports = Utils