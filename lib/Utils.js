class Utils{
	static getBlockByName(block){
		return global.contentMap['block'].indexOf(block)
	}
}

module.exports = Utils