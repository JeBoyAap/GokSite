// physicsConfig.js

export const physicsConfig = {
  ball: {
    radius: 15,
    restitution: 1.0,       // Elasticiteit van de bal
    mass: 0.1,              // Hoe zwaar de bal is
    frictionAir: 0.02,      // Luchtweerstand
    friction: 0.01,         // Wrijving bij contact
    render: {
      fillStyle: 'gray'
    }
  },

  pin: {
    radius: 6,
    friction: 0.05,
    isStatic: true,
    render: {
      fillStyle: 'white'
    }
  },

  speedLimit: {
    dampingFactor: 0.02,       // Hoe sterk snelheid wordt afgeremd
    speedThreshold: 10,        // Vanaf welke snelheid we dempen
    exponentialDrag: true      // Of we exponentieel afremmen
  }
};