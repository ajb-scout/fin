import ctypes
import os
from flask import Flask, request, jsonify
import numpy as np

# Load the shared library
lib_path = os.path.join('../cpp/liboption_pricing.dylib')
print(os.path.exists(lib_path))  # Should return True

app = Flask(__name__)

option_pricing_lib = ctypes.CDLL(lib_path)

# Define the argument types and return type for the black_scholes function
option_pricing_lib.black_scholes.argtypes = [ctypes.c_double, ctypes.c_double, ctypes.c_double, ctypes.c_double, ctypes.c_double, ctypes.c_bool]
option_pricing_lib.black_scholes.restype = ctypes.c_double

option_pricing_lib.delta.argtypes = [
    ctypes.c_double, ctypes.c_double, ctypes.c_double,
    ctypes.c_double, ctypes.c_double
]
option_pricing_lib.delta.restype = ctypes.c_double
option_pricing_lib.delta.argtypes = [
    ctypes.c_double, ctypes.c_double, ctypes.c_double,
    ctypes.c_double, ctypes.c_double, ctypes.c_bool
]
option_pricing_lib.delta.restype = ctypes.c_double

option_pricing_lib.gamma.argtypes = [
    ctypes.c_double, ctypes.c_double, ctypes.c_double,
    ctypes.c_double, ctypes.c_double
]
option_pricing_lib.gamma.restype = ctypes.c_double

option_pricing_lib.vega.argtypes = [
    ctypes.c_double, ctypes.c_double, ctypes.c_double,
    ctypes.c_double, ctypes.c_double
]
option_pricing_lib.vega.restype = ctypes.c_double

option_pricing_lib.theta.argtypes = [
    ctypes.c_double, ctypes.c_double, ctypes.c_double,
    ctypes.c_double, ctypes.c_double, ctypes.c_bool
]
option_pricing_lib.theta.restype = ctypes.c_double

option_pricing_lib.rho.argtypes = [
    ctypes.c_double, ctypes.c_double, ctypes.c_double,
    ctypes.c_double, ctypes.c_double, ctypes.c_bool
]
option_pricing_lib.rho.restype = ctypes.c_double

option_pricing_lib.black_scholes_strike_vec.argtypes = [ctypes.POINTER(ctypes.c_double), ctypes.POINTER(ctypes.c_double), ctypes.c_double, ctypes.c_double, ctypes.c_double, ctypes.c_double, ctypes.c_bool, ctypes.c_int]

#Delta
option_pricing_lib.delta_for_price.argtypes = [ctypes.POINTER(ctypes.c_double), ctypes.POINTER(ctypes.c_double), ctypes.c_double, ctypes.c_double, ctypes.c_double, ctypes.c_double, ctypes.c_bool, ctypes.c_int]
option_pricing_lib.delta_for_time.argtypes = [ctypes.c_double, ctypes.POINTER(ctypes.c_double), ctypes.c_double, ctypes.POINTER(ctypes.c_double), ctypes.c_double, ctypes.c_double, ctypes.c_bool, ctypes.c_int]
option_pricing_lib.delta_for_price_time.argtypes = [ctypes.POINTER(ctypes.c_double), ctypes.POINTER(ctypes.c_double), ctypes.c_double, ctypes.POINTER(ctypes.c_double), ctypes.c_double, ctypes.c_double, ctypes.c_bool, ctypes.c_int, ctypes.c_int]

#Theta
option_pricing_lib.theta_for_price.argtypes = [ctypes.POINTER(ctypes.c_double), ctypes.POINTER(ctypes.c_double), ctypes.c_double, ctypes.c_double, ctypes.c_double, ctypes.c_double, ctypes.c_bool, ctypes.c_int]
option_pricing_lib.theta_for_time.argtypes = [ctypes.c_double, ctypes.POINTER(ctypes.c_double), ctypes.c_double, ctypes.POINTER(ctypes.c_double), ctypes.c_double, ctypes.c_double, ctypes.c_bool, ctypes.c_int]
option_pricing_lib.theta_for_price_time.argtypes = [ctypes.POINTER(ctypes.c_double), ctypes.POINTER(ctypes.c_double), ctypes.c_double, ctypes.POINTER(ctypes.c_double), ctypes.c_double, ctypes.c_double, ctypes.c_bool, ctypes.c_int, ctypes.c_int]

#Gamma
option_pricing_lib.gamma_for_price.argtypes = [ctypes.POINTER(ctypes.c_double), ctypes.POINTER(ctypes.c_double), ctypes.c_double, ctypes.c_double, ctypes.c_double, ctypes.c_double, ctypes.c_bool, ctypes.c_int]
option_pricing_lib.gamma_for_time.argtypes = [ctypes.c_double, ctypes.POINTER(ctypes.c_double), ctypes.c_double, ctypes.POINTER(ctypes.c_double), ctypes.c_double, ctypes.c_double, ctypes.c_bool, ctypes.c_int]
option_pricing_lib.gamma_for_price_time.argtypes = [ctypes.POINTER(ctypes.c_double), ctypes.POINTER(ctypes.c_double), ctypes.c_double, ctypes.POINTER(ctypes.c_double), ctypes.c_double, ctypes.c_double, ctypes.c_bool, ctypes.c_int, ctypes.c_int]

