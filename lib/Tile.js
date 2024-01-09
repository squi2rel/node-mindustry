class Tile {
    x;
    y;
    floor;
    overlay;
    block;
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
    static buildDestroyed(build) {
        if (!build) return;
        build.killed()
    }
    static buildHealthUpdate() {//TODO

    }
}

module.exports = Tile