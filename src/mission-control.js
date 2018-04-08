import Rover from './rover';
import statusEnums from './status-enums';

export default class MissionControl {
  constructor({ ...props }) {
    this.location = props.location;
    this.status = { current: statusEnums['SUCCESS'] };
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

      // If a descernable gridSize does not exaist in the very first line of
      // the input data, then we stop everything.
      // Critical failure. Yes it's quite conservative - but we're controlling
      // rovers on mars, thus a failure of this kind is unacceptable.
      console.error('Critical failure!');
      this.status = {
        valid: statusEnums['CRITICAL_FAILURE'],
        details: `Critical Failure! CommandData does not begin with valid GridSize data.`,
      };
    }
  }

  // Match each rover's basic start position, orientation
  // and command sequence
  createRovers(input) {
    this.rovers = input.match(/\d\d\s[N|E|S|W]\n?\D+/g).reduce((arr, match) => {
      arr.push(new Rover({ initData: match }));
      return arr;
    }, []);
  }

  deployRovers() {

    // If mission control has already encountered a Critical Error
    if (this.status.current === statusEnums['CRITICAL_FAILURE']) {
      console.error(`Uh ${this.location}, we've had a problem.
      Details: ${this.status.details}`)
      return;
    }

    // Excecute all rover command sequences and test for viability at each step
    this.rovers.forEach((rover, i) => {
      let roverIsViable = true;
      while (rover.commands.length !== 0 && roverIsViable) {
        const newState = rover.getNextState();
        const viability = this.checkViability({ newState, i });
        if (viability.valid) {
          rover.commitState({ ...newState });
        } else {

          // Kill while loop and throw error:
          roverIsViable = false;
          rover.markInvalid({ reason: viability.reason });
        }
      }
    });

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
        this.status = {
          current: statusEnums['PARTIAL_FAILURE'],
          details: viability.reason,
        };

      // 2 - check if the move puts the rover into the same square as any other rovers:
      } else if (this.checkCollisionCourse({ ...newState, roverIndex: i })) {
        Object.assign(viability, {
          valid: false,
          reason: `Commands contain a directive that would cause rovers to collide`,
        });
        this.status = {
          current: statusEnums['PARTIAL_FAILURE'],
          details: viability.reason,
        };
      }
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
    switch (this.status.current) {
      case statusEnums['SUCCESS']:
        this.rovers.forEach(rover => {
          output += `${rover.position.x} ${rover.position.y} ${rover.orientation} \n`;
        });
        break;

      case statusEnums['PARTIAL_FAILURE']:
        this.rovers.forEach(rover => {
          output += `${rover.position.x} ${rover.position.y} ${rover.orientation} `
          if (rover.status.current === 2) {
            output += `- Rover is INVALID. ${rover.status.details}`;
          }
          output += ` \n`;
        });
        break;
    }

    output += '==========';
    console.log(output);
    return output;
  }
}

