import Cardinals from './cardinals';
import statusEnums from './status-enums';

/** Class representing a Mars Rover. */
export default class Rover {

  /**
   * Create a Rover instance
   * @property {object}  props
   * @property {string}  props.initData
   *   @example: "12 N \n LMLMLMLMM"
   */
  constructor({ ...props }) {
    this.commands = [];
    this.startPosition = {};
    this.startOrientation = null;
    this.state = { status: statusEnums['SUCCESS'] };
    this.ingestStartingPosition(props.initData);
    this.ingestCommandSequence(props.initData);
  }

  /**
   * INGEST starting coords and orientation into Rover's state
   * @property {String}  input - the full instructions for this instance of Rover
   *   @example: "55\n12 N\nLMLMLMLMM"
   */
  ingestStartingPosition(input) {
    const coords = input.match(/\d\d\s[N|E|S|W]+/g);
    const arr = coords[0].split('');
    this.startPosition = { x: parseInt(arr[0]), y: parseInt(arr[1]) };
    this.state.position = { ...this.startPosition };
    this.state.orientation = this.startOrientation = arr[3].toUpperCase();
  }

  /**
   * INGEST commands sequence into Rover's state
   * @property {String}  input - the full instructions for this instance of Rover
   *   @example: "55\n12 N\nLMLMLMLMM"
   * @NOTE: if any part of the command sequence is corrupted, then the whole rover's commands
   * are left empty - as we do not want to move a rover unless we have 100% valid move data
   * (avoids erronerously leaving a rover in a position which blocks other rovers from moving)
   */
  ingestCommandSequence(input) {
    const preParsedCommand = input.split('\n')
      .filter(itm => itm !== "")
      .filter(itm => itm.match(/\D+/g))
      .pop();

    const commands = preParsedCommand.match(/[L|M|R]+/g);
    if (commands && commands[0].length === preParsedCommand.length) {
      this.commands = commands[0].split('').map(c => c.toUpperCase());
    } else {

      // To avoid rovers getting in another rover's way, if a rover does
      // not successfully conduct all of it's commands - we keep it at it's start position
      this.state.status = statusEnums['CRITICAL_FAILURE'];
      this.state.details = `Rover contains invalid command codes.`;
    }
  }

  /**
   * @typedef {Object} nextState
   * @property {Object} [position] - Rover's next position
   * @property {Object} [position].x - x position
   * @property {Object} [position].y - y position
   * @property {String} [orientation] - Rover's next orientation
   */
  /**
   * Excecute next command in the sequence:
   * @returns {nextState} - a nominated mutation of the Rover's current state
   */
  getNextState() {
    const step = this.commands.shift();
    const nextState = {};
    switch (step) {
      case 'M':
        nextState.position = Cardinals[this.state.orientation].move({
          ...this.state.position
        });
        break;

      case 'L':
      case 'R':
        nextState.orientation = Cardinals[this.state.orientation][step];
        break;
    }

    return nextState;
  }

  /**
   * Mark this Rover with an invalid status.
   * @property {Object} [props] - Options to pass through error / status details
   * @property {String} [props.reason] - The reasoning for Rover invalition
   * @NOTE: When a Rover is marked invalid, it knows to reset it's position
   * back to it's original starting position and orientation
   */
  markInvalid({ ...props }) {
    const { reason } = props;
    this.state.status = statusEnums['CRITICAL_FAILURE'];
    if (reason) this.state.details = reason;
    this.state.position = this.startPosition;
    this.state.orientation = this.startOrientation;
  }

  /**
   * Commit an assumed valid mutation to this Rover's state.
   * @property {Object} props - Options to mutate the Rover's state with
   * @property {String} props[orientation] - The Rover's new orientation
   * @property {Object} props[position] - The Rover's new position
   */
  commitState({ ...props }) {
    const { position, orientation } = props;
    if (position) this.state.position = position;
    if (orientation) this.state.orientation = orientation;
  }
}