# Define a wrapper function for Black-Scholes pricing
def black_scholes(S, K, T, r, sigma, is_call):
    return option_pricing_lib.black_scholes(S, K, T, r, sigma, is_call)

# Wrapper functions for the Greeks
def delta(S, K, T, r, sigma, is_call):
    return option_pricing_lib.delta(S, K, T, r, sigma, is_call)

def gamma(S, K, T, r, sigma):
    return option_pricing_lib.gamma(S, K, T, r, sigma)

def vega(S, K, T, r, sigma):
    return option_pricing_lib.vega(S, K, T, r, sigma)

def theta(S, K, T, r, sigma, is_call):
    return option_pricing_lib.theta(S, K, T, r, sigma, is_call)

def rho(S, K, T, r, sigma, is_call):
    return option_pricing_lib.rho(S, K, T, r, sigma, is_call)

@app.route('/api/option_price_curve', methods=['POST'])
def option_price_curve():
    data = request.json 

    S = (data['S'])
    K = data['K']
    T = data['T']
    r = data['r']
    sigma = data['sigma']
    is_call = data['is_call']
    print(type(S))
    scores = np.array(S, dtype=np.float64)
    results = np.zeros(scores.size, dtype=np.float64)

    option_pricing_lib.black_scholes_strike_vec(scores.ctypes.data_as(ctypes.POINTER(ctypes.c_double)) ,results.ctypes.data_as(ctypes.POINTER(ctypes.c_double)),  K, T, r, sigma, is_call, scores.size)

    response = [{'data': price, 'underlying': scores[i]} for i, price in enumerate(results)]
    return jsonify(response)

@app.route('/api/greek_arrays', methods=['POST'])
def greeks_for_curve():
    data = request.json
    S = data['S']
    K = data['K']
    T = data['T']
    r = data['r']
    sigma = data['sigma']
    is_call = data['is_call']
    S_array = data['S_array']
    T_array = data['T_array']
    
    S_range = np.array(S_array, dtype=np.float64)
    T_range = np.array(T_array, dtype=np.float64)
    
    
    
    delta_price_output = np.zeros(S_range.size, dtype=np.float64)
    delta_time_output = np.zeros(T_range.size, dtype=np.float64)
    theta_price_output = np.zeros(S_range.size, dtype=np.float64)
    theta_time_output = np.zeros(T_range.size, dtype=np.float64)
    gamma_price_output = np.zeros(S_range.size, dtype=np.float64)
    gamma_time_output = np.zeros(T_range.size, dtype=np.float64)
    
    #Delta Calls
    option_pricing_lib.delta_for_price(S_range.ctypes.data_as(ctypes.POINTER(ctypes.c_double)), delta_price_output.ctypes.data_as(ctypes.POINTER(ctypes.c_double)),  K, T, r, sigma, is_call, S_range.size)
    option_pricing_lib.delta_for_time(S, delta_time_output.ctypes.data_as(ctypes.POINTER(ctypes.c_double)),  K, T_range.ctypes.data_as(ctypes.POINTER(ctypes.c_double)), r, sigma, is_call, T_range.size)

    #Theta Calls
    option_pricing_lib.theta_for_price(S_range.ctypes.data_as(ctypes.POINTER(ctypes.c_double)), theta_price_output.ctypes.data_as(ctypes.POINTER(ctypes.c_double)),  K, T, r, sigma, is_call, S_range.size)
    option_pricing_lib.theta_for_time(S, theta_time_output.ctypes.data_as(ctypes.POINTER(ctypes.c_double)),  K, T_range.ctypes.data_as(ctypes.POINTER(ctypes.c_double)), r, sigma, is_call, T_range.size)

    #Gamma Calls
    option_pricing_lib.gamma_for_price(S_range.ctypes.data_as(ctypes.POINTER(ctypes.c_double)), gamma_price_output.ctypes.data_as(ctypes.POINTER(ctypes.c_double)),  K, T, r, sigma, is_call, S_range.size)
    option_pricing_lib.gamma_for_time(S, gamma_time_output.ctypes.data_as(ctypes.POINTER(ctypes.c_double)),  K, T_range.ctypes.data_as(ctypes.POINTER(ctypes.c_double)), r, sigma, is_call, T_range.size)


    greek_output_response = [{
        'delta_price_output':   delta_price_output[i], 
        'delta_time_output':    delta_time_output[i],
        'theta_price_output':   theta_price_output[i], 
        'theta_time_output':    theta_time_output[i],
        'gamma_price_output':   gamma_price_output[i], 
        'gamma_time_output':    gamma_time_output[i],
        } 
                                   for i in range(S_range.size)]
    print(greek_output_response)
    return jsonify(greek_output_response)

