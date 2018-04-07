import Cardinals from './cardinals';

export default function Rover(initData) {
  // example initData: "12 N \n LMLMLMLMM"

  // INGEST starting coords and orientation:
  const coords = initData.match(/\d\d\s[N|E|S|W]+/g).shift();
  if (coords) {
    const arr = coords.split('');
    this.position = { x: parseInt(arr[0]), y: parseInt(arr[1]) };
    this.orientation = arr[3];
  }

  // INGEST commands sequence:
  const commands = initData.match(/[L|M|R]+/g).shift();
  if (commands) this.commands = commands.split('').map(c => c.toUpperCase());

  // Excecute next command in the sequence:
  this.getNextState = () => {
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
  };

  // Commit command to state:
  this.commitState = ({ ...props }) => Object.assign(this, props);
}
