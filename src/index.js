import fs from 'fs';
import MissionControl from './mission-control';

/*
// Various sets of test string data that are useful for logic debugging.
import {
  startCommands,
  brokenCommands,
  solarRadiationCorruptedCommands,
  testForCollisionCommands,
  twoRoversOneCommand,
  invalidGrid,
} from './data/test-data';
*/

fs.readFile(process.env.FILENAME, 'utf8', (err, contents) => {
  const housten = new MissionControl({
    commandData: contents,
    location: 'Housten',
  });

  // Begin the deployment of rovers at will!
  housten.deployRovers();
});



