// src/components/OptionsChart.tsx
import React from 'react';
import { LineChart } from '@mantine/charts';
import { TempOptionPriceArray } from './OptionResult';
import { Card, Center, Grid, Text } from '@mantine/core';

interface OptionsChartProps {
  data: TempOptionPriceArray['data']; // This will be an array of { price: number; underlyings: number; }
}

const mappings = [
  {
    "series": "delta_price_output",
    "key": "underlying_price",
    "x_label": "Underlying Price",
    "y_label": "Delta"
  },
  {
    "series": "delta_time_output",
    "key": "time_value",
    "x_label": "Time",
    "y_label": "Delta"
  },
  {
    "series": "theta_price_output",
    "key": "underlying_price",
    "x_label": "Underlying Price",
    "y_label": "Theta"
  },
  {
    "series": "theta_time_output",
    "key": "time_value",
    "x_label": "Time",
    "y_label": "Theta"
  },
  {
    "series": "gamma_price_output",
    "key": "underlying_price",
    "x_label": "Underlying Price",
    "y_label": "Gamma"
  },
  {
    "series": "gamma_time_output",
    "key": "time_value",
    "x_label": "Time",
    "y_label": "Gamma"
  },

]

const OptionsChart: React.FC<OptionsChartProps> = ({ data }) => {
  return (
    <>
      {data ? (
        <>
          <Grid>
            {mappings.map((mapping) => (
              <Grid.Col key={mapping.series} span={{base: 6, md: 6, sm: 12}}>
                <Card withBorder>
                  <Center><Text>{mapping.y_label} vs. {mapping.x_label}</Text></Center>
                  <LineChart
                    h={300}
                    data={data}
                    dataKey={mapping.key}
                    xAxisLabel={mapping.x_label}
                    yAxisLabel={mapping.y_label}
                    series={[
                      { name: mapping.series, color: 'indigo.6' }, // Adjust color as needed
                    ]}
                    type="gradient"
                    gradientStops={[
                      { offset: 0, color: '#00ff00' },
                      { offset: 100, color: '#0000ff' },

                    ]}

                    curveType="monotone"
                    withDots={false}
                  />
                  {/* </CardSection> */}
                </Card>
              </Grid.Col>
            ))}

          </Grid>

        </>
      ) : (
        <p>No option data available.</p>
      )}s
    </>
  );
};

export default OptionsChart;
