// map.getObjectLayer("Swing Locations").objects.forEach(swingObject => {
//   const { x, y, polyline } = swingObject;
//   const [startPoint, endPoint] = polyline;
//   const length = Phaser.Math.Distance.Between(
//     startPoint.x,
//     startPoint.y,
//     endPoint.x,
//     endPoint.y
//   );
//   const { Constraint } = Phaser.Physics.Matter.Matter;
//   const chain = this.add
//     .tileSprite(x + startPoint.x, y + startPoint.y, 18, Math.round(length), "chain")
//     .setOrigin(0.5, 0)
//     .setDepth(-1);
//   const platform = this.add.tileSprite(x + endPoint.x, y + endPoint.y, 64 * 3, 64, "block");
//   this.matter.add
//     .gameObject(platform, {
//       restitution: 0,
//       friction: 1,
//       frictionStatic: 0,
//       frictionAir: 0,
//       density: 1,
//       shape: "rectangle"
//     })
//     .setFixedRotation();
//   const constraint = Constraint.create({
//     pointA: { x: x + startPoint.x, y: y + startPoint.y },
//     bodyB: platform.body,
//     pointB: { x: 0, y: 0 }
//   });
//   this.events.on("update", () => {
//     const angle = Phaser.Math.Angle.Between(chain.x, chain.y, platform.x, platform.y);
//     chain.rotation = angle - Math.PI / 2;
//   });
//   this.matter.world.add(constraint);
// });
