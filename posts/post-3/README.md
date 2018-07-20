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

## Outline

This one of the contributions to phaser labs that I had the most fun making, and it conveniently covers a lot of what we need :)

1.  Simple Phaser template version
2.  More complex version broken into better programming practices

## Dungeon

We're going to get a head start on generating a world by using a dungeon generator library, [mikewesthad/dungeon](https://github.com/mikewesthad/dungeon). It's my updated fork of [nickgravelyn/dungeon](https://github.com/nickgravelyn/dungeon) with a few new features that I wanted for the demo. It's a pretty simple, brute force dungeon generator. Using a few user supplied parameters, it progressively builds a dungeon room-by-room starting at the center of the map.

You can load the library via a [CDN](https://www.jsdelivr.com/package/npm/@mikewesthad/dungeon), by downloading the script, or through npm ([install instructions](https://github.com/mikewesthad/dungeon#installation)). Once you've got it loaded, you'll have a `Dungeon` class that you can use like this:

```js
const dungeon = new Dungeon({
  // The dungeon's grid size
  width: 40,
  height: 40,
  rooms: {
    // Random range for the width of a room
    width: {
      min: 5,
      max: 10
    },
    // Random range for the height of a room
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

## Up Next

Stay tuned.

**Insert sentence and GIF of next post here**

Let me know if there's something you'd like to see in future posts!

## About Me

I’m a creative developer & educator. I wrote the Tilemap API for Phaser 3 and created a ton of guided examples, but I wanted to collect all of that information into a more guided and digestible format so that people can more easily jump into Phaser 3. You can see more of my work and get in touch [here](https://www.mikewesthad.com/).
