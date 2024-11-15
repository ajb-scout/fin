// src/components/OptionForm.tsx
import React from 'react';
import {
  NumberInput,
  Stack,
  Slider,
  Button,
  Card,
  SegmentedControl,
} from '@mantine/core';
import { OptionInputs } from './OptionResult';

interface ChildProps {
  optionInputs: OptionInputs;
  setOptionInputs: (data: OptionInputs) => void;
}


const OptionForm: React.FC<ChildProps> = ({ optionInputs, setOptionInputs}) => {
  const resetForm = () => {
    setOptionInputs({
      S: 100,
      K: 100,
      t: 30,
      r: 5,
      sigma: 20,
      call: true
    });
  }

  return (
    <Card withBorder>
      <Stack>
        <NumberInput
          label="Stock Price"
          value={optionInputs.S}
          onChange={(value) => setOptionInputs({...optionInputs, S: Number(value)})}
          min={0}
          required
        />
        <Slider
          label="Underlying Asset Price"
          value={Number(optionInputs.S)}
          onChange={(value) => setOptionInputs({...optionInputs, S: Number(value)})}
          min={0}
          max={Number(optionInputs.S) * 2}

        />

        <NumberInput
          label="Strike Price"
          value={optionInputs.K}
          onChange={(value) =>setOptionInputs({...optionInputs, K: Number(value)})}
          min={0}
          required
        />
        <Slider
          label="Strike Price"
          value={Number(optionInputs.K)}
          onChange={(value) => setOptionInputs({...optionInputs, K: Number(value)})}
          min={0}
        />

        <NumberInput
          label="Time to Expiration (days)"
          value={optionInputs.t}
          onChange={(value) => setOptionInputs({...optionInputs, t: Number(value)})}
          min={0}
          required
        />
        <Slider
          label="Time to Expiration (days)"
          defaultValue={Number(optionInputs.t)}
          onChange={(value) => setOptionInputs({...optionInputs, t: Number(value)})}
          min={0}
        />
        <NumberInput
          label="Sigma (%)"
          value={optionInputs.sigma}
          onChange={(value) => setOptionInputs({...optionInputs, sigma: Number(value)})}
          suffix="%"
          min={0}
          max={100}
          required
        />
        <Slider
          label="optionInputs.sigma (%)"
          value={Number(optionInputs.sigma)}
          onChange={(value) => setOptionInputs({...optionInputs, sigma: Number(value)})}
          min={0}
          max={100}

        />

        <NumberInput
          label="Risk-Free Interest Rate (%)"
          value={optionInputs.r}
          onChange={(value) => setOptionInputs({...optionInputs, r: Number(value)})}
          suffix="%"
          min={0}
          required
        />
        <Slider
          label="Risk-Free Interest Rate (%)"
          value={Number(optionInputs.r)}
          onChange={(value) => setOptionInputs({...optionInputs, r: Number(value)})}
          min={0}
        />
         <SegmentedControl
      value={String(optionInputs.call)}
      onChange={(value) => {
        if(value == "true"){
          setOptionInputs({...optionInputs, call: Boolean(true)})
        } else {
          setOptionInputs({...optionInputs, call: Boolean(false)})

        }
      }}
      data={[
        { label: 'Call', value: 'true' },
        { label: 'Put', value: 'false' },
      ]}
    />


        <Button onClick={resetForm}>Reset Values</Button>
      </Stack>
    </Card>
  );
};

export default OptionForm;


