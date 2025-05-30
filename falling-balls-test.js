// Import Matter.js modules
const Engine = Matter.Engine;
const Render = Matter.Render;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const World = Matter.World;
const Events = Matter.Events;
const Composite = Matter.Composite;

// Create the physics engine and world
const engine = Engine.create();
const world = engine.world;
world.gravity.y = 0.4;

// Set up canvas and renderer
const canvas = document.getElementById('falling-balls-canvas');

const render = Render.create({
  element: document.body,
  engine: engine,
  canvas: canvas,
  options: {
    width: 800,
    height: 600,
    wireframes: false,
    background: '#00a1e9'
  }
});

Render.run(render);

// Animation loop to update the engine
let lastTime = 0;
const frameInterval = 1000 / 60;

function runAnimation(time) {
  if (!lastTime) {
    lastTime = time;
  }

  const timeElapsed = time - lastTime;

  if (timeElapsed >= frameInterval) {
    Engine.update(engine, frameInterval);
    lastTime = time;
  }

  requestAnimationFrame(runAnimation);
}

requestAnimationFrame(runAnimation);

// Create pegs in a triangular Plinko grid
function createPegGrid(rowCount, bottomRowCount, spacingX, spacingY, startX, startY) {
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < bottomRowCount - row; col++) {
      const x = startX + col * spacingX + (row * spacingX) / 2;
      const y = startY - row * spacingY;

      const peg = Bodies.circle(x, y, 6, {
        isStatic: true,
        label: 'peg',
        render: { fillStyle: 'white' }
      });

      World.add(world, peg);
    }
  }
}

createPegGrid(8, 10, 80, 60, 40, 500);

// Create multiplier slots at the bottom
const multiplierValues = [7, 2, 1, 0.8, 0.5, 0.8, 1, 2, 7];
const multiplierColors = ['#ff9800', '#4caf50', '#2196f3', '#e91e63', '#9c27b0', '#e91e63', '#2196f3', '#4caf50', '#ff9800'];
const slotWidth = render.canvas.width / multiplierValues.length - 15;
const slotHeight = 50;
const slotY = render.canvas.height - slotHeight / 2;
const slots = [];

for (let i = 0; i < multiplierValues.length; i++) {
  const x = i * (slotWidth + 8) + slotWidth / 2 + 37;
  const value = multiplierValues[i];
  const color = multiplierColors[i % multiplierColors.length];

  const slot = Bodies.rectangle(x, slotY, slotWidth, slotHeight, {
    isStatic: true,
    label: 'multiplier',
    render: { fillStyle: color }
  });

  slot.multiplierValue = value;
  slots.push(slot);
  World.add(world, slot);
}

// Draw multiplier text
Events.on(render, 'afterRender', () => {
  const context = render.context;
  context.save();
  context.font = 'bold 24px Calibri';
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    context.fillStyle = '#222';
    context.fillText('x' + slot.multiplierValue, slot.position.x, slot.position.y);
  }

  context.restore();
});

// Handle mouse click to drop a ball
canvas.addEventListener('mousedown', function(event) {
  const canvasBounds = canvas.getBoundingClientRect();
  const x = event.clientX - canvasBounds.left;
  const y = event.clientY - canvasBounds.top;

  createBall(x, y);
});

// Handle button click to drop a ball
const spawnButton = document.getElementById('spawn-ball-button');
const BALL_GROUP = Body.nextGroup(true);

spawnButton.addEventListener('click', function() {
  const x = render.options.width / 2 + Math.random() * 60 - 30;
  const y = -Math.random() * 20;
  createBall(x, y);
});

// Function to create a new ball
function createBall(x, y) {
  const ball = Bodies.circle(x, y, 15, {
    restitution: 0.9,
    density: 1,
    frictionAir: 0.02,
    label: 'ball',
    render: { fillStyle: 'orange' },
    collisionFilter: { group: BALL_GROUP }
  });

  World.add(world, ball);
}

// Add drag to fast-moving balls to slow them down
const dragAmount = 0.1;
const maxSpeed = 10;
const useExponentialDrag = true;

Events.on(engine, 'beforeUpdate', function() {
  const bodies = Composite.allBodies(world);

  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];

    if (!body.isStatic && body.label === 'ball') {
      const vx = body.velocity.x;
      const vy = body.velocity.y;
      const speed = Math.sqrt(vx * vx + vy * vy);

      if (speed > 0.01) {
        let scale = 1;

        if (speed > maxSpeed) {
          const extraSpeed = speed - maxSpeed;
          scale = useExponentialDrag
            ? Math.exp(-dragAmount * extraSpeed)
            : 1 - dragAmount * (extraSpeed / speed);
          scale = Math.max(0.2, Math.min(scale, 1));
        }

        Body.setVelocity(body, {
          x: vx * scale,
          y: vy * scale
        });
      }
    }
  }
});

// Score tracking
let balance = 100;

Events.on(engine, 'collisionStart', function(event) {
  const pairs = event.pairs;

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const bodyA = pair.bodyA;
    const bodyB = pair.bodyB;

    let ball = null;
    let multiplier = null;

    if (bodyA.label === 'ball' && bodyB.label === 'multiplier') {
      ball = bodyA;
      multiplier = bodyB;
    } else if (bodyB.label === 'ball' && bodyA.label === 'multiplier') {
      ball = bodyB;
      multiplier = bodyA;
    }

    if (ball && multiplier) {
      balance += multiplier.multiplierValue - 1;
      console.log('Ball hit multiplier x' + multiplier.multiplierValue);
      console.log('Balance:', balance);

      World.remove(world, ball);
    }
  }
  //update balance display
  document.getElementById('balance-display').textContent = 'Balance: '+ balance.toFixed(2);

});
