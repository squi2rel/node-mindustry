class Utils{
	static getBlockByName(block){
		let blk  = !global.contentMap?.block ? undefined : global.contentMap.block.indexOf(block)
		if(blk == -1) blk = parseInt(blk)
		return blk
	}
	static getItemByName(item){
		let it = !global.contentMap?.item ? undefined : global.contentMap.item.indexOf(item)
		if(it == -1) it = parseInt(item)
		return it
	}
}

module.exports = Utils