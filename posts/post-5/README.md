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

This approach isn't terribly friendly or modular though. You have to worry about the order of bodyA and bodyB - was the floor A or B? You also have to have a big centralized function that knows about all the colliding pairs. If you want to go further with Matter without Phaser, then check out this Matter plugin to that makes collision handling easier by listening to collisions on specific bodies: [dxu/matter-collision-events](https://github.com/dxu/matter-collision-events#readme). When we get to Phaser, we'll similarly solve this with a plugin.

## Up Next

Thanks for reading, and if there's something you'd like to see in future posts, let me know!

## About Me

I’m a creative developer & educator. I wrote the Tilemap API for Phaser 3 and created a ton of guided examples, but I wanted to collect all of that information into a more guided and digestible format so that people can more easily jump into Phaser 3. You can see more of my work and get in touch [here](https://www.mikewesthad.com/).

```

```
