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

function pop(nodeToCost) {
  // this would be way faster if this was a heap, but whatever
  let min = Object.entries(nodeToCost).reduce((a,b) => a[1] < b[1] ? a : b, Object.entries(nodeToCost)[0]);
  delete nodeToCost[min[0]];
  return {node: min[0] * 1, cost: min[1]};
}

function djikstras(machine) {
  // in retrospect, using djikstras for this was very weird, but I was trying to anticipate part 2
  // but I failed
  const searched = new Set();
  const toSearch = {};
  toSearch[machine.startingPattern] = 0;

  while (Object.keys(toSearch).length > 0) {
    const min = pop(toSearch);
    // console.log(min)
    searched.add(min.node);
    if (min.node == machine.desiredPattern) {
      return min.cost;
    }

    machine.buttonsBitmaps.map(button => min.node ^ button)
        .filter(node => !searched.has(node))
        .map(node => {
          return {
            node: node,
            cost: min.cost + 1
          }
        })
        .filter(node => toSearch[node.node] == undefined || toSearch[node.node] > node.cost)
        .forEach(node => toSearch[node.node] = node.cost);
  }

  throw "Impossible pattern";
}

// console.log(machines.map(machine => djikstras(machine)).reduce((a,b) => a + b, 0))

// part 2

function pop2(nodeToCost) {
  // this would be way faster if this was a heap, but whatever
  let min = Object.values(nodeToCost).reduce((a,b) => a.heuristic < b.heuristic ? a : b, Object.values(nodeToCost)[0]);
  delete nodeToCost[min.id];
  return min;
}

function add(joltages, button) {
  const copy = joltages.map(it => it);
  button.forEach(it => copy[it]++);
  return copy;
}

function part2(machine) {
  const searched = new Set();
  const toSearch = {};
  const startingJoltage = machine.joltages.map(it => 0);
  const totalJoltage = machine.joltages.reduce((a,b) => a + b, 0);
  const highestJoltageButton = machine.buttons.map(it => it.length).reduce((a, b) => Math.max(a, b), -Infinity);
  toSearch[JSON.stringify(startingJoltage)] = {
    id: JSON.stringify(startingJoltage),
    joltages: startingJoltage,
    cost: 0,
    heuristic: totalJoltage / highestJoltageButton
  };
  const desiredJoltageId = JSON.stringify(machine.joltages);

  while (Object.keys(toSearch).length > 0) {
    const min = pop2(toSearch);
    console.log(min.cost)
    searched.add(min.id);
    if (min.id == desiredJoltageId) {
      return min.cost;
    }

    let newNodes = machine.buttons.map(button => add(min.joltages, button))
        .map(node => {
          // console.log(node)
          const total = node.reduce((a,b) => a + b, 0);
          return {
            id: JSON.stringify(node),
            joltages: node,
            cost: min.cost + 1,
            heuristic: min.cost + 1 + ((totalJoltage - total) / highestJoltageButton)
          }
        })
        .filter(node => !searched.has(node.id))
        .filter(node => node.joltages.every((jolt, i) => jolt <= machine.joltages[i]))
        .filter(node => toSearch[node.id] == undefined || toSearch[node.id].cost > node.cost);

    // console.log(newNodes)
    newNodes.forEach(node => toSearch[node.id] = node);
  }

  throw "Impossible pattern";
}

// console.log(machines)
console.log(part2(machines[0]))
