// src/App.tsx
import React, { useEffect, useState } from 'react';
import { Grid, MantineProvider } from '@mantine/core';
import OptionForm from './components/OptionForm';
import OptionChart from './components/OptionChart';
import OptionsResult, { Option3dData, OptionInputs, OptionResult, TempOptionPriceArray } from './components/OptionResult';
import OptionChart3d from './components/Option3dChart';
import useBsmModule from './hooks/useBsmModule';
import { fetchOption3dArrays, fetchOptionGreekArrays, fetchOptionPrice } from './requests';

const App: React.FC = () => {
  const [optionData, setOptionData] = useState<OptionResult>();
  const [greekCurveData, setGreekCurveData] = useState<TempOptionPriceArray>({ data: [] });
  const [option3dData, setOption3dData] = useState<Option3dData>({ data: [] });
  const [optionInputs, setOptionInputs] = useState<OptionInputs>({
    S: 100,
    K: 100,
    t: 30,
    r: 5.0,
    sigma: 20.0,
    call: true
  });

  const bsmWasm = useBsmModule();

  useEffect(() => {
    console.log("here!");
    fetchOptionPrice(optionInputs, setOptionData);
    fetchOptionGreekArrays(optionInputs, setGreekCurveData);
    fetchOption3dArrays(optionInputs, setOption3dData);
  }, [optionInputs.S, optionInputs.K, optionInputs.t, optionInputs.sigma, optionInputs.r]);

  const calculateDeltaForPrice = () => {
    console.log("calling");
    console.log(bsmWasm);
    if (bsmWasm) {
      const S = [100, 105, 110]; // Example stock prices
      const K = 100; // Strike price
      const T = 1;   // Time to expiration
      const r = 0.05; // Risk-free rate
      const sigma = 0.2; // Volatility
      const is_call = true; // Call option
      const size = S.length;
      // Allocate memory for input and output arrays
      const SPtr = bsmWasm._malloc(size * Float64Array.BYTES_PER_ELEMENT);
      const outputPtr = bsmWasm._malloc(size * Float64Array.BYTES_PER_ELEMENT);

      // Set values in the input array
      for (let i = 0; i < size; i++) {
        bsmWasm.HEAPF64[SPtr / Float64Array.BYTES_PER_ELEMENT + i] = S[i];
      }

      // Call the function
      bsmWasm._delta_for_price(SPtr, outputPtr, K, T, r, sigma, is_call, size);

      // Read the output array
      const output = new Float64Array(bsmWasm.HEAPF64.buffer, outputPtr, size);
      console.log('Delta output:', output);

      // Free allocated memory
      bsmWasm._free(SPtr);
      bsmWasm._free(outputPtr);
    }
  };

  return (
    <MantineProvider>
      <button onClick={calculateDeltaForPrice}>Calculate Delta for Prices</button>
      <Grid gutter={{ base: 5, xs: 'md', md: 'xl', xl: 50 }}>
        <Grid.Col span={3}>
          <h1>Option Pricing</h1>
          <OptionForm

            bsmWasm={bsmWasm}
            optionInputs={optionInputs}
            setOptionInputs={setOptionInputs}
            />
        </Grid.Col>
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
      </Grid>
    </MantineProvider>
  );
};

export default App;

