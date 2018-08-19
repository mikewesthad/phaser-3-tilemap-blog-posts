export default function createRotatingPlatform(scene, x, y, numTiles = 5) {
  // A TileSprite is a Sprite whose texture repeats to fill the given width and height. We can use
  // this with an image from our tileset to create a platform composed of tiles:
  const platform = scene.add.tileSprite(x, y, 64 * numTiles, 18, "wooden-plank");

  scene.matter.add.gameObject(platform, {
    restitution: 0, // No bounciness
    frictionAir: 0, // Spin forever without slowing down from air resistance
    friction: 0.2, // A little extra friction so the player sticks better
    // Density sets the mass and inertia based on area - 0.001 is the default. We're going lower
    // here so that the platform tips/rotates easily
    density: 0.0005
  });

  // Alias the native Matter.js API
  const { Constraint } = Phaser.Physics.Matter.Matter;

  // Create a point constraint that pins the center of the platform to a fixed point in space, so
  // it can't move
  const constraint = Constraint.create({
    pointA: { x: platform.x, y: platform.y },
    bodyB: platform.body,
    length: 0
  });

  // We need to add the constraint to the Matter world to activate it
  scene.matter.world.add(constraint);

  // Give the platform a random initial tilt, as a hint to the player that these platforms rotate
  const sign = Math.random() < 0.5 ? -1 : 1;
  const angle = sign * Phaser.Math.Between(15, 25);
  platform.setAngle(angle);
}
