'use strict';
const kCommand = 'add';
const kDescription = 'Add resources to a project';

function subcommands() {
  const api = require('./add_api');
  const commands = new Map([
    [api.command, api]
  ]);

  return commands;
}

module.exports = {
  command: kCommand,
  description: kDescription,
  subcommands
};
