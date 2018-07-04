/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Phaser, Rich Davey, Ilija Melentijević
 */

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  pixelArt: true,
  scene: {
    preload: preload,
    create: create
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image("tiles", "../assets/tilesets/catastrophi_tiles_16_blue.png");
  this.load.tilemapCSV("map", "../assets/tilemaps/catastrophi_level3.csv");
}

function create() {
  // When loading a CSV map, make sure to specify the tileWidth and tileHeight!
  const map = this.make.tilemap({ key: "map", tileWidth: 16, tileHeight: 16 });
  const tileset = map.addTilesetImage("tiles");
  const layer = map.createStaticLayer(0, tileset, 0, 0); // layer index, tileset, x, y
}
