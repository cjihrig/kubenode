'use strict';
const rootCommand = {
  name: 'kubenode',
  description: 'Kubernetes tools for Node.js',
  subcommands() {
    const add = require('./commands/add');
    const codegen = require('./commands/codegen');
    const configure = require('./commands/configure');
    const init = require('./commands/init');
    // @ts-ignore
    const commands = new Map([
      [add.name, add],
      [codegen.name, codegen],
      [configure.name, configure],
      [init.name, init]
    ]);

    return commands;
  },
  globalFlags: {
    directory: {
      type: 'string',
      multiple: false,
      short: 'w',
      default: process.cwd(),
      description: 'The working directory. Default: process.cwd()'
    }
  }
};


async function run(args) {
  const { parse } = await import('@kubenode/argparser');
  const { command, flags, positionals } = parse(rootCommand, args);

  return command.run(flags, positionals);
}

module.exports = { run };
