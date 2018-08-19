/**
 * A helper - slightly modeled off of Unity's concept of keyboard axes - which tracks the horizontal
 * movement keys (A/D keys or LEFT/RIGHT arrows) and returns a value between -1 (left) and 1 (right)
 * which indicates how long the player has been holding down the left or right keys respectively.
 * This lets us give the player more control over their movement based on how long they hold a key
 * down.
 */
export default class SmoothedHorizontalControls {
  constructor(scene, speed = 0.001) {
    this.msSpeed = speed;
    this.value = 0;

    const { LEFT, RIGHT, A, D } = Phaser.Input.Keyboard.KeyCodes;
    this.keys = scene.input.keyboard.addKeys({ left: LEFT, right: RIGHT, a: A, d: D });
  }

  getValue() {
    return this.value;
  }

  update(time, deltaTime) {
    if (this.keys.left.isDown || this.keys.a.isDown) {
      if (this.value > 0) this.value = 0;
      this.value -= this.msSpeed * deltaTime;
      if (this.value < -1) this.value = -1;
    } else if (this.keys.right.isDown || this.keys.d.isDown) {
      if (this.value < 0) this.value = 0;
      this.value += this.msSpeed * deltaTime;
      if (this.value > 1) this.value = 1;
    } else {
      this.value = 0;
    }
  }

  reset() {
    this.value = 0;
  }
}
