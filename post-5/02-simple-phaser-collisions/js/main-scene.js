export default class MainScene extends Phaser.Scene {
  preload() {
    this.load.tilemapTiledJSON("map", "../assets/tilemaps/level.json");
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

    // Set colliding tiles before converting the layer to Matter bodies
    groundLayer.setCollisionByProperty({ collides: true });
    lavaLayer.setCollisionByProperty({ collides: true });

    // Get the layers registered with Matter. Any colliding tiles will be given a Matter body. We
    // haven't mapped our collision shapes in Tiled so each colliding tile will get a default
    // rectangle body (similar to AP).
    this.matter.world.convertTilemapLayer(groundLayer);
    this.matter.world.convertTilemapLayer(lavaLayer);

    this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Drop some 1x grimacing emoji sprite when the mouse is pressed
    this.input.on("pointerdown", () => {
      const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
      const x = worldPoint.x + Phaser.Math.RND.integerInRange(-10, 10);
      const y = worldPoint.y + Phaser.Math.RND.integerInRange(-10, 10);

      // We're creating sprites this time, so that we can animate them
      this.matter.add
        .sprite(x, y, "emoji", "1f62c", { restitution: 1, friction: 0.25, shape: "circle" })
        .setScale(0.5);
    });

    // Create an angry emoji => grimace emoji animation
    this.anims.create({
      key: "angry",
      frames: [{ key: "emoji", frame: "1f92c" }, { key: "emoji", frame: "1f62c" }],
      frameRate: 8,
      repeat: 0
    });

    this.matter.world.on("collisionstart", event => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        const gameObjectA = bodyA.gameObject;
        const gameObjectB = bodyB.gameObject;

        const aIsEmoji = gameObjectA instanceof Phaser.Physics.Matter.Sprite;
        const bIsEmoji = gameObjectB instanceof Phaser.Physics.Matter.Sprite;

        if (aIsEmoji) {
          gameObjectA.setAlpha(0.5);
          gameObjectA.play("angry", false);
        }
        if (bIsEmoji) {
          gameObjectB.setAlpha(0.5);
          gameObjectB.play("angry", false);
        }
      });
    });

    this.matter.world.on("collisionend", event => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        const gameObjectA = bodyA.gameObject;
        const gameObjectB = bodyB.gameObject;

        const aIsEmoji = gameObjectA instanceof Phaser.Physics.Matter.Sprite;
        const bIsEmoji = gameObjectB instanceof Phaser.Physics.Matter.Sprite;

        if (aIsEmoji) gameObjectA.setAlpha(1);
        if (bIsEmoji) gameObjectB.setAlpha(1);
      });
    });

    // Our canvas is "clickable" so let's update the cursor to a custom pointer
    this.input.setDefaultCursor("url(../assets/cursors/pointer.cur), pointer");

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

    const text = "Left-click to emoji.\nArrows to move camera.";
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
