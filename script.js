// view object taking care of all display related stuff
let view = {
  displayMessage: function(msg) {
    let messageArea = document.getElementById("messageArea");
    messageArea.innerHTML = msg;
  },
  displayHit: function(location) {
    let cell = document.getElementById(location);
    cell.setAttribute("class", "hit");
  },
  displayMiss: function(location) {
    let cell = document.getElementById(location);
    cell.setAttribute("class", "miss");
  }
};

// model object taking care of initial settings, and monitoring the progress of
// game
let model = {
  boardSize: 7,
  numShips: 3,
  shipLength: 3,
  shipsSunk: 0,
  ships: [
    { locations: [0, 0, 0], hits: ["", "", ""] },
    { locations: [0, 0, 0], hits: ["", "", ""] },
    { locations: [0, 0, 0], hits: ["", "", ""] }
  ],

  fire: function(guess) {
    for (let i = 0; i < this.numShips; i++) {
      let ship = this.ships[i];
      let index = ship.locations.indexOf(guess);

      if (ship.hits[index] === "hit") {
        view.displayMessage("Oops, you already hit that location!");
        return true;
      } else if (index >= 0) {
        ship.hits[index] = "hit"; //we have a hit!
        view.displayHit(guess);
        view.displayMessage("HIT!");
        if (this.isSunk(ship)) {
          view.displayMessage("You sank my Battleship!");
          this.shipsSunk++;
        }
        return true;
      }
    }
    view.displayMessage("You missed.");
    view.displayMiss(guess);
    return false;
  },

  isSunk: function(ship) {
    for (let i = 0; i < this.shipLength; i++) {
      if (ship.hits[i] !== "hit") {
        return false; // the battleship is yet not sunk
      }
    }
    return true; // yes battleship is sunk
  },

  generateShipLocations: function() {
    let locations;
    for (let i = 0; i < this.numShips; i++) {
      do {
        locations = this.generateShip();
      } while (this.collision(locations));

      this.ships[i].locations = locations;
    }
  },

  generateShip: function() {
    let direction = Math.floor(Math.random() * 2);
    let row, col;
    if (direction === 1) {
      row = Math.floor(Math.random() * this.boardSize);
      col = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
    } else {
      row = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
      col = Math.floor(Math.random() * this.boardSize);
    }
    let newShipLocations = [];

    for (let i = 0; i < this.shipLength; i++) {
      if (direction === 1) {
        newShipLocations.push(row + "" + (col + i));
      } else {
        newShipLocations.push(row + i + "" + col);
      }
    }
    return newShipLocations;
  },

  collision: function(locations) {
    // Two nested loops, outer one iterates over all the ships in model &
    // inner one iterate over all the new ship locations.
    for (let i = 0; i < this.numShips; i++) {
      let ship = model.ships[i];
      for (let j = 0; j < this.shipLength; j++) {
        if (ship.locations.indexOf(locations[j]) >= 0) {
          return true; // collision occured.
        }
      }
    }
    return false; //no collision
  }
};

// controller object to keep track of final thing and finish the game.
let controller = {
  guesses: 0,
  processGuess: function(guess) {
    let location = parseGuess(guess);
    if (location) {
      this.guesses++;
      let hit = model.fire(location);
      if (hit && model.shipsSunk === model.numShips) {
        view.displayMessage(
          "You sank all my battleships, in " + this.guesses + " guesses."
        );
      }
    }
  }
};

// Helper function (actually a callable object) for parsing the guess
function parseGuess(guess) {
  let lowerAlphabet = ["a", "b", "c", "d", "e", "f", "g"];

  let upperAlphabet = ["A", "B", "C", "D", "E", "F", "G"];

  if (guess === null || guess.length !== 2) {
    alert("Oops, please enter a letter and a number on the board.");
  } else {
    firstChar = guess.charAt(0);
    let row = 8;
    for (let i = 0; i < 7; i++) {
      if (firstChar == lowerAlphabet[i]) {
        row = lowerAlphabet.indexOf(firstChar);
        break;
      } else if (firstChar == upperAlphabet[i]) {
        row = upperAlphabet.indexOf(firstChar);
        break;
      }
    }

    let column = guess.charAt(1);

    if (isNaN(row) || isNaN(column)) {
      alert("Oops, that isn't on the board.");
    } else if (
      row < 0 ||
      row > model.boardSize ||
      column < 0 ||
      column > model.boardSize
    ) {
      alert("Oops, thats off the board.");
    } else {
      return row + column;
    }
  }
  return null;
}

// helper function (callable object) to start with the game
function init() {
  let fireButton = document.getElementById("fireButton");
  fireButton.onclick = handleFireButton;
  let guessInput = document.getElementById("guessInput");
  guessInput.onkeypress = handleKeyPress;

  model.generateShipLocations();
}

// helper event handling functions for handling the fire button and keyPress events

function handleFireButton() {
  let guessInput = document.getElementById("guessInput");
  let guess = guessInput.value;
  controller.processGuess(guess);
  guessInput.value = "";
}

//for most of the events associated with the document object model (DOM) you'll
//be passed an event object. Which is consisting of general and specific info
//pertaining to the event just happend,eg. keyCode.

function handleKeyPress(e) {
  let fireButton = document.getElementById("fireButton");
  if (e.keyCode === 13) {
    //keyCode property of event object tell which key
    fireButton.click(); //....pressed by user.
    return false;
  }
}
window.addEventListener("load", init, false); // to make sure browser run init after the page is loaded.
