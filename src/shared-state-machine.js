const servify = require("servify");
const fs = require("fs");
const path = require("path");

const init = app => port => dataDir => {
  let state = null;
  let log = [];

  // Inits state
  if (dataDir) {
    fs.readDirSync(dataDir).forEach(file => {
      state = app.next(tx)(state);
      log.push(tx);
    });
  } else {
    state = app.init;
  }
  
  // Starts serving shared state machine
  return servify.api(port, {

    // Receives a new transaction and saves it
    send: tx => {
      log.push(tx);
      state = app.next(tx)(state);
      if (dataDir) {
        const fileName = ("00000000" + index.toString(16)).slice(-8);
        const filePath = path.join(dataDir, fileName);
        fs.writeFileSync(filePath, JSON.stringify(tx));
      };
    },

    // Gives the user the current state, and number of transactions
    init: () => ({
      state: state,
      index: log.length}),

    // Gives the user all transactions since given index
    poll: since =>
      log.slice(since).map((tx, i) => ([since+i, tx]))

  }).then(() => play(app)("http://localhost:"+port));
}

const play = app => url => {
  const api = servify.at(url);

  // Gets the API initial state
  return api.init().then(({state, index}) => {
    let get = () => {};

    // Refreshes state pooling last logs
    setInterval(() => api.poll(index).then(txs => {
      for (let i = 0, l = txs.length; i < l; ++i) {
        if (txs[i][0] === index) {
          state = app.next(txs[i][1])(state);
          ++index;
        };
      };
      if (txs.length > 0)
        get(state);
    }), 400);

    return {
      get: callback => (get = callback, get(state)),
      act: tx => api.send(tx)
    };
  });
};

module.exports = {
  init: (a,b,c) => c ? init(a)(b)(c) : b ? init(a)(b)() : init(a),
  play: (a,b) => b ? play(a)(b) : play(a)
}
