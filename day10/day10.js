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

function part1(machine) {
  let best = Infinity;
  for (let i = 0; i < Math.pow(2, machine.buttons.length); i++) {
    const bitmap = i.toString(2).padStart(machine.buttons.length, "0").split("");
    const buttonIds = bitmap.map((it,j) => it == "1" ? j : null).filter(it => it != null);
    const option = buttonIds.map(it => machine.buttonsBitmaps[it]).reduce((a, b) => a ^ b, 0);
    if (option == machine.desiredPattern && buttonIds.length < best) {
      best = buttonIds.length;
    }
  }

  return best;
}

console.log(machines.map(part1).reduce((a,b) => a + b, 0));

// part 2

/*
This solution may be insanely overcomplicated. It also only gives the correct answer about 50%
of the time. 10% of the time it fails, and 40% of the time it is off by 1. Oh well. It has been
a long time since linear algebra class, and I challenged myself to not look up too much.
I apologize if I use some words wrong.

For each machine
1. Attempt to find any solution to the problem using linear algebra
  1. Create matrix
  2. Put into echelon form
  3. Put into reduced row echelon form
  4. Extract solution
2. If solution is not whole numbers, shuffle the button order and return to step 1
3. Find possible reductions
  1. Try every combination of 3+ buttons to see if the are not linearly independent.
  2. If they are linearly dependent, record their ratios.
4. Apply reductions to try to get rid of negative numbers
5. Apply reductions to try to lower numbers
6. Repeat entire process a couple times while shuffling to see if that is the best solution

For some reason, row 70 of my input would just not cooperate, and I was too tired to figure out
why. I just gave up and added step 6.
*/

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
  console.log(matrix.map(row => row.map(cell => cell.toString()).join("\t")).join("\n"))
}

function gcd(a, b) {
  if (b === 0) {
    return a;
  }
  return gcd(b, a % b);
}

function lcm(a, b) {
  return Math.abs(a) * Math.abs(b) / gcd(a, b);
}

function lcmAll(arr) {
  return arr.reduce((a,b) => lcm(a, b), 1);
}

function reduce(matrix, result, pivots) {
  const matrixCopy = matrix.map(row => row.map(cell => cell));
  const resultCopy = result.map(it => it);

  pivots.toReversed().forEach(pivot => {
    divide(matrixCopy, resultCopy, pivot.y, matrixCopy[pivot.y][pivot.x]);
    for (let i = pivot.y - 1; i >= 0; i--) {
      add(matrixCopy, resultCopy, matrix[i][pivot.x].times(new Rational(-1, 1)), pivot.y, i);
    }
  });

  return {matrix: matrixCopy, result: resultCopy, pivots};
}

function solve(matrix, result) {
  let x = 0;
  let y = 0;
  let m = matrix.length;
  let n = matrix[0].length;
  
  let pivots = [];

  // put into echelon form
  while (x < n && y < m) {
    if (matrix[y][x].isNegative()) {
      divide(matrix, result, y, new Rational(-1, 1));
    }
    for (let i = y + 1; i < m; i++) {
      const parity = matrix[i][x].isNegative() ? new Rational(-1, 1) : new Rational(1, 1);
      add(matrix, result, parity, i, y);
    }

    if (matrix[y][x].isZero()) {
      // pivots.push({x: x, y: y - 1});
      x++;
      continue;
    }

    divide(matrix, result, y, matrix[y][x]);

    for (let i = y + 1; i < m; i++) {
      add(matrix, result, matrix[i][x].times(new Rational(-1, 1)), y, i);
    }

    pivots.push({x,y});
    y++;
    x++
  }
  
  pivots.toReversed().forEach(pivot => {
    divide(matrix, result, pivot.y, matrix[pivot.y][pivot.x]);
    for (let i = pivot.y - 1; i >= 0; i--) {
      add(matrix, result, matrix[i][pivot.x].times(new Rational(-1, 1)), pivot.y, i);
    }
  });

  const strayResults = result.slice(pivots.length).filter(it => !it.isZero()).length;
  if (strayResults > 0) {
    throw "Unsolvable";
  }

  return {pivots: pivots, result: result.slice(0, pivots.length)};
}

function convertAndSolve(matrix, result) {
  const rationalMatrix = matrix.map(row => row.map(cell => new Rational(cell, 1)));
  const rationalResult = result.map(it => new Rational(it, 1));
  return solve(rationalMatrix, rationalResult);
}

function createZeroMatrix(m, n) {
  return [...Array(m)].map(it => [...Array(n)].map(it => new Rational(0, 1)));
}

