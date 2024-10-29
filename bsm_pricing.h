#ifndef BSM_PRICING_H
#define BSM_PRICING_H

extern "C" {
    double black_scholes(double S, double K, double T, double r, double sigma, bool is_call);
    double delta(double S, double K, double T, double r, double sigma, bool is_call);
    double gamma(double S, double K, double T, double r, double sigma);
    double vega(double S, double K, double T, double r, double sigma);
    double theta(double S, double K, double T, double r, double sigma, bool is_call);
    double rho(double S, double K, double T, double r, double sigma, bool is_call);
    double norm_cdf(double x);
    
    void black_scholes_strike_vec(double* S, double* output, double K, double T, double r, double sigma, bool is_call, int size);
    
    void delta_for_price(double* S, double* output, double K, double T, double r, double sigma, bool is_call, int size);
    void delta_for_time(double S, double* output, double K, double* T, double r, double sigma, bool is_call, int size);
    void theta_for_price(double* S, double* output, double K, double T, double r, double sigma, bool is_call, int size);
    void theta_for_time(double S, double* output, double K, double* T, double r, double sigma, bool is_call, int size);
    void gamma_for_price(double* S, double* output, double K, double T, double r, double sigma, bool is_call, int size);
    void gamma_for_time(double S, double* output, double K, double* T, double r, double sigma, bool is_call, int size);


    void delta_for_price_time(double* S, double* output, double K, double* T, double r, double sigma, bool is_call, int size);
    void theta_for_price_time(double* S, double* output, double K, double* T, double r, double sigma, bool is_call, int size);
    void gamma_for_price_time(double* S, double* output, double K, double* T, double r, double sigma, bool is_call, int size);

}
#endif // BSM_PRICING_H
