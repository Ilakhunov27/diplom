

class ViscosityCalculator:
    def __init__(self, R=0.001, l=0.1, ro=1000, g=9.81, h=0.1, tay=60, Q=1e-6):
        self.pi = 3.141592653589793
        self.R = R
        self.l = l
        self.ro = ro  # Плотность жидкости
        self.g = g
        self.h = h
        self.tay = tay
        self.Q = Q

    def set_density(self, ro):
        """Метод для обновления плотности жидкости"""
        self.ro = ro

    def calculate_viscosity(self, tay=None, ro=None):
        """Вычисление вязкости"""
        if tay is None:
            tay = self.tay  # Если tay не передан, используем текущее значение
        B = (self.pi * self.R**4 * self.g * self.h) / (8 * self.Q * self.l)
        return B * ro * tay * 100  # Используем self.ro

