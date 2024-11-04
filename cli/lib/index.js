'use strict';
const { parseArgs } = require('node:util');
const rootCommand = {
  command: 'kubenode',
  description: 'Kubernetes tools for Node.js',
  subcommands() {
    const add = require('./commands/add');
    const codegen = require('./commands/codegen');
    const configure = require('./commands/configure');
    const init = require('./commands/init');
    // @ts-ignore
    const commands = new Map([
      [add.command, add],
      [codegen.command, codegen],
      [configure.command, configure],
      [init.command, init]
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

// eslint-disable-next-line require-await
async function run(args) {
  const { command, flags, positionals } = parse(rootCommand, args);

  return command.run(flags, positionals);
}

function parse(root, args) {
  let command = root;
  let globalFlags = { ...root.globalFlags };
  const consumed = [];

  const {
    positionals: rootPositionals = []
  } = runParseArgs(args, command, globalFlags);

  for (let i = 0; i < rootPositionals.length; ++i) {
    const subcommands = command.subcommands?.();
    if (subcommands === undefined) {
      break;
    }

    const positional = rootPositionals[i];
    const cmd = subcommands.get(positional);
    if (cmd === undefined) {
      break;
    }

    if (cmd.globalFlags) {
      globalFlags = { ...globalFlags, ...cmd.globalFlags };
    }

    consumed.push(positional);
    command = cmd;
  }

  if (typeof command.run !== 'function') {
    usage(command, root, globalFlags, consumed);
  }

  const {
    values: flags,
    positionals
  } = runParseArgs(args, command, globalFlags);

  return { command, flags, positionals };
}

function runParseArgs(args, command, globalFlags) {
  const config = {
    allowPositionals: true,
    strict: false,
    ...command.parserOptions,
    options: {
      ...globalFlags,
      ...command.flags
    },
    args
  };

  return parseArgs(config);
}

function usage(command, root, globalFlags, consumedPositionals) {
  const subcommands = command.subcommands?.();
  let usage = '';

  usage += 'Usage:\n';
  usage += `  ${root.command}`;

  if (consumedPositionals.length > 0) {
    usage += ` ${consumedPositionals.join(' ')}`;
  }

  if (subcommands instanceof Map) {
    usage += ' [command]';
  }

  usage += '\n';

  if (subcommands instanceof Map) {
    let maxCmdLen = 0;

    for (const cmd of subcommands.values()) {
      if (cmd.command.length > maxCmdLen) {
        maxCmdLen = cmd.command.length;
      }
    }

    usage += '\nAvailable Commands:\n';

    for (const cmd of subcommands.values()) {
      const padding = maxCmdLen - cmd.command.length;

      usage += `  ${cmd.command} ${' '.repeat(padding)} ${cmd.description}\n`;
    }
  }

  const combinedFlags = { ...globalFlags, ...command.flags };
  const flagEntries = Object.entries(combinedFlags);
  if (flagEntries.length > 0) {
    let maxFlagLen = 0;
    let hasShort = false;

    for (const [k, v] of flagEntries) {
      const len = v.type === 'string' ? k.length + 7 : k.length;
      if (len > maxFlagLen) {
        maxFlagLen = len;
      }

      if (v.short) {
        hasShort = true;
      }
    }

    usage += '\nFlags:\n';

    for (const [k, v] of flagEntries) {
      const short = v.short ? `-${v.short}, ` : hasShort ? '    ' : '';
      const type = v.type === 'string' ? ' string' : '';
      const flag = `${k}${type}`;
      const desc = v.description ?
        `   ${' '.repeat(maxFlagLen - flag.length)}${v.description}` : '';
      usage += `  ${short}--${flag}${desc}\n`;
    }
  }

  throw new Error(usage);
}

module.exports = { run };
