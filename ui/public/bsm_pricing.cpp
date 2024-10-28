// #include "bsm_pricing.h"
#include <emscripten.h>

#include <cmath>

extern "C"
{

        double norm_cdf(double x)
    {
        return 0.5 * (1.0 + erf(x / sqrt(2.0)));
    }


        // double delta(double S, double K, double T, double r, double sigma)
    // {
    //     return (log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt(T));
    // }
    // Greek: Delta
    double delta(double S, double K, double T, double r, double sigma, bool is_call)
    {
        double d1 = (log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt(T));
        return is_call ? norm_cdf(d1) : norm_cdf(d1) - 1;
    }

        // Greek: Gamma
    double gamma(double S, double K, double T, double r, double sigma)
    {
        double d1 = (log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt(T));
        return exp(-0.5 * d1 * d1) / (S * sigma * sqrt(T) * sqrt(2 * M_PI));
    }

    // Greek: Vega
    double vega(double S, double K, double T, double r, double sigma)
    {
        double d1 = (log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt(T));
        return S * exp(-0.5 * d1 * d1) * sqrt(T) / sqrt(2 * M_PI);
    }

    // Greek: Theta
    double theta(double S, double K, double T, double r, double sigma, bool is_call)
    {
        double d1 = (log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrt(T));
        double d2 = d1 - sigma * sqrt(T);
        double theta_value;

        if (is_call)
        {
            theta_value = -(S * exp(-0.5 * d1 * d1) * sigma) / (2 * sqrt(T) * sqrt(2 * M_PI)) - r * K * exp(-r * T) * norm_cdf(d2);
        }
        else
        {
            theta_value = -(S * exp(-0.5 * d1 * d1) * sigma) / (2 * sqrt(T) * sqrt(2 * M_PI)) + r * K * exp(-r * T) * norm_cdf(-d2);
        }

        return theta_value;
    }

    // Greek: Rho
    double rho(double S, double K, double T, double r, double sigma, bool is_call)
    {
        double d2 = (log(S / K) + (r - 0.5 * sigma * sigma) * T) / (sigma * sqrt(T));
        return is_call ? K * T * exp(-r * T) * norm_cdf(d2) : -K * T * exp(-r * T) * norm_cdf(-d2);
    }


    double black_scholes(double S, double K, double T, double r, double sigma, bool is_call)
    {
        double d1 = delta(S, K, T, r, sigma, is_call);
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

    // Array Calc: Delta vs. Price
    EMSCRIPTEN_KEEPALIVE
    void delta_for_price(double *S, double *output, double K, double T, double r, double sigma, bool is_call, int size)
    {
        for (int i = 0; i < size; i++)
        {
            double d = delta(S[i], K, T, r, sigma, is_call);
            output[i] = d;
        }
    }

    // Array Calc: Delta vs. Time
    void delta_for_time(double S, double *output, double K, double *T, double r, double sigma, bool is_call, int size)
    {
        for (int i = 0; i < size; i++)
        {
            double d = delta(S, K, T[i], r, sigma, is_call);
            output[i] = d;
        }
    }

    // Array Calc: Delta vs. Time vs. Price
    void delta_for_price_time(double *S, double *output, double K, double *T, double r, double sigma, bool is_call, int size)
    {
        for (int t = 0; t < size; t++)
        {
            double time = T[t];
            for (int s = 0; s < size; s++)
            {
                double d = delta(S[s], K, time, r, sigma, is_call);
                output[s + t * size] = d;
            }
        }
    }

    // Array Calc: Delta vs. Time vs. Price
    void theta_for_price_time(double *S, double *output, double K, double *T, double r, double sigma, bool is_call, int size)
    {
        for (int t = 0; t < size; t++)
        {
            for (int s = 0; s < size; s++)
            {
                double d = theta(S[s], K, T[t], r, sigma, is_call);
                output[s + t * size] = d;
            }
        }
    }

    // Array Calc: Delta vs. Time vs. Price
    void gamma_for_price_time(double *S, double *output, double K, double *T, double r, double sigma, bool is_call, int size)
    {
        for (int t = 0; t < size; t++)
        {
            for (int s = 0; s < size; s++)
            {
                double d = gamma(S[s], K, T[t], r, sigma);
                output[s + t * size] = d;
            }
        }
    }

    // Array Calc: Theta vs. Price
    void theta_for_price(double *S, double *output, double K, double T, double r, double sigma, bool is_call, int size)
    {
        for (int i = 0; i < size; i++)
        {
            double d = theta(S[i], K, T, r, sigma, is_call);
            output[i] = d;
        }
    }

    // Array Calc: Theta vs. time
    void theta_for_time(double S, double *output, double K, double *T, double r, double sigma, bool is_call, int size)
    {
        for (int i = 0; i < size; i++)
        {
            double d = theta(S, K, T[i], r, sigma, is_call);
            output[i] = d;
        }
    }

    // Array Calc: Gamma vs. Price
    void gamma_for_price(double *S, double *output, double K, double T, double r, double sigma, bool is_call, int size)
    {
        for (int i = 0; i < size; i++)
        {
            double d = gamma(S[i], K, T, r, sigma);
            output[i] = d;
        }
    }

    // Array Calc: Gamma vs. time
    void gamma_for_time(double S, double *output, double K, double *T, double r, double sigma, bool is_call, int size)
    {
        for (int i = 0; i < size; i++)
        {
            double d = gamma(S, K, T[i], r, sigma);
            output[i] = d;
        }
    }

    void black_scholes_strike_vec(double *S, double *output, double K, double T, double r, double sigma, bool is_call, int size)
    {
        for (int i = 0; i < size; i++)
        {
            // std::cout << "In vec call S: " << S[i] << std::endl;

            double bs = black_scholes(S[i], K, T, r, sigma, is_call);
            // std::cout << "In vec call BS: " << bs << std::endl;

            output[i] = bs;
        }
    }


}