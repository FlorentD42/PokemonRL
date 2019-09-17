import {GameMap, Type, Compass} from './GameMap.js';
import {Maps} from './maps.js';

class World {
    constructor(size=8) {
        this.size = size;
    }

    init() {
        this.world = new Array(this.size);
        for (var r=0; r<this.size; r++) {
            this.world[r] = new Array(this.size);
            for (var c=0; c<this.size; c++) {
                this.world[r][c] = null;
            }
        }
    }

    getStart() {
        for (var i = 0; i < this.size; i++) {
            for (var j = 0; j < this.size; j++) {
                if (this.world[i][j] != null && this.world[i][j].type == Type.START) {
                    this.x = i;
                    this.y = j;
                }
            }
        }
        return this.getMap();
    }

    getMapCompass(compass) {
        switch (compass) {
            case Compass.N:
                return this.getNorth();
            case Compass.S:
                return this.getSouth();
            case Compass.E:
                return this.getEast();
            case Compass.W:
                return this.getWest();
        }
    }

    getNorth() {
        this.world[this.x][this.y].player = false;
        this.x--;
        return this.getMap();
    }
    getSouth() {
        this.world[this.x][this.y].player = false;
        this.x++;
        return this.getMap();
    }
    getEast() {
        this.world[this.x][this.y].player = false;
        this.y++;
        return this.getMap();
    }
    getWest() {
        this.world[this.x][this.y].player = false;
        this.y--;
        return this.getMap();
    }

    getMap() {
        var m = this.world[this.x][this.y];
        if (m.loaded === false) {
            var unused = [];
            var used = [];
            for (var i in Maps) {
                if (Maps[i].type == m.type && Maps[i].compass == m.compass) {
                    if (Maps[i].isUsed)
                        used.push(i);
                    else
                        unused.push(i);
                }
            }
            if (unused.length == 0) {
                if (used.length == 0) {
                    console.log("No map file for {type:" + m.type + ", compass:" + m.compass + "}");
                } else {
                    console.log("Re-using map file for {type:" + m.type + ", compass:" + m.compass + "}");
                    var rand = this._randInt(0, used.length - 1);
                    i = used[rand];
                    this.world[this.x][this.y].load(Maps[i]);
                }
            } else {
                var rand = this._randInt(0, unused.length - 1);
                i = unused[rand];
                Maps[i].isUsed = true;
                this.world[this.x][this.y].load(Maps[i]);
            }
        }
        this.world[this.x][this.y].visited = true;
        this.world[this.x][this.y].player = true;
        console.log("Map:" + this.world[this.x][this.y].file);
        return this.world[this.x][this.y];
    }

