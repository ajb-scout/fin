// src/components/OptionsChart.tsx
import React from 'react';
import { LineChart } from '@mantine/charts';
import { TempOptionPriceArray } from './OptionResult';
import { Card, Grid } from '@mantine/core';
// import '@mantine/core/styles.css';

// interface OptionsChartProps {
//   data: {
//     labels: string;
//     prices: number;
//   }[];
// }
// const zip = (a: number[], b: number[]) => a.map((k, i) => [k, b[i]]);

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
  console.log("From options chart");
  console.log(data);
  return (
    <Card>
      <h2>Chart</h2>
      {data ? (
        <>
          <Grid>
            {mappings.map((mapping) => (
              <Grid.Col key={mapping.series} span={6}>
                <LineChart
                  h={300}
                  data={data}
                  dataKey={mapping.key}
                  xAxisLabel={mapping.x_label}
                  yAxisLabel={mapping.y_label}
                  series={[
                    { name: mapping.series, color: 'indigo.6' }, // Adjust color as needed
                  ]}
                  curveType="monotone"
                  withDots={false}
                />
              </Grid.Col>
            ))}

          </Grid>

        </>
      ) : (
        <p>No option data available.</p>
      )}

    </Card>

  );
};

export default OptionsChart;
