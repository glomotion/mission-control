import Cardinals from './cardinals';
import statusEnums from './status-enums';

export default class Rover {
  constructor({ ...props }) {
    // example props.initData: "12 N \n LMLMLMLMM"

    // The basic anotomy of a rover:
    this.commands = [];
    this.position = {};
    this.orientation = null;
    this.status = { current: statusEnums['SUCCESS'] };

    this.ingestStartingPosition(props.initData);
    this.ingestCommandSequence(props.initData);
  }

  // INGEST starting coords and orientation:
  ingestStartingPosition(input) {
    const coords = input.match(/\d\d\s[N|E|S|W]+/g);
    if (coords) {
      const arr = coords[0].split('');
      this.position = { x: parseInt(arr[0]), y: parseInt(arr[1]) };
      this.orientation = arr[3].toUpperCase();
    }
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
      this.status.current = statusEnums['PARTIAL_FAILURE'];
      this.status.details = `Rover contains invalid command codes.`;
    }
  }

  // Excecute next command in the sequence:
  getNextState() {
    const step = this.commands.shift();
    switch (step) {
      case 'M':
        return {
          position: Cardinals[this.orientation].move({ ...this.position })
        };
        break;

      case 'L':
      case 'R':
        return { orientation: Cardinals[this.orientation][step] };
        break;

      default:

        // @TODO: currently unrecognised command!
        // do something in here:
        break;
    }
  }

  // Mark rover with invalid status:
  markInvalid({ reason }) {
    this.status = {
      current: statusEnums['PARTIAL_FAILURE'],
      details: reason,
    };
  }

  // Commit command to state:
  commitState({ ...props }) {
    return Object.assign(this, props);
  }
}
