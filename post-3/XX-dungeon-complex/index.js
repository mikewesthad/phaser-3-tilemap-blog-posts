/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Character, Michele "Buch" Bucelli: 
 *      https://opengameart.org/content/a-platformer-in-the-forest
 *  - Tileset, Michele "Buch" Bucelli (tilset artist) & Abram Connelly (tileset sponsor): 
 *     https://opengameart.org/content/top-down-dungeon-tileset
 */

import TILES from "./tile-mapping.js";
import Player from "./player.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  pixelArt: true,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: true,
      gravity: { y: 0 }
    }
  }
};

const game = new Phaser.Game(config);

let level = 0;
let dungeon;
let map;
let player;
let groundLayer;
let stuffLayer;
let shadowLayer;
let activeRoom;

function preload() {
  this.load.image("tiles", "../assets/tilesets/buch-tileset-48px-extruded.png");
  this.load.spritesheet("characters", "../assets/images/buch-characters-64px-extruded.png", {
    frameWidth: 64,
    frameHeight: 64,
    margin: 1,
    spacing: 2
  });
}

function create() {
  // Note: Dungeon is not a Phaser element - it's from the custom script embedded at the bottom :)
  // It generates a simple set of connected rectangular rooms that then we can turn into a tilemap
  dungeon = new Dungeon({
    width: 50,
    height: 50,
    doorPadding: 2,
    rooms: {
      width: { min: 7, max: 15, onlyOdd: true },
      height: { min: 7, max: 15, onlyOdd: true }
    }
  });

  level += 1;

  // Creating a blank tilemap with dimensions matching the dungeon
  map = this.make.tilemap({
    tileWidth: 48,
    tileHeight: 48,
    width: dungeon.width,
    height: dungeon.height
  });
  const tileset = map.addTilesetImage("tiles", null, 48, 48, 1, 2);
  groundLayer = map.createBlankDynamicLayer("Ground", tileset);
  stuffLayer = map.createBlankDynamicLayer("Stuff", tileset);
  shadowLayer = map.createBlankDynamicLayer("Shadow", tileset);

  
  // Fill the ground and shadow with black tiles
  shadowLayer.fill(20);
  groundLayer.fill(20);

  // Use the array of rooms generated to place tiles in the map
  dungeon.rooms.forEach(function(room) {
    const { x, y, width, height, left, right, top, bottom } = room;

    // Fill the floor with mostly clean tiles, but occasionally place a dirty tile
    // See "Weighted Ranomize" example for more information on how to use weightedRandomize.
    groundLayer.weightedRandomize(x, y, width, height, TILES.FLOOR);

    // Place the room corners tiles
    groundLayer.putTileAt(TILES.WALL.TOP_LEFT, left, top);
    groundLayer.putTileAt(TILES.WALL.TOP_RIGHT, right, top);
    groundLayer.putTileAt(TILES.WALL.BOTTOM_RIGHT, right, bottom);
    groundLayer.putTileAt(TILES.WALL.BOTTOM_LEFT, left, bottom);

    // Fill the walls with mostly clean tiles, but occasionally place a dirty tile
    groundLayer.weightedRandomize(left + 1, top, width - 2, 1, TILES.WALL.TOP);
    groundLayer.weightedRandomize(left + 1, bottom, width - 2, 1, TILES.WALL.BOTTOM);
    groundLayer.weightedRandomize(left, top + 1, 1, height - 2, TILES.WALL.LEFT);
    groundLayer.weightedRandomize(right, top + 1, 1, height - 2, TILES.WALL.RIGHT);

    // Dunegons have rooms that are connected with doors. Each door has an x & y relative to the
    // room's location
    var doors = room.getDoorLocations();
    for (var i = 0; i < doors.length; i++) {
      if (doors[i].y === 0) {
        groundLayer.putTilesAt(TILES.DOOR.TOP, x + doors[i].x - 1, y + doors[i].y);
      } else if (doors[i].y === room.height - 1) {
        groundLayer.putTilesAt(TILES.DOOR.BOTTOM, x + doors[i].x - 1, y + doors[i].y);
      } else if (doors[i].x === 0) {
        groundLayer.putTilesAt(TILES.DOOR.LEFT, x + doors[i].x, y + doors[i].y - 1);
      } else if (doors[i].x === room.width - 1) {
        groundLayer.putTilesAt(TILES.DOOR.RIGHT, x + doors[i].x, y + doors[i].y - 1);
      }
    }
  });

  const rooms = dungeon.rooms.slice();
  const startRoom = rooms.shift();
  const endRoom = Phaser.Utils.Array.RemoveRandomElement(rooms);
  const otherRooms = Phaser.Utils.Array.Shuffle(rooms).slice(0, rooms.length * 0.9);
  stuffLayer.putTileAt(TILES.STAIRS, endRoom.centerX  - 2, endRoom.centerY);

  otherRooms.forEach(room => {
    // Place some random stuff in rooms occasionally
    var rand = Math.random();
    if (rand <= 0.25) {
      stuffLayer.putTileAt(TILES.CHEST, room.centerX, room.centerY);
    } else if (rand <= 0.5) {
      // Pick a spot in the room for the pot... except don't block a door!
      const x = Phaser.Math.Between(room.left + 2, room.right - 2);
      const y = Phaser.Math.Between(room.top + 2, room.bottom - 2);
      stuffLayer.weightedRandomize(x, y, 1, 1, TILES.POT);
    } else {
      if (room.height >= 9) {
        // We have room for 4 towers
        stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY + 1);
        stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY + 1);
        stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY - 2);
        stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY - 2);
      } else {
        stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY - 1);
        stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY - 1);
      }
    }
  });

  // Not exactly correct for the tileset since there are more possible floor tiles, but this will
  // do for the example.
  groundLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);
  stuffLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);

  stuffLayer.setTileIndexCallback(TILES.STAIRS, () => {
    stuffLayer.setTileIndexCallback(TILES.STAIRS, null);
    const cam = this.cameras.main;
    cam.fade(250, 0, 0, 0);
    // player.freeze();
    cam.once("camerafadeoutcomplete", () => {
      player.destroy();
      this.scene.restart();
    });
    
  });

  // Place the player in the first room
  const playerRoom = dungeon.rooms[0];
  const x = map.tileToWorldX(playerRoom.centerX + 1);
  const y = map.tileToWorldY(playerRoom.centerY + 1);
  player = new Player(this, x, y);
  // Watch the player and worldLayer for collisions, for the duration of the scene:
  this.physics.add.collider(player.sprite, groundLayer);
  this.physics.add.collider(player.sprite, stuffLayer);

  // Phaser supports multiple cameras, but you can access the default camera like this:
  const camera = this.cameras.main;

  // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  camera.startFollow(player.sprite);

  shadowLayer.forEachTile(tile => tile.alpha = 1);
  setRoomAlpha(startRoom, 0);
  activeRoom = startRoom;

  // Help text that has a "fixed" position on the screen
  this.add
    .text(16, 16, `Find the stairs. Go deeper.\nCurrent level: ${level}`, {
      font: "18px monospace",
      fill: "#000000",
      padding: { x: 20, y: 10 },
      backgroundColor: "#ffffff"
    })
    .setScrollFactor(0);
}

function update(time, delta) {
  player.update();

  const playerTileX = map.worldToTileX(player.sprite.x);
  const playerTileY = map.worldToTileY(player.sprite.y);

  // Another helper method from the dungeon - dungeon XY (in tiles) -> room
  const room = dungeon.getRoomAt(playerTileX, playerTileY);

  // If the player has entered a new room, make it visible and dim the last room
  if (activeRoom !== room) {
    setRoomAlpha(room, 0);
    if (activeRoom) setRoomAlpha(activeRoom, 0.5);
    activeRoom = room;
  }
}

function setRoomAlpha(room, alpha) {
  shadowLayer.forEachTile(t => t.alpha = alpha, this, room.x, room.y, room.width, room.height);
}
