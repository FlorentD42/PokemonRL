import {Compass} from './GameMap.js';

class Hero {
    constructor(map, loader) {
        this.map = map;
        this.tsize = parseInt(map.tsize);
        this.x = 128;
        this.y = 128;
        if (map.startx !== undefined)
            this.x = map.startx * map.tsize;
        if (map.starty !== undefined)
            this.y = map.starty * map.tsize;
        this.image = loader.getImage('entities');
        this.moving = false;
        this.dirx = 0;
        this.diry = 0;
        this.orientation = 0;
        this.animation = 0;
        this.tile = 0;
        this.flip = true;
        this.jumping = false;
		this.shadow = -1; // tile 86
    }

    setTile() {
        var t = {};
        t[Compass.E] = [3, 9, 9];
        t[Compass.W] = [2, 8, 8];
        t[Compass.N] = [1, 6, 7];
        t[Compass.S] = [0, 4, 5];
        var i = this.flip ? 1:2;
        if (this.animation < this.tsize / 2 || this.animation % this.tsize == 0)
            this.tile = t[this.orientation][0] * this.tsize;
        if (this.animation >= this.tsize / 2 && this.animation < this.tsize)
            this.tile = t[this.orientation][i] * this.tsize;
        if (this.animation % this.tsize == 0)
            this.flip = !this.flip;
    }

    getBorder() {
        if (this.x == this.map.tsize)
            return Compass.W;
        if (this.x == this.map.tsize * this.map.cols)
            return Compass.E;
        if (this.y == this.map.tsize)
            return Compass.N;
        if (this.y == this.map.tsize * this.map.rows)
            return Compass.S;
        return 0;
    }

    changeMap(map, dir) {
        this.map = map;
        this.animation = 0;
        this.moving = true;

        if (dir == Compass.E) {
            this.x = this.tsize + 1;
            this.dirx = 1;
        }
        if (dir == Compass.W) {
            this.x = this.map.tsize * this.map.cols - 1;
            this.dirx = -1;
        }
        if (dir == Compass.N) {
            this.y = this.map.tsize * this.map.rows - 1;
            this.diry = -1;
        }
        if (dir == Compass.S) {
            this.y = this.tsize + 1;
            this.diry = 1;
        }
    }

