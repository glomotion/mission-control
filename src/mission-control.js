import Rover from './rover';

export default class MissionControl {
  constructor({ ...props }) {
    this.location = props.location;

    // Extract grid size:
    // @TODO gridsize should be an object with x and y, not an array
    const gridCoords = props.commandData.match(/^\d\d\n/g);
    if (gridCoords) {
      this.gridSize = gridCoords.reduce((accum, vals) => {
        accum.push(...vals.split('').reduce((arr, val) => {
          val !== "\n" && arr.push(parseInt(val));
          return arr;
        }, []));
        return accum;
      }, []);
    } else {

      // If a descernable gridSize does not exaist in the very first line of
      // the input data, then we stop everything.
      // Critical failure. Yes it's quite conservative - but we're controlling
      // rovers on mars, thus a failure of this kind is unacceptable.
      console.log('Critical failure!!');
    }

    // Match each rover's basic start position, orientation and
    // command sequence
    this.rovers = props.commandData
      .match(/\d\d\s[N|E|S|W]\n?\D+/g)
      .reduce((arr, match) => {
        arr.push(new Rover({ initData: match }));
        return arr;
      }, []);
  }

  deployRovers() {

    // Excecute all rover command sequences and test for viability at each step
    this.rovers.forEach((rover, i) => {
      let roverIsViable = true;
      while (rover.commands.length !== 0 && roverIsViable) {
        const newState = rover.getNextState();
        const viability = this.checkViability({ newState, i });
        if (viability.valid) {
          rover.commitState({ ...newState });
        } else {

          // Kill while and throw error:
          roverIsViable = false;
          console.error(`Uh ${this.location}, we've had a problem.
  Rover: ${i} has attempted to perform an invalid command
  Details: ${viability.reason}`);
        }
      }
    });

    this.printFinalPositions();
  }

  printFinalPositions() {
    let output = '';
    this.rovers.forEach(rover => {
      output += `${rover.position.x} ${rover.position.y} ${rover.orientation} \n`;
    });
    output += '==========';
    console.log(output);
    return output;
  }

  checkViability({ newState, i }) {
    const viability = {};
    if (newState.position) {

      // 1 - check if the move puts the over out of bounds:
      if (this.checkOutOfBounds({ ...newState.position })) {
        Object.assign(viability, {
          valid: false, reason: `Current command moves the rover outside bounds`,
        });

      // 2 - check if the move puts the rover into the same square as any other rovers:
      } else if (this.checkCollisionCourse({ ...newState, roverIndex: i })) {
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

  checkCollisionCourse({ position, roverIndex }) {
    let collisionDetected = false;
    this.rovers.forEach((rover, i) => {
      if (roverIndex !== i
        && position.x === rover.position.x
        && position.y === rover.position.y) {

        collisionDetected = true;
      }
    });
    return collisionDetected;
  }

  checkOutOfBounds({ x, y }) {
    if (x > this.gridSize[0] || x < 0) {
      return true;
    } else if (y > this.gridSize[1] || y < 0) {
      return true;
    } else {
      return false;
    }
  }
}

