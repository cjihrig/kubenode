declare const kCommand: "add";
declare const kDescription: "Add resources to a project";
export function subcommands(): Map<string, {
    name: string;
    description: string;
    flags: {
        group: {
            type: string;
            multiple: boolean;
            short: string;
            description: string;
        };
        kind: {
            type: string;
            multiple: boolean;
            short: string;
            description: string;
        };
        version: {
            type: string;
            multiple: boolean;
            short: string;
            description: string;
        };
    };
    run: (flags: any, positionals: any) => Promise<void>;
}>;
export { kCommand as name, kDescription as description };
