import { OptionsData } from "@mantine/core";
import { Option3dData, OptionInputs, OptionResult, TempOptionPriceArray } from "./components/OptionResult";

const get_stockprice_range = (price: number, values: number, isPrice: boolean = false ): number[] =>  {
    const range: number[] = [];
    var  proportion;
    let highIncrement = price;
    let lowIncrement = price; 

    if (isPrice){
      proportion = price * 0.3 / values;

    } else {
      proportion = Math.max(price / values);
      highIncrement = proportion;
    }


    while (values > 0) {
      range.push(highIncrement);
      values -= 1;
      highIncrement += proportion;
      if(isPrice){
        lowIncrement -= proportion;
        range.push(lowIncrement);
        values -= 1;
      }
    }
    return range.sort((n1, n2) => n1 - n2); // change this to be more efficient later
  }



export const fetchOptionPrice = async (
    optionInputs: OptionInputs,
    updateOptionData: ((optionData: OptionResult) => void)
) => {
    try {
      const response = await fetch('/api/option_price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          S: Number(optionInputs.S),
          K: Number(optionInputs.K),
          T: Number(optionInputs.t) / 365.0,
          r: Number(optionInputs.r) / 100, // Convert percentage to decimal
          sigma: Number(optionInputs.sigma) / 100, // Convert percentage to decimal
          is_call: true, // Adjust as needed
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
    //   setOptionPrice(data.price);
      updateOptionData(data); // Set the option price from the response
    } catch (error) {
      console.error('Error fetching option price:', error);
    }
  };

  export const fetchOptionGreekArrays = async (
    optionInputs: OptionInputs,
    updateOptionCurveData: ((optionCurveData: TempOptionPriceArray) => void)

  ) => {
    try {
      const accuracy = 50;
      const stock_range = get_stockprice_range(Number(optionInputs.S), accuracy);
      const time_range = get_stockprice_range(Number(optionInputs.t) / 365.0, accuracy);

      const response = await fetch('/api/greek_arrays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          S_array: stock_range,
          T_array: time_range,
          S: Number(optionInputs.S),
          K: Number(optionInputs.K),
          T: Number(optionInputs.t) / 365.0,
          r: Number(optionInputs.r) / 100, // Convert percentage to decimal
          sigma: Number(optionInputs.sigma) / 100, // Convert percentage to decimal
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
      
      updateOptionCurveData({data:updatedObjectsArray})
      console.log("set the greek data");

    } catch (error) {
      console.error('Error fetching option price:', error);
    }
  };

  export const fetchOption3dArrays = async (
    optionInputs: OptionInputs,
    updateData: ((option3dData: Option3dData) => void)

  ) => {
    try {
      const accuracy = 50;
      const stock_range = get_stockprice_range(Number(optionInputs.S), accuracy, true);
      const time_range = get_stockprice_range(Number(optionInputs.t) / 365.0, accuracy, false);

      const response = await fetch('/api/greek_arrays_3d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          S_array: stock_range,
          T_array: time_range,
          S: Number(optionInputs.S),
          K: Number(optionInputs.K),
          T: Number(optionInputs.t) / 365.0,
          r: Number(optionInputs.r) / 100, // Convert percentage to decimal
          sigma: Number(optionInputs.sigma) / 100, // Convert percentage to decimal
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
      
      updateData({data:updatedObjectsArray})
      console.log("set the option 3d greek data");

    } catch (error) {
      console.error('Error fetching option price:', error);
    }

  };

//   const fetchOptionPriceRange = async () => {
//     try {
//       const response = await fetch('/api/option_price_curve', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           S: get_stockprice_range(Number(optionInputs.S), 500),
//           K: Number(optionInputs.K),
//           T: Number(optionInputs.t) / 365.0,
//           r: Number(optionInputs.r) / 100, // Convert percentage to decimal
//           sigma: Number(optionInputs.sigma) / 100, // Convert percentage to decimal
//           is_call: true, // Adjust as needed
//         }),
//       });

//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }

//       const data = await response.json();
//       console.log("Trying to updatecurvedata");
//       console.log(data);
//       updateOptionCurveData({ data: data })
//       // setOptionPrice(data.price);
//       // updateOptionData(data); // Set the option price from the response
//     } catch (error) {
//       console.error('Error fetching option price:', error);
//       setOptionPrice(null); // Reset on error
//     }
//   };