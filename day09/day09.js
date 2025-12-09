// part 1

const text = await Deno.readTextFile("./input.txt");
const lines = text.split("\n");

const tiles = lines.map(it => it.split(",")).map(it => {
  return {
    x: it[0] * 1,
    y: it[1] * 1
  };
});

function maxRectangle(tiles) {
  let max = 0;
  for (let i=0; i<(tiles.length - 1); i++) {
    for (let j=i+1; j<tiles.length; j++) {
      const a = tiles[i];
      const b = tiles[j];
      const area = ((Math.abs(b.x - a.x) + 1) * (Math.abs(b.y - a.y) + 1));
      if (area > max) {
        max = area;
      }
    }
  }
  return max;
}

function findBorder(tiles) {
  const borders = [];
  for (let i=0; i<(tiles.length - 1); i++) {
    let a = tiles[i];
    let b = tiles[i + 1];
    let direction = a.x == b.x ? "HORIZONTAL" : "VERTICAL";

    const border = {
      direction: direction,
      xMax: Math.max(a.x, b.x),
      xMin: Math.min(a.x, b.x),
      yMax: Math.max(a.y, b.y),
      yMin: Math.min(a.y, b.y)
    };
    borders.push(border);
  };
  return borders;
}

console.log(maxRectangle(tiles))

// part 2

/*
My approach to part 2 is pretty slow, but I am still happy with it. Still O(n^2)
1. Map the entire set of coordinates into a reduced virtual coordinate space 
   that maintains the relative positions of tiles, but is not porportional in shape
2. Find all the edge coordinates in this virtual coordinate space
3. Starting from a known exterior coordinate, flood the grid to find all exterior
   coordinates. This is the slowest step.
4. Brute force search time. Search all possible pairs of red tiles. Keep track
   of the largest known rectangle in the real (non-virtual) coordinate space.
   Before a new rectangle can become the max, we check that none of its interior
   virtual coordinates are outside the shape.
*/

function createVirtualMapping(values) {
  const xValues = Array.from(new Set(values)).sort((a,b) => a - b);
  const xRanges = [];
  let virtualX = 0;
  xRanges.push({
    virtual: virtualX,
    realMin: 0,
    realMax: xValues[0] - 1
  });
  virtualX++;

  for (let i=0; i< (xValues.length - 1); i++) {
    let x = xValues[i];
    const thisRange = {
      virtual: virtualX,
      realMin: x,
      realMax: x
    };
    xRanges.push(thisRange);
    virtualX++;

    x++;
    let nextX = xValues[i+1];
    if (nextX > x) {
      const thisRange = {
        virtual: virtualX,
        realMin: x,
        realMax: nextX - 1
      };
      xRanges.push(thisRange);
      virtualX++;
    }
  }

  xRanges.push({
    virtual: virtualX,
    realMin: xValues[xValues.length - 1],
    realMax: xValues[xValues.length - 1]
  });

  return xRanges;
}

function createCoordMapping(tiles) {
  const xMappings = createVirtualMapping(tiles.map(t => t.x));
  const yMappings = createVirtualMapping(tiles.map(t => t.y));
  return tiles.map(tile => {
    const virtualX = xMappings.find(mapping => mapping.realMax == tile.x && mapping.realMin == tile.x);
    const virtualY = yMappings.find(mapping => mapping.realMax == tile.y && mapping.realMin == tile.y);

    return {
      realX: tile.x,
      realY: tile.y,
      virtualX: virtualX.virtual,
      virtualY: virtualY.virtual
    }
  });
}

function coordsInLine(a, b) {
  if (a.virtualX == b.virtualX) {
    // vertical line
    const length = Math.abs(a.virtualY - b.virtualY) + 1;
    const startY = Math.min(a.virtualY, b.virtualY)
    return [...Array(length)].map((it, i) => startY + i).map(y => `${a.virtualX},${y}`);
  } else if (a.virtualY == b.virtualY) {
    // horizontal line
    const length = Math.abs(a.virtualX - b.virtualX) + 1;
    const startX = Math.min(a.virtualX, b.virtualX)
    return [...Array(length)].map((it, i) => startX + i).map(x => `${x},${a.virtualY}`);
  } else {
    throw "Points don't form a line";
  }
}

function findEdgeCoords(coords) {
  const edgeCoords = new Set();
  for (let i=0; i<(coords.length - 1); i++) {
    const a = coords[i];
    const b = coords[i + 1];
    coordsInLine(a, b).forEach(coord => edgeCoords.add(coord));
  }

  let first = coords[0];
  let last = coords[coords.length - 1];
  coordsInLine(first, last).forEach(coord => edgeCoords.add(coord));
  return edgeCoords;
}

function findExterior(coords, edgeCoords) {
  let maxX = coords.map(coord => coord.virtualX).reduce((a,b) => Math.max(a,b), -Infinity) + 1;
  let maxY = coords.map(coord => coord.virtualY).reduce((a,b) => Math.max(a,b), -Infinity) + 1;
  let minX = coords.map(coord => coord.virtualX).reduce((a,b) => Math.min(a,b), Infinity) - 1;
  let minY = coords.map(coord => coord.virtualY).reduce((a,b) => Math.min(a,b), Infinity) - 1;

  let toCheck = new Set([`${minX},${minY}`]);
  let exterior = new Set();

  while (toCheck.size > 0) {
    let current = Array.from(toCheck).pop();
    toCheck.delete(current);
    let parts = current.split(",");
    let x = parts[0] * 1;
    let y = parts[1] * 1;
    if (x < minX || x > maxX || y < minY || y > maxY) {
      continue;
    }

    exterior.add(current);
    const next = [
      `${x},${y + 1}`,
      `${x},${y - 1}`,
      `${x + 1},${y}`,
      `${x - 1},${y}`
    ];

    next.filter(it => !edgeCoords.has(it) && !exterior.has(it)).forEach(it => toCheck.add(it));
  }

  return exterior;
}

function isInterior(a, b, exterior) {
  const xMax = Math.max(a.virtualX, b.virtualX);
  const yMax = Math.max(a.virtualY, b.virtualY);
  const xMin = Math.min(a.virtualX, b.virtualX);
  const yMin = Math.min(a.virtualY, b.virtualY);

  for (let x = xMin; x<=xMax; x++) {
    for (let y = yMin; y<=yMax; y++) {
      const coord = `${x},${y}`;
      if (exterior.has(coord)) {
        return false;
      }
    }
  }

  return true;
}

function part2(tiles) {
  // map tiles to a virtual coordinate system
  const coords = createCoordMapping(tiles);

  // find edge tiles in virtual coordinate space
  const edgeCoords = findEdgeCoords(coords);

  // find all exterior tiles in virtual space
  const exterior = findExterior(coords, edgeCoords);

  // find largest real space without spilling into the exterior virtual space
  let max = 0;
  for (let i=0; i<(tiles.length - 1); i++) {
    for (let j=i+1; j<tiles.length; j++) {
      const a = coords[i];
      const b = coords[j];
      const area = ((Math.abs(b.realX - a.realX) + 1) * (Math.abs(b.realY - a.realY) + 1));
      if (area > max && isInterior(a, b, exterior)) {
        max = area;
      }
    }
  }
  return max;
}


console.log(part2(tiles));