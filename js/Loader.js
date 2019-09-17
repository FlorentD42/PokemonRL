
class Loader {
    constructor() {
        this.images = {};
        this.json = {};
    }

    loadImage(key, src) {
        var img = new Image();

        var d = new Promise(function(resolve, reject) {
            img.onload = function() {
                this.images[key] = img;
                resolve(img);
            }.bind(this);

            img.onerror = function() {
                reject("Could not load image : " + src);
            };
        }.bind(this));
        img.src = src;
        return d;
    }

    loadJSON(key, src) {

        var d = new Promise(function(resolve, reject) {
            const request = new XMLHttpRequest();
            request.open('GET', src);
            request.onload = function () {
                if (request.status == 200) {
                    this.json[key] = JSON.parse(request.response);
                    resolve(request.response);
                } else {
                    reject("Could not load JSON file : " + src);
                }
            }.bind(this);
            request.onerror = function() {
                reject("Could not load JSON file : " + src);
            };
            request.send();
        }.bind(this));
        return d;

    };

    getJSON(key) {
        return (key in this.json) ? this.json[key] : null;
    }
        

    getImage(key) {
        return (key in this.images) ? this.images[key] : null;
    }
}

export {Loader};
