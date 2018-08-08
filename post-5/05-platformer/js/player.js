import { getRootBody } from "./matter-utils.js";

/**
 */
export default class Player {
  constructor(scene, x, y) {
    this.scene = scene;

    // Create the animations we need from the player spritesheet
    const anims = scene.anims;
    anims.create({
      key: "player-idle",
      frames: anims.generateFrameNumbers("player", { start: 0, end: 3 }),
      frameRate: 3,
      repeat: -1
    });
    anims.create({
      key: "player-run",
      frames: anims.generateFrameNumbers("player", { start: 8, end: 15 }),
      frameRate: 12,
      repeat: -1
    });

    // Create the physics-based sprite that we will move around and animate
    this.sprite = scene.matter.add.sprite(0, 0, "player", 0);

    const M = Phaser.Physics.Matter.Matter;
    const { width: w, height: h } = this.sprite;

    // The player's body is going to be a compound body.
    const playerBody = M.Bodies.rectangle(0, 0, w * 0.75, h, { chamfer: { radius: 10 } });
    this.sensors = {
      bottom: M.Bodies.rectangle(0, h * 0.5, w * 0.25, 5, { isSensor: true }),
      left: M.Bodies.rectangle(-w * 0.45, 0, 8, h * 0.25, { isSensor: true }),
      right: M.Bodies.rectangle(w * 0.45, 0, 8, h * 0.25, { isSensor: true })
    };
    const compoundBody = M.Body.create({
      parts: [playerBody, this.sensors.bottom, this.sensors.left, this.sensors.right],
      restitution: 0.05, // Prevent body from sticking against a wall
      frictionStatic: 0,
      frictionAir: 0.01
    });
    this.sprite
      .setExistingBody(compoundBody)
      .setScale(2)
      .setFixedRotation()
      .setPosition(x, y);

    this.isTouching = { left: false, right: false, bottom: false };
    this.canJump = true;
    this.jumpCooldownTimer = null;

    // Before matter's update, reset the player's count of what surfaces it is touching.
    scene.matter.world.on("beforeupdate", () => {
      this.isTouching.left = false;
      this.isTouching.right = false;
      this.isTouching.bottom = false;
    });

    scene.matter.world.on("collisionactive", event => {
      const pairs = event.pairs;
      pairs.map(pair => {
        const { bodyA, bodyB } = pair;
        const { left, right, bottom } = this.sensors;

        if (bodyA === bottom || bodyB === bottom) {
          this.isTouching.bottom = true;
        } else if (bodyA === left || bodyB === left) {
          const other = bodyA === left ? bodyB : bodyA;
          if (other.isStatic) this.isTouching.left = true;
        } else if (bodyA === right || bodyB === right) {
          const other = bodyA === right ? bodyB : bodyA;
          if (other.isStatic) this.isTouching.right = true;
        }
      });
    });

    // Track the arrow keys & WASD
    const { LEFT, RIGHT, UP, W, A, D } = Phaser.Input.Keyboard.KeyCodes;
    this.keys = scene.input.keyboard.addKeys({
      left: LEFT,
      right: RIGHT,
      up: UP,
      w: W,
      a: A,
      d: D
    });
  }

  freeze() {
    this.sprite.body.moves = false;
  }

  update(time, deltaTime) {
    const { keys, sprite } = this;
    const onGround = true; //sprite.body.blocked.down;
    const acceleration = onGround ? 600 : 200;

    // // Apply horizontal acceleration when left/a or right/d are applied
    // if (keys.left.isDown || keys.a.isDown) {
    //   sprite.setAccelerationX(-acceleration);
    //   // No need to have a separate set of graphics for running to the left & to the right. Instead
    //   // we can just mirror the sprite.
    //   sprite.setFlipX(true);
    // } else if (keys.right.isDown || keys.d.isDown) {
    //   sprite.setAccelerationX(acceleration);
    //   sprite.setFlipX(false);
    // } else {
    //   sprite.setAccelerationX(0);
    // }

    // // Only allow the player to jump if they are on the ground
    // if (onGround && (keys.up.isDown || keys.w.isDown)) {
    //   sprite.setVelocityY(-500);
    // }

    // // Update the animation/texture based on the state of the player
    // if (onGround) {
    //   if (sprite.body.velocity.x !== 0) sprite.anims.play("player-run", true);
    //   else sprite.anims.play("player-idle", true);
    // } else {
    //   sprite.anims.stop();
    //   sprite.setTexture("player", 10);
    // }

    var oldVelocityX;
    var targetVelocityX;
    var newVelocityX;
    const playerController = { blocked: { left: false, right: false, bottom: false } };
    const speed = {
      run: 5,
      jump: 7
    };
    const { left, right, bottom } = this.isTouching;

    if (keys.left.isDown && !left) {
      // smoothedControls.moveLeft(delta);
      // matterSprite.anims.play("left", true);

      // // Lerp the velocity towards the max run using the smoothed controls. This simulates a
      // // player controlled acceleration.
      // oldVelocityX = matterSprite.body.velocity.x;
      // targetVelocityX = -playerController.speed.run;
      // newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, -smoothedControls.value);

      sprite.setVelocityX(-speed.run);
      sprite.setFlipX(true);
    } else if (keys.right.isDown && !right) {
      // smoothedControls.moveRight(delta);
      // matterSprite.anims.play("right", true);

      // // Lerp the velocity towards the max run using the smoothed controls. This simulates a
      // // player controlled acceleration.
      // oldVelocityX = matterSprite.body.velocity.x;
      // targetVelocityX = playerController.speed.run;
      // newVelocityX = Phaser.Math.Linear(oldVelocityX, targetVelocityX, smoothedControls.value);

      sprite.setVelocityX(speed.run);
      sprite.setFlipX(false);
    } else {
      // smoothedControls.reset();
      // matterSprite.anims.play("idle", true);
    }

    if (left && sprite.body.velocity.x < 0) {
      sprite.setVelocityX(0);
    } else if (right && sprite.body.velocity.x > 0) {
      sprite.setVelocityX(0);
    }

    // Jumping

    // Add a slight delay between jumps since the sensors will still collide for a few frames after
    // a jump is initiated
    // var canJump = time - playerController.lastJumpedAt > 250;
    const canJump = this.canJump;
    if (keys.up.isDown & canJump && bottom) {
      sprite.setVelocityY(-speed.jump);
      // playerController.lastJumpedAt = time;
      this.canJump = false;
      this.jumpCooldownTimer = this.scene.time.addEvent({
        delay: 250,
        callback: () => (this.canJump = true)
      });
    }

    // Update the animation/texture based on the state of the player
    if (bottom) {
      if (sprite.body.velocity.x !== 0) sprite.anims.play("player-run", true);
      else sprite.anims.play("player-idle", true);
    } else {
      sprite.anims.stop();
      sprite.setTexture("player", 10);
    }
  }

  destroy() {
    if (this.jumpCooldownTimer) this.jumpCooldownTimer.destroy();
    this.sprite.destroy();
  }
}
