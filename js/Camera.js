
class Camera {

    constructor(map, width, height) {
        this.width = width;
        this.height = height;
        this.maxX = map.cols * map.tsize - width;
        this.maxY = map.rows * map.tsize - height;
        this.x = Math.ceil((this.maxX / 2) / map.tsize) * map.tsize;
        this.y = Math.ceil((this.maxY / 2) / map.tsize) * map.tsize;
        this.tsize = map.tsize;

        this.dirx = 0;
        this.diry = 0;
        this.moving = false;
    }

    follow(sprite) {
        this.following = sprite;
        sprite.screenX = 0;
        sprite.screenY = 0;
    }

    update() {
        this.following.screenX = Math.round(this.width / 2);
        this.following.screenY = Math.round(this.width / 2);

        this.x = this.following.x - this.width / 2;
        this.y = this.following.y - this.width / 2;

        this.x = Math.max(0, Math.min(this.x, this.maxX));
        this.y = Math.max(0, Math.min(this.y, this.maxY));

        if (this.following.x < this.width / 2 || this.following.x > this.maxX + this.width / 2)
            this.following.screenX = this.following.x - this.x;
        if (this.following.y < this.width / 2 || this.following.y > this.maxY + this.width / 2)
            this.following.screenY = this.following.y - this.y;
    }
}

export {Camera};
