const blocksParams = require('./json/BlocksParams.json')

class Tile {
    x;
    y;
    floor;
    overlay;
    block;
    build;
    data;
    tiles;
    constructor(x, y, f, o, w) {
        this.x = x;
        this.y = y;
        this.floor = f;
        this.overlay = o;
        this.block = w
    }
    pos() {
        return (x << 16) | (y & 0xff)
    }
    setBlock(block){
        this.block = block
    }
    setFloor(floor){
        this.floor = floor
    }
    setOverlay(overlay){
        this.overlay = overlay
    }
    setBuild(build){
        this.build = build;
        this.atConstruct = global.contentMap['block'][this.block].startsWith("build") || this.atConstruct
        let midx = this.x;
        let midy = this.y;
        let size = parseInt(blocksParams[global.contentMap['block'][this.block]]?.size) || 1;

        let startX = Math.floor(midx - Math.floor((size - 1) / 2));
        let startY = Math.floor(midy - Math.floor((size - 1) / 2));
        let endX = startX + size;
        let endY = startY + size;

        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                let tile = this.tiles.get(x, y);
                if(tile != null){
                    tile.refBuild = this;
                }
            }
        }
    }
    hasBuild(){
        return Boolean(this.build) || Boolean(this?.refBuild)
    }
    setData(data){
        this.data = data
    }
}

module.exports = Tile