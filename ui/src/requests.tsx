import { Option3dData, OptionInputs, OptionResult, TempOptionPriceArray } from "./components/OptionResult";

const get_stockprice_range = (price: number, values: number, isPrice: boolean = false): number[] => {
    const range: number[] = [];
    var proportion;
    let highIncrement = price;
    let lowIncrement = price;

    if (isPrice) {
        proportion = price * 0.3 / values;

    } else {
        proportion = Math.max(price / values);
        highIncrement = proportion;
    }


    while (values > 0) {
        range.push(highIncrement);
        values -= 1;
        highIncrement += proportion;
        if (isPrice) {
            lowIncrement -= proportion;
            range.push(lowIncrement);
            values -= 1;
        }
    }
    return range.sort((n1, n2) => n1 - n2); // change this to be more efficient later
}



export const fetchOptionPrice = async (
    optionInputs: OptionInputs,
    updateOptionData: ((optionData: OptionResult) => void)
) => {
    try {
        const response = await fetch('/api/option_price', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                S: Number(optionInputs.S),
                K: Number(optionInputs.K),
                T: Number(optionInputs.t) / 365.0,
                r: Number(optionInputs.r) / 100, // Convert percentage to decimal
                sigma: Number(optionInputs.sigma) / 100, // Convert percentage to decimal
                is_call: optionInputs.call, // Adjust as needed
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        //   setOptionPrice(data.price);
        updateOptionData(data); // Set the option price from the response
    } catch (error) {
        console.error('Error fetching option price:', error);
    }
};

export const fetchOptionGreekArrays = async (
    optionInputs: OptionInputs,
    updateOptionCurveData: ((optionCurveData: TempOptionPriceArray) => void)

) => {
    try {
        const accuracy = 50;
        const stock_range = get_stockprice_range(Number(optionInputs.S), accuracy);
        const time_range = get_stockprice_range(Number(optionInputs.t) / 365.0, accuracy);

        const response = await fetch('/api/greek_arrays', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({
                S_array: stock_range,
                T_array: time_range,
                S: Number(optionInputs.S),
                K: Number(optionInputs.K),
                T: Number(optionInputs.t) / 365.0,
                r: Number(optionInputs.r) / 100, // Convert percentage to decimal
                sigma: Number(optionInputs.sigma) / 100, // Convert percentage to decimal
                is_call: true, // Adjust as needed
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log("Trying to updatecurvedata and get bulkdata");
        console.log(data);
        // data.stock_range = stock_range;
        // data.time_range = time_range;

        const updatedObjectsArray = data.map((obj: any, index: number) => {
            return {
                ...obj,                   // Spread the existing properties
                underlying_price: stock_range[index],  // Add new key from array1
                time_value: time_range[index]   // Add new key from array2
            };
        });

        updateOptionCurveData({ data: updatedObjectsArray })
        console.log("set the greek data");

    } catch (error) {
        console.error('Error fetching option price:', error);
    }
};

export const fetchOption3dArrays = async (
    optionInputs: OptionInputs
) => {
    try {
        const accuracy = 50;
        const stock_range = get_stockprice_range(Number(optionInputs.S), accuracy, true);
        const time_range = get_stockprice_range(Number(optionInputs.t) / 365.0, accuracy, false);

        const response = await fetch('/api/greek_arrays_3d', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },

            body: JSON.stringify({
                S_array: stock_range,
                T_array: time_range,
                S: Number(optionInputs.S),
                K: Number(optionInputs.K),
                T: Number(optionInputs.t) / 365.0,
                r: Number(optionInputs.r) / 100, // Convert percentage to decimal
                sigma: Number(optionInputs.sigma) / 100, // Convert percentage to decimal
                is_call: optionInputs.call, // Adjust as needed
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log("Trying to get 3d data ");
        console.log(data);
        // data.stock_range = stock_range;
        // data.time_range = time_range;


        // updateData({ data: updatedObjectsArray })
        console.log("set the option 3d greek data");

    } catch (error) {
        console.error('Error fetching option price:', error);
    }

};

export const fetchOption3dArraysWasm = async (
    optionInputs: OptionInputs,
    updateData: ((option3dData: Option3dData) => void),
    bsmWasm: any // this is bad need to add typing eventually
) => {
    const accuracy = 50;
    const stock_range = get_stockprice_range(Number(optionInputs.S), accuracy, true);
    const time_range = get_stockprice_range(Number(optionInputs.t) / 365.0, accuracy, false);
    if (bsmWasm) {
        const S = stock_range; // Example stock prices
        const K = optionInputs.K; // Strike price
        const T = time_range;   // Time to expiration
        const r = optionInputs.r / 100; // Risk-free rate
        const sigma = optionInputs.sigma / 100; // Volatility
        const is_call = optionInputs.call; // Call option
        const tSize = T.length;
        const sSize = S.length
        // Allocate memory for input and output arrays
        const SPtr = bsmWasm._malloc(sSize * Float64Array.BYTES_PER_ELEMENT);
        const TPtr = bsmWasm._malloc(tSize * Float64Array.BYTES_PER_ELEMENT);

        const outputPtrDelta = bsmWasm._malloc(tSize * sSize * Float64Array.BYTES_PER_ELEMENT);
        const outputPtrTheta = bsmWasm._malloc(tSize * sSize * Float64Array.BYTES_PER_ELEMENT);
        const outputPtrGamma = bsmWasm._malloc(tSize * sSize * Float64Array.BYTES_PER_ELEMENT);

        // Set values in the input array
        for (let i = 0; i < sSize; i++) {
            bsmWasm.HEAPF64[SPtr / Float64Array.BYTES_PER_ELEMENT + i] = S[i];
        }
        for (let i = 0; i < tSize; i++) {
            bsmWasm.HEAPF64[TPtr / Float64Array.BYTES_PER_ELEMENT + i] = T[i];
        }


        // Call the function
        bsmWasm._delta_for_price_time(SPtr, outputPtrDelta, K, TPtr, r, sigma, is_call, sSize, tSize);
        bsmWasm._gamma_for_price_time(SPtr, outputPtrGamma, K, TPtr, r, sigma, is_call, sSize, tSize);
        bsmWasm._theta_for_price_time(SPtr, outputPtrTheta, K, TPtr, r, sigma, is_call, sSize, tSize);


        // Read the output array
        const outputDelta = new Float64Array(bsmWasm.HEAPF64.buffer, outputPtrDelta, tSize * sSize);
        const outputTheta = new Float64Array(bsmWasm.HEAPF64.buffer, outputPtrTheta, tSize * sSize);
        const outputGamma = new Float64Array(bsmWasm.HEAPF64.buffer, outputPtrGamma, tSize * sSize);


        const greekOutputResponse: Option3dData = {data: []};

        // Assuming delta_price_time_output is obtained similarly to output

        // Iterate over each time step (T_range) and each asset price (S_range)
        for (let t = 0; t < tSize; t++) {
            for (let s = 0; s < sSize; s++) {
                const idx = t * sSize + s; // Correct index for the flattened output
                greekOutputResponse.data.push({
                    delta_price_time_output: outputDelta[idx],
                    theta_price_time_output: outputTheta[idx],
                    gamma_price_time_output: outputGamma[idx],
                    time: T[t],
                    price: S[s]
                });
            }
        }


        // Free allocated memory
        bsmWasm._free(SPtr);
        bsmWasm._free(TPtr);
        bsmWasm._free(outputPtrDelta);
        bsmWasm._free(outputPtrTheta);
        bsmWasm._free(outputPtrGamma);
        console.log(greekOutputResponse);
        updateData(greekOutputResponse);

    };

};

export const fetchOptionGreekArraysWasm = async (
    optionInputs: OptionInputs,
    updateOptionCurveData: (optionCurveData: TempOptionPriceArray) => void,
    bsmWasm: any
) => {
    try {
        const accuracy = 50;
        const stock_range = get_stockprice_range(Number(optionInputs.S), accuracy, true);
        const time_range = get_stockprice_range(Number(optionInputs.t) / 365.0, accuracy);

        const S = Number(optionInputs.S);
        const K = Number(optionInputs.K);
        const T = Number(optionInputs.t) / 365.0;
        const r = Number(optionInputs.r) / 100; // Convert percentage to decimal
        const sigma = Number(optionInputs.sigma) / 100; // Convert percentage to decimal
        const is_call = optionInputs.call; // Adjust as needed

        const sSize = stock_range.length;
        const tSize = time_range.length;

        // Allocate memory for input and output arrays
        const SPtr = bsmWasm._malloc(sSize * Float64Array.BYTES_PER_ELEMENT);
        const TPtr = bsmWasm._malloc(tSize * Float64Array.BYTES_PER_ELEMENT);
        const deltaPriceOutputPtr = bsmWasm._malloc(sSize * Float64Array.BYTES_PER_ELEMENT);
        const deltaTimeOutputPtr = bsmWasm._malloc(tSize * Float64Array.BYTES_PER_ELEMENT);
        const thetaPriceOutputPtr = bsmWasm._malloc(sSize * Float64Array.BYTES_PER_ELEMENT);
        const thetaTimeOutputPtr = bsmWasm._malloc(tSize * Float64Array.BYTES_PER_ELEMENT);
        const gammaPriceOutputPtr = bsmWasm._malloc(sSize * Float64Array.BYTES_PER_ELEMENT);
        const gammaTimeOutputPtr = bsmWasm._malloc(tSize * Float64Array.BYTES_PER_ELEMENT);

        // Set values in the input array
        for (let i = 0; i < sSize; i++) {
            bsmWasm.HEAPF64[SPtr / Float64Array.BYTES_PER_ELEMENT + i] = stock_range[i];
        }
        for (let i = 0; i < tSize; i++) {
            bsmWasm.HEAPF64[TPtr / Float64Array.BYTES_PER_ELEMENT + i] = time_range[i];
        }

        // Call the WASM functions
        bsmWasm._delta_for_price(SPtr, deltaPriceOutputPtr, K, T, r, sigma, is_call, sSize);
        bsmWasm._delta_for_time(S, deltaTimeOutputPtr, K, TPtr, r, sigma, is_call, tSize);
        bsmWasm._theta_for_price(SPtr, thetaPriceOutputPtr, K, T, r, sigma, is_call, sSize);
        bsmWasm._theta_for_time(S, thetaTimeOutputPtr, K, TPtr, r, sigma, is_call, tSize);
        bsmWasm._gamma_for_price(SPtr, gammaPriceOutputPtr, K, T, r, sigma, is_call, sSize);
        bsmWasm._gamma_for_time(S, gammaTimeOutputPtr, K, TPtr, r, sigma, is_call, tSize);

        // Read the output arrays
        const deltaPriceOutput = new Float64Array(bsmWasm.HEAPF64.buffer, deltaPriceOutputPtr, sSize);
        const deltaTimeOutput = new Float64Array(bsmWasm.HEAPF64.buffer, deltaTimeOutputPtr, tSize);
        const thetaPriceOutput = new Float64Array(bsmWasm.HEAPF64.buffer, thetaPriceOutputPtr, sSize);
        const thetaTimeOutput = new Float64Array(bsmWasm.HEAPF64.buffer, thetaTimeOutputPtr, tSize);
        const gammaPriceOutput = new Float64Array(bsmWasm.HEAPF64.buffer, gammaPriceOutputPtr, sSize);
        const gammaTimeOutput = new Float64Array(bsmWasm.HEAPF64.buffer, gammaTimeOutputPtr, tSize);

        // Construct the updatedObjectsArray using a for loop
        const updatedObjectsArray= [];

        for (let i = 0; i < sSize; i++) {
            updatedObjectsArray.push({
                delta_price_output: deltaPriceOutput[i],
                delta_time_output: deltaTimeOutput[i],
                theta_price_output: thetaPriceOutput[i],
                theta_time_output: thetaTimeOutput[i],
                gamma_price_output: gammaPriceOutput[i],
                gamma_time_output: gammaTimeOutput[i],
                underlying_price: Math.round(stock_range[i]),
                time_value: Math.round(time_range[i] * 365.0)
            });
        }

        updateOptionCurveData({ data: updatedObjectsArray });
            
        // Free allocated memory
        bsmWasm._free(SPtr);
        bsmWasm._free(TPtr);
        bsmWasm._free(deltaPriceOutputPtr);
        bsmWasm._free(deltaTimeOutputPtr);
        bsmWasm._free(thetaPriceOutputPtr);
        bsmWasm._free(thetaTimeOutputPtr);
        bsmWasm._free(gammaPriceOutputPtr);
        bsmWasm._free(gammaTimeOutputPtr);
        
    } catch (error) {
        console.error('Error fetching option price:', error);
    }
};


export const fetchOptionPriceWasm = async (
    optionInputs: OptionInputs,
    updateOptionData: (optionData: OptionResult) => void,
    bsmWasm: any
) => {
    try {
        const S = Number(optionInputs.S);
        const K = Number(optionInputs.K);
        const T = Number(optionInputs.t) / 365.0;
        const r = Number(optionInputs.r) / 100; // Convert percentage to decimal
        const sigma = Number(optionInputs.sigma) / 100; // Convert percentage to decimal
        const is_call = optionInputs.call; // Adjust as needed

        // Call the WASM functions and get the returned values
        const price = bsmWasm._black_scholes(S, K, T, r, sigma, is_call);
        const delta = bsmWasm._delta(S, K, T, r, sigma, is_call);
        const gamma = bsmWasm._gamma(S, K, T, r, sigma);
        const vega = bsmWasm._vega(S, K, T, r, sigma);
        const theta = bsmWasm._theta(S, K, T, r, sigma, is_call);
        const rho = bsmWasm._rho(S, K, T, r, sigma, is_call);

        // Construct the result object
        const optionData: OptionResult = {
            price,
            delta,
            gamma,
            vega,
            theta,
            rho
        };

       updateOptionData(optionData);
    } catch (error) {
        console.error('Error fetching option price:', error);
    }
};
