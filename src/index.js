import MissionControl from './mission-control';
import {
  startCommands,
  simpleCommands,
  solarRadiationCorruptedCommands,
  testForCollisionCommands,
  twoRoversOneCommand,
  invalidGrid,
} from './data/test-data';

const housten = new MissionControl({
  commandData: startCommands,
  location: 'Housten',
});

housten.deployRovers();

