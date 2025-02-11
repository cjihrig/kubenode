'use strict';
const kCommand = 'add';
const kDescription = 'Add resources to a project';

function subcommands() {
  const api = require('./add_api');
  const webhook = require('./add_webhook');
  // @ts-ignore
  const commands = new Map([
    [api.name, api],
    [webhook.name, webhook]
  ]);

  return commands;
}

module.exports = {
  name: kCommand,
  description: kDescription,
  subcommands
};
