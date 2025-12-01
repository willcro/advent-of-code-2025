// part 1

const text = await Deno.readTextFile("./input.txt");
const lines = text.split("\n");
const pattern = /(L|R)([0-9]+)/;

const instructions = lines.map((it) => pattern.exec(it))
  .map((it) => {
    return {
      direction: it[1],
      amount: it[2] * 1,
    };
  });

function mapInstruction(instruction) {
  if (instruction.direction == "R") {
    return instruction.amount;
  } else if (instruction.direction == "L") {
    return instruction.amount * -1;
  } else {
    throw "Unknown direction " + instruction.direction;  
  }
}

function runPart1(instructions) {
  let timesAtZero = 0;
  let currentPos = 50;
  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i];
    const value = mapInstruction(instruction);
    currentPos = (((currentPos + value) % 100) + 100) % 100;
    if (currentPos == 0) {
      timesAtZero++
    }
  }
  return timesAtZero;
}

console.log(runPart1(instructions));

function runPart2(instructions) {
  let timesAtZero = 0;
  let currentPos = 50;
  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i];
    const value = mapInstruction(instruction);
    const newPosNonNormal = currentPos + value;
    if (newPosNonNormal >= 100) {
      timesAtZero += Math.floor(newPosNonNormal / 100);
    }

    if (newPosNonNormal <= 0) {
      if (currentPos == 0) {
        timesAtZero += Math.floor(-newPosNonNormal / 100);
      } else {
        timesAtZero += Math.floor(-newPosNonNormal / 100) + 1;
      }
    }

    currentPos = ((newPosNonNormal % 100) + 100) % 100;
  }
  return timesAtZero;
}

console.log(runPart2(instructions));