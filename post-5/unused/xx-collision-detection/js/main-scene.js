// If a body is a compound body (like some of our tile bodies), then Matter collision events may
// be triggered by any of the parts of the compound body. The root body is the one which has access
// to the tile, gameObject and label.
const getRootBody = body => {
  while (body.parent !== body) body = body.parent;
  return body;
};

export default class MainScene extends Phaser.Scene {
  preload() {
    this.load.tilemapTiledJSON("map", "../assets/tilemaps/simple-map-collision-mapped.json");
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
    // rectangle body (similar to AP). The body will be accessible via tile.physics.matterBody.
    this.matter.world.convertTilemapLayer(groundLayer);
    this.matter.world.convertTilemapLayer(lavaLayer);

    lavaLayer.forEachTile(tile => {
      // tile.physics is where physics engines can install tile bodies (currently only used by
      // the Matter engine). tile.physics.matterBody is a Phaser.Physics.Matter.TileBody instance...
      // which has a "body" property which is the raw Matter body, so we can use the Matter API and
      // change the label property.
      if (tile.physics.matterBody) {
        const tileBody = tile.physics.matterBody; // Phaser wrapper around a tile's body
        const matterBody = tileBody.body; // The actual Matter.js body
        matterBody.label = "lava";
      }
    });

    // Drop some more emojis when the mouse is pressed. To randomize the frame, we'll grab all the
    // frame names from the atlas.
    const frameNames = Object.keys(this.cache.json.get("emoji").frames);
    this.input.on("pointerdown", () => {
      const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
      for (let i = 0; i < 1; i++) {
        const x = worldPoint.x + Phaser.Math.RND.integerInRange(-10, 10);
        const y = worldPoint.y + Phaser.Math.RND.integerInRange(-10, 10);
        const frame = Phaser.Utils.Array.GetRandom(frameNames);
        this.matter.add
          .image(x, y, "emoji", frame, {
            restitution: 1,
            friction: 0,
            shape: "circle",
            label: "emoji"
          })
          .setScale(0.25);
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

    // The native matter events are camelcase, but they are lowercased as they are passed through
    // Phaser. To listen to Matter engine events, listen to the Phaser.Matter.World

    // this.matterCollision.events.on("collisionstart", data => {
    //   console.log(data);
    //   debugger;
    // });

    // this.matterCollision.events.on("collisionend", data => {
    //   console.log(data);
    //   debugger;
    // });

    const emoji = this.matter.add
      .image(200, 200, "emoji", "1f4a9", {
        restitution: 1,
        friction: 0,
        shape: "circle",
        label: "emoji"
      })
      .setScale(0.25);

    const emoji2 = this.matter.add
      .image(200, 350, "emoji", "1f4a9", {
        restitution: 1,
        friction: 0,
        shape: "circle",
        label: "emoji"
      })
      .setScale(0.25);

    const emoji3 = this.matter.add
      .image(250, 200, "emoji", "1f4a9", {
        restitution: 1,
        friction: 0,
        shape: "circle",
        label: "emoji"
      })
      .setScale(0.5);

    const rect = this.matter.add.rectangle(200, 400, 200, 200, {
      isStatic: true,
      label: "hidden-sensor"
    });
    // this.matterCollision.onCollisionStart(emoji, emoji2, (...args) => {
    //   console.log("emoji hit emoji 2");
    // });

    this.matterCollision.onCollisionStart(emoji3, [emoji, emoji2], (...args) => {
      console.log("emoji3 hit an emoji");
    });
    // this.matterCollision.onCollisionStart(emoji, null, (...args) => {
    //   console.log("emoji ", ...args);
    //   debugger;
    // });
    // this.matterCollision.onCollisionStart(emoji, rect, (...args) => {
    //   console.log("emoji2 ", ...args);
    //   this.matter.world.remove(rect);
    //   debugger;
    // });

    // // Loop over all the collision pairs that start colliding on each step of the Matter engine.
    // this.matter.world.on("collisionstart", event => {
    //   const pairs = event.pairs;

    //   pairs.map(pair => {
    //     const { bodyA, bodyB } = pair;

    //     // The tile bodies in this example are a mixture of compound bodies and simple rectangle
    //     // bodies. The "label" property was set on the parent body, so we will first make sure that
    //     // we have the top level body instead of a part of a larger compound body.
    //     const rootA = getRootBody(bodyA);
    //     const rootB = getRootBody(bodyB);

    //     if (
    //       (rootA.label === "lava" && rootB.label === "emoji") ||
    //       (rootB.label === "lava" && rootA.label === "emoji")
    //     ) {
    //       const emojiBody = rootA.label === "emoji" ? rootA : rootB;

    //       if (rootA.label !== bodyA.label) debugger;
    //       if (rootB.label !== bodyB.label) debugger;

    //       // Get access to the image we created
    //       const emoji = emojiBody.gameObject;

    //       // A body may collide with multiple other bodies in a step, so we'll use a flag to
    //       // only tween & destroy the emoji once.
    //       if (emoji.isBeingDestroyed) return;
    //       emoji.isBeingDestroyed = true;

    //       // Remove the emoji from the physics simulation so that it doesn't interact with anything
    //       this.matter.world.remove(emoji);

    //       this.tweens.add({
    //         targets: emoji,
    //         alpha: { value: 0, duration: 150, ease: "Power1" },
    //         onComplete: () => emoji.destroy()
    //       });
    //     }
    //   });
    // });

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
