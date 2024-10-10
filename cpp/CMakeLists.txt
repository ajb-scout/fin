cmake_minimum_required(VERSION 3.10)
project(OptionPricing)

set(CMAKE_CXX_STANDARD 14)

add_library(option_pricing SHARED bsm_pricing.cpp)

# If you have tests
#enable_testing()
#add_subdirectory(tests)
