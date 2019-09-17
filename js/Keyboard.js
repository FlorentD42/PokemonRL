
class Keyboard {

    static listenForEvents(keys) {
        window.addEventListener('keydown', this._onKeyDown.bind(this));
        window.addEventListener('keyup', this._onKeyUp.bind(this));
         keys.forEach(function(key) {
            this._keys[key] = false;
        }.bind(this));
    }

    static _onKeyDown(event) {
        var keyCode = event.keyCode;
        if (keyCode in this._keys) {
            event.preventDefault();
            this._keys[keyCode] = true;
        }
    }

    static _onKeyUp(event) {
        var keyCode = event.keyCode;
        if (keyCode in this._keys) {
            event.preventDefault();
            this._keys[keyCode] = false;
        }
    }

    static isDown(keyCode) {
        if (!keyCode in this._keys)
            throw new Error('Keycode ' + keyCode + ' is not being listened to');
        return this._keys[keyCode];
    }

}

Keyboard._keys = {};
Keyboard.LEFT = 37;
Keyboard.RIGHT = 39;
Keyboard.UP = 38;
Keyboard.DOWN = 40;
export {Keyboard};
