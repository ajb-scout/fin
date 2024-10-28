// src/wasm.d.ts
export interface WasmExports {
    delta_for_price_time: (S: Float64Array, output: Float64Array, K: number, T: Float64Array, r: number, sigma: number, is_call: boolean, size: number) => void;
    theta_for_price_time: (S: Float64Array, output: Float64Array, K: number, T: Float64Array, r: number, sigma: number, is_call: boolean, size: number) => void;
    gamma_for_price_time: (S: Float64Array, output: Float64Array, K: number, T: Float64Array, r: number, sigma: number, is_call: boolean, size: number) => void;
}
