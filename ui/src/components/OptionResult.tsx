
// src/components/OptionsChart.tsx
import React from 'react';
import { Card, Image, Text, Badge, Button, Group, Table, Divider } from '@mantine/core';
// import '@mantine/core/styles.css';

export interface OptionInputs {
    S: number;
    K: number;
    t: number;
    r: number;
    sigma: number;
    call: boolean;
  
  
}

export interface OptionResult {
  price: number;
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
  rho: number;
}

export interface TempOptionPriceArray {
  data: {
    delta_price_output: number;
    delta_time_output: number;
    theta_price_output: number;
    theta_time_output: number;
    gamma_price_output: number;
    gamma_time_output: number;
  }[];
}

export interface Option3dData {
  data: {
    delta_price_time_output: number;
    theta_price_time_output: number;
    gamma_price_time_output: number;
    time: number;
    price: number;
  }[];
}

interface OptionsResultProps {
  data: OptionResult | undefined;
}
const OptionsResult: React.FC<OptionsResultProps> = ({ data }) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      {data ? (
    <Table>
    <Table.Thead>
      <Table.Tr>
        <Table.Th>Greek</Table.Th>
        <Table.Th>Value</Table.Th>
      </Table.Tr>
    </Table.Thead>
    <Table.Tbody>
    <Table.Tr key="Delta">
      <Table.Td>Delta</Table.Td>
      <Table.Td>{data.delta.toFixed(5)}</Table.Td>
    </Table.Tr>
    <Table.Tr key="Theta">
      <Table.Td>Theta</Table.Td>
      <Table.Td>{(data.theta / 365).toFixed(5)}</Table.Td>
    </Table.Tr>
    <Table.Tr key="Gamma">
      <Table.Td>Gamma</Table.Td>
      <Table.Td>{data.gamma.toFixed(5)}</Table.Td>
    </Table.Tr>

    <Table.Tr key="Vega">
      <Table.Td>Vega</Table.Td>
      <Table.Td>{data.vega.toFixed(5)}</Table.Td>
    </Table.Tr>

    <Table.Tr key="Rho">
      <Table.Td>Rho</Table.Td>
      <Table.Td>{data.rho.toFixed(5)}</Table.Td>
    </Table.Tr>

    </Table.Tbody>
  </Table>
    ) : (
        <p>No option data available.</p>
      )}
    </Card>
  );
};

export default OptionsResult;



