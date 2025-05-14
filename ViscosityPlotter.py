import json
import matplotlib.pyplot as plt
import numpy as np

class ViscosityPlotter:
    def __init__(self, json_path='extra_files/TableCalcData.json', save_path='static/plot.png'):
        self.json_path = json_path
        self.save_path = save_path
        self.temperatures = []
        self.viscosities_real = []
        self._load_data()

    def _load_data(self):
        with open(self.json_path, 'r', encoding='utf-8') as file:
            data = json.load(file)

        # Извлекаем данные из JSON
        table_1 = data.get("table 1", {})
        table_2 = data.get("table 2", {})

        # Заполняем списки
        self.temperatures.extend(table_1.get('t(нач)', []))
        self.viscosities_real.extend(table_2.get('n', []))

    def plot_viscosity(self):
        # Создание фигуры с прозрачным фоном
        plt.figure(figsize=(10, 8), facecolor='none', dpi=150)
        ax = plt.gca()

        # Полностью прозрачная область графика
        ax.set_facecolor('none')
        ax.patch.set_alpha(0)

        # График с белыми элементами
        plt.plot(
            self.temperatures,
            self.viscosities_real,
            marker='o',
            markersize=9,
            linestyle='-',
            color='white',  # Белая линия графика
            linewidth=2.5,
            label='Экспериментальная вязкость жидкости',
            markerfacecolor='white',  # Белая заливка маркеров
            markeredgecolor='#ffffff',  # Белая обводка
            markeredgewidth=1.2,
            alpha=0.9  # Легкая прозрачность
        )

        # Белый текст
        plt.xlabel('Температура (°C)',
                   fontsize=13,
                   color='white',
                   fontweight='bold')

        plt.ylabel('Вязкость (Па·с)',
                   fontsize=13,
                   color='white',
                   fontweight='bold')

        plt.title('Зависимость вязкости жидкости от ее температуры',
                  fontsize=15,
                  pad=25,
                  color='white',
                  fontweight='bold')

        # Скрываем рамки осей
        for spine in ax.spines.values():
            spine.set_visible(False)

        # Белая полупрозрачная сетка
        ax.grid(True,
                axis='both',
                linestyle=':',
                alpha=0.4,
                color='white')

        # Легенда с прозрачным фоном
        legend = plt.legend(
            frameon=False,
            fontsize=11,
            labelcolor='white',
            handletextpad=0.8
        )

        # Настройка меток осей
        ax.tick_params(axis='both',
                       colors='white',
                       labelsize=11)

        # Фиксируем температурный диапазон
        plt.xticks(np.arange(20, 41, 2.5))
        plt.xlim(20, 40)

        # Сохранение с прозрачностью
        plt.tight_layout()
        plt.savefig(
            self.save_path,
            dpi=150,
            transparent=True,
            bbox_inches='tight',
            pad_inches=0.2
        )
        plt.close()

        return {'image_url': f'/{self.save_path}'}

    def plot_ln_viscosity_vs_inverse_temp(self):
        # Убедимся, что есть данные
        if not self.temperatures or not self.viscosities_real:
            return {'image_url': ''}

        T = np.array(self.temperatures, dtype=float)
        n = np.array(self.viscosities_real, dtype=float)

        inverse_T = 1 / T
        ln_n_over_T = np.log(n / T)

        # Создание фигуры с прозрачным фоном
        plt.figure(figsize=(10, 8), facecolor='none', dpi=150)
        ax = plt.gca()

        # Полностью прозрачная область графика
        ax.set_facecolor('none')
        ax.patch.set_alpha(0)

        # Белый график
        plt.plot(inverse_T, ln_n_over_T, marker='s', markersize=9, linestyle='--',
                 color='white', linewidth=2.5, label='ln(n/T) vs 1/T',
                 markerfacecolor='white', markeredgecolor='white', markeredgewidth=1.2, alpha=0.9)

        # Белые подписи
        plt.xlabel('1 / T (1/°C)', fontsize=13, color='white', fontweight='bold')
        plt.ylabel('ln(n / T)', fontsize=13, color='white', fontweight='bold')
        plt.title('Зависимость(жидкости) ln(n/T) от 1/T', fontsize=15, pad=25, color='white', fontweight='bold')

        # Убираем рамки осей
        for spine in ax.spines.values():
            spine.set_visible(False)

        # Полупрозрачная белая сетка
        ax.grid(True, axis='both', linestyle=':', alpha=0.4, color='white')

        # Легенда
        plt.legend(frameon=False, fontsize=11, labelcolor='white', handletextpad=0.8)

        # Белые метки осей
        ax.tick_params(axis='both', colors='white', labelsize=11)

        # Сохранение с прозрачностью
        save_path_ln = 'static/plot_ln.png'
        plt.tight_layout()
        plt.savefig(save_path_ln, dpi=150, transparent=True, bbox_inches='tight', pad_inches=0.2)
        plt.close()

        return {'image_url': f'/{save_path_ln}'}




