import Rover from './rover';
import {
  simpleCommands,
  solarRadiationCorruptedCommands
} from './data/test-data';

// Extract grid size:
// @TODO: if a descernable gridSize does not exaist in the very first line, then we stop everything. Critical failure. Conservative, yes - but we're controlling rovers on mars, so a failure of this kind is unacceptable.
const gridSize = solarRadiationCorruptedCommands.match(/\d\d\n/g).reduce((accum, vals) => {
  accum.push(...vals.split('').reduce((arr, val) => {
    val !== "\n" && arr.push(parseInt(val));
    return arr;
  }, []));

  return accum;
}, []);

// match each rover's command sequence and start position:
// /\d\d\s[N|E|S|W]\n[L|M|R]+/g
const rovers = solarRadiationCorruptedCommands
  .match(/\d\d\s[N|E|S|W]\n[L|M|R]+\n/g)
  .reduce((arr, match) => {
    arr.push(new Rover(match));
    return arr;
  }, []);

// Excecute all rover command sequences and test for viability at each step
rovers.forEach((rover, i) => {
  let roverIsViable = true;
  while (rover.commands.length !== 0 && roverIsViable) {
    const newState = rover.getNextState();
    const viability = checkViability(newState, i);

    if (viability.valid) {
      rover.commitState({ ...newState });
    } else {

      // Kill while and throw error:
      roverIsViable = false;
      console.error(`Error!
        Rover: ${i} has performed an invalid command
        details: ${viability.reason}
      `)
    }
  }
});

function outputFinalPositions() {
  let output = '';
  rovers.forEach(rover => {
    output += `${rover.position.x} ${rover.position.y} ${rover.orientation} \n`;
  });
  output += '==========';
  console.log(output);
}

function checkViability(newState, roverIndex) {
  const viability = {};
  if (newState.position) {

    // 1 - check if the move puts the over out of bounds:
    if (outOfBounds({ ...newState.position })) {
      Object.assign(viability, {
        valid: false, reason: `Current command moves the rover outside bounds`,
      });

    // 2 - check if the move puts the rover into the same square as any other rovers:
    } else if (collisionCourse({ position: newState.position, i: roverIndex })) {
      Object.assign(viability, {
        valid: false, reason: `Current command would cause rovers to collide`,
      });
    } else {
      viability.valid = true;
    }

  } else {
    viability.valid = true;
  }

  return viability;
}

function collisionCourse({ position, roverIndex }) {
  rovers.forEach((rover, i) => {
    if (roverIndex !== i
      && (position.x === rover.position.x
        || position.y === rover.position.y)) {

      return true;
    } else {
      return false;
    }
  });
}

function outOfBounds({ x, y }) {
  if (x > gridSize[0] || x < 0) {
    return true;
  } else if (y > gridSize[1] || y < 0) {
    return true;
  } else {
    return false;
  }
}


outputFinalPositions();

