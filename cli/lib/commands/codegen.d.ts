declare const kCommand: "codegen";
declare const kDescription: "Generate code from project resources";
export namespace flags {
    namespace group {
        let type: string;
        let multiple: boolean;
        let short: string;
        let description: string;
    }
    namespace kind {
        let type_1: string;
        export { type_1 as type };
        let multiple_1: boolean;
        export { multiple_1 as multiple };
        let short_1: string;
        export { short_1 as short };
        let description_1: string;
        export { description_1 as description };
    }
    namespace version {
        let type_2: string;
        export { type_2 as type };
        let multiple_2: boolean;
        export { multiple_2 as multiple };
        let short_2: string;
        export { short_2 as short };
        let description_2: string;
        export { description_2 as description };
    }
}
export function run(flags: any, positionals: any): Promise<void>;
export { kCommand as name, kDescription as description };
