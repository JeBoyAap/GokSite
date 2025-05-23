// Import Matter.js modules and set up the physics engine
const Engine = Matter.Engine;
const Render = Matter.Render;
const Runner = Matter.Runner;
const Bodies = Matter.Bodies;
const World = Matter.World;
const Body = Matter.Body;

// Create the Matter.js engine and world
const engine = Engine.create();
const world = engine.world;

const canvas = document.getElementById('falling-balls-canvas');

const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: 800,
    height: 600,
    wireframes: false,
    background: '#00a1e9'
  },
  canvas: canvas
});

// Start renderer
Render.run(render);

// Create and start runner
let lastTime = 0;
const timeStep = 1000 / 60;

function animate(time) {
  if (!lastTime) {
    lastTime = time;  
  }
  const delta = time - lastTime;

  if (delta >= timeStep) {
    Engine.update(engine, timeStep);
    lastTime = time;
  }  
  
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

createPlinkoGrid(
  8,    // Number of rows of pegs
  10,   // Number of pegs in the bottom (widest) row
  80,   // Horizontal spacing between pegs
  60,   // Vertical spacing between pegs
  40,   // Horizontal offset for the grid
  500   // Vertical offset for the grid
);

// Function to generate the Plinko peg grid
function createPlinkoGrid(rows, cols, spacingX, spacingY, offsetX, offsetY) {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols - row; col++) {
      const x = offsetX + col * spacingX + (row * spacingX) / 2;
      const y = offsetY + row * -spacingY;
      const peg = Matter.Bodies.circle(x, y, 6, {
        isStatic: true,
        label: 'peg',
        render: { fillStyle: 'white' }
      });
      Matter.World.add(world, peg);
    }
  }
}

//Create multipliers

const multiplierBar = Matter.Bodies.rectangle(render.canvas.width / 2, render.canvas.height, render.canvas.width, 20, {
  isStatic: true,
  label: 'multiplier',
  render: {fillStyle: 'white'}
});
Matter.World.add(world, multiplierBar);

engine.world.gravity.y = 0.4;

// Add a new ball at the mouse position when the user clicks the canvas
render.canvas.addEventListener('mousedown', function(event) {
  const rect = render.canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const ball = Bodies.circle(x, y, 15, {
    restitution: 0.9,
    density: 1,
    frictionAir: 0.02,
    label: 'ball',
    render: { fillStyle: 'orange' }
  });
  World.add(world, ball);
});

const BALL_GROUP = Body.nextGroup(true);
const spawnButton = document.getElementById('spawn-ball-button');

spawnButton.addEventListener('click', function() {
  const x = render.options.width / 2 + -30 + (Math.random() * 60);
  const y = -(Math.random() * 20);
  const ball = Bodies.circle(x, y, 15, {
    restitution: 0.9,
    density: 1,
    frictionAir: 0.02,
    label: 'ball',
    render: { fillStyle: 'orange' },
    collisionFilter: {
      group: BALL_GROUP
    }
  });
  World.add(world, ball);
});


// Ball speed limiting
const dampingFactor = 0.1;
const speedThreshold = 15;
const exponentialDrag = true;

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

Matter.Events.on(engine, 'collisionStart', function(event) {
  for (let pair of event.pairs) {
    const { bodyA, bodyB } = pair;

    if (bodyA.label === 'ball' && bodyB.label === 'multiplier') {
      console.log('Ball hit a multiplier!');
      Matter.World.remove(world, bodyA)
    }
    
    else if (bodyB.label === 'ball' && bodyA.label === 'multiplier') { 
      console.log('Ball hit a multiplier!');
      Matter.World.remove(world, bodyB)
    }
  }
});