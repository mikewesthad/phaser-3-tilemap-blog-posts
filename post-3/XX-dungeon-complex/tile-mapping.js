// Mapping from tile name to index(/indices) to make the code more readable
const TILE_MAPPING = {
  WALL: {
    TOP_LEFT: 3,
    TOP_RIGHT: 4,
    BOTTOM_RIGHT: 23,
    BOTTOM_LEFT: 22,
    TOP: [
      { index: 39, weight: 4 },
      { index: 57, weight: 1 },
      { index: 58, weight: 1 },
      { index: 59, weight: 1 }
    ],
    LEFT: [
      { index: 21, weight: 4 },
      { index: 76, weight: 1 },
      { index: 95, weight: 1 },
      { index: 114, weight: 1 }
    ],
    RIGHT: [
      { index: 19, weight: 4 },
      { index: 77, weight: 1 },
      { index: 96, weight: 1 },
      { index: 115, weight: 1 }
    ],
    BOTTOM: [
      { index: 1, weight: 4 },
      { index: 78, weight: 1 },
      { index: 79, weight: 1 },
      { index: 80, weight: 1 }
    ]
  },
  DOOR: {
    TOP: [40, 6, 38],
    LEFT: [[40], [6], [2]],
    BOTTOM: [2, 6, 0],
    RIGHT: [[38], [6], [0]]
  },
  FLOOR: [
    { index: 6, weight: 20 },
    { index: 7, weight: 1 },
    { index: 8, weight: 1 },
    { index: 26, weight: 1 }
  ],
  CHEST: 166,
  STAIRS: 81,
  TOWER: [[186], [205]],
  POT: [
    { index: 13, weight: 1 },
    { index: 32, weight: 1 },
    { index: 51, weight: 1 }
  ]
};

export default TILE_MAPPING;