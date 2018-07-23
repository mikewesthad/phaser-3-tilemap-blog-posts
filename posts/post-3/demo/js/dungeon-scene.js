import Player from "./player.js";
import TILES from "./tile-mapping.js";

/**
 * Scene that generates a new dungeon
 */
export default class DungeonScene extends Phaser.Scene {
  constructor() {
    super();
    this.level = 0;
  }

  preload() {
    this.load.image(
      "tiles",
      "../../../../examples/post-3/assets/tilesets/buch-tileset-48px-extruded.png"
    );
    this.load.spritesheet(
      "characters",
      "../../../../examples/post-3/assets/spritesheets/buch-characters-64px-extruded.png",
      {
        frameWidth: 64,
        frameHeight: 64,
        margin: 1,
        spacing: 2
      }
    );
  }

  create() {
    this.level++;
    this.hasPlayerReachedStairs = false;

    // Generate a random world with a few extra options:
    //  - Rooms should only have odd number dimensions so that they have a center tile.
    //  - Doors should be at least 2 tiles away from corners, so that we can place a corner tile on
    //    either side of the door location
    this.dungeon = new Dungeon({
      width: 50,
      height: 50,
      doorPadding: 2,
      rooms: {
        width: { min: 7, max: 15, onlyOdd: true },
        height: { min: 7, max: 15, onlyOdd: true }
      },
      maxRooms: 10
    });

    // Creating a blank tilemap with dimensions matching the dungeon
    const map = this.make.tilemap({
      tileWidth: 48,
      tileHeight: 48,
      width: this.dungeon.width,
      height: this.dungeon.height
    });
    const tileset = map.addTilesetImage("tiles", null, 48, 48, 1, 2); // 1px margin, 2px spacing
    this.groundLayer = map.createBlankDynamicLayer("Ground", tileset);
    this.stuffLayer = map.createBlankDynamicLayer("Stuff", tileset).setVisible(false);
    this.shadowLayer = map.createBlankDynamicLayer("Shadow", tileset).setVisible(false);

    // Fill the ground and shadow with black tiles
    this.shadowLayer.fill(20);

    // --- DEMO 1 ---
    // Set all tiles in the ground layer with blank tiles (purple-black tile)
    this.groundLayer.fill(20);

    // Use the array of rooms generated to place tiles in the map
    // Note: using an arrow function here so that "this" still refers to our scene
    this.dungeon.rooms.forEach(room => {
      // These room properties are all in grid units (not pixels units)
      const { x, y, width, height, left, right, top, bottom } = room;

      // Fill the entire room (minus the walls) with mostly clean floor tiles (90% of the time), but
      // occasionally place a dirty tile (10% of the time).
      this.groundLayer.weightedRandomize(x + 1, y + 1, width - 2, height - 2, [
        { index: 6, weight: 9 },
        { index: [7, 8, 26], weight: 1 }
      ]);

      // Place the room corners tiles
      this.groundLayer.putTileAt(3, left, top);
      this.groundLayer.putTileAt(4, right, top);
      this.groundLayer.putTileAt(23, right, bottom);
      this.groundLayer.putTileAt(22, left, bottom);

      // Place the non-corner wall tiles using fill with x, y, width, height parameters
      this.groundLayer.fill(39, left + 1, top, width - 2, 1); // Top
      this.groundLayer.fill(1, left + 1, bottom, width - 2, 1); // Bottom
      this.groundLayer.fill(21, left, top + 1, 1, height - 2); // Left
      this.groundLayer.fill(19, right, top + 1, 1, height - 2); // Right
    });
    // --- /DEMO 1 ---

    // // Use the array of rooms generated to place tiles in the map
    // // Note: using an arrow function here so that "this" still refers to our scene
    // this.dungeon.rooms.forEach(room => {
    //   const { x, y, width, height, left, right, top, bottom } = room;

    //   // Fill the floor with mostly clean tiles, but occasionally place a dirty tile
    //   // See "Weighted Randomize" example for more information on how to use weightedRandomize.
    //   this.groundLayer.weightedRandomize(x, y, width, height, TILES.FLOOR);

    //   // Place the room corners tiles
    //   this.groundLayer.putTileAt(TILES.WALL.TOP_LEFT, left, top);
    //   this.groundLayer.putTileAt(TILES.WALL.TOP_RIGHT, right, top);
    //   this.groundLayer.putTileAt(TILES.WALL.BOTTOM_RIGHT, right, bottom);
    //   this.groundLayer.putTileAt(TILES.WALL.BOTTOM_LEFT, left, bottom);

    //   // Fill the walls with mostly clean tiles, but occasionally place a dirty tile
    //   this.groundLayer.weightedRandomize(left + 1, top, width - 2, 1, TILES.WALL.TOP);
    //   this.groundLayer.weightedRandomize(left + 1, bottom, width - 2, 1, TILES.WALL.BOTTOM);
    //   this.groundLayer.weightedRandomize(left, top + 1, 1, height - 2, TILES.WALL.LEFT);
    //   this.groundLayer.weightedRandomize(right, top + 1, 1, height - 2, TILES.WALL.RIGHT);

    //   // Dunegons have rooms that are connected with doors. Each door has an x & y relative to the
    //   // room's location
    //   var doors = room.getDoorLocations();
    //   for (var i = 0; i < doors.length; i++) {
    //     if (doors[i].y === 0) {
    //       this.groundLayer.putTilesAt(TILES.DOOR.TOP, x + doors[i].x - 1, y + doors[i].y);
    //     } else if (doors[i].y === room.height - 1) {
    //       this.groundLayer.putTilesAt(TILES.DOOR.BOTTOM, x + doors[i].x - 1, y + doors[i].y);
    //     } else if (doors[i].x === 0) {
    //       this.groundLayer.putTilesAt(TILES.DOOR.LEFT, x + doors[i].x, y + doors[i].y - 1);
    //     } else if (doors[i].x === room.width - 1) {
    //       this.groundLayer.putTilesAt(TILES.DOOR.RIGHT, x + doors[i].x, y + doors[i].y - 1);
    //     }
    //   }
    // });

    const rooms = this.dungeon.rooms.slice();
    const startRoom = rooms.shift();
    const endRoom = rooms[0]; //Phaser.Utils.Array.RemoveRandomElement(rooms);
    const otherRooms = Phaser.Utils.Array.Shuffle(rooms).slice(0, rooms.length * 0.9);
    this.stuffLayer.putTileAt(TILES.STAIRS, endRoom.centerX - 2, endRoom.centerY);

    otherRooms.forEach(room => {
      // Place some random stuff in rooms occasionally
      var rand = Math.random();
      if (rand <= 0.25) {
        this.stuffLayer.putTileAt(TILES.CHEST, room.centerX, room.centerY);
      } else if (rand <= 0.5) {
        // Pick a spot in the room for the pot... except don't block a door!
        const x = Phaser.Math.Between(room.left + 2, room.right - 2);
        const y = Phaser.Math.Between(room.top + 2, room.bottom - 2);
        this.stuffLayer.weightedRandomize(x, y, 1, 1, TILES.POT);
      } else {
        if (room.height >= 9) {
          // We have room for 4 towers
          this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY + 1);
          this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY + 1);
          this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY - 2);
          this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY - 2);
        } else {
          this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX - 1, room.centerY - 1);
          this.stuffLayer.putTilesAt(TILES.TOWER, room.centerX + 1, room.centerY - 1);
        }
      }
    });

    // Not exactly correct for the tileset since there are more possible floor tiles, but this will
    // do for the example.
    this.groundLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);
    this.stuffLayer.setCollisionByExclusion([-1, 6, 7, 8, 26]);

    this.stuffLayer.setTileIndexCallback(TILES.STAIRS, () => {
      this.stuffLayer.setTileIndexCallback(TILES.STAIRS, null);
      const cam = this.cameras.main;
      cam.fade(250, 0, 0, 0);
      this.hasPlayerReachedStairs = true;
      this.player.freeze();
      cam.once("camerafadeoutcomplete", () => {
        this.player.destroy();
        this.scene.restart();
      });
    });

    // Place the player in the first room
    const playerRoom = this.dungeon.rooms[0];
    const x = map.tileToWorldX(playerRoom.centerX + 1);
    const y = map.tileToWorldY(playerRoom.centerY + 1);
    this.player = new Player(this, x, y);
    // Watch the player and worldLayer for collisions, for the duration of the scene:
    this.physics.add.collider(this.player.sprite, this.groundLayer);
    this.physics.add.collider(this.player.sprite, this.stuffLayer);

    // Phaser supports multiple cameras, but you can access the default camera like this:
    const camera = this.cameras.main;

    // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    camera.startFollow(this.player.sprite);

    this.shadowLayer.forEachTile(tile => (tile.alpha = 1));
    this.setRoomAlpha(startRoom, 0);
    this.activeRoom = startRoom;

    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 16, `Find the stairs. Go deeper.\nCurrent level: ${this.level}`, {
        font: "18px monospace",
        fill: "#000000",
        padding: { x: 20, y: 10 },
        backgroundColor: "#ffffff"
      })
      .setScrollFactor(0)
      .setVisible(false);
  }

  update(time, delta) {
    if (this.hasPlayerReachedStairs) return;

    this.player.update();

    const playerTileX = this.groundLayer.worldToTileX(this.player.sprite.x);
    const playerTileY = this.groundLayer.worldToTileY(this.player.sprite.y);

    // Another helper method from the dungeon - dungeon XY (in tiles) -> room
    const room = this.dungeon.getRoomAt(playerTileX, playerTileY);

    // If the player has entered a new room, make it visible and dim the last room
    if (this.activeRoom !== room) {
      this.setRoomAlpha(room, 0);
      if (this.activeRoom) this.setRoomAlpha(this.activeRoom, 0.5);
      this.activeRoom = room;
    }
  }

  setRoomAlpha(room, alpha) {
    this.shadowLayer.forEachTile(
      t => (t.alpha = alpha),
      this,
      room.x,
      room.y,
      room.width,
      room.height
    );
  }
}
