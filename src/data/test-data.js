export const startCommands = `55
12 N
LMLMLMLMM
33 E
MMRMMRMRRM`;
// Expected Output:
// 13 N
// 51 E
// ==========

export const twoRoversOneCommand = `55
11 N
12 E
MMRMMRMRRM`

export const brokenCommands = `55
11 N
MMRMMRMRRM
33 E
MMRMMRMRRM
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
