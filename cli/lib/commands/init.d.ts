declare const kCommand: "init";
declare const kDescription: "Initialize a new project";
export const flags: {
    domain: {
        type: string;
        multiple: boolean;
        short: string;
        description: string;
    };
    'project-name': {
        type: string;
        multiple: boolean;
        short: string;
        default: string;
        description: string;
    };
};
export function run(flags: any, positionals: any): Promise<void>;
export { kCommand as name, kDescription as description };
