import Cardinals from './cardinals';
import statusEnums from './status-enums';

export default class Rover {
  constructor({ ...props }) {
    // example props.initData: "12 N \n LMLMLMLMM"

    // The basic anotomy of a rover:
    this.commands = [];
    this.startPosition = {};
    this.startOrientation = null;
    this.state = { status: statusEnums['SUCCESS'] };

    this.ingestStartingPosition(props.initData);
    this.ingestCommandSequence(props.initData);
  }

  // INGEST starting coords and orientation:
  ingestStartingPosition(input) {
    const coords = input.match(/\d\d\s[N|E|S|W]+/g);
    if (coords) {
      const arr = coords[0].split('');
      this.startPosition = { x: parseInt(arr[0]), y: parseInt(arr[1]) };
      this.state.position = { ...this.startPosition };
      this.state.orientation = this.startOrientation = arr[3].toUpperCase();
    }

    // Bec: what about an else here? can that happen? explain?
  }

  /*
    INGEST commands sequence:
    - NOTE, if any part of the command sequence is corrupted, then the whole rover's commands
    are left empty - as we do not want to move a rover unless we have 100% valid move data
    (avoids erronerously leaving a rover in a position which blocks other rovers from moving)
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

  // Excecute next command in the sequence:
  getNextState() {
    const step = this.commands.shift();
    switch (step) {
      case 'M':
        return {
          position: Cardinals[this.state.orientation].move({
            ...this.state.position
          }),
        };
        break;

      case 'L':
      case 'R':
        return { orientation: Cardinals[this.state.orientation][step] };
        break;

      default:

        // @TODO: currently unrecognised command!
        // do something in here:
        break;
    }
  }

  // Mark rover with invalid status:
  // When a rover is marked invalid, it knows to reset it's
  // position back to it's original starting position and orientation
  markInvalid({ reason }) {
    this.state.status = statusEnums['CRITICAL_FAILURE'];
    this.state.details = reason;
    this.state.position = this.startPosition;
    this.state.orientation = this.startOrientation;
  }

  // Commit command to state:
  commitState({ ...props }) {
    let { position, orientation } = props;
    if (position) this.state.position = position;
    if (orientation) this.state.orientation = orientation;
  }
}
