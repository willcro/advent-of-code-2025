// part 1
const text = await Deno.readTextFile("./input.txt");
const lines = text.split("\n");
const grid = lines.map(line => line.split(""));


function find(grid, char) {
  for (let y = 0; y < grid.length; y++) {
    const line = grid[y];
    for (let x = 0; x < line.length; x++) {
      const square = line[x];
      if (square == char) {
        return {x, y};
      }
    }
  }
}

function setOrIncrement(object, key, value) {
  if (object[key] == undefined) {
    object[key] = value;
  } else {
    object[key] = object[key] + value;
  }
}

function solve(grid) {
  const s = find(grid, "S");
  let previous = {};
  let next = {};
  next[`${s.x},${s.y}`] = 1;
  let universes = 0;
  let splits = 0

  while (Object.keys(next).length > 0) {
    let nextArray = Object.keys(next);
    previous = next;
    next = {};
    nextArray.forEach(coord => {
      const parts = coord.split(",");
      const x = parts[0] * 1;
      const y = parts[1] * 1;
      const value = previous[coord];
      const elem = grid[y][x];
      if (elem == "^") {
        setOrIncrement(next, `${x - 1},${y + 1}`, value);
        setOrIncrement(next, `${x + 1},${y + 1}`, value);
        splits++
      } else if (grid.length > (y + 1)) {
        setOrIncrement(next, `${x},${y + 1}`, value);
      } else {
        universes += value;
      }
    });
  }
  return {splits, universes};
}

const solutions = solve(grid);

// part 1
console.log(solutions.splits);

// part2
console.log(solutions.universes);