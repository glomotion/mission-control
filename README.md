[![Build Status](https://travis-ci.org/glomotion/mission-control.svg?branch=master)](https://travis-ci.org/glomotion/mission-control)

# NASA MissionControl App
A NodeJS app built for a coding challenge based on the control of Mars Rovers.

## Install:
Checkout the repository, and then:
```bash
$ yarn install
```
*Note: yarn is currently being used for scripts inside of package.json. If you prefer npm, you'll need to edit the "start" script to use "npm run" instead of "yarn".

## Run:
```bash
$ yarn demo # Startup the app using a demo text file for data input
# or
$ FILENAME=[reference filename here] yarn start # Startup the app using your own text file input
```

## Tests:
```bash
$ yarn test # Run unit tests
# or
$ yarn _test # Run unit tests and output coverage
```

## Technical assumptions:
MissionControl has been built with quite opinionated error handling.
Imagening the high stakes of remotely operating machinery on Mars - I've deliberately been quite conservative with the way that the application errors out / resets upon bad input or conditions.

Simply put, if MissionControl has any reason to doubt the success of a deployment, it will cease some/all operations before they cause a Rover to be left in an unplanned position / orientation.

- If MissionControl does not recieve valid gridSize coords in the very first line of command input, it will throw `Critical Failure!`.
- Due to the imagined presence of Solar wind / radiation, some allowance has been made for partial parsing of Rovers / command data - so long as the resulting definitions are **100% valid**. This means that MissionControl should be able to extract commands even if they are surrounded in garbled / corrupted data.
- If some Rovers are able to be moved, but others not, MissionControl will still move the valid Rovers, but will reset all erroneously commanded Rovers to their respective start positions & orientations. In that instance, MissionControl will signal `"PARTIAL_FAILURE"`, and state the reason, but still output final positions for Rovers (also indicating which one's failed)
- Rovers cannot drive over each other. So, if a Rover tries to move into a space currently occupied by another Rover, MissionControl will invalidate that Rover, and reset it to it's starting conditions.
- Rovers cannot drive out of bounds. If a Rover tries to move outside of the defined Grid, MissionControl will invalidate that Rover, and reset it to it's starting conditions.
- If a Rover's command sequence contains **any invalid commands** (anything but `[M|L|R]`) - that command sequence will be ignored and the Rover will remain in it's start position - with a `"CRITICAL_FAILURE"` status.

