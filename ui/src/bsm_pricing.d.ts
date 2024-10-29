declare module "*.js?url" {
    export function createBsmModule(options: {
        locateFile: (file: string) => string;
    }): Promise<any>; // You can replace 'any' with a more specific type if you know it
}
