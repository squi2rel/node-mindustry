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
        if((x >= 0 || x <= this.width) && (y >= 0 || y <= this.height)){
            return this.array[y * this.width + x]
        } else {
            return null
        }
    }
}

module.exports = Tiles