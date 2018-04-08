import fs from 'fs';
import MissionControl from './mission-control';

// Some test string data that's useful for debugging.
// import {
//   startCommands,
//   brokenCommands,
//   solarRadiationCorruptedCommands,
//   testForCollisionCommands,
//   twoRoversOneCommand,
//   invalidGrid,
// } from './data/test-data';

const inputData = fs.readFile(process.env.FILENAME, 'utf8', (err, contents) => {
    const housten = new MissionControl({
      commandData: contents,
      location: 'Housten',
    });

    // Begin the deployment of rovers at will!
    housten.deployRovers();
});



