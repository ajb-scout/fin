import { OptionsData } from "@mantine/core";
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
                is_call: true, // Adjust as needed
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
    optionInputs: OptionInputs,
    updateData: ((option3dData: Option3dData) => void)

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
                is_call: true, // Adjust as needed
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

        const updatedObjectsArray = data.map((obj: any, index: number) => {
            return {
                ...obj,                   // Spread the existing properties
                underlying_price: stock_range[index],  // Add new key from array1
                time_value: time_range[index]   // Add new key from array2
            };
        });

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
        const is_call = true; // Call option
        const tSize = T.length;
        const sSize = S.length
        // Allocate memory for input and output arrays
        const SPtr = bsmWasm._malloc(sSize * Float64Array.BYTES_PER_ELEMENT);
        const TPtr = bsmWasm._malloc(tSize * Float64Array.BYTES_PER_ELEMENT);

        const outputPtr = bsmWasm._malloc(tSize * sSize * Float64Array.BYTES_PER_ELEMENT);

        // Set values in the input array
        for (let i = 0; i < sSize; i++) {
            bsmWasm.HEAPF64[SPtr / Float64Array.BYTES_PER_ELEMENT + i] = S[i];
        }
        for (let i = 0; i < tSize; i++) {
            bsmWasm.HEAPF64[TPtr / Float64Array.BYTES_PER_ELEMENT + i] = T[i];
        }


        // Call the function
        bsmWasm._delta_for_price_time(SPtr, outputPtr, K, TPtr, r, sigma, is_call, sSize, tSize);
        console.log('Delta output:', outputPtr);

        // Read the output array
        const output = new Float64Array(bsmWasm.HEAPF64.buffer, outputPtr, tSize * sSize);
        console.log('Delta output:', output)

        // const greekOutputResponse: Array<{ delta_price_time_output: number; theta_price_time_output: null; gamma_price_time_output: null; time: number; price: number; }> = [];

        // Calculate the total size
        const totalSize = tSize * sSize;
        const greekOutputResponse: Option3dData = {data: []};

        // Assuming delta_price_time_output is obtained similarly to output
        const deltaPriceTimeOutput = new Float64Array(bsmWasm.HEAPF64.buffer, outputPtr, totalSize);

        // Iterate over each time step (T_range) and each asset price (S_range)
        for (let t = 0; t < tSize; t++) {
            for (let s = 0; s < sSize; s++) {
                const idx = t * sSize + s; // Correct index for the flattened output
                greekOutputResponse.data.push({
                    delta_price_time_output: deltaPriceTimeOutput[idx],
                    theta_price_time_output: 0,
                    gamma_price_time_output: 0,
                    time: T[t],
                    price: S[s]
                });
            }
        }


        // Free allocated memory
        bsmWasm._free(SPtr);
        bsmWasm._free(TPtr);
        bsmWasm._free(outputPtr);

        updateData(greekOutputResponse);

    };

};

//   const fetchOptionPriceRange = async () => {
//     try {
//       const response = await fetch('/api/option_price_curve', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           S: get_stockprice_range(Number(optionInputs.S), 500),
//           K: Number(optionInputs.K),
//           T: Number(optionInputs.t) / 365.0,
//           r: Number(optionInputs.r) / 100, // Convert percentage to decimal
//           sigma: Number(optionInputs.sigma) / 100, // Convert percentage to decimal
//           is_call: true, // Adjust as needed
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }

//       const data = await response.json();
//       console.log("Trying to updatecurvedata");
//       console.log(data);
//       updateOptionCurveData({ data: data })
//       // setOptionPrice(data.price);
//       // updateOptionData(data); // Set the option price from the response
//     } catch (error) {
//       console.error('Error fetching option price:', error);
//       setOptionPrice(null); // Reset on error
//     }
//   };