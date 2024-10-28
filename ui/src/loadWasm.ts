// src/loadBsmModule.ts
export interface BsmModule extends Emscripten.Module {
    _black_scholes(S: number, K: number, T: number, r: number, sigma: number, is_call: boolean): number;
    _delta_for_price(SPtr: number, outputPtr: number, K: number, T: number, r: number, sigma: number, is_call: boolean, size: number): void;
    _malloc(size: number): number;
    _free(ptr: number): void;
    HEAPF64: Float64Array;
}

export const loadBsmModule = async (): Promise<BsmModule> => {
    // Load the module asynchronously using a dynamic import
    const module = await import('../public/bsm_pricing.js');

    // Initialize and return the module
    return new Promise<BsmModule>((resolve) => {
        module.default({ 
            locateFile: (file: string) => `/${file}`,
        }).then(resolve);
    });
};
