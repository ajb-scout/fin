import ctypes
import os
from flask import Flask, request, jsonify

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
    
    return jsonify({'price': price})

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

