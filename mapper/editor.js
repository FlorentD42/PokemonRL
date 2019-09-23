var cols = 20;
var rows = 20;
var tsize = 16;
var zoom = 1;
var mapCanvas;
var mapCtx;
var img;
var paletteCols = 0;
var paletteTsize = 0;
var grid = [];
var selectedTile;
var tileset = '';
var displayGrid = true;
var files;

$(function() {
    mapCanvas = document.getElementById("map");
    mapCtx = mapCanvas.getContext('2d');
    zoom = $("#zoom").val();
    renderMap();
    getFilesList();
});

function loadMap(file) {
    if (file == '') return;

    $("#saveInput").val(file);
    $.getJSON("/maps/"+file, function(data) {
        console.log(data);
    });
}

function getFilesList() {
    $.ajax({
        type: 'POST',
        url: 'files.php',
        data: {list:'1'},
        success: function(res) {
            let files = JSON.parse(res);
            for(let i in files) {
                $("#loadSelect").append("<option>" + files[i] + "</option>");
            }
        }
    });
}

function renderMap() {
    let width = cols * tsize * zoom;
    let height = rows * tsize * zoom;

    mapCanvas.width = width;
    mapCanvas.height = height;
    mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

    let ctsize = $("#map").width() / cols;
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            if (grid[c+r*cols] == undefined) continue;
            
            let tile = grid[c+r*cols];
            let src_x = ((tile - 1) % paletteCols) * 16;
            let src_y = Math.floor((tile - 1) / paletteCols) * 16;
            mapCtx.drawImage(img, 
                src_x, src_y,
                16, 16,
                c*ctsize, r*ctsize,
                ctsize, ctsize);
        }
    }

    if(!displayGrid) return;

    // display a grid
    for (let x=0; x <= width; x += width / cols) {
        mapCtx.moveTo(x, 0);
        mapCtx.lineTo(x, height);
    }
    for (let y=0; y <= height; y += height / rows) {
        mapCtx.moveTo(0, y);
        mapCtx.lineTo(width, y);
    }
    mapCtx.strokeStyle = 'grey';
    mapCtx.stroke();

    mapCtx.beginPath();
    mapCtx.moveTo(width / 2, 0);
    mapCtx.lineTo(width / 2, height);
    mapCtx.moveTo(0, height / 2);
    mapCtx.lineTo(width, height / 2);
    mapCtx.closePath();
    mapCtx.strokeStyle = 'black';
    mapCtx.stroke();
}

$("#zoom").on("change", function() {
    zoom = this.value;
    renderMap();
});
$("#rows").on("change", function() {
    rows = this.value;
    renderMap();
});
$("#cols").on("change", function() {
    cols = this.value;
    renderMap();
});
$(".accordion").on('click', function () {
    $(this)
        .next()
        .slideToggle();
});
$("#saveButton, .save div .close").on('click', function() {
    $(".save").toggle();
});
$("#loadButton, .load div .close").on('click', function() {
    $(".load").toggle();
});
$("#saveConfirm").on('click', function() {
    let file = $("#saveInput").val();
    if (file == "")
        return;

    saveJSON(file);

    $(".save").toggle();
});
$("#loadConfirm").on('click', function() {
    $(".load").toggle();
    loadMap($("#loadSelect option:selected").text());
});
$("#newOutside").on('click', function() {
    if (grid.length != 0 && !confirm("Are you sure?"))
        return;
    tileset = 'outside';
    palette(tileset);
});
$("#newInside").on('click', function() {
    if (grid.length != 0 && !confirm("Are you sure?"))
        return;
    tileset = 'inside';
    palette(tileset);
});
$("#displayGrid").on('change', function() {
    displayGrid = !displayGrid;
    renderMap();
});
function palette(tileset) {
    img = $("#"+tileset+"Tiles")[0];
    grid = [];
    renderMap();
    let canvas = $("#tileset")[0];
    let ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 
        0, 0, //img start coordinates
        img.width, img.height, //image width/height
    );
    paletteCols = img.width / tsize;
    paletteTsize = $("#tileset").width() / paletteCols;
    let selectCtx = $("#selectTile")[0].getContext('2d');
    selectCtx.clearRect(0,0,32,32);
    selectedTile = undefined;
}
$("#tileset").on('click', function(e) {
    let canvas = $("#tileset")[0];
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top;
    selectedTile = Math.floor(x / paletteTsize) + Math.floor(y / paletteTsize) * paletteCols + 1;

    let ctx = $("#selectTile")[0].getContext('2d');
    let src_x = ((selectedTile - 1) % paletteCols) * 16;
    let src_y = Math.floor((selectedTile - 1) / paletteCols) * 16;
    ctx.clearRect(0,0,32,32);
    ctx.drawImage(img, src_x, src_y, 16, 16, 0, 0, 32, 32);
});
$("#map").on('mousemove mousedown', function(e) {
    if (e.which != 1) return;
    if (selectedTile == undefined) return;
    let rect = mapCanvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    let ctsize = $("#map").width() / cols;
    x = Math.floor(x / ctsize);
    y = Math.floor(y / ctsize);
    if (selectedTile == 0)
        grid[x+y*cols] = undefined;
    else
        grid[x+y*cols] = selectedTile;
    renderMap();
});
$("#map").on("mousemove", function(e) {
    let rect = mapCanvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    let ctsize = $("#map").width() / cols;
    x = Math.floor(x / ctsize) + 1;
    y = Math.floor(y / ctsize) + 1;
    $("#coord").html("["+x+", "+y+"]");
});
$("#fillButton").on('click', function() {
    if (selectedTile == undefined) return;
    for (let c = 0; c < cols; c++)
        for (let r = 0; r < rows; r++)
            grid[c+r*cols] = selectedTile;
    renderMap();
});
$("#eraseButton").on('click', function() {
    selectedTile = 0;
    let ctx = $("#selectTile")[0].getContext('2d');
    ctx.clearRect(0,0,32,32);
});
function saveJSON(file) {
    let data = {};
    data.tileset = tileset;
    data.cols = cols;
    data.rows = rows;
    data.tsize = tsize;
    data.tiles = grid;
    data.type = $("#type").val();
    data.compass = $("#check1").val() * $("#check1").is(":checked") +
                   $("#check2").val() * $("#check2").is(":checked") +
                   $("#check4").val() * $("#check4").is(":checked") +
                   $("#check8").val() * $("#check8").is(":checked");
    data.entities = [];
    data = JSON.stringify(data, null, 2);
    $.ajax({
        type: 'POST',
        url: 'files.php',
        data: {file:file, data:data},
        success: function(res) {
            alert("File saved.")
        }
    });
}
