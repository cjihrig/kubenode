export class Project {
    static fromDirectory(directory: any): Project;
    constructor(data: any);
    domain: string;
    markers: any;
    projectName: string;
    projectPath: string;
    version: string;
    resources: any[];
    ensureResource(r: any): any;
    getResource(group: any, version: any, kind: any): any;
    inject(filename: any, marker: any, str: any): void;
    toJSON(): {
        domain: string;
        projectName: string;
        version: string;
        resources: any[];
    };
    write(): void;
    writeMarkers(): Promise<void>;
}
