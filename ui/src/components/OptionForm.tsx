// src/components/OptionForm.tsx
import React, { useState, useEffect } from 'react';
import {
  NumberInput,
  Group,
  Stack,
  Text,
  Slider,
  Button,
  Card,
} from '@mantine/core';
import { Option3dData, OptionResult, TempOptionPriceArray } from './OptionResult';

interface ChildProps {
  updateOptionData: (data: OptionResult) => void;
  updateOptionCurveData: (data: TempOptionPriceArray) => void;
  updateDeltaCurveData: (data: TempOptionPriceArray) => void;
  updateOption3dData: (data: Option3dData) => void;
}


const OptionForm: React.FC<ChildProps> = ({ updateOptionData, updateOptionCurveData, updateDeltaCurveData, updateOption3dData}) => {
  const [underlyingPrice, setUnderlyingPrice] = useState<string | number>(100.00);
  const [strikePrice, setStrikePrice] = useState<string | number>(105.00);
  const [timeToExpiration, setTimeToExpiration] = useState<string | number>(30);
  const [volatility, setVolatility] = useState<string | number>(20);
  const [riskFreeRate, setRiskFreeRate] = useState<string | number>(5);
  const [optionPrice, setOptionPrice] = useState<number | null>(null); // State to hold the calculated option price

  const get_stockprice_range = (price: number, values: number) => {
    const range: number[] = [];
    const proportion = Math.max(0.5, price / values);
    // const proportion = 0.25;
    let lowIncrement = price;
    let highIncrement = proportion;

    // range.push(price);


    while (values > 0) {
      range.push(highIncrement);
      values -= 1;
      highIncrement += proportion;

      // lowIncrement -= proportion;
      // if (lowIncrement > 0) {
      //   range.unshift(lowIncrement);
      //   values -= 1;
      // }

    }
    return range.sort((n1, n2) => n1 - n2); // change this to be more efficient later
  }

  const resetForm = () => {
    setUnderlyingPrice(100);
    setStrikePrice(100);
    setTimeToExpiration(30);
    setVolatility(20);
    setRiskFreeRate(5);

  }

  // Effect to fetch the option price whenever any input value changes
  useEffect(() => {
    const fetchOptionPrice = async () => {
      try {
        const response = await fetch('/api/option_price', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            S: Number(underlyingPrice),
            K: Number(strikePrice),
            T: Number(timeToExpiration) / 365.0,
            r: Number(riskFreeRate) / 100, // Convert percentage to decimal
            sigma: Number(volatility) / 100, // Convert percentage to decimal
            is_call: true, // Adjust as needed
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setOptionPrice(data.price);
        updateOptionData(data); // Set the option price from the response
      } catch (error) {
        console.error('Error fetching option price:', error);
        setOptionPrice(null); // Reset on error
      }
    };

    const fetchOptionGreekArrays = async () => {
      try {
        const accuracy = 50;
        const stock_range = get_stockprice_range(Number(underlyingPrice), accuracy);
        const time_range = get_stockprice_range(Number(timeToExpiration), accuracy);

        const response = await fetch('/api/greek_arrays', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            S_array: stock_range,
            T_array: time_range,
            S: Number(underlyingPrice),
            K: Number(strikePrice),
            T: Number(timeToExpiration) / 365.0,
            r: Number(riskFreeRate) / 100, // Convert percentage to decimal
            sigma: Number(volatility) / 100, // Convert percentage to decimal
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
        
        updateDeltaCurveData({data:updatedObjectsArray})
        console.log("set the greek data");

      } catch (error) {
        console.error('Error fetching option price:', error);
        setOptionPrice(null); // Reset on error
      }
    };

    const fetchOption3dArrays = async () => {
      try {
        const accuracy = 50;
        const stock_range = get_stockprice_range(Number(underlyingPrice), accuracy);
        const time_range = get_stockprice_range(Number(timeToExpiration), accuracy);

        const response = await fetch('/api/greek_arrays_3d', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            S_array: stock_range,
            T_array: time_range,
            S: Number(underlyingPrice),
            K: Number(strikePrice),
            T: Number(timeToExpiration) / 365.0,
            r: Number(riskFreeRate) / 100, // Convert percentage to decimal
            sigma: Number(volatility) / 100, // Convert percentage to decimal
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
        
        updateOption3dData({data:updatedObjectsArray})
        console.log("set the option 3d greek data");

      } catch (error) {
        console.error('Error fetching option price:', error);
        setOptionPrice(null); // Reset on error
      }
  
    };

    const fetchOptionPriceRange = async () => {
      try {
        const response = await fetch('/api/option_price_curve', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            S: get_stockprice_range(Number(underlyingPrice), 500),
            K: Number(strikePrice),
            T: Number(timeToExpiration) / 365.0,
            r: Number(riskFreeRate) / 100, // Convert percentage to decimal
            sigma: Number(volatility) / 100, // Convert percentage to decimal
            is_call: true, // Adjust as needed
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log("Trying to updatecurvedata");
        console.log(data);
        updateOptionCurveData({ data: data })
        // setOptionPrice(data.price);
        // updateOptionData(data); // Set the option price from the response
      } catch (error) {
        console.error('Error fetching option price:', error);
        setOptionPrice(null); // Reset on error
      }
    };
    fetchOptionPriceRange()
    fetchOptionPrice();
    fetchOption3dArrays();
    fetchOptionGreekArrays();
  }, [underlyingPrice, strikePrice, timeToExpiration, volatility, riskFreeRate]);


  return (
    <Card>
      <Stack>
        <NumberInput
          label="Stock Price"
          value={underlyingPrice}
          onChange={(value) => setUnderlyingPrice(value)}
          min={0}
          required
        />
        <Slider
          label="Underlying Asset Price"
          value={Number(underlyingPrice)}
          onChange={(value) => setUnderlyingPrice(value)}
          min={0}
          max={Number(underlyingPrice) * 2}

        />

        <NumberInput
          label="Strike Price"
          value={strikePrice}
          onChange={(value) => setStrikePrice(value)}
          min={0}
          required
        />
        <Slider
          label="Strike Price"
          value={Number(strikePrice)}
          onChange={(value) => setStrikePrice(value)}
          min={0}
        />

        <NumberInput
          label="Time to Expiration (days)"
          value={timeToExpiration}
          onChange={(value) => setTimeToExpiration(value)}
          min={0}
          required
        />
        <Slider
          label="Time to Expiration (days)"
          defaultValue={Number(timeToExpiration)}
          onChange={(value) => setTimeToExpiration(value)}
          min={0}
        />
        <NumberInput
          label="Volatility (%)"
          value={volatility}
          onChange={(value) => setVolatility(value)}
          suffix="%"
          min={0}
          max={100}
          required
        />
        <Slider
          label="Volatility (%)"
          value={Number(volatility)}
          onChange={(value) => setVolatility(value)}
          min={0}
          max={100}

        />

        <NumberInput
          label="Risk-Free Interest Rate (%)"
          value={riskFreeRate}
          onChange={(value) => setRiskFreeRate(value)}
          suffix="%"
          min={0}
          required
        />
        <Slider
          label="Risk-Free Interest Rate (%)"
          value={Number(riskFreeRate)}
          onChange={(value) => setRiskFreeRate(value)}
          min={0}
        />


        <Button onClick={resetForm}>Reset Values</Button>
      </Stack>
    </Card>
  );
};

export default OptionForm;
