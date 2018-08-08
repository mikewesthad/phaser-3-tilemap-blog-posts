/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Twemoji, https://github.com/twitter/twemoji, CC-BY 4.0
 *  - Cursor by freepik, https://www.flaticon.com/free-icon/pointer_178432, CC-BY 3.0
 *  - Tilesets by Kenney, https://www.kenney.nl/assets/platformer-art-pixel-redux and
 *    https://www.kenney.nl/assets/abstract-platformer, CC 1.0 Universal
 */

import MainScene from "./main-scene.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#000c1f",
  parent: "game-container",
  pixelArt: true,
  scene: MainScene,
  physics: {
    default: "matter",
    matter: {
      // This is the default value
      gravity: { y: 1 },

      // You can also pass in Matter.Engine config properties:
      //  http://brm.io/matter-js/docs/classes/Engine.html#properties
      enableSleep: true
    }
  }
};

const game = new Phaser.Game(config);
