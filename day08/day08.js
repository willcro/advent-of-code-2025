// part 1
const text = await Deno.readTextFile("./input.txt");
const lines = text.split("\n");
const MAX_LINKS = 1000;

let coords = lines.map((line, i) => {
  const parts = line.split(",");
  return {
    id: i,
    x: parts[0],
    y: parts[1],
    z: parts[2],
    network: i
  };
});

function allPossibleLinks(coords) {
  let pairs = [];
  for (let i=0; i<(coords.length - 1); i++) {
    for (let j=i+1; j<coords.length; j++) {
      const a = coords[i];
      const b = coords[j];
      // I am not square rooting because that won't change the ordering
      // and square rooting is fairly slow
      const distance = (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y) + (b.z - a.z) * (b.z - a.z);
      pairs.push({pair: [a.id, b.id], distance: distance});
    }
  }

  return pairs.sort((a,b) => a.distance - b.distance);
}

function linkValue(coords) {
  const networks = {};

  coords.forEach(coord => {
    if (networks[coord.network] == undefined) {
      networks[coord.network] = {
        id: coord.network,
        count: 1
      }
    } else {
      networks[coord.network].count++
    }
  })

  return Object.values(networks).sort((a,b) => b.count - a.count).slice(0, 3).map(it => it.count).reduce((a,b) => a * b, 1);
}

function link(coords) {
  const possibleLinks = allPossibleLinks(coords);
  for (let i=0; i<MAX_LINKS; i++) {
    const possibleLink = possibleLinks[i];
    const a = coords[possibleLink.pair[0]];
    const b = coords[possibleLink.pair[1]];
    if (a.network != b.network) {
      // O(n^2) goes brrrrr
      // I should keep a separate map of the networks to make this faster, but whatever
      coords.filter(coord => coord.network == b.network).forEach(coord => coord.network = a.network);
    }
  }

  return linkValue(coords);
}

// making a backup of coords since this function modifies it
const coordBackup = JSON.stringify(coords);
console.log(link(coords));

// part 2
coords = JSON.parse(coordBackup);

function part2(coords) {
  const possibleLinks = allPossibleLinks(coords);
  let ret = 0;
  for (let i=0; true; i++) {
    const possibleLink = possibleLinks[i];
    const a = coords[possibleLink.pair[0]];
    const b = coords[possibleLink.pair[1]];
    if (a.network != b.network) {
      coords.filter(coord => coord.network == b.network).forEach(coord => coord.network = a.network);
      ret = a.x * b.x
    } else if (coords.every(coord => coord.network == a.network)) {
      return ret;
    }
  }

}

console.log(part2(coords))
