import Player from "./player.js";

/**
 * Scene that generates a new dungeon
 */
export default class DungeonScene extends Phaser.Scene {
  preload() {
    this.load.image("tiles", "../assets/tilesets/buch-tileset-48px-extruded.png");
    this.load.spritesheet(
      "characters",
      "../assets/spritesheets/buch-characters-64px-extruded.png",
      {
        frameWidth: 64,
        frameHeight: 64,
        margin: 1,
        spacing: 2
      }
    );
  }

  create() {
    // Generate a random world
    const dungeon = new Dungeon({
      width: 50,
      height: 50,
      rooms: {
        width: { min: 7, max: 15 },
        height: { min: 7, max: 15 },
        maxRooms: 12
      }
    });

    // Create a blank tilemap with dimensions matching the dungeon
    const map = this.make.tilemap({
      tileWidth: 48,
      tileHeight: 48,
      width: dungeon.width,
      height: dungeon.height
    });
    const tileset = map.addTilesetImage("tiles", null, 48, 48, 1, 2); // 1px margin, 2px spacing
    const layer = map.createBlankDynamicLayer("Layer 1", tileset);

    // Get a 2D array of tile indices (using -1 to not render empty tiles) and place them into the
    // blank layer
    const mappedTiles = dungeon.getMappedTiles({ empty: -1, floor: 6, door: 6, wall: 20 });
    layer.putTilesAt(mappedTiles, 0, 0);
    layer.setCollision(20); // We only need one tile index (the walls) to be colliding for now

    // Place the player in the center of the map. This works because the Dungeon generator places
    // the first room in the center of the map.
    this.player = new Player(this, map.widthInPixels / 2, map.heightInPixels / 2);

    // Watch the player and layer for collisions, for the duration of the scene:
    this.physics.add.collider(this.player.sprite, layer);

    // Phaser supports multiple cameras, but you can access the default camera like this:
    const camera = this.cameras.main;
    camera.startFollow(this.player.sprite);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 16, "Arrow keys to move", {
        font: "18px monospace",
        fill: "#000000",
        padding: { x: 20, y: 10 },
        backgroundColor: "#ffffff"
      })
      .setScrollFactor(0);
  }

  update(time, delta) {
    this.player.update();
  }
}
