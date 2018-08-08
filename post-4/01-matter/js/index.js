/**
 * Author: Michael Hadley, mikewesthad.com
 */

// Matter is structured around modules that contain object creation factories and methods that can
// manipulate those objects - e.g. Body.create and Body.applyForce
const { Engine, Render, World, Bodies, Body } = Matter;

// A few math/random helpers
const DEGREES_TO_RADIANS = Math.PI / 180;
const randomInRange = (min, max) => Math.random() * (max - min) + min;
const randomIntInRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// Create a matter physics simulation engine and a debugging canvas renderer. We won't need to do
// this ourselves when working with Phaser later.
const engine = Engine.create();
const render = Render.create({
  element: document.getElementById("game-container"),
  engine: engine,
  options: {
    width: 800,
    height: 600,
    wireframes: false,
    background: "#f4f4f8"
  }
});

// Create some simple physics bodies, horizontally centered & above the top edge of the canvas. The
// last parameter allows you override any of the default body properties. E.g. here we define
// different frictions (resistance between surfaces sliding against one another) and restitution
// (bounciness) for the bodies.
const rectangle = Bodies.rectangle(400, -450, 120, 80, { friction: 1, restitution: 0.25 });
const circle = Bodies.circle(400, -300, 50, { friction: 0, restitution: 1 });
const triangle = Bodies.polygon(400, -150, 3, 50, { friction: 0, restitution: 0.5 });

// Create a cross-shaped compound body that is composed of two rectangle bodies joined together
const verticalPart = Bodies.rectangle(400, 0, 100, 50);
const horizontalPart = Bodies.rectangle(400, 0, 50, 100);
const cross = Body.create({
  parts: [verticalPart, horizontalPart],
  friction: 0,
  restitution: 1
});

// Create slippery, static floors and walls. The walls are positioned off screen. A static body
// can't move or rotate.
const floor = Bodies.rectangle(400, 575, 800, 50, { isStatic: true, friction: 0 });
const leftWall = Bodies.rectangle(-25, 400, 50, 800, { isStatic: true, friction: 0 });
const rightWall = Bodies.rectangle(825, 400, 50, 800, { isStatic: true, friction: 0 });

// Create some bouncy, static obstacles in the world for our bodies to ricochet off of
const obstacle1 = Bodies.circle(150, 200, 85, { isStatic: true, friction: 0, restitution: 1 });
const obstacle2 = Bodies.polygon(400, 400, 3, 75, {
  isStatic: true,
  angle: 90 * DEGREES_TO_RADIANS,
  friction: 0,
  restitution: 1
});
const obstacle3 = Bodies.circle(650, 200, 85, { isStatic: true, friction: 0, restitution: 1 });

// Bodies won't do anything unless they are added to the world
World.add(engine.world, [
  rectangle,
  triangle,
  circle,
  cross,
  floor,
  obstacle1,
  obstacle2,
  obstacle3,
  leftWall,
  rightWall
]);

// Listen for mouse presses on the canvas and add a bunch of new bodies to the world
document.querySelector("canvas").addEventListener("mousedown", () => {
  for (let i = 0; i < 5; i++) {
    const x = randomInRange(50, 750);
    const y = randomInRange(0, 50);
    const radius = randomInRange(25, 50);
    const sides = randomIntInRange(3, 6);
    const body = Bodies.polygon(x, y, sides, radius, {
      friction: 0,
      restitution: 0.5
    });
    World.add(engine.world, body);
  }
});

// Kick off the simulation and the render loops
Engine.run(engine);
Render.run(render);
