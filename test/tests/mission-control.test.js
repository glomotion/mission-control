import { startCommands } from '../../src/data/test-data';
import MissionControl from '../../src/mission-control';
import statusEnums from '../../src/status-enums';

const housten = new MissionControl({
  commandData: startCommands,
  location: 'Housten',
});

/*
55
12 N
LMLMLMLMM
33 E
MMRMMRMRRM

Expected Output:
13 N
51 E
==========
*/

test('Create an instance of MissionControl, and properly assign initial values', () => {
  expect(housten.state.status).toBe(statusEnums['SUCCESS']);
  expect(housten.gridSize).toEqual({ w: 5, h: 5 });
  expect(housten.location).toBe('Housten');
});

test('Creation of valid Rovers', () => {
  expect(housten.rovers[0].startPosition).toEqual({ x: 1, y: 2 });
  expect(housten.rovers[0].startOrientation).toBe('N');
  expect(housten.rovers[1].startPosition).toEqual({ x: 3, y: 3 });
  expect(housten.rovers[1].startOrientation).toBe('E');
});

test('Correct deployment of Rovers, when data is valid', () => {
  housten.deployRovers();
  expect(housten.rovers[0].state.position).toEqual({ x: 1, y: 3 });
  expect(housten.rovers[0].state.orientation).toBe('N');
  expect(housten.rovers[1].state.position).toEqual({ x: 5, y: 1 });
  expect(housten.rovers[1].state.orientation).toBe('E');
});

test('Correct output of final data', () => {
  expect(housten.printFinalPositions()).toBe(`13 N\n51 E\n==========`);
});

test('Viability check correctly fails', () => {

});




