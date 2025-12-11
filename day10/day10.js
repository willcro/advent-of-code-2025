// part 1

const text = await Deno.readTextFile("./input.txt");
const lines = text.split("\n");
const regex = /^\[([.#]+)\] ([()0-9, ]*) {([0-9,]+)}$/
const buttonRegex = /\(([0-9,]+)\)/g;

function buttonToBitmap(buttons) {
  return buttons.map(button => button.map(light => Math.pow(2, light)).reduce((a,b) => a + b, 0));
}

const machines = lines.map(line => regex.exec(line)).map(it => {
  return {
    startingPattern: 0,
    desiredPattern: Number.parseInt(it[1].replaceAll(".", "0").replaceAll("#", "1").split("").reverse().join(""), 2),
    buttonsBitmaps: buttonToBitmap([...it[2].matchAll(buttonRegex)].map(it => it[1].split(",").map(it => it * 1))),
    buttons: [...it[2].matchAll(buttonRegex)].map(it => it[1].split(",").map(it => it * 1)),
    joltages: it[3].split(",").map(it => it * 1)
  }
});

function add(matrix, result, coefficient, rowToAdd, rowAddedTo) {
  const adder = matrix[rowToAdd].map(it => it.times(coefficient));
  const newRow = matrix[rowAddedTo].map((it, i) => it.add(adder[i]));
  matrix[rowAddedTo] = newRow;
  result[rowAddedTo] = result[rowAddedTo].add(coefficient.times(result[rowToAdd]));
}

function divide(matrix, result, row, quotient) {
  matrix[row] = matrix[row].map(it => it.divide(quotient));
  result[row] = result[row].divide(quotient);
}

class Rational {
  constructor(numerator, denominator) {
    this.numerator = numerator;
    this.denominator = denominator;
    this.reduce()
  }

  add(other) {
    return new Rational((this.numerator * other.denominator) + (other.numerator * this.denominator), this.denominator * other.denominator);
  }

  divide(other) {
    return new Rational(this.numerator * other.denominator, this.denominator * other.numerator);
  }

  times(other) {
    return new Rational(this.numerator * other.numerator, this.denominator * other.denominator);
  }

  isWholeNumber() {
    return this.numerator % this.denominator == 0;
  }

  getInteger() {
    if (this.numerator % this.denominator == 0) {
      return this.numerator / this.denominator;
    }
    console.log("not int")
    throw "Not a whole number";
  }

  isNegative() {
    return this.numerator < 0 
  }

  isZero() {
    return this.numerator == 0;
  }

  reduce() {
    if (this.denominator < 0) {
      this.denominator = this.denominator * -1;
      this.numerator = this.numerator * -1;
    }
    let div = gcd(Math.abs(this.numerator), Math.abs(this.denominator));
    this.numerator = this.numerator / div;
    this.denominator = this.denominator / div;
  }

  toString() {
    if (this.denominator == 1) {
      return `${this.numerator}`;
    }
    return `${this.numerator}/${this.denominator}`;
  }
}

function printMatrix(matrix) {
  console.log(matrix.map(row => row.map(cell => cell.toString())))
}

function gcd(a, b) {
  if (b === 0) {
    return a;
  }
  return gcd(b, a % b);
}

function solve(matrix, result) {
  let x = 0;
  let y = 0;
  let m = matrix.length;
  let n = matrix[0].length;
  
  let pivots = [];

  // put into echelon form
  while (x < n && y < m) {
    // printMatrix(matrix)
    // console.log(x, y);
    if (matrix[y][x].isNegative()) {
      divide(matrix, result, y, new Rational(-1, 1));
    }
    for (let i = y + 1; i < m; i++) {
      const parity = matrix[i][x].isNegative() ? new Rational(-1, 1) : new Rational(1, 1);
      add(matrix, result, parity, i, y);
    }

    // console.log("after add")
    // printMatrix(matrix)


    if (matrix[y][x].isZero()) {
      x++
      continue;
    }

    divide(matrix, result, y, matrix[y][x]);

    // console.log("after divide")
    // printMatrix(matrix)

    for (let i = y + 1; i < m; i++) {
      add(matrix, result, matrix[i][x].times(new Rational(-1, 1)), y, i);
    }

    // console.log("after second add")
    // printMatrix(matrix)

    pivots.push({x,y});
    y++;
    x++
  }

  // reduced row echelon form
  pivots.toReversed().forEach(pivot => {
    for (let i = pivot.y - 1; i >= 0; i--) {
      add(matrix, result, matrix[i][pivot.x].times(new Rational(-1, 1)), pivot.y, i);
    }
  })

  console.log("in echelon form")
  printMatrix(matrix);

  console.log(result.map(it => it.toString()))

  if (result.some(it => it.isNegative() || !it.isWholeNumber())) {
    throw "Unsolvable";
  }

  if (pivots.length < result.filter(it => it != 0).length) {
    throw "Unsolvable";
  }




  return {matrix, result, pivots};
}


function createZeroMatrix(m, n) {
  return [...Array(m)].map(it => [...Array(n)].map(it => new Rational(0, 1)));
}

function attemptPart2(machine, guess) {
  const buttons = machine.buttons
  const matrix = createZeroMatrix(machine.joltages.length + 1, buttons.length);
  buttons.forEach((button, x) => button.forEach((it) => matrix[it][x] = new Rational(1, 1)));

  matrix[matrix.length - 1] = matrix[matrix.length - 1].map(it => new Rational(1, 1));

  let result = machine.joltages.map(it => new Rational(it, 1));
  result.push(new Rational(guess, 1));
  let out = solve(matrix, result).result.reduce((a,b) => a.add(b), new Rational(0, 1)).getInteger();
  return out;
}

function part2(machine) {
  let min = machine.joltages.reduce((a,b) => Math.max(a,b), -Infinity);
  let max = machine.joltages.reduce((a,b) => a + b, 0);
  for (let guess = min; guess <= max; guess++) {
    try {
      console.log(guess)
      const out = attemptPart2(machine, guess);
      return out;
    } catch (ex) {
      if (ex != "Unsolvable") {
        throw ex;
      }
    }
  }

}


// console.log(solve(matrix, result));

// console.log(machines.map(it => part2(it)));
// console.log(attemptPart2(machines[0], 10))
// console.log(attemptPart2(machines[14], 300))
console.log(part2(machines[14]))

// console.log(gcd(1,1))
