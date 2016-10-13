const SHEEP_CHANCE = 4;

function pickSquareType() {
  let number = Math.floor(Math.random() * SHEEP_CHANCE) + 1;
  if (number === 1) {
    return SheepSquare;
  } else {
    return GrassSquare;
  }
}

class GridOfSquares {
  constructor(height, width) {
    this.height = height;
    this.width = width;

    this.rows = [];
    this.squares = [];

    for (let y = 0; y < height; y++) {
      let row = [];

      for (let x = 0; x < width; x++) {
        let squareType = pickSquareType();
        let square = new squareType(this, x, y, this.squares.length + 1);

        row.push(square);
        this.squares.push(square);
      }

      this.rows.push(row);
    }
  }

  getSquareAt([x, y]) {
    try {
      return this.rows[y][x];
    } catch (e) {
      return undefined;
    }
  }

  countSheepSquaresAdjacentTo(square) {
    let sheepCount = 0;

    for (let directionCombo of SHEEP_LOOKUP_DIRECTIONS) {

      let coords = [square.x, square.y];

      for (let letter of directionCombo) {
        coords = DIRECTION_MOVEMENTS[letter](coords);
      }

      let adjacentSquare = this.getSquareAt(coords);

      if (adjacentSquare instanceof SheepSquare) {
        sheepCount += 1;
      }
    }
    return sheepCount;
  }
}

class Square {
  constructor(grid, x, y, key) {
    this.key = key;
    this.grid = grid;
    this.x = x;
    this.y = y;
    this.exposed = false;

    this.expose = this.expose.bind(this);
  }

  expose() {
    if (!this.exposed) {
      this.exposed = true;
      return this.handleExposure();
    } else {
      return;
    }
  }
}

class GrassSquare extends Square {
  get type() {
    return '🌱';
  }
  handleExposure() {
    let adjacentSheep = this.grid.countSheepSquaresAdjacentTo(this);
    if (adjacentSheep < 7) {
      if (adjacentSheep === 0 || Math.floor(Math.random() * 2) !== 0) {
        for (let directionCombo of GRASS_EXPLORATION_DIRECTIONS) {
          exploreGrass(directionCombo, this, this.grid);
        }
      }
    }
  }
}

class SheepSquare extends Square {
  get type() {
    return '🐑';
  }
  handleExposure() {
    for (let square of this.grid.squares) {
      if (square instanceof SheepSquare) {
        square.expose();
      }
    }
  }
}

// Automatic grass exploration

function exploreGrass(inDirection, fromSquare, ofGrid) {
  let coords = [fromSquare.x, fromSquare.y];

  for (let letter of inDirection) {
    coords = DIRECTION_MOVEMENTS[letter](coords);
  }

  let nextSquare = ofGrid.getSquareAt(coords);
  if (!nextSquare || nextSquare.exposed) {
    return;
  }

  if (nextSquare instanceof SheepSquare) {
    return;
  }

  return nextSquare.expose();

  /*
  if (ofGrid.countSheepSquaresAdjacentTo(nextSquare) < 4) {
    return;
  } else {
    return;
  }
  */
}

const SHEEP_LOOKUP_DIRECTIONS = new Set([
  'NW',
  'N',
  'NE',
  'E',
  'SE',
  'S',
  'SW',
  'W',
]);

const GRASS_EXPLORATION_DIRECTIONS = new Set([
  'N',
  'E',
  'S',
  'W',
]);

const DIRECTION_MOVEMENTS = {
  'E': ([x, y]) => [x + 1, y],
  'S': ([x, y]) => [x, y + 1],
  'W': ([x, y]) => [x - 1, y],
  'N': ([x, y]) => [x, y - 1],
};

export default GridOfSquares;