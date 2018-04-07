export default {
  N: {
    L: 'W',
    R: 'E',
    move: ({ x, y }) => {
      return { x, y: y + 1 };
    },
  },
  E: {
    L: 'N',
    R: 'S',
    move: ({ x, y }) => {
      return { x : x + 1, y };
    },
  },
  S: {
    L: 'E',
    R: 'W',
    move: ({ x, y }) => {
      return { x, y: y - 1 };
    },
  },
  W: {
    L: 'S',
    R: 'N',
    move: ({ x, y }) => {
      return { x: x - 1, y };
    },
  },
};
