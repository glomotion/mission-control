// test cases:
// - invalid commands
// - invalid rover start position

import Rover from '../../src/rover';
import statusEnums from '../../src/status-enums';

describe('Rover is created with bad data', () => {
  const rover = new Rover({ initData: '33 E\nMMRMMvRMRRM' });

  test('Rover ignores command sequence', () => {
    expect(rover.commands.length).toBe(0);
  });

  test('Rover starts with critical error status', () => {
    expect(rover.state.status).toBe(statusEnums["CRITICAL_FAILURE"]);
  });
});

describe('Rover is created with good data', () => {
  const rover = new Rover({ initData: '33 E\nMMRRM' });
  const reason = 'Just because';

  test('Rover can be invalidated, and resets to start position', () => {
    rover.markInvalid({ reason });
    expect(rover.state.status).toBe(statusEnums["CRITICAL_FAILURE"]);
    expect(rover.state.details).toBe(reason);
    expect(rover.state.position).toEqual(rover.startPosition);
    expect(rover.state.orientation).toBe(rover.startOrientation);
  });

  test('Rover can update its orientation', () => {
    const orientation = 'W';
    rover.commitState({ orientation });
    expect(rover.state.orientation).toBe(orientation);
  });

  test('Rover can update its own position', () => {
    const position = { x: 2, y: 3 };
    rover.commitState({ position });
    expect(rover.state.position).toEqual(position);
  });
});
