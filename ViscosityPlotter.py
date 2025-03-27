import matplotlib.pyplot as plt

class ViscosityPlotter:
    def __init__(self, save_path='static/plot.png'):
        self.save_path = save_path
        self.temperatures = [20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40]
        self.viscosities_real = [0.001002, 0.000955, 0.000911, 0.000870, 0.000833,
                                 0.000797, 0.000764, 0.000733, 0.000704, 0.000677, 0.000651]

    def plot_viscosity(self):
        plt.figure(figsize=(8, 6))
        plt.plot(self.temperatures, self.viscosities_real, marker='o', linestyle='-', color='b',
                 label='Эмпирическая вязкость')
        plt.xlabel('Температура (°C)')
        plt.ylabel('Вязкость (Па·с)')
        plt.title('Зависимость эмпирической вязкости от температуры')
        plt.grid(True)
        plt.legend()

        plt.savefig(self.save_path)
        plt.close()
        return {'image_url': f'/{self.save_path}'}