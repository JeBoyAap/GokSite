// Plinko game using Matter.js
const { Engine, Render, Runner, Bodies, Composite } = Matter;

const width = 440; // Increased width
const height = 660; // Increased height
const pegRadius = 7;
const rows = 11; // Slightly more rows for bigger window
const cols = 10; // More columns for bigger window
const spacingX = width / cols;
const spacingY = 55;

// Create engine and world
const engine = Engine.create();
const world = engine.world;

// Create renderer
const render = Render.create({
    element: document.getElementById('plinko-container'),
    engine: engine,
    options: {
        width: width,
        height: height,
        wireframes: false,
        background: '#222'
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Create walls
const walls = [
    Bodies.rectangle(width / 2, height + 20, width, 40, { isStatic: true }), // floor
    Bodies.rectangle(-10, height / 2, 20, height, { isStatic: true }), // left wall
    Bodies.rectangle(width + 10, height / 2, 20, height, { isStatic: true }) // right wall
];
Composite.add(world, walls);

// Add vertical edge balls to push falling balls away from the walls
const edgeBallRadius = 16;
const edgeBallSpacing = spacingY;
for (let y = 80; y < height - 60; y += edgeBallSpacing) {
    // Left edge
    const leftEdgeBall = Bodies.circle(edgeBallRadius + 2, y, edgeBallRadius, {
        isStatic: true,
        render: { fillStyle: '#ff9800' }
    });
    // Right edge
    const rightEdgeBall = Bodies.circle(width - edgeBallRadius - 2, y, edgeBallRadius, {
        isStatic: true,
        render: { fillStyle: '#ff9800' }
    });
    Composite.add(world, [leftEdgeBall, rightEdgeBall]);
}

// Create pegs
for (let row = 0; row < rows - 1; row++) { // Only up to rows-2, so last row is omitted
    for (let col = 0; col < cols; col++) {
        // Offset every other row
        let x = col * spacingX + (row % 2 === 0 ? spacingX / 2 : 0);
        // Increase distance between last row and holes
        let y = 80 + row * spacingY;
        if (x > 0 && x < width) {
            const peg = Bodies.circle(x, y, pegRadius, {
                isStatic: true,
                render: { fillStyle: '#fff' }
            });
            Composite.add(world, peg);
        }
    }
}

// Create bins at the bottom
for (let i = 0; i <= cols; i++) {
    const bin = Bodies.rectangle(i * spacingX, height - 35, 10, 170, {
        isStatic: true,
        render: { fillStyle: '#888' }
    });
    Composite.add(world, bin);
}

// Score counter setup
let scores = Array(cols).fill(0);
let scoreDisplay = document.getElementById('scoreDisplay');
if (!scoreDisplay) {
    scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'scoreDisplay';
    scoreDisplay.style.margin = '10px auto';
    scoreDisplay.style.width = width + 'px';
    scoreDisplay.style.color = '#fff';
    scoreDisplay.style.fontSize = '20px';
    scoreDisplay.style.letterSpacing = '2px';
    scoreDisplay.style.textAlign = 'center';
    document.body.insertBefore(scoreDisplay, document.getElementById('plinko-container'));
}
function updateScoreDisplay() {
    scoreDisplay.innerHTML = scores.map((s, i) => `Bin ${i + 1}: ${s}`).join(' | ');
}
updateScoreDisplay();

// Detect balls entering bins and update score
Matter.Events.on(engine, 'afterUpdate', function() {
    const allBodies = Composite.allBodies(world);
    for (const body of allBodies) {
        if (body.label === 'Circle Body' && body.position.y > height - 100 && !body.isCounted) {
            // Determine which bin
            let binIdx = Math.floor(body.position.x / spacingX);
            if (binIdx < 0) binIdx = 0;
            if (binIdx >= cols) binIdx = cols - 1;
            scores[binIdx]++;
            updateScoreDisplay();
            body.isCounted = true;
        }
    }
});

// Drop ball on button click
const btn = document.getElementById('dropBallBtn');
if (btn) {
    btn.onclick = () => {
        const x = Math.random() * (width - 60) + 30; // Keep balls away from edges
        const ball = Bodies.circle(x, 20, 13, {
            restitution: 0.5,
            render: { fillStyle: '#4caf50' }
        });
        Composite.add(world, ball);
    };
}
