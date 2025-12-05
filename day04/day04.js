// part 1
const text = await Deno.readTextFile("./input.txt");
const lines = text.split("\n");
const grid = lines.map(it => it.split(""));

const perimeter = [[-1,-1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

function part1(grid) {
  let out = [];
  for (let y = 0; y < grid.length; y++) {
    const line = grid[y];
    for (let x = 0; x < line.length; x++) {
      if (grid[y][x] != "@") {
        continue;
      }
      const openCount = perimeter.filter(it => {
        const checkX = x + it[0];
        const checkY = y + it[1];
        return checkX < 0 || checkX >= line.length || checkY < 0 || checkY >= grid.length || grid[checkY][checkX] == ".";
      }).length;
      if (openCount > 4) {
        out.push({x,y});
      }
    }
  }
  return out;
}

console.log(part1(grid).length);

function part2(grid) {
  let total = 0;
  let removed = 0;
  do {
    let toRemove = part1(grid);
    removed = toRemove.length;
    total += removed;
    toRemove.forEach(it => grid[it.y][it.x] = ".");
  } while (removed > 0);

  return total;
}

console.log(part2(grid));