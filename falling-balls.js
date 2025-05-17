import { physicsConfig } from './falling-balls-config.js';

// Step 1: Create the physics engine
const Engine = Matter.Engine;
const Render = Matter.Render;
const Runner = Matter.Runner;
const Bodies = Matter.Bodies;
const World = Matter.World;

const engine = Engine.create();   // Makes the engine
const world = engine.world;      // The "universe" with all the stuff

// Step 2: Create a renderer (to show things on screen)
const canvas = document.getElementById('falling-balls-canvas');

// Fix: Remove 'position: fixed' from canvas in CSS for proper layout
// and set canvas width/height attributes to match Matter.js render size
canvas.width = 1000;
canvas.height = 800;

const render = Render.create({
  element: document.body,   // Show it in the web page body
  engine: engine,
  canvas: canvas,           // Use the existing canvas element
  options: {
    width: 1000,
    height: 800,
    wireframes: false,       // Show shapes filled in (not just outlines)
    background: '#00a1e9'
  }
});

Render.run(render);   // Start rendering

// Step 3: Create the runner (so things move over time)
const runner = Runner.create();
Runner.run(runner, engine);

// 4. Add ground
//const ground = Bodies.rectangle(400, 590, 810, 60, { isStatic: true });
//World.add(world, ground);

createPlinkoGrid(
  8,         // rows
  10,         // pins in bottom row (or widest row)
  80,        // spacingX
  60,        // spacingY
  40,        // offsetX
  500        // offsetY
);

function createPlinkoGrid(rows, cols, spacingX, spacingY, offsetX, offsetY) {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols - row; col++) {
      const x = offsetX + col * spacingX + (row * spacingX) / 2;
      const y = offsetY + row * -spacingY;

    const peg = Matter.Bodies.circle(x, y, physicsConfig.pin.radius, {
        isStatic: physicsConfig.pin.isStatic,
        friction: physicsConfig.pin.friction,
        render: physicsConfig.pin.render
      });

      Matter.World.add(world, peg);
    }
  }
}

    // 5. Handle click to spawn ball
render.canvas.addEventListener("mousedown", function(event) {
const rect = render.canvas.getBoundingClientRect();  // Get canvas position
const x = event.clientX - rect.left;
const y = event.clientY - rect.top;

const ball = Bodies.circle(x, y, physicsConfig.ball.radius, {
  restitution: physicsConfig.ball.restitution,
  mass: physicsConfig.ball.mass,
  frictionAir: physicsConfig.ball.frictionAir,
  friction: physicsConfig.ball.friction,
  label: 'ball',
  render: physicsConfig.ball.render
});

World.add(world, ball);
});


const { dampingFactor, speedThreshold, exponentialDrag } = physicsConfig.speedLimit;

Matter.Events.on(engine, 'beforeUpdate', () => {
  const allBodies = Matter.Composite.allBodies(world);

  allBodies.forEach(body => {
    if (!body.isStatic && body.label === 'ball') {
      const vx = body.velocity.x;
      const vy = body.velocity.y;
      const speed = Math.sqrt(vx * vx + vy * vy);

      if (speed > 0.01) {
        let scale = 1;

        if (speed > speedThreshold) {
          const excessSpeed = speed - speedThreshold;
          scale = exponentialDrag
            ? Math.exp(-dampingFactor * excessSpeed)
            : 1 - dampingFactor * (excessSpeed / speed);

          scale = Math.max(0.2, Math.min(scale, 1));
        }

        Matter.Body.setVelocity(body, {
          x: vx * scale,
          y: vy * scale
        });
      }
    }
  });
});