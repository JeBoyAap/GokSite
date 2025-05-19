// Import Matter.js modules and set up the physics engine
const Engine = Matter.Engine;
const Render = Matter.Render;
const Runner = Matter.Runner;
const Bodies = Matter.Bodies;
const World = Matter.World;
const Body = Matter.Body;

// Create the Matter.js engine and world (the simulation environment)
const engine = Engine.create();
const world = engine.world;

// Get the canvas element from the HTML to use for rendering
const canvas = document.getElementById('falling-balls-canvas');

// Set up the renderer to display the simulation on the canvas
const render = Render.create({
  element: document.body, // Attach the renderer to the body
  engine: engine,
  options: {
    width: 800,
    height: 600,
    wireframes: false, // Render filled shapes instead of wireframes
    background: '#00a1e9'
  },
  canvas: canvas // Use the existing canvas element
});

// Start the renderer to display the simulation
Render.run(render);

// Create and start the runner to advance the simulation over time
const runner = Runner.create();
Runner.run(runner, engine);



// Create the grid of static pegs for the Plinko board
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
        render: { fillStyle: 'white' }
      });
      Matter.World.add(world, peg);
    }
  }
}

//Create multipliers

const multiplierBar = Matter.Bodies.rectangle(render.canvas.width / 2, render.canvas.height, render.canvas.width, 20, {
  isStatic: true,
  render: {fillStyle: 'white'}
});
Matter.World.add(world, multiplierBar)


// Set gravity for the simulation (controls how fast balls fall)
engine.world.gravity.y = 0.4; // Try values between 0.2 and 0.6 for different effects

// Add a new ball at the mouse position when the user clicks the canvas
render.canvas.addEventListener('mousedown', function(event) {
  const rect = render.canvas.getBoundingClientRect(); // Get canvas position on screen
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const ball = Bodies.circle(x, y, 15, {
    restitution: 0.9, // Bounciness
    density: 1,
    frictionAir: 0.02,
    label: 'ball',
    render: { fillStyle: 'orange' }
  });
  World.add(world, ball);
});


const BALL_GROUP = Body.nextGroup(true); // negative group for non-colliding within group
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
      group: BALL_GROUP // Balls in the same group will not collide with each other
    }
  });

  World.add(world, ball);
});


// Parameters for limiting ball speed (drag/damping)
const dampingFactor = 0.1;   // How strong the drag is
const speedThreshold = 10;   // Speed above which drag is applied
const exponentialDrag = true; // Use exponential drag if true, linear if false

// Apply drag to balls that are moving too fast before each simulation update
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
          // Use exponential or linear drag depending on the toggle
          scale = exponentialDrag
            ? Math.exp(-dampingFactor * excessSpeed)
            : 1 - dampingFactor * (excessSpeed / speed);
          scale = Math.max(0.2, Math.min(scale, 1)); // Clamp scale between 0.2 and 1

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





if (Matter.Collision.collides(a, b) != null) {
  
}