/**
 * Author: Michael Hadley, mikewesthad.com
 * Codepen Link:
 * Github Source:
 * Asset Credits:
 *  - Tuxemon, https://github.com/Tuxemon/Tuxemon
 */

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "phaser-container",
  pixelArt: true,
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);
let controls;

function preload() {
  this.load.image("tiles", "../assets/tilesets/tuxmon-sample-32px-extruded.png");
  this.load.tilemapTiledJSON("map", "../assets/tilemaps/tuxemon-town.json");
}

function create() {
  const map = this.make.tilemap({ key: "map" });

  const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

  const belowLayer = map.createLayer("Below Player", tileset, 0, 0);
  const worldLayer = map.createLayer("World", tileset, 0, 0);
  const aboveLayer = map.createLayer("Above Player", tileset, 0, 0);
}

function update(time, delta) {}
