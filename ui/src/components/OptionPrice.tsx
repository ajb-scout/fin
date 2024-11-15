
// src/components/OptionsChart.tsx
import React from 'react';
import { Card, Group, Text } from '@mantine/core';
import { OptionResult } from './OptionResult';
// import '@mantine/core/styles.css';

interface OptionsResultProps {
  data: OptionResult | undefined;
}
const OptionsResult: React.FC<OptionsResultProps> = ({ data }) => {
  return (
    <Card withBorder>
      {data ? (
    <>
    <Group>
        <Text>Price</Text>
        <Text c="white" fw={400}>{data.price.toPrecision(4)}</Text>
        </Group>
    </>
    ) : (
        <p>No option data available.</p>
      )}
    </Card>
  );
};

export default OptionsResult;



