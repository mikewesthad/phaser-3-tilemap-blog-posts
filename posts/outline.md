# Tilemap API Tour

3-part blog post plan

## Part 1: Static Maps

Target audience: newbies to Phaser and devs moving from v2 to v3
Goal: walking around an AP physics map

- Me & my role in phaser
- Overview
- What is phaser?
- Basic Phaser 3 template
- What is a tilemap?
- Map from 2D array (tileset and indices)
- Map from CSV
- Tiled introduction
- Loading a Tiled map
- Physics
  - Engine choices
  - Config
  - Marking collisions by index
  - Marking collision by Tiled property
  - Player controls
- Addendum on tile bleeding

## Part 2: Dynamic Maps

- Review of terminology
- Static vs dynamic layers
  - Static for speed
  - Dynamic for flexibility
- Dynamic layers
- Blank layers
- Converting dynamic to static
- Getting tiles at a location: within shape, under pointer (world XY)
- Modification: randomize, shuffle, swap, put, fill, remove, copy
- Tile access
- Finish with dungeon generator

Load a Tiled map and modify it
  Collect the coins? Disappearing platforms?
  Platformer where you paint tiles under the mouse

Dungeon generator load props from Tiled
copy, random

To fit in:

- Limitations
- Static layer warnings

## Part 3: Physics

- Setting colliding: by index, by property
- Physics: matter, impact
- Impact collision defs
- Collision shapes
- Finding objects
- Finish with matter platformer

## Extra

- API overview
- Mention Weltmeister?
- What is a null tile?
- Map vs layer & multiple layers & changing layers
- Mixing tile sizes: base tile vs tile size
- Recalculating faces – AP physics
- Create from objects? Create from tiles?
- Getting tileset properties
- Error on static calls

## API

Checking tiles:

- HasTileAt, HasTileAtWorldXY

Getting tiles:

- GetTileAt, GetTileAtWorldXY
- GetTilesWithin, GetTilesWithinWorldXY
- FilterTiles
- GetTilesWithinShape
- FindByIndex
- FindTile
- ForEachTile

Changing tiles:

- PutTileAt, PutTileAtWorldXY
- PutTilesAt
- Randomize, WeightedRandomize
- RemoveTileAt, RemoveTileAtWorldXY
- ReplaceByIndex
- Shuffle
- SwapByIndex

Collision flags:

- SetCollision
- SetCollisionBetween
- SetCollisionByExclusion
- SetCollisionByProperty
- SetCollisionFromCollisionGroup

SetTileIndexCallback
SetTileLocationCallback

TileToWorldX, TileToWorldY, TileToWorldXY & reverse

filterObjects, findObject
