import Rover from './rover';
import statusEnums from './status-enums';

/** Class representing a rover. */
export default class MissionControl {

  /**
   * Create a MissionControl instance
   * @property {object}  props
   * @property {string}  props.initData - example: "12 N \n LMLMLMLMM"
   */
  constructor({ ...props }) {
    this.location = props.location;
    this.state = { status: statusEnums['SUCCESS'] };
    this.extractGridCoords(props.commandData);
    this.createRovers(props.commandData);
  }

  // Extract grid size:
  extractGridCoords(input) {
    const gridCoords = input.match(/^\d\d\n/g);
    if (gridCoords) {
      const arr = gridCoords[0].split('');
      this.gridSize = { w: parseInt(arr[0]), h: parseInt(arr[1]) };
    } else {

      // If a descernable gridSize does not exist in the very first line of
      // the input data, then we stop everything.
      // Critical failure. Yes it's quite conservative - but we're controlling
      // rovers on mars, thus a failure of this kind is unacceptable.
      console.error('Critical failure!');
      this.state.status = statusEnums['CRITICAL_FAILURE'];
      this.state.details = `Critical Failure!
      CommandData does not begin with valid GridSize data.`;
    }
  }

  // Extract each rover's basic start position, orientation
  // and command sequence
  createRovers(input) {
    this.rovers = input.match(/\d\d\s[N|E|S|W]\n?\D+/g).reduce((arr, match) => {
      arr.push(new Rover({ initData: match }));
      return arr;
    }, []);
  }

  deployRovers() {

    // If mission control has already encountered a Critical Error
    if (this.state.status === statusEnums['CRITICAL_FAILURE']) {
      console.error(`Uh ${this.location}, we've had a problem.
      Details: ${this.state.details}`)
      return;
    }

    // Excecute all rover command sequences, one rover at a time
    this.rovers.forEach((rover, i) => {
      let roverIsViable = true;

      // Step through current rover's entire command sequence,
      // checking each step as we go
      while (rover.commands.length !== 0 && roverIsViable) {
        const newState = rover.getNextState();

        // Bec: Check next move is valid before we commit it
        const viability = this.checkViability({ newState, i });
        if (viability.valid) {
          rover.commitState({ ...newState });
        } else {

          // We found a problem with the Rover's commands, so stop here.
          // This might be being a little conservative -
          // but when a rover excutes an invalid command,
          // it will mark itself as invalid and move itself back to it's starting
          // position and orientation. No further commands are to be executed
          // by this rover.
          roverIsViable = false;
          rover.markInvalid({ reason: viability.reason });
        }
      }
    });

    //Bec: finished moving all the rovers
    this.printFinalPositions();
  }

  checkViability({ newState, i }) {
    const viability = { valid: true };
    if (newState.position) {

      // 1 - check if the move puts the over out of bounds:
      if (this.checkOutOfBounds({ ...newState.position })) {
        Object.assign(viability, {
          valid: false,
          reason: `Commands contain a directive that moves the rover outside bounds`,
        });
        this.state.status = statusEnums['PARTIAL_FAILURE'];
        this.state.details = viability.reason;

      // 2 - check if the move puts the rover into the same square as any other rovers:
      } else if (this.checkCollisionCourse({ ...newState, roverIndex: i })) {
        Object.assign(viability, {
          valid: false,
          reason: `Commands contain a directive that would cause rovers to collide`,
        });
        this.state.status = statusEnums['PARTIAL_FAILURE'];
        this.state.details = viability.reason;
      }
    }

    return viability;
  }

  checkCollisionCourse({ position, roverIndex }) {
    let collisionDetected = false;

    // Bec:check no rover is already in this position
    this.rovers.forEach((rover, i) => {
      if (roverIndex !== i
        && position.x === rover.state.position.x
        && position.y === rover.state.position.y) {

        collisionDetected = true;
      }
    });
    return collisionDetected;
  }

  checkOutOfBounds({ x, y }) {
    let outOfBounds = false;
    if (x > this.gridSize.w || x < 0) {
      outOfBounds = true;
    } else if (y > this.gridSize.h || y < 0) {
      outOfBounds = true;
    }
    return outOfBounds;
  }

  printFinalPositions() {
    let output = ``;
    this.rovers.forEach(rover => {
      output += `${rover.state.position.x}${rover.state.position.y} ${rover.state.orientation}`
      if (rover.state.status === statusEnums['CRITICAL_FAILURE']) {
        output += `- Rover is INVALID. ${rover.state.details}`;
      }
      output += `\n`;
    });

    output += '==========';
    console.log(output);
    return output;
  }
}