    generate(nb_cities=4) {
        this.init();

        // draw finish and start
        var edges = [Compass.N, Compass.E, Compass.S, Compass.W];
        var s_edge = edges[this._randInt(0, edges.length)];
        var f_edge = s_edge;
        while (f_edge == s_edge)
            f_edge = edges[this._randInt(0, edges.length)];
        var start = this._getEdgePos(s_edge);
        this.x = start[0];
        this.y = start[1];
        var finish = this._getEdgePos(f_edge);

        this.world[start[0]][start[1]] = new GameMap(s_edge, Type.START);
        this.world[finish[0]][finish[1]] = new GameMap(f_edge, Type.FINISH);

        var points = [start, finish];

        // draw cities
        var i = 0;
        while (points.length != nb_cities + 2) {
            i++;
            if (i == 100) // if no solution
                return this.generate(nb_cities);

            var candidate = [this._randInt(1, this.size - 2),
                             this._randInt(1, this.size - 2)];
            var dist = this.size * 10;
            for (var p = 0; p < points.length; p++) {
                var d = this._distance(points[p], candidate);
                if (d < dist) 
                    dist = d ;
            }
            if (dist <= 2 || this.world[candidate[0]][candidate[1]] != null)
                continue;
            points.push(candidate);
            this.world[candidate[0]][candidate[1]] = new GameMap(0, Type.CITY);
        }
        var cities = points.slice(2);

        // draw the compasss
        var dist = this.size ** 2;
        var city = null;
        var id = 0;
        for (var i = 0; i < cities.length; i++) {
            var d = this._distance(start, cities[i]);
            if (d < dist) {
                id = i;
                dist = d;
                city = cities[i];
            }
        }
        this._drawCompass(start, city, s_edge);
        dist = this.size ** 2;
        city = null;
        id = 0;
        for (i = 0; i < cities.length; i++) {
            d = this._distance(finish, cities[i]);
            if (d < dist) {
                id = i;
                dist = d;
                city = cities[i];
            }
        }
        this._drawCompass(finish, city, f_edge);

        for (i = 0; i < cities.length - 1; i++) {
            this._drawCompass(cities[i], cities[i + 1]);
        }

        // make cave entrances
        var candidates = [];
        for (var i = 0; i < this.size; i++) {
            for (var j = 0; j < this.size; j++) {
                if (this.world[i][j] !== null)
                    continue;
                var compass = 0;
                if (i - 1 >= 0 && this.world[i-1][j] != null) {
                    if (this.world[i-1][j].type != Type.ROUTE)
                        continue;
                    compass += Compass.NORTH;
                }
                if (i + 1 < this.size && this.world[i+1][j] != null) {
                   if (this.world[i+1][j].type != Type.ROUTE)
                        continue;
                    compass += Compass.SOUTH;
                }
                if (j - 1 >= 0 && this.world[i][j-1] != null) {
                    if (this.world[i][j-1].type != Type.ROUTE)
                        continue;
                    compass += Compass.WEST;
                }
                if (j + 1 < this.size && this.world[i][j+1] != null) {
                    if (this.world[i][j+1].type != Type.ROUTE)
                        continue;
                    compass += Compass.EAST;
                }
                // only one neighbour
                if (compass == Compass.N || compass == Compass.S || compass == Compass.W || compass == Compass.E)
                    candidates.push([i, j, compass]);
            }
        }
        if (candidates.length < 2)
            return this.generate(nb_cities);
        var cpt = 0;
        do {
            var c1 = candidates[this._randInt(0, candidates.length - 1)];
            var c2 = candidates[this._randInt(0, candidates.length - 1)];
            cpt ++;
            if (cpt == 100) // stuck
                return this.generate(nb_cities);
        } while(this._distance(c1, c2) < 4);

        this.world[c1[0]][c1[1]] = new GameMap(c1[2], Type.ENTRANCE);
        this.world[c2[0]][c2[1]] = new GameMap(c2[2], Type.ENTRANCE);

        // Compute compasss
        for (var i = 0; i < this.size; i++) {
            for (var j = 0; j < this.size; j++) {
                if (this.world[i][j] === null)
                    continue;
                var compasss = 0;
                if (i - 1 >= 0 && this.world[i-1][j] != null)
                    compasss += Compass.NORTH;
                if (i + 1 < this.size && this.world[i+1][j] != null)
                    compasss += Compass.SOUTH;
                if (j - 1 >= 0 && this.world[i][j-1] != null)
                    compasss += Compass.WEST;
                if (j + 1 < this.size && this.world[i][j+1] != null)
                    compasss += Compass.EAST;
                this.world[i][j].compass = compasss;
            }
        }
    }

    _drawCompass(start, stop, edge=null) {
        if (edge == null)
            edge = [Compass.N, Compass.E][this._randInt(0, 1)];
        
        if (edge == Compass.E || edge == Compass.W) {
            var r = 1;
            if (start[1] > stop[1])
                r = -1;
            for (var i=start[1]; i!=stop[1]+r; i+=r) 
                if (this.world[start[0]][i] === null)
                    this.world[start[0]][i] = new GameMap(0, Type.ROUTE);
            r = 1;
            if (start[0] > stop[0])
                r = -1;
            for (i=start[0]; i!=stop[0]+r; i+=r) 
                if (this.world[i][stop[1]] === null)
                    this.world[i][stop[1]] = new GameMap(0, Type.ROUTE);
        } else {
            var r = 1;
            if (start[0] > stop[0])
                r = -1;
            for (var i=start[0]; i!=stop[0]+r; i+=r)
                if (this.world[i][start[1]] === null)
                    this.world[i][start[1]] = new GameMap(0, Type.ROUTE);
            r = 1;
            if (start[1] > stop[1])
                r = -1;
            for (i=start[1]; i!=stop[1]+r; i+=r)
                if (this.world[stop[0]][i] === null)
                    this.world[stop[0]][i] = new GameMap(0, Type.ROUTE);
        }
    }

    _distance(p1, p2) {
        var d = Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
        return d;
    }

    _getEdgePos(edge) {
        var p = [0, 0];
        switch (edge) {
            case Compass.N:
                p[0] = this.size - 1;
                p[1] = this._randInt(2, this.size - 3);
                break;
            case Compass.S:
                p[1] = this._randInt(2, this.size - 3);
                break;
            case Compass.W:
                p[1] = this.size - 1;
                p[0] = this._randInt(2, this.size - 3);
                break;
            case Compass.E:
                p[0] = this._randInt(2, this.size - 3);
                break;
        }
        return p;
    }

    _randInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    _print() {
        var txt = ''
        for (var r=0; r<this.size; r++) {
            txt += r + ' ';
            for (var c=0; c<this.size; c++) {
                if (this.world[r][c] === null) {
                    txt += '. ';
                } else {
                    txt += this.world[r][c] + ' ';
                }
            }
            console.log(txt);
            txt = '';
        }
    }
}

export {World};
