import {
  startCommands,
  brokenCommands,
  solarRadiationCorruptedCommands,
  twoRoversOneCommand,
  invalidGrid
} from '../../src/data/test-data';
import MissionControl from '../../src/mission-control';
import statusEnums from '../../src/status-enums';

/**
 * Tests width good data input.
*/

describe('Data input is good', () => {
  const housten = new MissionControl({
    commandData: startCommands,
    location: 'Housten',
  });
  test('Create an instance of MissionControl, and properly assign initial values', () => {
    expect(housten.state.status).toBe(statusEnums['SUCCESS']);
    expect(housten.gridSize).toEqual({ w: 5, h: 5 });
    expect(housten.location).toBe('Housten');
  });

  test('Creation of Rovers', () => {
    expect(housten.rovers.length).toBe(2);
    expect(housten.rovers[0].startPosition).toEqual({ x: 1, y: 2 });
    expect(housten.rovers[1].startPosition).toEqual({ x: 3, y: 3 });
    expect(housten.rovers[0].startOrientation).toBe('N');
    expect(housten.rovers[1].startOrientation).toBe('E');
  });

  test('Correct deployment of Rovers, when data is housten', () => {
    housten.deployRovers();
    expect(housten.state.status).toBe(statusEnums['SUCCESS']);
    expect(housten.rovers[0].state.status).toBe(statusEnums['SUCCESS']);
    expect(housten.rovers[1].state.status).toBe(statusEnums['SUCCESS']);
    expect(housten.rovers[0].state.position).toEqual({ x: 1, y: 3 });
    expect(housten.rovers[1].state.position).toEqual({ x: 5, y: 1 });
    expect(housten.rovers[0].state.orientation).toBe('N');
    expect(housten.rovers[1].state.orientation).toBe('E');
  });

  test('Correct output of final data', () => {
    expect(housten.printFinalPositions()).toBe(`13 N\n51 E\n==========`);
  });
});


/**
 * Tests with varying bad data input.
*/

describe('Some command sequences will result in collision/out-of-bounds', () => {
  const housten = new MissionControl({
    commandData: brokenCommands,
    location: 'Housten',
  });
  beforeAll(() => housten.deployRovers());
  test('Fail certain rovers when commands are readable but erroneous', () => {

    // Expect MissionControl's status to be "PARTIAL_FAILURE"
    expect(housten.state.status).toBe(statusEnums['PARTIAL_FAILURE']);

    // Rover 1 should be invalid (potential collision)
    // (and reset back to it's start position)
    expect(housten.rovers[0].state.status).toBe(statusEnums['CRITICAL_FAILURE']);
    expect(housten.rovers[0].state.details).toBe(
      `Commands contain a directive that would cause rovers to collide`
    );
    expect(housten.rovers[0].state.position).toEqual(housten.rovers[0].startPosition);
    expect(housten.rovers[0].state.orientation).toBe(housten.rovers[0].startOrientation);

    // Rover 2 should be valid
    expect(housten.rovers[1].state.status).toBe(statusEnums['SUCCESS']);
    expect(housten.rovers[1].state.position).toEqual({ x: 5, y: 1 });
    expect(housten.rovers[1].state.orientation).toBe('E');

    // Rover 3 should be invalid (potential out of bounds)
    // (and reset back to it's start position)
    expect(housten.rovers[2].state.status).toBe(statusEnums['CRITICAL_FAILURE']);
    expect(housten.rovers[2].state.details).toBe(
      `Commands contain a directive that moves the rover outside bounds`
    );
    expect(housten.rovers[2].state.position).toEqual(housten.rovers[2].startPosition);
    expect(housten.rovers[2].state.orientation).toBe(housten.rovers[2].startOrientation);
  });
  test('Printout final data when some Rover commands failed', () => {
    expect(housten.printFinalPositions()).toMatch(/Rover is INVALID\. Commands contain a directive that would cause rovers to collide/g);
    expect(housten.printFinalPositions()).toMatch(/Rover is INVALID\. Commands contain a directive that moves the rover outside bound/g);
  });
});

describe('Invalid grid size data', () => {
  const housten = new MissionControl({
    commandData: invalidGrid,
    location: 'Housten',
  });
  test('Set Critical Error status if a valid grid size does not prefix all command data', () => {
    expect(housten.deployRovers()).toBe(false);
    expect(housten.state.status).toBe(statusEnums['CRITICAL_FAILURE']);
    expect(housten.state.details).toBe(`Critical Failure!`
      + ` CommandData does not begin with valid GridSize data.`);
  });
});

describe('Two rovers specified with only one command sequence', () => {
  const housten = new MissionControl({
    commandData: twoRoversOneCommand,
    location: 'Housten',
  });
  test('Assign orders to correct Rover, when Rover start positions are parrallel', () => {
    expect(housten.rovers.length).toBe(2);
    expect(housten.rovers[0].commands).toEqual([]);
    expect(housten.rovers[1].commands).toEqual(['M','M','R','M','M','R','M','R','R','M']);
  });
});



