
const Compass = {
    NORTH: 1,  N: 1,
    SOUTH: 2,  S: 2,
    EAST:  4,  E: 4,
    WEST:  8,  W: 8
};

const Type = {
    START: 0,
    CITY: 1,
    ROUTE: 2,
    FINISH: 3,
    ENTRANCE: 4,
    CAVE: 5
};

class GameMap {
    constructor(compass, type) {
        this.visited = false;
        this.player = false; // player on this map
        this.compass = compass;
        this.type = type;
        this.loaded = false;
		this.animation = 0;
    }

    load(data) {
        this.tsize = data.tsize;
        this.rows = data.rows;
        this.tiles = data.tiles;
        this.cols = data.cols;
        this.tcols = data.tcols;
        this.atlas = data.atlas;
        this.file = data.file;
        if (this.type == Type.START) {
            this.startx = data.startx;
            this.starty = data.starty;
        }
        this.loaded = true;
    }

    getTile(col, row) {
        return this.tiles[row * this.cols + col];
    }

    isSolidTile(x, y, dir) {
        var col = Math.floor(x / this.tsize);
        var row = Math.floor(y / this.tsize);
        var tile = this.getTile(col, row);
        var walkable = [
            1, 2, 3, 4, 12, 16, 17, 19, 22, 23, 24, 25, 26, 27, 28, 28, 29, 
            30, 31, 37, 41, 42, 43, 44, 45, 47, 48, 49, 50, 67, 68, 69, 70, 
            77, 89, 94, 95, 97, 105, 108, 111, 114, 139, 147, 160, 161, 162,
            163, 164, 185, 186, 187, 188, 189, 191, 194, 210, 211, 212, 213, 
            214, 215, 237, 238, 239, 240, 242, 245, 292, 314,
            154, 127, 295, 168, 46, 21, 195, 196];
        var jumpable = [
            [130, Compass.S], [133, Compass.S], [136, Compass.S],
            [79,  Compass.S], [81,  Compass.S], [82,  Compass.S],
            [84,  Compass.S], [85,  Compass.S], [87,  Compass.S],
            [104, Compass.W], [107, Compass.W], [110, Compass.W],
            [106, Compass.E], [109, Compass.E], [112, Compass.E]];
        for (var i in walkable) {
            if (walkable[i] == tile)
                return 0;
        }
        for (var i in jumpable) {
            if (jumpable[i][0] == tile && jumpable[i][1] == dir)
                return 2;
        }
        return 1;
    }
	
	_getWaterTile(tile) {
		var waters = {35:0,9:1,34:2,59:3,60:4,61:5,36:6,11:7,62:8};
		var row = waters[tile];
		
		if (this.animation < 32 * 1) return 1 + row * 5;
		if (this.animation < 32 * 2) return 2 + row * 5;
		if (this.animation < 32 * 3) return 3 + row * 5;
		if (this.animation < 32 * 4) return 4 + row * 5;
		if (this.animation < 32 * 5) return 5 + row * 5;
		if (this.animation < 32 * 6) return 4 + row * 5;
		if (this.animation < 32 * 7) return 3 + row * 5;
		if (this.animation <= 32 * 8) return 2 + row * 5;
	
		return tile;
	}
	
	_getFlowerTile(tile) {
		var flowers = {12:9,37:10};
		var row = flowers[tile];
		
		if (this.animation < 32 * 2) return 1 + row * 5;
		if (this.animation < 32 * 4) return 2 + row * 5;
		if (this.animation < 32 * 6) return 3 + row * 5;
		if (this.animation <= 32 * 8) return 2 + row * 5;
		
		return tile;
	}

    drawCamera(loader, context, camera) {
        var image = loader.getImage(this.atlas);
		var anims = loader.getImage('animation');
        var startCol = Math.floor(camera.x / this.tsize);
        var endCol = startCol + (camera.width / this.tsize);
        var startRow = Math.floor(camera.y / this.tsize);
        var endRow = startRow + (camera.height / this.tsize);
        var offsetX = -camera.x + startCol * this.tsize;
        var offsetY = -camera.y + startRow * this.tsize;
		
		this.animation ++;
		if (this.animation > 32 * 8)
			this.animation = 0;

        for (var c = startCol; c <= endCol; c++) {
            for (var r = startRow; r <= endRow; r++) {
                var tile = this.getTile(c, r);
				var anim = false;
				if ([35, 9, 34, 59, 60, 61, 36, 11, 62].indexOf(tile) != -1) {
					tile = this._getWaterTile(tile);
					anim = true;
				} else if (tile == 12 || tile == 37) {
					tile = this._getFlowerTile(tile);
					anim = true;
				}

                var x = (c - startCol) * this.tsize + offsetX;
                var y = (r - startRow) * this.tsize + offsetY;

                if (tile == 0)
                    continue;
				
				if (!anim) {
					var src_x = ((tile - 1) % this.tcols) * this.tsize;
					var src_y = Math.floor((tile - 1) / this.tcols) * this.tsize;
					context.drawImage(
						image,
						src_x, src_y,
						this.tsize, this.tsize,
						Math.round(x), Math.round(y),
						this.tsize, this.tsize
					);
				} else {
					var src_x = ((tile - 1) % 5) * this.tsize;
					var src_y = Math.floor((tile - 1) / 5) * this.tsize;
					context.drawImage(
						anims,
						src_x, src_y,
						this.tsize, this.tsize,
						Math.round(x), Math.round(y),
						this.tsize, this.tsize
					);
				}
            }
        }
    }

