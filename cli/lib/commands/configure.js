'use strict';
const kCommand = 'configure';
const kDescription = 'Configure project settings';

function subcommands() {
  const managerImage = require('./configure_manager_image');
  const commands = new Map([
    [managerImage.command, managerImage]
  ]);

  return commands;
}

module.exports = {
  command: kCommand,
  description: kDescription,
  subcommands
};
