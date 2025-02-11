declare const kCommand: "configure";
declare const kDescription: "Configure project settings";
export function subcommands(): Map<string, {
    name: string;
    description: string;
    run: (flags: any, positionals: any) => Promise<void>;
}>;
export { kCommand as name, kDescription as description };
