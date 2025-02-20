class Utils{
	static getBlockByName(block){
		let blk  = !global.contentMap?.block ? undefined : global.contentMap.block.indexOf(block)
		if(blk == -1) blk = parseInt(block)
		return blk
	}
	static getItemByName(item){
		let it = !global.contentMap?.item ? undefined : global.contentMap.item.indexOf(item)
		if(it == -1) it = parseInt(item)
		return it
	}
	static getUnitByName(unit){
		let un = !global.contentMap?.unit ? undefined : global.contentMap.unit.indexOf(unit)
		if(un == -1) un = parseInt(unit)
		return un
	}
	static escapeColors(str){
		const colors = [
	        "white", "lightGray", "gray", "darkGray", "black", "clear",
	        "blue", "navy", "royal", "slate", "sky", "cyan", "teal",
	        "green", "acid", "lime", "forest", "olive", "yellow", "gold",
	        "goldenrod", "orange", "brown", "tan", "brick", "red", "scarlet",
	        "crimson", "coral", "salmon", "pink", "magenta", "purple", "violet", "maroon"
	    ];

	    const pattern = new RegExp(
	        `\\[(${colors.join('|')}|#[0-9A-Fa-f]{6})\\]`, 'g'
	    );

	    return str.replace(pattern, '');
	}
	static escapeGlyphs(input) {
	    const start = 63083;
	    const end = 63743;

	    return Array.from(input)
	        .filter(char => {
	            const code = char.codePointAt(0);
	            return code < start || code > end;
	        })
	        .join('');
	}
}

module.exports = Utils