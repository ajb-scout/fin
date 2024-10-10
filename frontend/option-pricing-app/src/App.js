import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [inputs, setInputs] = useState({
        S: 100,
        K: 100,
        T: 1,
        r: 0.05,
        sigma: 0.2,
        is_call: true,
    });
    const [result, setResult] = useState(null);
    const [greeks, setGreeks] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs({ ...inputs, [name]: value });
    };

    const calculatePrice = async () => {
      const requestData = {
        ...inputs,
        S: parseFloat(inputs.S),
        K: parseFloat(inputs.K),
        T: parseFloat(inputs.T),
        r: parseFloat(inputs.r),
        sigma: parseFloat(inputs.sigma),
        is_call: inputs.is_call,
    };

        const response = await axios.post('/api/option_price', requestData);
        setResult(response.data.price);
    };

    const calculateGreeks = async () => {
      const requestData = {
        ...inputs,
        S: parseFloat(inputs.S),
        K: parseFloat(inputs.K),
        T: parseFloat(inputs.T),
        r: parseFloat(inputs.r),
        sigma: parseFloat(inputs.sigma),
        is_call: inputs.is_call,
    };


        const response = await axios.post('/api/greeks', requestData);
        setGreeks(response.data);
    };

    return (
        <div>
            <h1>Option Pricing</h1>
            <form>
                <input type="number" name="S" value={inputs.S} onChange={handleChange} placeholder="Stock Price" />
                <input type="number" name="K" value={inputs.K} onChange={handleChange} placeholder="Strike Price" />
                <input type="number" name="T" value={inputs.T} onChange={handleChange} placeholder="Time to Expiry" />
                <input type="number" name="r" value={inputs.r} onChange={handleChange} placeholder="Risk-Free Rate" />
                <input type="number" name="sigma" value={inputs.sigma} onChange={handleChange} placeholder="Volatility" />
                <label>
                    Call
                    <input type="radio" name="is_call" value={true} checked={inputs.is_call} onChange={() => setInputs({ ...inputs, is_call: true })} />
                </label>
                <label>
                    Put
                    <input type="radio" name="is_call" value={false} checked={!inputs.is_call} onChange={() => setInputs({ ...inputs, is_call: false })} />
                </label>
            </form>
            <button onClick={calculatePrice}>Calculate Price</button>
            <button onClick={calculateGreeks}>Calculate Greeks</button>

            {result && <h2>Option Price: {result}</h2>}
            {greeks && (
                <div>
                    <h3>Greeks:</h3>
                    <p>Delta: {greeks.delta}</p>
                    <p>Gamma: {greeks.gamma}</p>
                    <p>Vega: {greeks.vega}</p>
                    <p>Theta: {greeks.theta}</p>
                    <p>Rho: {greeks.rho}</p>
                </div>
            )}
        </div>
    );
}

export default App;
