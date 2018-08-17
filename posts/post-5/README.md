# Modular Game Worlds in Phaser 3 (Tilemaps #5) - Matter.js & Collisions

Author: [Mike Hadley](https://www.mikewesthad.com/)

Reading this on GitHub? Check out the [medium post](coming soon).

This is the fifth post in a series of blog posts about creating modular worlds with tilemaps in the [Phaser 3](http://phaser.io/) game engine. In this edition, ...

**Insert final demo GIF**

_↳ insert caption_

If you haven't checked out the previous posts in the series, here are the links:

1.  [Static tilemaps & a Pokémon-style world](https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6)
2.  [Dynamic tilemaps & puzzle-y platformer](https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-2-dynamic-platformer-3d68e73d494a)
3.  [Dynamic tilemaps & Procedural Dungeons](https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-3-procedural-dungeon-3bc19b841cd)
4.  [Meet Matter.js](https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-4-meet-matter-js-abf4dfa65ca1)

Before we dive in, all the source code and assets that go along with this post can be found in [this repository](https://github.com/mikewesthad/phaser-3-tilemap-blog-posts/tree/master/examples/post-5).

## Intended Audience

This post will make the most sense if you have some experience with JavaScript (classes, arrow functions & modules), Phaser and the [Tiled](https://www.mapeditor.org/) map editor. If you don't, you might want to start at the beginning of the [series](https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6), or continue reading and keep Google, the Phaser tutorial and the Phaser [examples](https://labs.phaser.io/) & [documentation](https://photonstorm.github.io/phaser3-docs/index.html) handy.

Alright, Let's get into it!

## Overview

...

In the [last post](https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-4-meet-matter-js-abf4dfa65ca1), we got acquainted with Matter.js...

If you are the type of the person who just wants to get straight to handling collisions nicely in Phaser, you can jump ahead two sections. But if you like to understand how something really works - which I think will pay off in the long run - then let's take a short detour back into Matter to see how native collisions work there.

## Collisions in Matter

Last time, we saw how to add physical shapes to a world and have them collide with one another. If we want to use that physics in a game, we need to be able to respond when certain objects collide with one another, e.g. like a player character stepping on a trap door. Since Phaser's implementation of Matter is a thin wrapper around the underlying library, it's worth revisiting our vanilla Matter example from last time to learn about collision detection in Matter.

The setup is almost exactly the same:

1. We create a renderer and engine.
2. We create some different shaped bodies that will bounce around the world.
3. We add some static bodies - bodies that are unable to move or rotate - to act as the world.
4. We add everything to the world and kick off the renderer & engine loops.

The difference is that we added a new module alias at the top of the file, `Events`:

```js
const { Engine, Render, World, Bodies, Body, Events } = Matter;
```

`Events` allows us to subscribe to event emitters in Matter. The two events we will play with in this demo are [`collisionStart`](http://brm.io/matter-js/docs/classes/Engine.html#event_collisionStart) and [`collisionEnd`](http://brm.io/matter-js/docs/classes/Engine.html#event_collisionEnd). (See the docs for other [engine events](http://brm.io/matter-js/docs/classes/Engine.html#events).)

```js
Events.on(engine, "collisionStart", event => {
  event.pairs.forEach(pair => {
    const { bodyA, bodyB } = pair;
  });
});

Events.on(engine, "collisionEnd", event => {
  event.pairs.forEach(pair => {
    const { bodyA, bodyB } = pair;
  });
});
```

On each tick of the engine's loop, Matter keeps track of all pairs of objects that just started colliding (`collisionStart`), have continued colliding for multiple ticks (`collisionActive`) or just finished colliding (`collisionEnd`). The events have the same structure. Each provides a single argument - an object - with a `pairs` property that is an array of all pairs of Matter bodies that were colliding. Each `pair` has `bodyA` and `bodyB` properties that give us access to who collided. Inside of our event listener, we can loop over all the pairs, look for collisions we care about and do something. Let's start by making anything that collides slightly transparent (using the body's [render property](http://brm.io/matter-js/docs/classes/Body.html#property_render)):

```js
Events.on(engine, "collisionStart", event => {
  event.pairs.forEach(pair => {
    const { bodyA, bodyB } = pair;

    // Make translucent until collisionEnd
    bodyA.render.opacity = 0.75;
    bodyB.render.opacity = 0.75;
  });
});

Events.on(engine, "collisionEnd", event => {
  event.pairs.forEach(pair => {
    const { bodyA, bodyB } = pair;

    // Return to opaque
    bodyA.render.opacity = 1;
    bodyB.render.opacity = 1;
  });
});
```

**GIF**

_↳ The bodies flash just while they are colliding_

Now we can extend our "collisionStart" to have some conditional logic based on which bodies are colliding.

```js
Events.on(engine, "collisionStart", event => {
  event.pairs.forEach(pair => {
    const { bodyA, bodyB } = pair;

    // Make translucent until collisionEnd
    bodyA.render.opacity = 0.75;
    bodyB.render.opacity = 0.75;

    // #1 Detecting collisions between the floor and anything else
    if (bodyA === floor || bodyB === floor) {
      console.log("Something hit the floor!");

      // The conditional ternary operator is a shorthand for an if-else conditional. Here, we use it
      // to access whichever body is not the floor.
      const otherBody = bodyB === floor ? bodyA : bodyB;
      otherBody.render.fillStyle = "#2E2B44";
    }

    // #2 Detecting collisions between the floor and the circle
    if ((bodyA === floor && bodyB === circle) || (bodyA === circle && bodyB === floor)) {
      console.log("Circle hit floor");

      const circleBody = bodyA === circle ? bodyA : bodyB;
      World.remove(engine.world, circleBody);
    }
  });
});
```

In the first conditional, we check if one of the bodies is the floor, then we adjust the color of the other body to match the floor color. In the second conditional, we check if the circle hit the floor, and if so, kill it. With those basics, we can do a lot in a game world - like checking if the player hit a button, or if any object fell into lava.

**sandbox**

This approach isn't terribly friendly or modular though. We have to worry about the order of bodyA and bodyB - was the floor A or B? We also have to have a big centralized function that knows about all the colliding pairs. Matter takes the approach of keeping the engine itself as simple as possible and leaving it up to the user to add in their specific way of handling collisions. If you want to go further with Matter without Phaser, then check out this Matter plugin to that makes collision handling easier by giving us a way to listening to collisions on specific bodies: [dxu/matter-collision-events](https://github.com/dxu/matter-collision-events#readme). When we get to Phaser, we'll similarly solve this with a plugin.

## Simple Collisions in Phaser

Now that we understand how collisions work in Matter, let's use them in Phaser. Before getting into creating a platformer, let's quickly revisit our emoji dropping example from last time:

**GIF**

When an emoji collides with something, we'll make it play a short angry face animation. The setup is the same as last time. We set up a tilemap and enable Matter bodies on the tiles. When the player clicks on the screen, we drop a Matter-enabled emoji. Last time we used a [`Phaser.Physics.Matter.Image`](https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Matter.Image.html) for the emoji, but this time we'll use a [`Phaser.Physics.Matter.Sprite`](https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Matter.Sprite.html) so that we can use an animation. This goes into our Scene's `create` method:

```js
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
```

Now we just need to handle the collisions (also in `create`):

```js
this.matter.world.on("collisionstart", event => {
  event.pairs.forEach(pair => {
    const { bodyA, bodyB } = pair;
  });
});

this.matter.world.on("collisionend", event => {
  event.pairs.forEach(pair => {
    const { bodyA, bodyB } = pair;
  });
});
```

The structure is pretty much the same as with native Matter, except that Phaser lowercases the event name to match its own conventions. `bodyA` and `bodyB` are Matter bodies, but with an added property. If the bodies are owned by a Phaser game object (like a Sprite, Image, Tile, etc.), they'll have a `gameObject` property. We can then use that property to identify what collided:

```js
this.matter.world.on("collisionstart", event => {
  event.pairs.forEach(pair => {
    const { bodyA, bodyB } = pair;

    const gameObjectA = bodyA.gameObject;
    const gameObjectB = bodyB.gameObject;

    const aIsEmoji = gameObjectA instanceof Phaser.Physics.Matter.Sprite;
    const bIsEmoji = gameObjectB instanceof Phaser.Physics.Matter.Sprite;

    if (aIsEmoji) {
      gameObjectA.setAlpha(0.5);
      gameObjectA.play("angry", false); // false = don't restart animation if it's already playing
    }
    if (bIsEmoji) {
      gameObjectB.setAlpha(0.5);
      gameObjectB.play("angry", false);
    }
  });
});
```

We've got two types of colliding objects in our scene - sprites and tiles. We're using the [`instanceof`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof) to figure out which bodies are the emoji sprites. We play an angry animation and make the sprite translucent. We can also use the "collisionend" event to make the sprite opaque again:

```js
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
```

**sandbox**

Now we've seen native Matter events and Phaser's wrapper around those Matter events. Both are a bit messy to use without a better structure, but they are important to cover before we start using a plugin to help us manage the collisions.

The approach in this section still isn't very modular. One function handles all our collisions. If we added more types of objects to the world, we'd need more conditionals in this function. We also haven't looked at how compound bodies would work here - spoiler, they add another layer of complexity.

## Collision Plugin

I created a Phaser plugin to make our lives a bit easier when it comes to Matter collisions in Phaser: [phaser-matter-collision-plugin](https://github.com/mikewesthad/phaser-matter-collision-plugin). With it, we can detect collisions between specific game objects, e.g.

```js
const player = this.matter.add.sprite(0, 0, "player");
const trapDoor = this.matter.add.sprite(200, 0, "door");

this.matterCollision.addOnCollideStart({
  objectA: player,
  objectB: trapDoor,
  callback: () => console.log("Player touched door!")
});
```

Or between groups of game objects, e.g.

```js
const player = this.matter.add.sprite(0, 0, "player");
const enemy1 = this.matter.add.sprite(100, 0, "enemy");
const enemy2 = this.matter.add.sprite(200, 0, "enemy");
const enemy3 = this.matter.add.sprite(300, 0, "enemy");

this.matterCollision.addOnCollideStart({
  objectA: player,
  objectB: [enemy1, enemy2, enemy3],
  callback: eventData => {
    console.log("Player hit an enemy");
    // eventData.gameObjectB will be the specific enemy that was hit
  }
});
```

Check out [the docs](https://www.mikewesthad.com/phaser-matter-collision-plugin/docs/manual/README.html) if you want to learn more.
## Ghost Collisions

At some point in exploring Matter, you might run into the common problem of ghost collisions. If you notice a player seemingly tripping over nothing as it walks along a platform of tiles, you are likely running into ghost collisions. Here's what they look like:

![](./images/ghost-collision-demo.gif)

You can check out the corresponding live [demo](http://labs.phaser.io/view.html?src=src/game%20objects/tilemap/collision/matter%20ghost%20collisions.js) that I created on Phaser Labs. As the mushrooms move over the top platform, you can see that they catch on the vertical edge of the tiles. That's due to how physics engines resolve collisions. The engine sees the tiles as separate bodies when the mushroom collides against them. It doesn't know that they form a straight line and that the mushrooms shouldn't hit any of the vertical edges. Check out [this article](http://www.iforce2d.net/b2dtut/ghost-vertices) for more information and to see how Box2D solves for this.

There are a couple ways to mitigate this:

- Add chamfer to bodies, i.e. round the edges, or use circular bodies to reduce the impact of the ghost collisions.
- Map out your level's hitboxes as as a few convex hulls instead of giving each tile a separate body. You can still use Tiled for this. Create an object layer, and fill it with shapes, convert those shapes to Matter bodies in Phaser. The demo code does that.
- You might be able to use Matter's ability to handle polygons to join all your tiles into one body, depending on the complexity of your map.

Or, just live with the little glitches for a bit. [@hexus](https://github.com/hexus) is working on a Phaser plugin for solving for ghost collisions against tilemaps, so keep an eye on his GitHub feed. It should be dropping pretty soon.

## Up Next

Thanks for reading, and if there's something you'd like to see in future posts, let me know!

## About Me

I’m a creative developer & educator. I wrote the Tilemap API for Phaser 3 and created a ton of guided examples, but I wanted to collect all of that information into a more guided and digestible format so that people can more easily jump into Phaser 3. You can see more of my work and get in touch [here](https://www.mikewesthad.com/).

```

```
