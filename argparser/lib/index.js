import { parseArgs } from 'node:util';

/**
 * @typedef {Object} CommandFlag
 * @property {string} type The data type of the flag.
 * @property {boolean} multiple Indicates whether or not the flag may be specified multiple times.
 * @property {string} [short] The short name of the flag.
 * @property {any} [default] The default value of the flag.
 * @property {string} [description] A textual description of the flag.
 *
 * @typedef {Object} Command
 * @property {string} name The name of the command.
 * @property {string} [description] A textual description of the command.
 * @property {any} [subcommands] Subcommands of the current command.
 * @property {function} [run] Executable functionality of the command.
 * @property {Object} [globalFlags] Flags available to this command and all subcommands.
 * @property {Object} [flags] Flags available to this command.
 * @property {Object} [parserOptions] Additional options to pass to util.parseArgs().
 */

/**
 * Parses input arguments given a command structure.
 * @param {Command} root The root command to parse.
 * @param {string[]} args The arguments to apply to the command.
 */
export function parse(root, args) {
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

/**
 * Run Node's util.parseArgs().
 * @param {string[]} args The arguments to apply to the command.
 * @param {Command} command The command to apply the arguments to.
 * @param {Object} globalFlags The current global flags.
 */
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

/**
 * Throws an exception containing usage text.
 * @param {Command} command The command to generate usage text for.
 * @param {Command} root The root command.
 * @param {Object} globalFlags The current global flags.
 * @param {string[]} consumedPositionals The arguments that have been consumed by the parser.
 */
function usage(command, root, globalFlags, consumedPositionals) {
  /** @type {Map<string, Command>|undefined} */
  const subcommands = command.subcommands?.();
  let usage = '';

  usage += 'Usage:\n';
  usage += `  ${root.name}`;

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
      if (cmd.name.length > maxCmdLen) {
        maxCmdLen = cmd.name.length;
      }
    }

    usage += '\nAvailable Commands:\n';

    for (const cmd of subcommands.values()) {
      const padding = maxCmdLen - cmd.name.length;

      usage += `  ${cmd.name} ${' '.repeat(padding)} ${cmd.description}\n`;
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

export default {
  parse
};
