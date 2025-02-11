declare const kCommand: "webhook";
declare const kDescription: "Add a new webhook to a project";
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
    namespace mutating {
        let type_2: string;
        export { type_2 as type };
        let _default: boolean;
        export { _default as default };
        let multiple_2: boolean;
        export { multiple_2 as multiple };
        let short_2: string;
        export { short_2 as short };
        let description_2: string;
        export { description_2 as description };
    }
    namespace validating {
        let type_3: string;
        export { type_3 as type };
        let _default_1: boolean;
        export { _default_1 as default };
        let multiple_3: boolean;
        export { multiple_3 as multiple };
        let short_3: string;
        export { short_3 as short };
        let description_3: string;
        export { description_3 as description };
    }
    namespace version {
        let type_4: string;
        export { type_4 as type };
        let multiple_4: boolean;
        export { multiple_4 as multiple };
        let short_4: string;
        export { short_4 as short };
        let description_4: string;
        export { description_4 as description };
    }
}
export function run(flags: any, positionals: any): Promise<void>;
export { kCommand as name, kDescription as description };
