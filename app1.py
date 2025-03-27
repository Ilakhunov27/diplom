from flask import Flask, render_template, request, jsonify, send_from_directory
from ViscosityCalculator import ViscosityCalculator
from ViscosityPlotter import ViscosityPlotter
from random import randint as r
from MainCalculation import  TableCalculator
import json
import os
app = Flask(__name__)
calc_vis = ViscosityCalculator()
plotter = ViscosityPlotter()
FILE_PATH = "extra_files/liquid.txt"



# JSON-данные с жидкостями и их плотностями
liquids = {
    "Вода": 1000,
    "Ртуть": 13546,
    "Мёд": 1420,
    "Молоко": 1030,
    "Масло подсолнечное": 920,
    "Спирт": 789,
    "Ацетон": 784,
    "Бензин": 710,
    "Масло машинное": 890
}

# Функция чтения выбранной жидкости
def read_liquid():
    try:
        with open(FILE_PATH, "r", encoding="utf-8") as file:
            return file.read().strip()
    except FileNotFoundError:
        return "Вода"

# Функция записи жидкости в файл
def write_liquid(liquid):
    with open(FILE_PATH, "w", encoding="utf-8") as file:
        file.write(liquid)


@app.route('/extra_files/TableCalcData.json')
def get_extra_file():
    return send_from_directory('extra_files', 'TableCalcData.json')

@app.route('/')
def home_page():  # put application's code here
    return render_template('index.html')

@app.route('/laboratory1_page')
def laboratory1_page():
    return render_template('laboratory1_page.html')

#implemented
@app.route('/calculation_page')
def calculation_page():
    return render_template('laboratory1.html')

default_liquid = "Вода"  # Устанавливаем жидкость по умолчанию

# Сбрасываем жидкость в "Вода" при запуске
write_liquid(default_liquid)

@app.route('/laboratory_visualisation', methods=['POST'])
def laboratory_visualisation():
    data = request.json
    liquid = data.get('liquid', read_liquid())  # Получаем жидкость (из запроса или файла)

    if liquid not in liquids:
        liquid = default_liquid  # Если жидкость отсутствует, ставим "Вода"

    write_liquid(liquid)  # Сохраняем в файл

    ro = liquids.get(liquid, 1000)  # Получаем плотность жидкости
    temperature = float(data.get('temperature', 20))  # Получаем температуру

    # Вычисления
    equ = (22 - 20) / 2
    tay = 130 - 5 * equ + r(0, 4)  # Пример вычисления

    # заполнение таблицы
    calculator = TableCalculator(22, tay)
    calculator.process()

    # Подключаем расчет вязкости
    result = calc_vis.calculate_viscosity(tay, ro)

    # Генерируем график
    image_url = plotter.plot_viscosity()['image_url']

    return jsonify({'output': round(result, 6), 'image_url': image_url, 'ro': ro})



if __name__ == '__main__':
    app.run(debug=True)