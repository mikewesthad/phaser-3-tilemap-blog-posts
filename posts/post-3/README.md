# Modular Game Worlds in Phaser 3 (Tilemaps #3) - Procedural Dungeon

Author: [Mike Hadley](https://www.mikewesthad.com/)

Reading this on GitHub? Check out the [Medium Post]() **insert link**

This is a series of blog posts about creating modular worlds with tilemaps in the [Phaser 3](http://phaser.io/) game engine.

In this post, **insert description**:

Table of Contents:

1.  [Post 1](https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6) - Static Tilemaps & Pokémon
2.  [Post 2]((https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-2-dynamic-platformer-3d68e73d494a) - Dynamic Tilemaps & Platformer
3.  This post
4.  Next post

**Insert GIF**

In the next post in the series, **insert sentence**

Before we dive in, all the source code and assets that go along with this post can be found in [this repository](https://github.com/mikewesthad/phaser-3-tilemap-blog-posts/tree/master/examples/post-3).

## Intended Audience

This post will make the most sense if you have some experience with JavaScript (classes, arrow functions & modules), Phaser and the [Tiled](https://www.mapeditor.org/) map editor. If you don't, you might want to start at the beginning of the [series](https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6), or continue reading and keep Google, the Phaser tutorial and the Phaser [examples](https://labs.phaser.io/) & [documentation](https://photonstorm.github.io/phaser3-docs/index.html) handy.

Alright, Let's get into it!

## Dungeon

We're going to get a head start on generating a world by using a dungeon generator library, [mikewesthad/dungeon](https://github.com/mikewesthad/dungeon). It's my updated fork of [nickgravelyn/dungeon](https://github.com/nickgravelyn/dungeon) that has a few new features, along with being published on npm. It's a pretty simple, brute force dungeon generator. You give it some configuration info, and it randomly builds a dungeon room-by-room starting at the center of the map.

You can load the library via a [CDN](https://www.jsdelivr.com/package/npm/@mikewesthad/dungeon), by downloading the script, or through npm ([install instructions](https://github.com/mikewesthad/dungeon#installation)). Once you've got the library loaded, you'll have a `Dungeon` class that you can use like this:

```js
const dungeon = new Dungeon({
  // The dungeon's grid size
  width: 40,
  height: 40,
  rooms: {
    // Random range for the width of a room (grid units)
    width: {
      min: 5,
      max: 10
    },
    // Random range for the height of a room (grid units)
    height: {
      min: 8,
      max: 20
    },
    // Cap the area of a room - e.g. this will prevent large rooms like 10 x 20
    maxArea: 150,
    // Max rooms to place
    maxRooms: 10
  }
});
```

And we can visualize the random dungeon by generating some HTML via `dungeon.drawToHtml` which converts the dungeon to a `<pre><table> ... </table></pre>` HTML element. We just need to specify which characters we want to use for each type of "tile" in the dungeon:

```js
const html = dungeon.drawToHtml({
  empty: " ",
  wall: "📦",
  floor: "☁️",
  door: "🚪"
});

// Append the element to an existing element on the page
document.getElementById("centered-container").appendChild(html);
```

And voilà, emoji-goodness:

![](images/emoji-dungeon.gif)

Check out the example:

**Insert CodeSandbox**

## Phaser & Dungeon

Now we can introduce Phaser and put a player inside of these random worlds. The [previous post](https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-2-dynamic-platformer-3d68e73d494a) in this series introduced the idea of using modules to better structure our code. Since modules aren't common in the Phaser examples, I'll break down the structure again here to help ease the transition.

Remember, if you're following along and not using CodeSandbox, you can get access to modules in your code by using `<script src="./js/index.js" type="module"></script>` in any modern browser. You could, of course, also reach for Webpack, Parcel or any of the other JavaScript build tools. Check out [phaser3-project-template](https://github.com/photonstorm/phaser3-project-template) for a webpack starting template.

Our directory structure looks like this:

**Insert image**

index.js is the entry point for our code. This file kicks off things off by creating the Phaser game with arcade physics enabled and loading our custom scene:

```js
import DungeonScene from "./dungeon-scene.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#000",
  parent: "game-container",
  pixelArt: true,
  scene: DungeonScene,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 }
    }
  }
};

const game = new Phaser.Game(config);
```

dungeon-scene.js is a module that exports a single `class` called `DungeonScene`. It extends [`Phaser.Scene`](https://photonstorm.github.io/phaser3-docs/Phaser.Scene.html), which means it has access to a bunch of Phaser functionality via properties (e.g. `this.add` for accessing the game factory). The scene loads up some assets in `preload`, creates a dungeon and player in `create` and updates the player in `update`.

Once we've created a `dungeon` like we did in the last example, we can set up a tilemap with a blank layer using [`createBlankDynamicLayer`](https://photonstorm.github.io/phaser3-docs/Phaser.Tilemaps.Tilemap.html#createBlankDynamicLayer__anchor):

```js
// Create a blank map
const map = this.make.tilemap({
  tileWidth: 48,
  tileHeight: 48,
  width: dungeon.width,
  height: dungeon.height
});

// Load up a tileset, in this case, the tileset has 1px margin & 2px padding (last two arguments)
const tileset = map.addTilesetImage("tiles", null, 48, 48, 1, 2);

// Create an empty layer and give it the name "Layer 1"
const layer = map.createBlankDynamicLayer("Layer 1", tileset);
```

`Dungeon` comes with an easy way to get a 2D array of tiles via `dungeon.getMappedTiles`, and Phaser has an easy way to insert an array of tiles into a layer via [`putTilesAt`](https://photonstorm.github.io/phaser3-docs/Phaser.Tilemaps.DynamicTilemapLayer.html#putTilesAt__anchor):

```js
// Turn the dungeon into a 2D array of tiles where each of the four types of tiles is mapped to a
// tile index within our tileset. Note: using -1 for empty tiles means they won't render.
const mappedTiles = dungeon.getMappedTiles({ empty: -1, floor: 6, door: 6, wall: 20 });

// Drop a 2D array into the map at (0, 0)
layer.putTilesAt(mappedTiles, 0, 0);
```

And if we put this all together with the player code from the first post in the series, we end up with:

**Insert CodeSandbox**

**Do I need to break down player.js again?**

## Other Bits to Incorperate Elsewhere

```js
// Place a row of tiles
layer.putTilesAt([1, 1, 1], 0, 0);

// Place a column of tiles
layer.putTilesAt([[1], [1], [1]], 0, 0);

// Place a 2D grid of tiles
layer.putTilesAt([[1, 1, 1], [1, 0, 1], [1, 0, 1]], 0, 0);
```

## Up Next

Stay tuned.

**Insert sentence and GIF of next post here**

Let me know if there's something you'd like to see in future posts!

## About Me

I’m a creative developer & educator. I wrote the Tilemap API for Phaser 3 and created a ton of guided examples, but I wanted to collect all of that information into a more guided and digestible format so that people can more easily jump into Phaser 3. You can see more of my work and get in touch [here](https://www.mikewesthad.com/).
