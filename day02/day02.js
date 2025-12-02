// part 1
const text = await Deno.readTextFile("./input.txt");
const rangesText = text.split(",");
const pattern = /([0-9]+)-([0-9]+)/;

const ranges = rangesText.map(it => pattern.exec(it)).map(it => {
  return {
    min: it[1],
    max: it[2]
  };
});

/**
 * take a range. flatten it out so that the min and max have the same number of digits
 * @param {*} range 
 */
function flattenRange(range) {
  if (range.min.length == range.max.length) {
    return [range];
  }

  const endFirstRange = [...Array(range.min.length)].map(it => "9").join("");
  const first = {
    min: range.min,
    max: endFirstRange
  }

  const startRestRange = "1" + [...Array(range.min.length)].map(it => "0").join("");
  const nonFlatRest = {
    min: startRestRange,
    max: range.max
  }

  const rest = flattenRange(nonFlatRest);
  
  return [first, rest].flat();
}

const flattenedRanges = ranges.flatMap(flattenRange);

function findBadCodes(range, groups) {
  // input will always be flattened, so min and max lengths are the same
  const length = range.min.length;
  if (length % groups != 0) {
    // numbers with an odd number of digits can't be bad
    return [];
  }

  const prefixStart = range.min.substring(0, length / groups) * 1;
  const prefixEnd = range.max.substring(0, length / groups) * 1;

  let out = [];
  const max = range.max * 1;
  const min = range.min * 1;

  for (let i = prefixStart; i <= prefixEnd; i++) {
    const it = [...Array(groups)].map(it => "" + i).join("") * 1;
    if (it < min) {
      continue;
    }

    if (it > max) {
      break;
    }
    out.push(it);
  }

  return out;
}

const badCodes = flattenedRanges.flatMap(it => findBadCodes(it, 2));
const sum = badCodes.reduce((a, b) => a + b, 0);

console.log(sum);

// part 2

function findBadCodesPart2(range) {
  let out = [];
  for (let i=2; i<=range.max.length; i++) {
    out.push(findBadCodes(range, i));
  }
  return out.flat();
}

const badCodesPart2 = Array.from(new Set(flattenedRanges.flatMap(findBadCodesPart2)));
const sumPart2 = badCodesPart2.reduce((a, b) => a + b, 0);
console.log(badCodesPart2, sumPart2)
