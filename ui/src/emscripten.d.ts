// src/emscripten.d.ts
declare module Emscripten {
    export interface Module {
        _malloc(size: number): number;  // Allocate memory
        _free(ptr: number): void;        // Free allocated memory
        HEAPF64: Float64Array;           // Pointer to the HEAPF64 array
        // Add any other Emscripten methods you might need
    }

    export interface EmscriptenModule extends Module {
        _black_scholes(S: number, K: number, T: number, r: number, sigma: number, is_call: boolean): number;
        _delta_for_price(SPtr: number, outputPtr: number, K: number, T: number, r: number, sigma: number, is_call: boolean, size: number): void;
        // Add other exported functions as needed
    }
}

// Exporting the Emscripten types for usage in your project
declare module "*.js" {
    const value: any;
    export default value;
}
