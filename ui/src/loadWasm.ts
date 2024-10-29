// src/loadBsmModule.ts
export interface BsmModule extends Emscripten.Module {
    _black_scholes(S: number, K: number, T: number, r: number, sigma: number, is_call: boolean): number;
    _delta_for_price(SPtr: number, outputPtr: number, K: number, T: number, r: number, sigma: number, is_call: boolean, size: number): void;
    _malloc(size: number): number;
    _free(ptr: number): void;
        _delta(S: number, K: number, T: number, r: number, sigma: number, is_call: boolean): number;
    _gamma(S: number, K: number, T: number, r: number, sigma: number): number;
    _vega(S: number, K: number, T: number, r: number, sigma: number): number;
    _theta(S: number, K: number, T: number, r: number, sigma: number, is_call: boolean): number;
    _rho(S: number, K: number, T: number, r: number, sigma: number, is_call: boolean): number;
    _delta_for_price(S: number[], outputPtr: number, K: number, T: number, r: number, sigma: number, is_call: boolean, size: number): void;

    HEAPF64: Float64Array;
}

// export const loadBsmModule = async (): Promise<BsmModule> => {
//     try {
//         const module = await new Promise<{ default: (options: any) => Promise<BsmModule> }>((resolve, reject) => {
//             const script = document.createElement('script');
//             script.src = '../fin/bsm_pricing.js'; // Adjust path to your repo name
//             script.onload = () => {
//                 const emscriptenModule = (window as any).Module;
//                 if (emscriptenModule) {
//                     resolve(emscriptenModule);
//                 } else {
//                     reject(new Error("Module not found in window after script load"));
//                 }
//             };

//             script.onerror = (err) => reject(err);
//             document.body.appendChild(script);
//         });

//         return module.default({
//             locateFile: (file: string) => `/fin/${file}`, // Adjust as needed
//         });
//     } catch (error) {
//         console.error("Failed to load BSM module:", error);
//         throw error; // Rethrow to handle it in the calling code
//     }
// };

