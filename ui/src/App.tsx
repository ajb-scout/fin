// src/App.tsx
import React, { useEffect, useState } from 'react';
import { Grid, MantineProvider } from '@mantine/core';
import OptionForm from './components/OptionForm';
import OptionChart from './components/OptionChart';
import OptionsResult, { Option3dData, OptionInputs, OptionResult, TempOptionPriceArray } from './components/OptionResult';
import OptionChart3d from './components/Option3dChart';
import useBsmModule from './hooks/useBsmModule';
import { fetchOption3dArrays, fetchOption3dArraysWasm, fetchOptionGreekArrays, fetchOptionPrice } from './requests';

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
    fetchOption3dArraysWasm(optionInputs, setOption3dData, bsmWasm);
  }, [bsmWasm, optionInputs.S, optionInputs.K, optionInputs.t, optionInputs.sigma, optionInputs.r]);


  return (
    <MantineProvider>
      <button onClick={ ( () => fetchOption3dArraysWasm(optionInputs, setOption3dData, bsmWasm))}>Calculate Delta for Prices</button>
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

