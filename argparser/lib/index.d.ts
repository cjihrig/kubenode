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
export function parse(root: Command, args: string[]): {
    command: Command;
    flags: {
        [longOption: string]: string | boolean | (string | boolean)[];
    };
    positionals: string[];
};
declare namespace _default {
    export { parse };
}
export default _default;
export type CommandFlag = {
    /**
     * The data type of the flag.
     */
    type: string;
    /**
     * Indicates whether or not the flag may be specified multiple times.
     */
    multiple: boolean;
    /**
     * The short name of the flag.
     */
    short?: string;
    /**
     * The default value of the flag.
     */
    default?: any;
    /**
     * A textual description of the flag.
     */
    description?: string;
};
export type Command = {
    /**
     * The name of the command.
     */
    name: string;
    /**
     * A textual description of the command.
     */
    description?: string;
    /**
     * Subcommands of the current command.
     */
    subcommands?: any;
    /**
     * Executable functionality of the command.
     */
    run?: Function;
    /**
     * Flags available to this command and all subcommands.
     */
    globalFlags?: any;
    /**
     * Flags available to this command.
     */
    flags?: any;
    /**
     * Additional options to pass to util.parseArgs().
     */
    parserOptions?: any;
};
