class Tile {
    x;
    y;
    floor;
    overlay;
    block;
    build;
    data;
    constructor(x, y, f, o, w) {
        this.x = x;
        this.y = y;
        this.floor = f;
        this.overlay = o;
        this.block = w
        this.build = [{}, {}]
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
        this.build = build
    }
    setData(data){
        this.data = data
    }
}

module.exports = Tile