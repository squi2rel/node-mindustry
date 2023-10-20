class Tiles {
    width;
    height;
    array;
    constructor(w, h) {
        this.width = w;
        this.height = h;
        this.array = [];
        this.array.length = w * h
    }
    set(x, y, tile) {
        this.array[y * this.width + x] = tile
    }
}

module.exports = Tiles