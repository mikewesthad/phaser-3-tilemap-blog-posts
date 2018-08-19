import Player from "./player.js";

export default class MainScene extends Phaser.Scene {
  preload() {
    this.load.tilemapTiledJSON("map", "../assets/tilemaps/simple-map-with-collisions.json");
    this.load.image(
      "kenney-tileset-64px-extruded",
      "../assets/tilesets/kenney-tileset-64px-extruded.png"
    );

    this.load.image("wooden-plank", "../assets/images/wooden-plank.png");
    this.load.image("block", "../assets/images/block.png");
    this.load.image("chain", "../assets/images/chain.png");

    this.load.spritesheet(
      "player",
      "../assets/spritesheets/0x72-industrial-player-32px-extruded.png",
      {
        frameWidth: 32,
        frameHeight: 32,
        margin: 1,
        spacing: 2
      }
    );

    this.load.atlas("emoji", "../assets/atlases/emoji.png", "../assets/atlases/emoji.json");
  }

  create() {
    const map = this.make.tilemap({ key: "map" });
    const tileset = map.addTilesetImage("kenney-tileset-64px-extruded");
    const groundLayer = map.createDynamicLayer("Ground", tileset, 0, 0);
    const lavaLayer = map.createDynamicLayer("Lava", tileset, 0, 0);

    // Set colliding tiles, same as with arcade physics (AP). We'll just make everything collide for
    // now.
    groundLayer.setCollisionByExclusion([-1, 0]);
    lavaLayer.setCollisionByExclusion([-1, 0]);

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

    const bodies = Phaser.Physics.Matter.Matter.Composite.allBodies(this.matter.world.localWorld);

    this.player = new Player(this, 200, 200);

    // Normally, we could just set the "debug" property to true in our game config, but we'll do
    // something a little more complicated here toggle the debug graphics on the fly. It's worth
    // noting that the debug renderer is slow!
    this.matter.world.createDebugGraphic();
    this.matter.world.drawDebug = false;
    this.input.keyboard.on("keydown_R", event => {
      this.matter.world.drawDebug = !this.matter.world.drawDebug;
      this.matter.world.debugGraphic.clear();
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
          .setScale(0.5);
      }
    });

    // const constrainedEmoji = this.matter.add
    //   .image(300, 300, "emoji", "1f92c", {
    //     restitution: 0,
    //     friction: 0,
    //     shape: "rectangle",
    //     label: "emoji",
    //     frictionAir: 0
    //   })
    //   .setScale(3, 0.5);

    const M = Phaser.Physics.Matter.Matter;
    // const constraint = M.Constraint.create({
    //   pointA: { x: 300, y: 300 },
    //   bodyB: constrainedEmoji.body,
    //   length: 0
    // });
    // this.matter.world.add(constraint);

    const chain = this.add
      .tileSprite(600, 0, 18, 400, "chain")
      .setOrigin(0.5, 0)
      .setDepth(-1);
    const constrainedEmoji2 = this.matter.add
      .image(600, 400, "block", null, {
        restitution: 0,
        friction: 1,
        shape: "rectangle",
        label: "emoji",
        frictionAir: 0
      })
      .setScale(1)
      .setFixedRotation();
    const constraint2 = M.Constraint.create({
      pointA: { x: 600, y: 0 },
      bodyB: constrainedEmoji2.body,
      pointB: { x: 0, y: 0 }
    });
    this.matter.world.add(constraint2);

    this.events.on("update", () => {
      const angle = Phaser.Math.Angle.Between(
        chain.x,
        chain.y,
        constrainedEmoji2.x,
        constrainedEmoji2.y
      );
      chain.rotation = angle - Math.PI / 2;
    });

    const makePlatform = (x, y) => {
      const platform = this.add.tileSprite(x, y, 64 * 5, 18, "wooden-plank");
      this.matter.add.gameObject(platform, {
        restitution: 0,
        friction: 0,
        frictionAir: 0
      });
      const constraint = M.Constraint.create({
        pointA: { x: platform.x, y: platform.y },
        bodyB: platform.body,
        length: 0
      });
      this.matter.world.add(constraint);
      platform.setRotation((Math.random() * Math.PI) / 4 - Math.PI / 8);
    };

    makePlatform(940, 640);
    makePlatform(1340, 640);

    // The native matter events are camelcase, but they are lowercased as they are passed through
    // Phaser. To listen to Matter engine events, listen to the Phaser.Matter.World

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

    //       // Get access to the image we created
    //       const emoji = emojiBody.gameObject;

    //       // A body may collide with multiple other bodies in a step, so we'll use a flag to
    //       // only tween & destroy the ball once.
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
    this.cameras.main.startFollow(this.player.sprite);

    // const cursors = this.input.keyboard.createCursorKeys();
    // const controlConfig = {
    //   camera: this.cameras.main,
    //   left: cursors.left,
    //   right: cursors.right,
    //   up: cursors.up,
    //   down: cursors.down,
    //   speed: 0.5
    // };
    // this.controls = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);

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
    // this.controls.update(delta);
    this.player.update(time, delta);
  }
}
