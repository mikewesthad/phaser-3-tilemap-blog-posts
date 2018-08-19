export default class MainScene extends Phaser.Scene {
  preload() {
    this.load.tilemapTiledJSON("map", "../assets/tilemaps/simple-map.json");
    this.load.image(
      "kenney-tileset-64px-extruded",
      "../assets/tilesets/kenney-tileset-64px-extruded.png"
    );

    // An atlas is a way to pack multiple images together into one texture. For more info see:
    //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
    // If you don't use an atlas, you can do the same thing with a spritesheet, see:
    //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
    this.load.atlas("emoji", "../assets/atlases/emoji.png", "../assets/atlases/emoji.json");
  }

  create() {
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("kenney-tileset-64px-extruded");
    const groundLayer = map.createDynamicLayer("Ground", tileset, 0, 0);
    const lavaLayer = map.createDynamicLayer("Lava", tileset, 0, 0);

    // Set colliding tiles before converting the layer to Matter bodies - same as we've done before
    // with AP. See post #1 for more on setCollisionByProperty.
    groundLayer.setCollisionByProperty({ collides: true });
    lavaLayer.setCollisionByProperty({ collides: true });

    // Get the layers registered with Matter. Any colliding tiles will be given a Matter body. We
    // haven't mapped our collision shapes in Tiled so each colliding tile will get a default
    // rectangle body (similar to AP).
    this.matter.world.convertTilemapLayer(groundLayer);
    this.matter.world.convertTilemapLayer(lavaLayer);

    // Drop a couple matter-enabled emoji images into the world. (Note, the frame names come from
    // twemoji - they are the unicode values of the emoji.)

    // Create a physics-enabled image
    const image1 = this.matter.add.image(275, 100, "emoji", "1f92c");
    // Change it's body to a circle and configure its body parameters
    image1.setCircle(image1.width / 2, { restitution: 1, friction: 0.25 });
    image1.setScale(0.5);

    const image2 = this.matter.add.image(300, 75, "emoji", "1f60d");
    image2.setCircle(image2.width / 2, { restitution: 1, friction: 0.25 });
    image2.setScale(0.5);

    // We can also pass in our Matter body options directly into to this.matter.add.image, along with
    // a Phaser "shape" property for controlling the type & size of the body
    const image3 = this.matter.add
      .image(325, 100, "emoji", "1f4a9", { restitution: 1, friction: 0, shape: "circle" })
      .setScale(0.5);

    // Drop some more emojis when the mouse is pressed. To randomize the frame, we'll grab all the
    // frame names from the atlas.
    const frameNames = Object.keys(this.cache.json.get("emoji").frames);
    this.input.on("pointerdown", () => {
      const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
      for (let i = 0; i < 4; i++) {
        const x = worldPoint.x + Phaser.Math.RND.integerInRange(-10, 10);
        const y = worldPoint.y + Phaser.Math.RND.integerInRange(-10, 10);
        const frame = Phaser.Utils.Array.GetRandom(frameNames);
        this.matter.add
          .image(x, y, "emoji", frame, { restitution: 1, friction: 0, shape: "circle" })
          .setScale(0.5);
      }
    });

    // Our canvas is now "clickable" so let's update the cursor to a custom pointer
    this.input.setDefaultCursor("url(../assets/cursors/pointer.cur), pointer");

    // Normally, we could just set the "debug" property to true in our game config, but we'll do
    // something a little more complicated here toggle the debug graphics on the fly. It's worth
    // noting that the debug renderer is slow!
    this.matter.world.createDebugGraphic();
    this.matter.world.drawDebug = false;
    this.input.keyboard.on("keydown_D", event => {
      this.matter.world.drawDebug = !this.matter.world.drawDebug;
      this.matter.world.debugGraphic.clear();
    });

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    const cursors = this.input.keyboard.createCursorKeys();
    const controlConfig = {
      camera: this.cameras.main,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      speed: 0.5
    };
    this.controls = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);

    const text = 'Left-click to emoji.\nArrows to scroll.\nPress "D" to see Matter bodies.';
    const help = this.add.text(16, 16, text, {
      fontSize: "18px",
      padding: { x: 10, y: 5 },
      backgroundColor: "#ffffff",
      fill: "#000000"
    });
    help.setScrollFactor(0).setDepth(1000);
  }

  update(time, delta) {
    this.controls.update(delta);
  }
}
