import json
import math
with open("extra_files/TableCalcData.json", "r", encoding="utf-8") as file:
    data = json.load(file)
    x = data["table 3"]["x"]
    y = data["table 3"]["y"]
    x2 = data["table 3"]["x^2"]
    xy = data["table 3"]["x*y"]
    sumX = 0
    sumY = 0
    sumX2 = 0
    sumXY = 0
    k = 1.38*10**(-23)
    n = int(len(x))
    for i in x:
        sumX +=i
    for i in y:
        sumY +=i
    for i in x2:
        sumX2 +=i
    for i in xy:
        sumXY +=i
print(f"n = {n}")
print(f"sumX = {sumX}")
print(f"sumY = {sumY}")
print(f"sumX2 = {sumX2}")
print(f"sumXY = {sumXY}")
a = (sumX * sumXY - sumX2 * sumY) / (sumX**2 - n * sumX2)
b = (sumY * sumX - n * sumXY) / (sumX**2 - n * sumX2)

print(f"a = {a}")
print(f"b = {b}")
#энергия активации
U = round(b * k * 10**20, 3)
# постоянная А
A = round(math.exp(a) * 10**7, 3)
# полуэмперическое уравнение
halfemper_equ = f"η = {A} * 10^-7 * T * exp({round(b)}/T)"
print(halfemper_equ)
print(f"U = {U}")

