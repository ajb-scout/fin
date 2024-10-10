#include "bsm_pricing.h"
#include <cmath>

double black_scholes(double S, double K, double T, double r, double sigma, bool is_call)
{
    double d1 = delta(S, K, T, r, sigma);
    double d2 = d1 - sigma * sqrt(T);

    double price;
    if (is_call)
    {
        price = S * norm_cdf(d1) - K * exp(-r * T) * norm_cdf(d2);
    }
    else
    {
        price = K * exp(-r * T) * norm_cdf(-d2) - S * norm_cdf(-d1);
    }
    return price;
}

double delta(double S, double K, double T, double r, double sigma)
{
    return (log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt(T));
}


    // Greek: Delta
    double delta(double S, double K, double T, double r, double sigma, bool is_call) {
        double d1 = (log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt(T));
        return is_call ? norm_cdf(d1) : norm_cdf(d1) - 1;
    }

    // Greek: Gamma
    double gamma(double S, double K, double T, double r, double sigma) {
        double d1 = (log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt(T));
        return exp(-0.5 * d1 * d1) / (S * sigma * sqrt(T) * sqrt(2 * M_PI));
    }

    // Greek: Vega
    double vega(double S, double K, double T, double r, double sigma) {
        double d1 = (log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt(T));
        return S * exp(-0.5 * d1 * d1) * sqrt(T) / sqrt(2 * M_PI);
    }

    // Greek: Theta
    double theta(double S, double K, double T, double r, double sigma, bool is_call) {
        double d1 = (log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt(T));
        double d2 = d1 - sigma * sqrt(T);
        double theta_value;

        if (is_call) {
            theta_value = - (S * exp(-0.5 * d1 * d1) * sigma) / (2 * sqrt(T) * sqrt(2 * M_PI)) 
                          - r * K * exp(-r * T) * norm_cdf(d2);
        } else {
            theta_value = - (S * exp(-0.5 * d1 * d1) * sigma) / (2 * sqrt(T) * sqrt(2 * M_PI)) 
                          + r * K * exp(-r * T) * norm_cdf(-d2);
        }

        return theta_value;
    }

    // Greek: Rho
    double rho(double S, double K, double T, double r, double sigma, bool is_call) {
        double d2 = (log(S / K) + (r - 0.5 * sigma * sigma) * T) / (sigma * sqrt(T));
        return is_call ? K * T * exp(-r * T) * norm_cdf(d2) : -K * T * exp(-r * T) * norm_cdf(-d2);
    }

double norm_cdf(double x)
{
    return 0.5 * (1.0 + erf(x / sqrt(2.0)));
}
