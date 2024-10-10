#ifndef BSM_PRICING_H
#define BSM_PRICING_H

extern "C" {
    double black_scholes(double S, double K, double T, double r, double sigma, bool is_call);
    double delta(double S, double K, double T, double r, double sigma);
    double gamma(double S, double K, double T, double r, double sigma);
    double vega(double S, double K, double T, double r, double sigma);
    double theta(double S, double K, double T, double r, double sigma, bool is_call);
    double rho(double S, double K, double T, double r, double sigma, bool is_call);

    double norm_cdf(double x);
}
#endif // BSM_PRICING_H
