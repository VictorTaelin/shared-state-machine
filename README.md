## Shared State Machine

A simple library for shared state-machines between client and server. It was designed to simplify developing web-apps. Client-server communication is often done through APIs, but, (i) designing APIs is laborous; (ii) calling the API in the middle of the application is an imperactive, state-mutating operation. Instead, `shared-state-machine` allows you to just define the logic of your app as an initial state and a transaction function. The library then takes care of creating the server, and letting the clients send transactions, and stay synched with the machine's state.

## Example: shared random-walk app

This demo implements a random-walk app. Its state is just a number, and it has only one transaction type, which adds a number to the state.

### 1. Install the lib

    npm install shared-state-machine

### 2. Specify the app

The app specification is just a combination of the initial state and the transaction function.

```javascript
const walkerApp = {
  init: 0,
  next: tx => state => tx + state
}
```

### 3. Start the master state-machine (i.e., the "server")

To start the server, you just need the App specification and a port.

```javascript
const ssm = require("shared-state-machine");

// Inits master machine
ssm.init(walkerApp, 7171).then(() =>
  console.log("Started master state machine."));
```

### 4. Play the state-machine remotely (i.e., the "clients")

To start a client, you just need the App specification and the server URL. It returns a state-machine object, which allows you to send a transaction with `ssm.act(tx)`, and to observe state changes with `ssm.get(state => ...)`.

```javascript
const ssm = require("shared-state-machine");

 // Plays the state machine remotely
ssm.play(app, "http://localhost:7171").then(ssm => {

  // When the state changes, prints it
  ssm.get(state => console.log("state: " + state));

  // Every second, add a random number to the state
  setInterval(() => ssm.act(Math.random() - 0.5), 1000);

});
```

## Implementation

The library is a very thin, 70-LOC file which depends on just another thin, 50-LOC library. It uses HTTP pooling for state replication, so, on the large scale, its performance could be improved using websockets.

## Conclusion

Whenever you have an application where each client has a view of the whole state of the app, and can act to change that state, then using `shared-state-machine` instead of designing an API might be the most robust way to go. It plays really well with React.
