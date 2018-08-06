# Post 4 Outline

This may need to be split up into two smaller posts - one on the initial matter & phaser setup and one on creating the platformer.

- Introduction
- What is matter.js
  - Cool examples
  - Matter vs Arcade
    - Complex bodies
    - More realistic physics
  - Phaser's thin wrapper
    - Invisible bodies
  - Matter Concepts
    - Friction, restitution, density, mass, etc.
    - Static bodies
    - Compound bodies
- Introduction to Matter
  - Understanding what's under the hood
  - No Phaser
  - Passing body properties
  - Simple bodies
  - Compound bodies
- Matter in Phaser
  - Load a map and creating matter bodies for it
  - Dropping shapes into it
  - Collision logic to kill bodies
    - Labels
    - Events
    - Going from body and tile body to game object and tile respectively
  - Debugging and drawing bodies
- Collision mapping with Tiled
  - Tileset collision editor to map colliding bodies
  - Simple shapes and compound shapes
  - Making the emoji's faces change on collision? -> Nope! There's a bug in phaser.
- Platformer 1
  - Creating a player that uses matter physics to move
    - Fixed rotation
  - Raycasting to detect the ground and jumping
    - Or, use sensors
- Platformer 2
  - Raycasting to detect walls and wall jumping
    - Or, use sensors
  - Collision logic to kill the player
- Ghost collisions
  - Using an object layer to map collisions
  - Hexus's plugin

## Examples

- Matter dropping shapes
- Loading up a tilemap and dropping shapes
- Mapping collisions in Tiled and dropping shapes
- Building a non-jumping platformer
- Building a jumping platformer with sensors
- Adding wall jumping
