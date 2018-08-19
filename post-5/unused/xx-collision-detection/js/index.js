/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Twemoji, https://github.com/twitter/twemoji, CC-BY 4.0
 *  - Cursor by freepik, https://www.flaticon.com/free-icon/pointer_178432, CC-BY 3.0
 *  - Tilesets by Kenney, https://www.kenney.nl/assets/platformer-art-pixel-redux and
 *    https://www.kenney.nl/assets/abstract-platformer, public domain
 */

import MainScene from "./main-scene.js";
import MatterCollisionPlugin from "./matter-collision-plugin.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#000c1f",
  parent: "game-container",
  pixelArt: true,
  scene: MainScene,
  plugins: {
    scene: [
      {
        key: "MatterCollisionPlugin",
        plugin: MatterCollisionPlugin,
        mapping: "matterCollision",
        start: true
      }
    ]
  },
  physics: {
    default: "matter",
    matter: {
      gravity: { y: 1 },
      enableSleep: true
    }
  }
};

const game = new Phaser.Game(config);
