import {Keyboard} from './Keyboard.js';
import {Camera} from './Camera.js';
import {Loader} from './Loader.js';
import {World} from './World.js';
import {Compass} from './GameMap.js';
import {Hero} from './Hero.js';

class Game {

    init() {
        Keyboard.listenForEvents([
            Keyboard.LEFT,
            Keyboard.RIGHT,
            Keyboard.UP,
            Keyboard.DOWN
        ]);
    	this.dpad = {UP: false, DOWN: false, LEFT: false, RIGHT: false};
        this.world = new World();
        this.world.generate();
        this.map = this.world.getStart();
        this.hero = new Hero(this.map, this.loader);
        this.camera = new Camera(this.map, 160, 144);
        this.camera.follow(this.hero);

        this.context.canvas.height = 144;
        this.context.canvas.width = 160;
    }

    update(delta) {
        var dirx = 0;
        var diry = 0;
        if      (Keyboard.isDown(Keyboard.LEFT)  || this.dpad.LEFT)  { dirx = -1; }
        else if (Keyboard.isDown(Keyboard.RIGHT) || this.dpad.RIGHT) { dirx = 1;  }
        else if (Keyboard.isDown(Keyboard.UP)    || this.dpad.UP)    { diry = -1; }
        else if (Keyboard.isDown(Keyboard.DOWN)  || this.dpad.DOWN)  { diry = 1;  }
        this.hero.move(dirx, diry);
        this.camera.update();

        var dir = this.hero.getBorder();
        if (dir == Compass.W) this.map = this.world.getWest();
        if (dir == Compass.E) this.map = this.world.getEast();
        if (dir == Compass.S) this.map = this.world.getSouth();
        if (dir == Compass.N) this.map = this.world.getNorth();
        if (dir) this.hero.changeMap(this.map, dir);
        if (this.hero.isOnDoor()) {
        }

    }

    render() {
        this.map.drawCamera(this.loader, this.context, this.camera);
        this.hero.draw(this.context, this.camera);
        if (this.hero.isInGrass()) 
            this.map.drawGrass(this.loader, this.context, this.camera, this.hero);
    }

    load() {
        return [this.loader.loadImage('outside',   'img/outside.png'),
                this.loader.loadImage('inside',    'img/inside.png'),
				this.loader.loadImage('animation', 'img/anims.png'),
                this.loader.loadImage('entities',  'img/entities.png')];
    }

    run(context) {
        this.context = context;
        this.loader = new Loader();
        this._previousElapsed = 0;
        var p = this.load();
        Promise.all(p).then(function(loaded) {
            this.init();
            window.requestAnimationFrame(() => this.tick());
        }.bind(this));
    }

    tick(elapsed) {
        window.requestAnimationFrame(() => this.tick());
    
        this.context.clearRect(0, 0, 320, 320);
        var delta = (elapsed - this._previousElapsed) / 1000.0;
        delta = Math.min(delta, 0.25);
        this._previousElapsed = elapsed;
    
        this.update(delta);
        this.render();
    }
}

export {Game};
