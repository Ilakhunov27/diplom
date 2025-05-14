from flask import Flask, render_template, request, jsonify, send_from_directory
from ViscosityCalculator import ViscosityCalculator
from ViscosityPlotter import ViscosityPlotter
from random import randint as r, randint
from MainCalculation import  TableCalculator
import json
import os
app = Flask(__name__)
calc_vis = ViscosityCalculator()
FILE_PATH = "extra_files/liquid.txt"



def load_liquids():
    file_path = os.path.join("extra_files", "type_liquids.json")
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)

liquids = load_liquids()  # Используем вместо старого словаря

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

@app.route('/clear_table_data', methods=['POST'])
def clear_table_data():
    file_path = "extra_files/TableCalcData.json"

    with open(file_path, "r+", encoding="utf-8") as file:
        data = json.load(file)
        for table in data.values():
            for key in table:
                table[key] = []
        file.seek(0)
        json.dump(data, file, ensure_ascii=False, indent=4)
        file.truncate()

    return jsonify({"message": "Таблицы очищены"})



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

@app.route('/load-liquid-equation')
def load_liquid_equation():
    return render_template('exp-equ.html')

@app.route('/load-gas-equation')
def load_gas_equation():
    return render_template('exp-equ2forGases.html')


@app.route('/laboratory_visualisation', methods=['POST'])
def laboratory_visualisation():
    data = request.json
    liquid = data.get('liquid')
    if not liquid:
        liquid = read_liquid()

    if liquid not in liquids:
        liquid = default_liquid

    write_liquid(liquid)

    liquid_par = liquids[liquid]
    ro = liquid_par.get("density", 1000)
    print(f"viscosity is + {ro}")
    try:
        temperature = float(data.get('temperature', 20))
    except (TypeError, ValueError):
        temperature = 20

    params = liquid_par["tay_params"]
    equ = (temperature - 20) / 2
    tay = (params["start"] - params["coef"] * equ + randint(0, params["rand_range"])) / params["divider"]
    calculator = TableCalculator(temperature, tay)
    calculator.process()

    result = calc_vis.calculate_viscosity(tay, ro)


    default_image = '/static/assets/css/images/график_вязкости.png'

    plotter = ViscosityPlotter(json_path='extra_files/TableCalcData.json')
    plot_1 = plotter.plot_viscosity()
    image_url_1 = plot_1['image_url'] if os.path.exists(plotter.save_path) else default_image

    plot_2 = plotter.plot_ln_viscosity_vs_inverse_temp()
    image_url_2 = plot_2['image_url'] if os.path.exists('static/ln_plot.png') else default_image
    # ==========================

    return jsonify({
        'output': round(result, 6),
        'image_url_1': image_url_1,
        'image_url_2': image_url_2,
        'ro': ro,
        "tay": tay,
    })



if __name__ == '__main__':
    app.run(debug=True)