    isGrass(tile) {
        var grassTiles = [27, 28, 17, 42, 43, 67, 68];
        return (grassTiles.indexOf(tile) != -1)
    }

    isDoor(tile) { // include cave entrances, holes and ladders
        var doors = [154, 127, 295, 168, 46, 21, 195, 196];
        return (doors.indexOf(tile) != -1);
    }

    drawGrass(loader, context, camera, hero) {
        var image = loader.getImage(this.atlas);
        var startCol = Math.floor(camera.x / this.tsize);
        var endCol = startCol + (camera.width / this.tsize);
        var startRow = Math.floor(camera.y / this.tsize);
        var endRow = startRow + (camera.height / this.tsize);
        var offsetX = -camera.x + startCol * this.tsize;
        var offsetY = -camera.y + startRow * this.tsize;

        var heroCol = Math.floor((hero.x - 16) / 16);
        var heroRow = Math.floor((hero.y - 16) / 16);

        //console.log(heroCol, heroRow, hero.y);

        for (var c = heroCol - 1; c <= heroCol + 1; c++) {
            for (var r = heroRow - 1; r <= heroRow + 1; r++) {
                var tile = this.getTile(c, r);
                if (!this.isGrass(tile))
                    continue;
                var x = (c - startCol) * this.tsize + offsetX;
                var y = (r - startRow) * this.tsize + offsetY;
 				var src_x = ((tile - 1) % this.tcols) * this.tsize;
   				var src_y = Math.floor((tile - 1) / this.tcols) * this.tsize;

                var offset = 0;
                if (hero.x % 16 == 0 && hero.y % 16 == 0 
                    && heroCol == c && heroRow == r) { // not moving
                    offset = 4; // ok
                    
                } else if ((hero.orientation == Compass.E || hero.orientation == Compass.W) 
                    && c == heroCol && heroRow == r && hero.x % 16 != 0) { // moving left/right
                    offset = 4; // ok

                } else if (hero.orientation == Compass.S && r == heroRow
                    && heroCol == c && hero.y % 16 != 0) { // moving down
                    offset = (hero.y + 4) % 16; // ok
                    if (offset <= 4)
                        continue;

                } else if (hero.orientation == Compass.N && r == heroRow
                    && heroCol == c && hero.y % 16 != 0) { // moving up
                    offset = (hero.y + 4) % 16; // ok
                    if (offset <= 4)
                        continue;

                } else if ((hero.orientation == Compass.E || hero.orientation == Compass.W) 
                    && c == heroCol+1 && heroRow == r && hero.x % 16 != 0) {
                    offset = 4; // ok

                } else if (hero.orientation == Compass.S && r == heroRow+1 
                    && heroCol == c && hero.y % 16 != 0) { // moving down
                    offset = (hero.y + 4) % 16; // ok
                    if (offset > 4)
                        offset = 0;

                } else if (hero.orientation == Compass.N && r == heroRow+1 
                    && heroCol == c && hero.y % 16 != 0) { // moving up
                    offset = (hero.y + 4) % 16; // ok

                } else {
                    continue;
                }


    			context.drawImage(
    				image,
    				src_x, src_y + offset,
    				this.tsize, this.tsize - offset,
    				Math.round(x), Math.round(y) + offset,
    				this.tsize, this.tsize - offset
    			);
            }
        }
    }

    draw(loader, context) {
        var image = loader.getImage(this.atlas);
        for (var c = 0; c < this.cols; c++) {
            for (var r = 0; r < this.rows; r++) {
                var tile = this.getTile(c, r);
                var src_x = ((tile - 1) % this.tcols) * this.tsize;
                var src_y = Math.floor((tile - 1) / this.tcols) * this.tsize;

                if (tile == 0)
                    continue;

                context.drawImage(
                    image,
                    src_x, src_y,
                    this.tsize, this.tsize,
                    c * this.tsize, r * this.tsize,
                    this.tsize, this.tsize);
            }
        }
    }

    toString() {
        return this.type;
    }
}

export {GameMap, Compass, Type};
