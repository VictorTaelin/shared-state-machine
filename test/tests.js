const ssm = require("./../src/shared-state-machine.js");

// Demo app where a tx is just a number that is added to the state
const app = {
  init: 0,
  next: tx => state => tx + state
}

// Inits master machine
ssm.init(app, 7171).then(() =>
  console.log("Started master state machine."));


setTimeout(() => {

  // Plays the state machine remotely
  ssm.play(app, "http://localhost:7171").then(ssm => {

    // When the state changes, prints it
    ssm.get(state => console.log("state: " + state));

    // Every second, add a random number to the state
    setInterval(() => ssm.act(Math.random() - 0.5), 30);

  });

}, 500);



















