const chalk = require('chalk');

const SecondaryIndexColor = chalk.hex('#f5cd79');
const IndexColor = chalk.yellow;
const FileColor = chalk.blue;
const LineColor = chalk.green;
const ContentColor = chalk;
const HighlightColor = chalk.bold.red;

// Can we reduce duplication???
module.exports = {
    IndexColor,
    FileColor,
    LineColor,
    ContentColor,
    HighlightColor,
    SecondaryIndexColor,
};