// // Create worldLayer collision graphic above the player, but below the help text
const graphics = this.add
  .graphics()
  .setAlpha(0.5)
  .setDepth(20);
// this.groundLayer.renderDebug(graphics, {
//   tileColor: null, // Color of non-colliding tiles
//   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
//   faceColor: new Phaser.Display.Color(255, 255, 255, 255) // Color of colliding face edges
// });

this.spikeGroup.getChildren().forEach(spike => {
  graphics.fillStyle(0xf38630);
  graphics.fillRect(spike.body.x, spike.body.y, spike.body.width, spike.body.height);
});
setInterval(() => (graphics.visible = !graphics.visible), 1000);
