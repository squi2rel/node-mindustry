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
    get(x, y){
        return this.array[y * this.width + x]
    }
}

module.exports = Tiles