    move(dirx, diry) {
			
        if (!this.moving && (dirx != 0 || diry != 0)) {
            var old_ori = this.orientation;
			if (dirx == 1) this.orientation = Compass.EAST;
			if (dirx == -1) this.orientation = Compass.WEST;
			if (diry == -1) this.orientation = Compass.NORTH;
			if (diry == 1) this.orientation = Compass.SOUTH;

            if (old_ori != this.orientation) { // just change facing direction
                this.setTile();
                return;
            }
            this.animation = 0;
            this.dirx = dirx;
            this.diry = diry;

            if (this._collide()) {
                return;
            }

            this.x += dirx;
            this.y += diry;
            this.moving = true;
			
		} else if (this.jumping) {
			this.animation++;
			
			if (this.orientation == Compass.SOUTH) {
				var shadow_y = [
					-1,5,7,6,8,10,12,12,12,11,11,11,10,
					10,10,9,9,9,8,8,8,7,7,7,7,7,7,7,6,
					6,6,5,5,5,4,4,4,3,3,3,-1];

				if (this.animation == 42) { // end
					this.moving = false;
					this.jumping = false;
					this.dirx = 0;
					this.diry = 0;
					this.animation = 0;
					this.shadow = -1;
					this.setTile();
				} else {
					if (shadow_y.length > this.animation)
						this.shadow = [0, shadow_y[this.animation]];
					if (this.animation >= 6)
						this.tile = 4 * this.tsize;
					if (this.animation < 6)
						this.diry = -1; // jump up
					else
						this.diry = 1; // then down
					this.y += this.diry;
				}
			} else if (this.orientation == Compass.WEST || this.orientation == Compass.EAST) {
				if (this.animation == 41) { // end
					this.moving = false;
					this.jumping = false;
					this.dirx = 0;
					this.diry = 0;
					this.animation = 0;
					this.shadow = -1;
					this.setTile();
				} else {
					if (this.animation == 1) this.shadow = [0, 0];
					
					if (this.animation >= 6 && this.orientation == Compass.WEST)
						this.tile = 8 * this.tsize;
					if (this.animation >= 6 && this.orientation == Compass.EAST)
						this.tile = 9 * this.tsize;
					var d = 1;
					if (this.orientation == Compass.WEST)
						d = -1;
						
					if (this.animation == 4)  {this.x += 2*d; this.y += -3; this.shadow[1] = 3; }
					if (this.animation == 8)  {this.x += 2*d; this.y += -3; this.shadow[1] = 6; }
					if (this.animation == 12) {this.x += 4*d; this.y += -3; this.shadow[1] = 9; }
					if (this.animation == 16) {this.x += 4*d; this.y += -2; this.shadow[1] = 11;}
					if (this.animation == 20) {this.x += 4*d; this.y += 0;  this.shadow[1] = 11;}
					if (this.animation == 24) {this.x += 4*d; this.y += 0;  this.shadow[1] = 11;}
					if (this.animation == 28) {this.x += 4*d; this.y += 3;  this.shadow[1] = 9;}
					if (this.animation == 32) {this.x += 4*d; this.y += 3;  this.shadow[1] = 6;}
					if (this.animation == 36) {this.x += 2*d; this.y += 3;  this.shadow[1] = 3;}
					if (this.animation == 40) {this.x += 1*d; this.y += 2;  this.shadow[1] = 0;}
				}
			}
			
        } else if (this.moving) {
            this.animation++;
            this.setTile();

            if (this.animation >= this.tsize || (this.x % 16 == 0 && this.y % 16 == 0)) {
                this.moving = false;
                this.dirx = 0;
                this.diry = 0;
                this.animation = 0;
                this.setTile();
            }

            this.x += this.dirx;
            this.y += this.diry;
        }

        var maxX = this.map.cols * this.map.tsize;
        var maxY = this.map.rows * this.map.tsize;
        this.x = Math.max(this.tsize, Math.min(this.x, maxX));
        this.y = Math.max(this.tsize, Math.min(this.y, maxY));
    }

    draw(context) {
        var src_x = this.screenX - this.tsize;
        var src_y = this.screenY - this.tsize;

		if (this.shadow != -1) {
			context.drawImage(
				this.image,
				5*16, 8*16,
				16, 16,
				src_x + this.shadow[0], src_y + this.shadow[1],
				this.tsize, this.tsize
			);
		}

        context.drawImage(
            this.image,
            this.tile, 0,
            this.tsize, this.tsize,
            src_x, src_y - 4,
            this.tsize, this.tsize
		);
    }

    _collide() {
        var x = this.x - this.tsize;
        var y = this.y - this.tsize;
        var dir = 0;
        if (this.dirx > 0) {x += this.tsize; dir = Compass.E; }
        if (this.dirx < 0) {x -= this.tsize; dir = Compass.W; }
        if (this.diry > 0) {y += this.tsize; dir = Compass.S; }
        if (this.diry < 0) {y -= this.tsize; dir = Compass.N; }

        if (x < 0) return false;
        if (y < 0) return false;

        var collision = this.map.isSolidTile(x, y, dir);
        if (collision == 1) // solid tile
            return true;
        if (collision == 0) // walkable tile
            return false;
        if (collision == 2) {// jumpable tile
            this.jumping = true;
            return false;
        }
    }

    getColRow() {
        var col = Math.floor((this.x - this.tsize / 2) / this.tsize);
        var row = Math.floor((this.y - this.tsize / 2) / this.tsize);
        return [col, row];
    }

    isOnDoor() {
        var colrow = this.getColRow;
        var tile = this.map.getTile(colrow[0], colrow[1]);
        return this.map.isDoor(tile);
    }

    isInGrass() {
        var colrow = this.getColRow;
        var tile = this.map.getTile(colrow[0], colrow[1]);
        return this.map.isGrass(tile);
    }
}

export {Hero};
