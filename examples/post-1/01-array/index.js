/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Nintendo Mario Tiles, Educational use only
 */

const config = {
  type: Phaser.AUTO,
  width: 171,
  height: 160,
  zoom: 4, // Since we're working with 16x16 pixel tiles, let's scale up the canvas by 4x
  pixelArt: true, // Force the game to scale images up crisply
  parent: "game-container",
  scene: {
    preload: preload,
    create: create
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image("tiles", "../assets/tilesets/super-mario-tiles.png");
}

function create() {
  // Load a map from a 2D array of tile indices
  // prettier-ignore
  const level = [
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ],
    [  0,  1,  2,  3,  0,  0,  0,  1,  2,  3,  0 ],
    [  0,  5,  6,  7,  0,  0,  0,  5,  6,  7,  0 ],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ],
    [  0,  0,  0, 14, 13, 14,  0,  0,  0,  0,  0 ],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ],
    [  0,  0, 14, 14, 14, 14, 14,  0,  0,  0, 15 ],
    [  0,  0,  0,  0,  0,  0,  0,  0,  0, 15, 15 ],
    [ 35, 36, 37,  0,  0,  0,  0,  0, 15, 15, 15 ],
    [ 39, 39, 39, 39, 39, 39, 39, 39, 39, 39, 39 ]
  ];

  // When loading from an array, make sure to specify the tileWidth and tileHeight
  const map = this.make.tilemap({ data: level, tileWidth: 16, tileHeight: 16 });
  const tiles = map.addTilesetImage("tiles");
  const layer = map.createStaticLayer(0, tiles, 0, 0);
}
