// src/App.tsx
import React, { useEffect, useState } from 'react';
import { Card, Center, Container, createTheme, Grid, MantineProvider, NumberInput, Stack, Table, Text } from '@mantine/core';
import OptionForm from './components/OptionForm';
import OptionChart from './components/OptionChart';
import OptionsResult, { Option3dData, OptionInputs, OptionResult, TempOptionPriceArray } from './components/OptionResult';
import OptionChart3d from './components/Option3dChart';
import useBsmModule from './hooks/useBsmModule';
import { fetchOption3dArraysWasm, fetchOptionGreekArraysWasm, fetchOptionPriceWasm } from './requests';
import { LineChart } from '@mantine/charts';
import OptionPrice from './components/OptionPrice';


const theme = createTheme({
  // primaryColor: "white",


  components: {

    NumberInput: NumberInput.extend({
      styles: {
        root: { color: "white" }
      }
    }),

    Text: Text.extend({
      styles: {
        root: { color: "#00ff99", fontWeight: 800 }
      }
    }),

    Table: Table.extend({
      styles: {
        th: { color: "#00ff99" },
        tr: { color: "white" }
      }
    }),

    LineChart: LineChart.extend({
      styles: {
        root: {
          color: "white"
        }
      }
    }),

    Grid: Grid.extend({
      styles: {
        root: { backgroundColor: "#20293b" }
      }
    }),
    Card: Card.extend({

      styles: {

        root: { backgroundColor: "#283e6b", borderColor: "white", borderRadius: 10, }
      }
    }),
  },
});


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
    fetchOptionPriceWasm(optionInputs, setOptionData, bsmWasm);
    fetchOptionGreekArraysWasm(optionInputs, setGreekCurveData, bsmWasm);
    fetchOption3dArraysWasm(optionInputs, setOption3dData, bsmWasm);
  }, [bsmWasm, optionInputs.S, optionInputs.K, optionInputs.t, optionInputs.sigma, optionInputs.r, optionInputs.call]);



  return (

    <MantineProvider theme={theme}>
      <header style={{ height: 50, backgroundColor: "#20293b" }} ><Center><Text style={{ fontWeight: 10, color: "white" }} fw={12000}>Fin Vanilla Option Pricer</Text></Center></header>
      <Container fluid px={20}>
        <Grid grow gutter={{ base: 20, xs: 20, md: 10, xl: 20 }} >
          <Grid.Col span={{ base: 3, md: 3, xs: 12 }}>
            <OptionForm
              // bsmWasm={bsmWasm}
              optionInputs={optionInputs}
              setOptionInputs={setOptionInputs}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 9, md: 9, xs: 12 }}  >
            <Grid>
              <Grid.Col span={{ base: 3, md: 3, xs: 12 }} >
                <Stack>
                  <OptionPrice data={optionData} />
                  <OptionsResult data={optionData} />

                </Stack>
              </Grid.Col>
              <Grid.Col span={{ base: 9, md: 9, xs: 12 }} >
                <OptionChart3d data={option3dData.data} />
              </Grid.Col>
            </Grid>
            <Grid>
              <Grid.Col span={12}>
                <OptionChart data={greekCurveData.data} />
              </Grid.Col>
            </Grid>
          </Grid.Col>
        </Grid>
      </Container>
    </MantineProvider>
  )
};

export default App;

