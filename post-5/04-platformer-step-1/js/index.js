/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Twemoji, https://github.com/twitter/twemoji, CC-BY 4.0
 *  - Tilesets by Kenney, https://www.kenney.nl/assets/platformer-art-pixel-redux and
 *    https://www.kenney.nl/assets/abstract-platformer, public domain
 *  - Character by 0x72 under CC-0, https://0x72.itch.io/16x16-industrial-tileset
 */

import MainScene from "./main-scene.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#000c1f",
  parent: "game-container",
  scene: MainScene,
  pixelArt: true,
  physics: { default: "matter" },
  plugins: {
    scene: [
      {
        plugin: PhaserMatterCollisionPlugin, // The plugin class
        key: "matterCollision", // Where to store in Scene.Systems, e.g. scene.sys.matterCollision
        mapping: "matterCollision" // Where to store in the Scene, e.g. scene.matterCollision
      }
    ]
  }
};

const game = new Phaser.Game(config);
