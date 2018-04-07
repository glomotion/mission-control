const path = require('path');

module.exports = {
	rootDir: path.resolve(__dirname, '../'),
	moduleFileExtensions: [ 'js' ],
	verbose: true,
  transform: {
    "^.+\\.js$": "babel-jest",
  },
  globals: {
    "NODE_ENV": "test"
  },
  moduleFileExtensions: [
    "js",
  ],
  moduleDirectories: [
    "node_modules",
  ]
}