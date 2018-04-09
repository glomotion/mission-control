# NASA MissionControl App
A NodeJS app built for a coding challenge based on the control of Mars Rovers.

## Install:
Checkout the repository, and then:
```
$ yarn install
```
*Note: yarn is currently being used for scripts inside of package.json. If you prefer npm, simply edit the scripts inside npm to use NPM.

## Run:
```
$ yarn demo // boots up the app using a demo text file for data input
// or
$ FILENAME=./src/data/[your text file here] yarn start
```

## Technical assumptions:
I've tried to make some judgement calls around error handling etc. Given the high stakes of remotely operating machinery on Mars - I've deliberately been quite conservative with the way that the application errors out upon bad input or conditions.

Simply put, if MissionControl has any reason to doubt the success of a deployment, it will cease some/all operations before they cause a Rover to be left in an unplanned position / orientation.

1. If MissionControl does not recieve valid Grid Size coords in the very first line of command input, it will throw "CRITICAL_ERROR".
2. If some Rovers are able to be moved, but others not, MissionControl will still move the valid Rovers, but will reset all invalidly commanded Rovers to their respective start position & orientations.
⋅⋅* Rovers cannot drive over each other. Hence, if a Rover tries to move into a space currently occupied by another Rover, MissionControl will invalidate that Rover, and reset it to it's starting conditions.
..* Rovers cannot drive out of bounds. If a Rover tries to move outside of the defined Grid, MissionControl will invalidate that Rover, and reset it to it's starting conditions.
