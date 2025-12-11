// part 1

const text = await Deno.readTextFile("./input.txt");
const lines = text.split("\n");
const regex = /([a-z]{3}): (.*)/;

const connections = {};

lines.map(line => regex.exec(line)).forEach(it => connections[it[1]] = it[2].split(" "));


const memo = {};

function paths(connections, start, end) {
  let id = `${start}-${end}`;
  let cached = memo[id];
  if (cached != undefined) {
    return cached;
  }

  if (start == end) {
    // we reached the end
    return 1;
  }

  if (connections[start] == undefined) {
    // we reached a dead end
    return 0;
  }
  
  let ret = connections[start].map(it => paths(connections, it, end)).reduce((a,b) => a + b, 0);
  memo[id] = ret;
  return ret;
}

console.log(paths(connections, "you", "out"))

// part 2

function part2(connections) {
  const svrToFft = paths(connections, "svr", "fft");
  const fftToDac = paths(connections, "fft", "dac");
  const dacToOut = paths(connections, "dac", "out");

  const svrToDac = paths(connections, "svr", "dac");
  const dacToFft = paths(connections, "dac", "fft");
  const fftToOut = paths(connections, "fft", "out");

  return (svrToFft * fftToDac * dacToOut) + (svrToDac * dacToFft * fftToOut)
}

console.log(part2(connections))
