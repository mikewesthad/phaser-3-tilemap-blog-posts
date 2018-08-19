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
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    // Create two simple animations - one angry => grimace emoji and one heart eyes => grimace
    this.anims.create({
      key: "angry",
      frames: [{ key: "emoji", frame: "1f92c" }, { key: "emoji", frame: "1f62c" }],
      frameRate: 3,
      repeat: 0
    });
    this.anims.create({
      key: "love",
      frames: [{ key: "emoji", frame: "1f60d" }, { key: "emoji", frame: "1f62c" }],
      frameRate: 3,
      repeat: 0
    });

    const bodyOptions = { restitution: 1, friction: 0, shape: "circle" };
    const emoji1 = this.matter.add.sprite(250, 100, "emoji", "1f62c", bodyOptions);
    const emoji2 = this.matter.add.sprite(250, 275, "emoji", "1f62c", bodyOptions);

    // Use the plugin to only listen for collisions between emoji 1 & 2
    this.matterCollision.addOnCollideStart({
      objectA: emoji1,
      objectB: emoji2,
      callback: ({ gameObjectA, gameObjectB }) => {
        gameObjectA.play("angry", false); // gameObjectA will always match the given "objectA"
        gameObjectB.play("love", false); // gameObjectB will always match the given "objectB"
      }
    });

    // Make the emoji draggable - not essential for the tutorial but fun to do. This works by
    // turning the emoji into a static body (not moved/rotated by forces in Matter) while dragging
    // and teleporting the object to the pointer position.
    emoji1.setInteractive();
    emoji2.setInteractive();
    this.input.setDraggable(emoji1);
    this.input.setDraggable(emoji2);
    this.input.on("drag", (pointer, gameObject, x, y) => gameObject.setPosition(x, y));
    this.input.on("dragstart", (pointer, gameObject) => gameObject.setStatic(true));
    this.input.on("dragend", (pointer, gameObject) => gameObject.setStatic(false));

    const text = "Click and drag the emoji.\nArrow keys to move the camera.";
    const help = this.add.text(16, 16, text, {
      fontSize: "18px",
      padding: { x: 10, y: 5 },
      backgroundColor: "#ffffff",
      fill: "#000000"
    });
    help.setScrollFactor(0).setDepth(1000);

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
  }

  update(time, delta) {
    this.controls.update(delta);
  }
}
