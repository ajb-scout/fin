// src/App.tsx
import React, { useEffect, useState } from 'react';
import { Container, Grid, Title } from '@mantine/core';
import OptionForm from './components/OptionForm';
import OptionChart from './components/OptionChart';

import { MantineProvider } from '@mantine/core';
import OptionsResult, { Option3dData, OptionResult, TempOptionPriceArray } from './components/OptionResult';
import OptionChart3d from './components/Option3dChart';
import { WasmExports } from './wasm';
import { BsmModule, loadBsmModule } from './loadWasm';



const App: React.FC = () => {
  const [wasmExports, setWasmExports] = useState<WasmExports | null>(null);

  const [optionData, setOptionData] = useState<OptionResult>();
  const [optionCurveData, setOptionCurveData] = useState<TempOptionPriceArray>({ data: [] });
  const [greekCurveData, setGreekCurveData] = useState<TempOptionPriceArray>({ data: [] });
  const [option3dData, setOption3dData] = useState<Option3dData>({ data: [] });
  // const [deltaForTimeCurveData, setDeltaForTimeCurveData] = useState<TempOptionPriceArray>({ data: [] });

  // const [thetaForPriceCurveData, setThetaForPriceCurveData] = useState<TempOptionPriceArray>({ data: [] });
  // const [thetaForTimeCurveData, setThetaForTimeCurveData] = useState<TempOptionPriceArray>({ data: [] });

  // const [gammaForPriceCurveData, setGammaForPriceCurveData] = useState<TempOptionPriceArray>({ data: [] });
  // const [gammaForTimeCurveData, setGammaForTimeCurveData] = useState<TempOptionPriceArray>({ data: [] });


  const [module, setModule] = useState<BsmModule | null>(null);

  useEffect(() => {
    const initializeModule = async () => {
      const instance = await loadBsmModule();
      setModule(instance);
    };

    initializeModule();
  }, []);

  const calculateBlackScholes = () => {
    if (module) {
      const S = 100; // Example stock price
      const K = 100; // Example strike price
      const T = 1;   // Example time to expiration
      const r = 0.05; // Example risk-free rate
      const sigma = 0.2; // Example volatility
      const is_call = true; // Call option

      // Call the C++ function
      const price = module._black_scholes(S, K, T, r, sigma, is_call);
      console.log('Black-Scholes Price:', price);
    }
  };

  const calculateDeltaForPrice = () => {
    if (module) {
      const S = [100, 105, 110]; // Example stock prices
      const K = 100; // Strike price
      const T = 1;   // Time to expiration
      const r = 0.05; // Risk-free rate
      const sigma = 0.2; // Volatility
      const is_call = true; // Call option
      const size = S.length;

      // Allocate memory for input and output arrays
      const SPtr = module._malloc(size * Float64Array.BYTES_PER_ELEMENT);
      const outputPtr = module._malloc(size * Float64Array.BYTES_PER_ELEMENT);

      // Set values in the input array
      for (let i = 0; i < size; i++) {
        module.HEAPF64[SPtr / Float64Array.BYTES_PER_ELEMENT + i] = S[i];
      }

      // Call the function
      module._delta_for_price(SPtr, outputPtr, K, T, r, sigma, is_call, size);

      // Read the output array
      const output = new Float64Array(module.HEAPF64.buffer, outputPtr, size);
      console.log('Delta output:', output);

      // Free allocated memory
      module._free(SPtr);
      module._free(outputPtr);
    }
  };



  return (
    <MantineProvider>
      <button onClick={calculateDeltaForPrice}>Calculate Delta for Prices</button>

      <Grid gutter={{ base: 5, xs: 'md', md: 'xl', xl: 50 }}>
        <Grid.Col span={3}>
          <h1>Option Pricing</h1>
          <OptionForm updateOptionData={setOptionData}
            updateOptionCurveData={setOptionCurveData}
            updateDeltaCurveData={setGreekCurveData}
            updateOption3dData={setOption3dData} /></Grid.Col>
        <Grid.Col span={9}>
          <Grid bg="blue">
            <Grid.Col span={3}>
              <OptionsResult data={optionData} />
            </Grid.Col>
            <Grid.Col span={9}><OptionChart3d data={option3dData.data} /></Grid.Col>
            <Grid.Col span={12}>

              <OptionChart data={greekCurveData.data} />
            </Grid.Col>

          </Grid>
        </Grid.Col>
        {/* <OptionChart data={deltaForPriceCurveData.data}/> */}
        {/* TODO: 
          Delta for underlying price, 
          Delta for time 

          Theta for underlying price 
          Theta for time

          Gamma for underlying price 
          Gamma for time
          */}

      </Grid>
      {/* <OptionChart data={chartData} /> */}


      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </MantineProvider>
  )

};

export default App;

// import React, { useEffect, useState } from 'react';
// import { loadBsmModule, BsmModule } from './loadWasm';

// const App: React.FC = () => {
//     const [module, setModule] = useState<BsmModule | null>(null);

//     useEffect(() => {
//         const initializeModule = async () => {
//             const instance = await loadBsmModule();
//             setModule(instance);
//         };

//         initializeModule();
//     }, []);

//     const calculateBlackScholes = () => {
//         if (module) {
//             const S = 100; // Example stock price
//             const K = 100; // Example strike price
//             const T = 1;   // Example time to expiration
//             const r = 0.05; // Example risk-free rate
//             const sigma = 0.2; // Example volatility
//             const is_call = true; // Call option

//             // Call the C++ function
//             const price = module._black_scholes(S, K, T, r, sigma, is_call);
//             console.log('Black-Scholes Price:', price);
//         }
//     };

//     const calculateDeltaForPrice = () => {
//         if (module) {
//             const S = [100, 105, 110]; // Example stock prices
//             const K = 100; // Strike price
//             const T = 1;   // Time to expiration
//             const r = 0.05; // Risk-free rate
//             const sigma = 0.2; // Volatility
//             const is_call = true; // Call option
//             const size = S.length;

//             // Allocate memory for input and output arrays
//             const SPtr = module._malloc(size * Float64Array.BYTES_PER_ELEMENT);
//             const outputPtr = module._malloc(size * Float64Array.BYTES_PER_ELEMENT);

//             // Set values in the input array
//             for (let i = 0; i < size; i++) {
//                 module.HEAPF64[SPtr / Float64Array.BYTES_PER_ELEMENT + i] = S[i];
//             }

//             // Call the function
//             module._delta_for_price(SPtr, outputPtr, K, T, r, sigma, is_call, size);

//             // Read the output array
//             const output = new Float64Array(module.HEAPF64.buffer, outputPtr, size);
//             console.log('Delta output:', output);

//             // Free allocated memory
//             module._free(SPtr);
//             module._free(outputPtr);
//         }
//     };

//     return (
//         <div>
//             <h1>Black-Scholes Calculator</h1>
//             <button onClick={calculateBlackScholes}>Calculate Black-Scholes Price</button>
//             <button onClick={calculateDeltaForPrice}>Calculate Delta for Prices</button>
//         </div>
//     );
// };

// export default App;
