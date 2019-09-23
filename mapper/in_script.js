var tile = 1;
var cols;
var tsize;
var grid = [];
for (var i=0; i<20*20; i++) {
    grid[i] = 0;
}


var Loader = {
    images: {}
};

Loader.loadImage = function (key, src) {
    var img = new Image();

    var d = new Promise(function(resolve, reject) {
        img.onload = function () {
            this.images[key] = img;
            resolve(img);
        }.bind(this);

        img.onerror = function () {
            reject('Could not load image: ' + src);
        }
    }.bind(this));

    img.src = src;
    return d;
};

Loader.getImage = function(key) {
    return (key in this.images) ? this.images[key] : null;
};

function getFiles(fn='') {
    $.ajax({
        type: 'GET',
        url: 'files.php?list=1',
        cache: false,
        success: function(result) { 
            result = '<option></option>' + result;
            $("#files").html(result);
            if (fn != '')
                $('#files').val(fn);
        }
    });
}

function saveFile(fn, data) {
    $.ajax({
        type: 'POST',
        url: 'files.php',
        data: {file:fn, data:data},
        success: function(result) {
            alert('File saved');
        }
    });
}

function makeJSON() {
    var map = {};
    map.name = "";
    map.atlas = window.location.pathname.split('/')[2].split('.')[0];
    map.cols = 20;
    map.rows = 20;
    map.tsize = 16;
    map.tcols = cols;
    map.tiles = grid;
    map.type = $('#type').val();
    map.compass = $('#check1').val() * $('#check1').is(':checked') +
              $('#check2').val() * $('#check2').is(':checked') +
              $('#check3').val() * $('#check3').is(':checked') +
              $('#check4').val() * $('#check4').is(':checked');
    return JSON.stringify(map, null, 2);
}

$(document).ready(function() {
    $.ajaxSetup({ cache: false });
    getFiles();
    cols = $("#tileAtlas")[0].naturalWidth / 16;
    tsize = $("#tileAtlas")[0].clientWidth / cols;

    var sel = document.getElementById("tile");
    var sel_ctx = sel.getContext('2d');
    //Loader.loadImage('outside', '../img/outside.png');
    Loader.loadImage('tiles', $('#tileAtlas')[0].src);

    var map = document.getElementById("map");
    var ctx = map.getContext('2d');
    for (var x=0; x <= 700; x += 700/20) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 700);
    }
    for (var y=0; y<=700; y+=700/20) {
        ctx.moveTo(0, y);
        ctx.lineTo(700, y);
    }
    ctx.strokeStyle = 'lightgrey';
    ctx.stroke();

    $("#tileAtlas").on('click', function(event) {
        var x = event.pageX - this.offsetLeft - this.offsetParent.offsetLeft;
        var y = event.pageY - this.offsetTop - this.offsetParent.offsetTop;
        tile = Math.floor(x / tsize) + Math.floor(y / tsize) * cols + 1;
        var src_x = ((tile - 1) % cols) * 16;
        var src_y = Math.floor((tile - 1) / cols) * 16;
        var atlas = Loader.getImage('tiles');
        sel_ctx.clearRect(0, 0, 27, 27);
        sel_ctx.drawImage(atlas, 
            src_x, src_y, 
            16, 16, 
            0, 0, 
            27, 27);
    });
    $("#fill").on('click', function(event) {
        var atlas = Loader.getImage('tiles');
        var src_x = ((tile - 1) % cols) * 16;
        var src_y = Math.floor((tile - 1) / cols) * 16;
        for (var y=0; y<20; y++) {
            for (var x=0; x<20; x++) {
                grid[x+y*20] = tile;
                ctx.drawImage(atlas,
                    src_x, src_y,
                    16, 16,
                    x*35, y*35,
                    35, 35);
            }
        }
    });
    $("#map").on('mousemove mousedown', function(event) {
        if (event.which != 1)
            return;
        var x = event.pageX - this.offsetLeft - this.offsetParent.offsetLeft;
        var y = event.pageY - this.offsetTop - this.offsetParent.offsetTop;
        var ctsize = 700 / 20;
        x = Math.floor(x / ctsize);
        y = Math.floor(y / ctsize);
        grid[x+y*20] = tile;
        src_x = ((tile - 1) % cols) * 16;
        src_y = Math.floor((tile - 1) / cols) * 16;
        var atlas = Loader.getImage('tiles');
        ctx.clearRect(x*ctsize, y*ctsize, ctsize, ctsize);
        ctx.drawImage(atlas,
            src_x, src_y,
            16, 16,
            x*ctsize, y*ctsize,
            ctsize, ctsize);
    });
    $("#json_button").on('click', function(event) {
        $("#json").text(makeJSON());
    });

    $('#load').on('click', function(event) {
        var fn = $('#files option:selected').text();
        if (fn == '')
            return;
        $('#fileName').val(fn);
        var f = '/maps/' + fn;
        $.getJSON(f, function(data) {
            $('#type').val(data.type);
            $('input[type=checkbox]').prop('checked', false);
            if (1 & data.compass) $("#check1").prop("checked", true);
            if (2 & data.compass) $("#check2").prop("checked", true);
            if (4 & data.compass) $("#check3").prop("checked", true);
            if (8 & data.compass) $("#check4").prop("checked", true);


            grid = data.tiles;
            for (var i=0; i<grid.length; i++) {
                var tile = grid[i];
                var ctsize = 700 / 20;
                
                var x = i % 20;
                var y = Math.floor(i / 20);
                var src_x = ((tile - 1) % 25 ) * 16;
                var src_y = Math.floor((tile - 1) / 25) * 16;
                var atlas = Loader.getImage('tiles');
                ctx.drawImage(atlas,
                    src_x, src_y,
                    16, 16,
                    x*ctsize, y*ctsize,
                    ctsize, ctsize);
            }
        
        });

    });

    $('#save').on('click', function(event) {
        var json = makeJSON();
        var fn = $('#fileName').val();
        if (fn == '')
            return;
        saveFile(fn, json);
        getFiles(fn); // update list
    });
});

