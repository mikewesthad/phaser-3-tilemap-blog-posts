// If a body is a compound body (like some of our tile bodies), then Matter collision events may
// be triggered by any of the parts of the compound body. The root body is the one which has access
// to the tile, gameObject and label.
const getRootBody = body => {
  while (body.parent !== body) body = body.parent;
  return body;
};

// Duck type because there isn't a prototype
const isMatterBody = obj => {
  return (
    obj.hasOwnProperty("collisionFilter") &&
    obj.hasOwnProperty("label") &&
    obj.hasOwnProperty("parts") &&
    obj.hasOwnProperty("isSensor")
  );
};

export default class MatterCollisionPlugin extends Phaser.Plugins.ScenePlugin {
  constructor(scene, pluginManager) {
    super(scene, pluginManager);

    this.scene = scene;
    this.systems = scene.sys;
    this.events = new Phaser.Events.EventEmitter();

    this.collisionStartTrackers = new Map();
    this.collisionEndTrackers = new Map();
    this.collisionActiveTrackers = new Map();

    this.scene.events.once("start", this.start, this);
  }

  // other = Matter.Body|Sprite|Image or array containing any of those
  onCollisionStart(physicsObject, others, callback, context) {
    //      { checkTiles = true, checkMatterBodies = true, checkGameObjects = true }
    if (!isMatterBody(physicsObject) && !physicsObject.body) {
      console.warn(
        `The first parameter should be a matter body or a GameObject with a body property. Instead, recieved: ${physicsObject}`
      );
      return;
    }
    if (!Array.isArray(others)) others = [others];
    others.map(other =>
      this.onCollision(this.collisionStartTrackers, physicsObject, other, callback, context)
    );
  }

  onCollision(map, objectA, objectB, callback, context) {
    const callbacks = map.get(objectA) || [];
    callbacks.push({ target: objectB, callback, context });
    this.collisionStartTrackers.set(objectA, callbacks);
  }

  onCollisionEnd() {}

  onCollisionActive() {}

  /**
   * Phaser.Scene lifecycle event - noop in this plugin, but still required.
   */
  init() {}

  /**
   * Phaser.Scene lifecycle event - noop in this plugin, but still required.
   */
  start() {
    // Could be started multiple times

    if (!this.scene.matter) console.log("Plugin requires matter!");
    console.log("start");

    this.systems.events.once("destroy", this.destroy, this);

    this.scene.matter.world.on(
      "collisionstart",
      this.onCollisionEvent.bind(this, this.collisionStartTrackers, "collisionstart")
    );
    this.scene.matter.world.on(
      "collisionactive",
      this.onCollisionEvent.bind(this, this.collisionActiveTrackers, "collisionactive")
    );
    this.scene.matter.world.on(
      "collisionend",
      this.onCollisionEvent.bind(this, this.collisionEndTrackers, "collisionend")
    );
  }

  onCollisionEvent(trackersMap, eventName, event) {
    const pairs = event.pairs;
    pairs.map(pair => {
      const gameObjectA = getRootBody(pair.bodyA).gameObject;
      const gameObjectB = getRootBody(pair.bodyB).gameObject;
      this.events.emit(eventName, pair.bodyA, gameObjectA, pair.bodyB, gameObjectB, pair);
      if (trackersMap.size) {
        this.checkAndEmit(trackersMap, pair.bodyA, pair.bodyB, gameObjectB, pair);
        this.checkAndEmit(trackersMap, gameObjectA, pair.bodyB, gameObjectB, pair);
        this.checkAndEmit(trackersMap, pair.bodyB, pair.bodyA, gameObjectA, pair);
        this.checkAndEmit(trackersMap, gameObjectB, pair.bodyA, gameObjectA, pair);
      }
    });
  }

  checkAndEmit(map, object, otherBody, otherGameObject, pair) {
    const callbacks = map.get(object);
    if (callbacks) {
      callbacks.forEach(({ target, callback, context }) => {
        if (!target || target === otherBody || target === otherGameObject) {
          callback.call(context, otherBody, otherGameObject, pair);
        }
      });
    }
  }

  /**
   * Phaser.Scene lifecycle event - will destroy all navmeshes created.
   */
  destroy() {
    this.systems.events.off("boot", this.boot, this);
    this.scene = undefined;
    this.systems = undefined;
  }
}
