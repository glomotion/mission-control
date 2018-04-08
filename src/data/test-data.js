// possible test cases:
// - grid size is not the very first line of the sequence
// - invalid grid size
// - invalid commands
// - invalid rover start position
// - two rover orientation/positions in a row, no commands
// - rover orientation is lowercase (?)

export const startCommands = `55
12 N
LMLMLMLMM
33 E
MMRMMRMRRM`;

export const twoRoversOneCommand = `55
11 N
12 E
MMRMMRMRRM`

export const brokenCommands = `55
11 N
MMRMMRMRRM
33 E
MMRMMRMRRM
12 N
LL
33 E
MMRMMRMRRMMMM
21 W
MRMMRMMMMRRM
00 E
RMMRMMMMRRM`;

// just 1 rover below is considered "valid" in the following data ...
export const solarRadiationCorruptedCommands = `jkdshadskjhdasjkhsadkjhdsa
55
jkdshadskjhdasjkhsadkjhdsa
daskj dakjadsh
1@#$%^&*()
12 N
LMLMLMLMM
33 E
MMRMMvRMRRM
12 N
#!@$%^&*
LL
#!@$%^&*
33 e
MMRMMRvMRRMMMM
21 W
MRMMRMMvMMRRM
00 E
RMMvRMMMMRRM
daskj dakjadsh
1@#$%^&*()
#!@$%^&*`;

export const invalidGrid = `moo
55
11 N
MR`;

export const testForCollisionCommands = `55
11 N
M
22 W
M`;
