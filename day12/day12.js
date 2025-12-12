// part 1

const text = await Deno.readTextFile("./input.txt");
const parts = text.split("\n\n");

const regex = /^([0-9]+)x([0-9]+): ([0-9]+ [0-9]+ [0-9]+ [0-9]+ [0-9]+ [0-9]+)$/

const presentAreas = parts.slice(0, 6).map(it => it.split("").filter(it => it == "#").length)

const trees = parts[6].split("\n").map(it => regex.exec(it)).map(it => {
  return {
    height: it[1] * 1,
    width: it[2] * 1,
    presents: it[3].split(" ").map(it => it * 1),
    area: (it[1] * 1) * (it[2] * 1)
  }
});

trees.forEach(tree => {
  tree.presentArea = tree.presents.map((it, i) => it * presentAreas[i]).reduce((a,b) => a + b, 0);
});

trees.forEach(tree => {
  tree.trivialPresentArea = tree.presents.map((it, i) => it * 9).reduce((a,b) => a + b, 0);
});

// filter out trees that are trivial to tell they are impossible
const possibleTrees = trees.filter(tree => tree.area >= tree.presentArea);

// filter out trees that are trivial to tell they are possible
const notTriviallyPossible = possibleTrees.filter(tree => tree.area < tree.trivialPresentArea);

// lol, all of them are either trivially possible or trivially impossible

if (notTriviallyPossible > 0) {
  throw "panic";
}

console.log(possibleTrees.length)
