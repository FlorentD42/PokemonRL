# Javascript files
List and description of all the js files.

- [Camera.js](js/Camera.js): controls the camera that follows the player
- [Game.js](js/Game.js): initialization of the game and main loop
- [GameMap.js](js/GameMap.js): represents a map in the game. Problem to be addressed: too many hard-coded values for the tiles and the animations, probably a better solution to draw the grass.
- [Hero.js](js/Hero.js): represents the player character. So far only used for camera and animation. The jumping animation needs some rework.
- [Keyboard.js](js/Keyboard.js): listening to keyboard events (arrow keys, A, B, Space, Enter)
- [Loader.js](js/Loader.js): charged on loading and getting images and json files
- [World.js](js/World.js): controls the world generation.
- [main.js](js/main.js): run on index.html, initializises the game and deals with the interface.
- [maps.js](js/maps.js): compilation of all json maps from the [maps](maps) directory, probably a temporary solution that will have to be dealt with as the game scales up.
