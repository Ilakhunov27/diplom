import json
import math
from random import random as r
from ViscosityCalculator import ViscosityCalculator


class TableCalculator:
    def __init__(self, temp, tay, file_path="extra_files/TableCalcData.json", liquid_path="extra_files/liquid.txt",
                 type_liquid="extra_files/type_liquids.json"):
        self.temp = temp
        self.tay = tay
        self.file_path = file_path
        self.liquid_path = liquid_path
        self.type_liquid_path = type_liquid

        self.data = self.load_data()
        self.liquid = self.load_liquid()
        self.type_liquid = self.load_type_liquid()

    def load_data(self):
        with open(self.file_path, "r", encoding="utf-8") as file:
            return json.load(file)

    def load_liquid(self):
        with open(self.liquid_path, "r", encoding="utf-8") as file:
            return file.read().strip()  # strip() убирает лишние \n

    def load_type_liquid(self):
        with open(self.type_liquid_path, "r", encoding="utf-8") as file:
            return json.load(file)

    def calculate_values(self):
        if self.liquid in self.type_liquid:
            ro = self.type_liquid[self.liquid]["density"]
            # далее логика, например:
            calculator = ViscosityCalculator(tay=self.tay)
            n = calculator.calculate_viscosity(ro=ro)
            # и т.д.
        else:
            raise ValueError(f"Жидкость '{self.liquid}' не найдена в базе.")

        calculator = ViscosityCalculator(tay=self.tay)
        n = calculator.calculate_viscosity(ro=ro)
        T =  272.15 + self.temp
        t2eq1 = 1 / T * 1000
        t2eq2 = n * 0.01 / T * 1000
        t2eq3 = math.log(t2eq2 * 0.001)

        x = t2eq1 * 0.001
        y = t2eq3
        t3eq1 = x ** 2
        t3eq2 = x * y

        return {
            "n": n, "T": T, "t2eq1": t2eq1, "t2eq2": t2eq2, "t2eq3": t2eq3,
            "x": x, "y": y, "t3eq1": t3eq1, "t3eq2": t3eq2
        }

    def update_tables(self):
        values = self.calculate_values()

        self.data["table 1"]["t(нач)"].append(self.temp)
        self.data["table 1"]["t(кон)"].append(self.temp - r() * 3)
        self.data["table 1"]["tay"].append(self.tay)

        self.data["table 2"]["tay"].append(self.tay)
        self.data["table 2"]["n"].append(values["n"])
        self.data["table 2"]["T"].append(values["T"])
        self.data["table 2"]["1/T"].append(values["t2eq1"])
        self.data["table 2"]["n/T"].append(values["t2eq2"])
        self.data["table 2"]["ln(n/T)"].append(values["t2eq3"])

        self.data["table 3"]["x"].append(values["x"])
        self.data["table 3"]["y"].append(values["y"])
        self.data["table 3"]["x^2"].append(values["t3eq1"])
        self.data["table 3"]["x*y"].append(values["t3eq2"])

    def save_data(self):
        with open(self.file_path, "w", encoding="utf-8") as file:
            json.dump(self.data, file, ensure_ascii=False, indent=4)

    def process(self):
        self.update_tables()
        self.save_data()