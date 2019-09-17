import {Compass, Type} from './GameMap.js';
import {Game} from './Game.js';


var context;
var game;

window.onload = function() {
    context = $("#game")[0].getContext('2d');
    game = new Game();    
    game.run(context);
}

function displayMap() {
    var html = "<table>";
    for (var i=0; i<8; i++) {
        html += "<tr>";
        for (var j=0; j<8; j++) {
            var w = game.world.world[i][j];
            var c = '';
            var p = '';
            if (w !== null && w.visited) {
                if (w.type == Type.START)
                    c = 'start';
                if (w.type == Type.FINISH)
                    c = 'finish';
                if (w.type == Type.ROUTE)
                    c = 'route';
                if (w.type == Type.CITY)
                    c = 'city';
                if (w.type == Type.ENTRANCE)
                    c += ' cave';
                if (w.player)
                    p = '&diams;';
                if ((w.compass & Compass.N) == 0)
                    c += ' b-top';
                if ((w.compass & Compass.E) == 0)
                    c += ' b-right';
                if ((w.compass & Compass.S) == 0)
                    c += ' b-bot';
                if ((w.compass & Compass.W) == 0)
                    c += ' b-left';

            }
            html += "<td class='" + c +" square'><p>"+p+"</p></td>";
        }
        html += "</tr>";
    }
    html += "</table>";
    $('#worldmap').html(html);
}


$('.d').on('mouseup touchend', function() {
    game.dpad = {UP: false, DOWN: false, LEFT: false, RIGHT: false};
});

$('.d').on('mousedown touchstart', function() {
    if (this.id == 'N') game.dpad.UP = true;
    if (this.id == 'S') game.dpad.DOWN = true;
    if (this.id == 'W') game.dpad.LEFT = true;
    if (this.id == 'E') game.dpad.RIGHT = true;
});

$(document).on('keydown', function(e) {
    switch(e.keyCode) {
        case 39:
            $('#E').addClass('active');
            break;
        case 37:
            $('#W').addClass('active');
            break;
        case 38:
            $('#N').addClass('active');
            break;
        case 40:
            $('#S').addClass('active');
            break;
        case 13: // Enter
            $('#meta-start').addClass('active');
            break;
        case 32: // Space
            $('#meta-select').addClass('active');
            break;
        case 65: // A
            $('#control-a').addClass('active');
            break;
        case 66: // B
            $('#control-b').addClass('active');
            break;
        default:
            console.log(e.keyCode);
    }
});
$(document).on('keyup', function(e) {
    $('.button').removeClass('active');
});
