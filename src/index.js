import MissionControl from './mission-control';
import {
  startCommands,
  brokenCommands,
  solarRadiationCorruptedCommands,
  testForCollisionCommands,
  twoRoversOneCommand,
  invalidGrid,
} from './data/test-data';

const housten = new MissionControl({
  commandData: brokenCommands,
  location: 'Housten',
});

// Begin the deployment of rovers at will!
housten.deployRovers();