@app.route('/api/greek_arrays_3d', methods=['POST','GET'])
def greeks_for_curve_3d():
    data = request.json
    S = data['S']
    K = data['K']
    T = data['T']
    r = data['r']
    sigma = data['sigma']
    is_call = data['is_call']
    S_array = data['S_array']
    T_array = data['T_array']

    S_range = np.array(S_array, dtype=np.float64)
    T_range = np.array(T_array, dtype=np.float64)
    
    
    
    delta_price_time_output = np.zeros(S_range.size * T_range.size, dtype=np.float64).ctypes.data_as(ctypes.POINTER(ctypes.c_double))
    theta_price_time_output = np.zeros(S_range.size * T_range.size, dtype=np.float64).ctypes.data_as(ctypes.POINTER(ctypes.c_double))
    gamma_price_time_output = np.zeros(S_range.size * T_range.size, dtype=np.float64).ctypes.data_as(ctypes.POINTER(ctypes.c_double))
    S_pointer = S_range.ctypes.data_as(ctypes.POINTER(ctypes.c_double))
    T_pointer = T_range.ctypes.data_as(ctypes.POINTER(ctypes.c_double))
        
    #Delta Calls
    option_pricing_lib.delta_for_price_time(S_pointer, delta_price_time_output,  K, T_pointer, r, sigma, is_call, S_range.size, T_range.size)

    #Theta Calls
    option_pricing_lib.theta_for_price_time(S_pointer, theta_price_time_output,  K, T_pointer, r, sigma, is_call, S_range.size, T_range.size)

    # #Gamma Calls
    option_pricing_lib.gamma_for_price_time(S_pointer, gamma_price_time_output,  K,  T_pointer, r, sigma, is_call, S_range.size, T_range.size)


    
    greek_output_response = []

    # Calculate the total size
    total_size = S_range.size * T_range.size

    # Iterate over each time step (T_range) and each asset price (S_range)
    for t in range(T_range.size):
        for s in range(S_range.size):
            idx = t * S_range.size + s  # Correct index for the flattened output
            greek_output_response.append({
                'delta_price_time_output': delta_price_time_output[idx], 
                'theta_price_time_output': theta_price_time_output[idx],
                'gamma_price_time_output': gamma_price_time_output[idx],
                'time': T_range[t],
                'price': S_range[s]
            })
    return jsonify(greek_output_response)




@app.route('/api/delta_for_price_curve', methods=['POST'])
def delta_for_price_curve():
    data = request.json 

    S = (data['S'])
    K = data['K']
    T = data['T']
    r = data['r']
    sigma = data['sigma']
    is_call = data['is_call']
    prices = np.array(S, dtype=np.float64)
    results = np.zeros(prices.size, dtype=np.float64)

    option_pricing_lib.delta_for_price(prices.ctypes.data_as(ctypes.POINTER(ctypes.c_double)) ,results.ctypes.data_as(ctypes.POINTER(ctypes.c_double)),  K, T, r, sigma, is_call, prices.size)

    response = [{'data': price, 'underlying': results[i]} for i, price in enumerate(results)]

# Return the response using jsonify
    return jsonify(response)


    # return jsonify({'price': results.tolist(), 'underlyings': scores.tolist()})


@app.route('/api/option_price', methods=['POST'])
def option_price():
    data = request.json
    S = int(data['S'])
    K = data['K']
    T = data['T']
    r = data['r']
    sigma = data['sigma']
    is_call = data['is_call']
    print(type(S))

    price = option_pricing_lib.black_scholes(S, K, T, r, sigma, is_call)
    delta = option_pricing_lib.delta(S, K, T, r, sigma, is_call)
    gamma = option_pricing_lib.gamma(S, K, T, r, sigma)
    vega = option_pricing_lib.vega(S, K, T, r, sigma)
    theta = option_pricing_lib.theta(S, K, T, r, sigma, is_call)
    rho = option_pricing_lib.rho(S, K, T, r, sigma, is_call)

    return jsonify({
        'price': price,
        'delta': delta,
        'gamma': gamma,
        'vega': vega,
        'theta': theta,
        'rho': rho

        
        })

@app.route('/api/greeks', methods=['POST'])
def greeks():
    data = request.json
    S = data['S']
    K = data['K']
    T = data['T']
    r = data['r']
    sigma = data['sigma']
    is_call = data['is_call']

    delta = option_pricing_lib.delta(S, K, T, r, sigma, is_call)
    gamma = option_pricing_lib.gamma(S, K, T, r, sigma)
    vega = option_pricing_lib.vega(S, K, T, r, sigma)
    theta = option_pricing_lib.theta(S, K, T, r, sigma, is_call)
    rho = option_pricing_lib.rho(S, K, T, r, sigma, is_call)

    return jsonify({
        'delta': delta,
        'gamma': gamma,
        'vega': vega,
        'theta': theta,
        'rho': rho
    })

if __name__ == '__main__':
    app.run(debug=True)