function solveMachine(machine) {
  const buttons = machine.buttons;
  const matrix = createZeroMatrix(machine.joltages.length, buttons.length);
  buttons.forEach((button, x) => button.forEach((it) => matrix[it][x] = new Rational(1, 1)));

  let result = machine.joltages.map(it => new Rational(it, 1));
  let solution = solve(matrix, result);

  if (solution.result.some(it => !it.isWholeNumber())) {
    return null;
  }

  const reductions = findReductions(machine);
  const formattedSolution = [...Array(machine.buttons.length)].map(it => it = 0);
  solution.pivots.forEach((pivot, i) => formattedSolution[pivot.x] = solution.result[i].getInteger());

  return reduceSolution(formattedSolution, reductions);
}

function reduceSolution(solution, reductions) {
  // get rid of negatives
  let negativeness = solution.filter(it => it < 0).reduce((a,b) => a + b, 0);
  while (negativeness < 0) {
    let bestNegtiveness = -Infinity;
    let bestSolution = solution;
    for (let rid = 0; rid < reductions.length; rid++) {
      const reduction = reductions[rid];
      const option = solution.map((it, i) => it + reduction[i]);
      const optionNegativeness = option.filter(it => it < 0).reduce((a,b) => a + b, 0);
      if (optionNegativeness > bestNegtiveness) {
        bestNegtiveness = optionNegativeness;
        bestSolution = option;
      }
    }

    if (bestNegtiveness <= negativeness) {
      throw "Stuck in negative";
    }

    solution = bestSolution;
    negativeness = bestNegtiveness;
  }

  let totalPresses = solution.reduce((a,b) => a + b, 0);
  while (true) {
    let bestPresses = totalPresses;
    let bestSolution = solution;
    for (let rid = 0; rid < reductions.length; rid++) {
      const reduction = reductions[rid];
      const option = solution.map((it, i) => it + reduction[i]);
      const optionPresses = option.reduce((a,b) => a + b, 0);
      const optionNegativeness = option.filter(it => it < 0).reduce((a,b) => a + b, 0);
      if (optionPresses < bestPresses && optionNegativeness == 0) {
        bestPresses = optionPresses;
        bestSolution = option;
      }
    }

    if (bestPresses == totalPresses) {
      return solution;
    }

    totalPresses = bestPresses;
    solution = bestSolution;
  }

  return solution;
}

const MAX_SHUFFLES = 10;
function scrambleAndSolve(machine) {
  for (let i = 0; i < MAX_SHUFFLES; i++) {
    machine.buttons = machine.buttons.sort((a,b) => Math.random() - 0.5);
    
    let result = solveMachine(machine);
    
    if (result != null) {
      return result;
    }
    

  }
  return null;
}

export function findReductions(machine) {
  const out = [];
  for (let i = 0; i < Math.pow(2, machine.buttons.length); i++) {
    const bitmap = i.toString(2).padStart(machine.buttons.length, "0").split("");
    const buttonIds = bitmap.map((it,j) => it == "1" ? j : null).filter(it => it != null);
    if (buttonIds.length < 3) {
      continue;
    }
    const result = [...Array(machine.joltages.length)].map(it => new Rational(0, 1));
    machine.buttons[buttonIds[0]].forEach(it => result[it] = new Rational(1, 1));

    const rest = buttonIds.slice(1);
    const matrix = createZeroMatrix(machine.joltages.length, rest.length);

    rest.forEach((buttonId, j) => machine.buttons[buttonId].forEach(it => matrix[it][j] = new Rational(1, 1)));

    try {
      const solution = solve(matrix, result).result;

      if (solution.some(it => it.isZero()) || solution.length < rest.length) {
        continue;
      }

      const solutionLcm = lcmAll(solution.map(it => it.denominator));
      const reducedSolution = solution.map(it => it.times(new Rational(solutionLcm, 1)).getInteger());
      const reduction = [...Array(machine.buttons.length)].map(it => 0);
      rest.forEach((r, j) => {
        reduction[r] = reducedSolution[j];
      });

      reduction[buttonIds[0]] = -solutionLcm;
      out.push(reduction);
      out.push(reduction.map(it => it * -1));
    } catch (ex) {

    }
  }
  return out;
}

function checkSolution(machine, solution) {
  const joltages = machine.joltages.map(it => 0);
  machine.buttons.forEach((button, i) => {
    button.forEach(it => {
      joltages[it] += solution[i];
    })
  });

  let match = joltages.every((j, i) => machine.joltages[i] == j);

  if (!match) {
    throw "bad solution";
  }
}

// console.log(machines.map(it => scrambleAndSolve(it)).forEach((it, i) => {
//   if (it == undefined) {
//     console.log(i);
//   }
// }))

// console.log(checkSolution(machines[1], [ 2, 5, 1, 0, 3, 0 ]))

// console.log(solveMachine(machines[0]))

const finalResult = machines.map((machine, id) => {
  // console.log("solving " + id);
  const solution = scrambleAndSolve(machine);
  checkSolution(machine, solution);
  return solution;
}).flat().reduce((a,b) => a + b, 0);

console.log(finalResult);

// console.log(findReductions(machines[39]))

// before: 16780, 16751
// after: 16362, 16362, 16362, 16362