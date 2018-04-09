import Rover from './rover';
import statusEnums from './status-enums';

/** Class representing a rover. */
export default class MissionControl {

  /**
   * Create a MissionControl instance
   * @property {Object}  props
   * @property {String}  props.initData -
   *   @example: "12 N \n LMLMLMLMM"
   */
  constructor({ ...props }) {
    this.location = props.location;
    this.state = { status: statusEnums['SUCCESS'] };
    this.extractGridCoords(props.commandData);
    this.createRovers(props.commandData);
  }

  /**
   * Extract MissionControl's grid size from input data
   * @property {String}  input - the full instructions for this instance of MissionControl
   *   @example: "55\n12 N\nLMLMLMLMM"
   */
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
      this.state.details = `Critical Failure!`
        + ` CommandData does not begin with valid GridSize data.`;
    }
  }

  /**
   * Extract each rover's basic start position, orientation and command sequence
   * @property {String}  input - Rover's start / command details.
   *   @example: "12 N \n LMLMLMLMM"
   */
  createRovers(input) {
    this.rovers = input.match(/\d\d\s[N|E|S|W]\n?\D+/g).reduce((arr, match) => {
      arr.push(new Rover({ initData: match }));
      return arr;
    }, []);
  }

  /**
   * Execute Rover commands synchronously.
   */
  deployRovers() {

    // If mission control has already encountered a Critical Error, then simply return
    // false and cease operations.
    if (this.state.status === statusEnums['CRITICAL_FAILURE']) {
      console.error(`Uh ${this.location}, we've had a problem.
      Details: ${this.state.details}`)
      return false;
    }

    // Excecute all rover command sequences, one rover at a time
    this.rovers.forEach((rover, i) => {
      let roverIsViable = true;

      // Step through current rover's entire command sequence,
      // checking each step as we go
      while (rover.commands.length !== 0 && roverIsViable) {
        const newState = rover.getNextState();

        // Check if Rover's next move is valid before we commit it
        const viability = this.checkViability({ newState, i });
        if (viability.valid) {
          rover.commitState({ ...newState });
        } else {

          // We found a problem with the Rover's commands, so stop here.
          // This might be being a little conservative - but when a rover excutes an
          // invalid command, it will mark itself as invalid and move itself back to
          // it's starting position and orientation.
          // No further commands are to be executed by this rover.
          roverIsViable = false;
          rover.markInvalid({ reason: viability.reason });
        }
      }
    });

    // Finished moving all the rovers - so print out the final positions of each Rover.
    this.printFinalPositions();
  }

  /**
   * @typedef {Object} Viability
   * @property {Boolean} valid - Boolean stating the purposed move's validity
   * @property {String} reason - String containing any possible error details
   */
  /**
   * Return the viability of a single Rover command, based on it's current position
   * (and the * position of other rovers)
   * @property {Object}   newState - Object containing the purposed new state of the Rover
   * @property {Object}   [newState.position]
   * @property {Array}    [newState.orientation]
   * @property {Number}   i - Relevant Rover's index integer
   * @returns {Viability}
   */
  checkViability({ newState, i }) {
    const viability = { valid: true };

    // Only commands where the position changes, need to be evaluated for validity.
    if (newState.position) {

      // 1 - check if the move puts the rover out of bounds:
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

  /**
   * Check the new potential position for a Rover for collision with all other Rovers
   * @property {Object}   position - Object containing new purposed position of the Rover
   * @property {Number}   position.x - x value of new Rover position
   * @property {Number}   position.y - y value of new Rover position
   * @property {Number}   roverIndex - Relevant Rover's index integer
   * @returns  {Boolean}  collisionDetected - Will the Rover collide with anothe Rover
   */
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

  /**
   * Check the new potential position for a Rover for collision with all other Rovers
   * @property {Object}   position - Object containing new purposed position of the Rover
   * @property {Number}   position.x - x value of new Rover position
   * @property {Number}   position.y - y value of new Rover position
   * @property {Number}   roverIndex - Relevant Rover's index integer
   * @returns  {Boolean}  collisionDetected - Will the Rover collide with anothe Rover
   */
  checkOutOfBounds({ x, y }) {
    let outOfBounds = false;
    if (x > this.gridSize.w || x < 0) {
      outOfBounds = true;
    } else if (y > this.gridSize.h || y < 0) {
      outOfBounds = true;
    }
    return outOfBounds;
  }

  /**
   * Print out the final positions of Rovers into the console (and return them)
   * @returns  {String}  output - All final Rover positions and orientations
   * (and some extra details if they're erroneous)
   */
  printFinalPositions() {
    let output = ``;
    this.rovers.forEach(rover => {
      output += `${rover.state.position.x}${rover.state.position.y} ${rover.state.orientation}`
      if (rover.state.status === statusEnums['CRITICAL_FAILURE']) {
        output += ` - Rover is INVALID. ${rover.state.details}`;
      }
      output += `\n`;
    });

    output += '==========';
    console.log(output);
    return output;
  }
}

