// part 1
const text = await Deno.readTextFile("./input.txt");
const lines = text.split("\n");

const reduceFunctions = {
  "+": (a,b) => a + b,
  "*": (a,b) => a * b
}

const identities = {
  "+": 0,
  "*": 1
}

const numbers = lines.slice(0, -1).map(it => it.split(/ +/).filter(it => it != "").map(it => it * 1));
const operators = lines[lines.length - 1].split(/ +/).filter(it => it != "");
const part1 = operators.map((op, i) => numbers.map(it => it[i]).reduce(reduceFunctions[op], identities[op])).reduce((a,b) => a + b, 0);

console.log(part1)

// part2

const splitIndexes = Array.from(lines.map(line => line.split("").map((char, i) => char == " " ? i : null).filter(it => it != null)).map(it => new Set(it)).reduce((a,b) => a.intersection(b)))

function split(string, indexes) {
  const out = [];
  let rest = string;
  for (let i = indexes.length - 1; i>=0; i--) {
    const index = indexes[i];
    const last = rest.substring(index + 1);
    rest = rest.substring(0, index);
    out.unshift(last);
  }
  out.unshift(rest);
  return out;
}

let elements = lines.map(line => split(line, splitIndexes));

function part2(elements) {
  const numbers = elements.slice(0, -1);
  return operators.map((op, i) => {
    let nums = transpose(numbers.map(it => it[i]));
    return nums.reduce(reduceFunctions[op], identities[op])
  }).reduce((a,b) => a + b, 0);
}

function transpose(numbers) {
  let out = [];
  for (let i=0; i<numbers[0].length; i++) {
    out.push(numbers.map(it => it[i]).join("").trim() * 1)
  }
  return out;
}

console.log(part2(elements))


