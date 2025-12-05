// part 1
const text = await Deno.readTextFile("./input.txt");
const parts = text.split("\n\n");

const freshRanges = parts[0].split("\n").map(it => it.split("-").map(it => it * 1)).map((it, i) => {
  return {
    id: `${i}`,
    indexes: new Set([i]),
    min: it[0],
    max: it[1]
  }
});
const itemIds = parts[1].split("\n").map(it => it * 1);
const freshItemIds = itemIds.filter(itemId => freshRanges.some(range => itemId >= range[0] && itemId <= range[1]));

console.log(freshItemIds.length);

function findOverlaps(ranges) {
  let overlaps = [];
  for (let i=0; i<(ranges.length - 1); i++) {
    for (let j=i+1; j<ranges.length; j++) {
      const overlap = findOverlap(ranges[i], ranges[j]);
      if (overlap != null) {
        overlaps.push(overlap);
      }
    }
  }

  return overlaps;
}

function findOverlap(rangeA, rangeB) {
  if (rangeA.indexes.isSubsetOf(rangeB.indexes) || rangeA.indexes.isSupersetOf(rangeB.indexes)){
    return null;
  }

  if (rangeA.min > rangeB.min) {
    return findOverlap(rangeB, rangeA);
  }

  if (rangeA.max < rangeB.min) {
    return null;
  }

  return {
    id: Array.from(rangeA.indexes.union(rangeB.indexes)).sort((a,b) => a - b).join(","),
    min: rangeB.min, 
    max: Math.min(rangeB.max, rangeA.max), 
    indexes: rangeA.indexes.union(rangeB.indexes)
  };
}

function dedupeRanges(ranges) {
  const exists = new Set();
  const out = [];

  ranges.forEach(it => {
    if (!exists.has(it.id)) {
      exists.add(it.id);
      out.push(it);
    }
  })
  return out;
}

function part2() {
  let ranges = freshRanges;
  let overlaps = {}
  while (ranges.length > 0) {
    ranges.forEach(it => {
      const parity = it.indexes.size % 2 == 0 ? -1 : 1;
      overlaps[it.id] = (it.max - it.min + 1) * parity;
    })
    ranges = findOverlaps(ranges);
    ranges = dedupeRanges(ranges);
  };

  console.log(overlaps);
  return Object.values(overlaps).reduce((a,b) => a + b, 0);
}

console.log(part2())