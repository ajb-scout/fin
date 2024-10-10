#include <iostream>
#include "bsm_pricing.h"

int main()
{
    double price = black_scholes(100, 100, 1, 0.05, 0.2, true);
    double d = delta(100, 100, 1, 0.05, 0.2);

    std::cout << "Call Option Price: " << price << std::endl;
    std::cout << "Call Option Delta: " << d << std::endl;

    return 0;
}
