const liquidBtn = document.getElementById('liquid-button');
const gasBtn = document.getElementById('gas-button');
const liquidList = document.getElementById('liquid-list');
const gasList = document.getElementById('gas-list');
const liquidButtons = document.getElementById('liquid-buttons');
const gasButtons = document.getElementById('gas-buttons');
const liquidIcons = document.getElementById('liquid-icons');
const gasIcons = document.getElementById('gas-icons');
// Добавляем выходные данные
const liquidOutput = document.getElementById('liquid-output');
const gasOutput = document.getElementById('gas-output');
// Константы для расчётов
const RHO_WATER = 1000;    // Плотность воды (кг/м³)
const G = 9.81;            // Ускорение свободного падения (м/с²)
const ETA_20 = 1.81e-5;    // Вязкость воздуха при 20°C (Па·с)
const R = 8.314;           // Универсальная газовая постоянная (Дж/(моль·K))
const MU_AIR = 28.96e-3;   // Молярная масса воздуха (кг/моль)
const P_ATM = 101325;      // Атмосферное давление (Па)
const KB = 1.38e-23;       // Постоянная Больцмана (Дж/K)
const PI = Math.PI;


function setActiveButton(activeBtn, inactiveBtn) {
    activeBtn.classList.add('active');
    activeBtn.classList.remove('inactive');
    inactiveBtn.classList.remove('active');
    inactiveBtn.classList.add('inactive');
}

function loadEquation(isLiquid) {
    fetch(isLiquid ? '/load-liquid-equation' : '/load-gas-equation')
        .then(response => response.text())
        .then(html => {
            document.getElementById('equation-container').innerHTML = html;
        });
}

liquidBtn.addEventListener('click', () => {
    // Показываем блоки для жидкостей
    liquidList.style.display = 'block';
    liquidButtons.style.display = 'block';
    liquidIcons.style.display = 'flex';
    liquidOutput.style.display = 'block'; // Добавляем эту строку

    // Скрываем блоки для газов
    gasList.style.display = 'none';
    gasButtons.style.display = 'none';
    gasIcons.style.display = 'none';
    gasOutput.style.display = 'none'; // Добавляем эту строку

    setActiveButton(liquidBtn, gasBtn);
    loadEquation(true);
});

gasBtn.addEventListener('click', () => {
    // Показываем блоки для газов
    gasList.style.display = 'block';
    gasButtons.style.display = 'block';
    gasIcons.style.display = 'flex';
    gasOutput.style.display = 'block'; // Добавляем эту строку

    // Скрываем блоки для жидкостей
    liquidList.style.display = 'none';
    liquidButtons.style.display = 'none';
    liquidIcons.style.display = 'none';
    liquidOutput.style.display = 'none'; // Добавляем эту строку

    setActiveButton(gasBtn, liquidBtn);
    loadEquation(false);
});

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Гарантируем начальное состояние
    gasOutput.style.display = 'none';
    gasList.style.display = 'none';
    gasButtons.style.display = 'none';
    gasIcons.style.display = 'none';
    loadEquation(true); // Загружаем уравнение для жидкостей
});

// Вычисления


function calculateGasParameters() {
    const tempC = parseInt(document.getElementById('temperature').value);
    const tempK = tempC + 273.15;
    const h1 = 0.15 - 0.001 * (tempC - 20);
    const h2 = 0.10 - 0.001 * (tempC - 20);
    const t = 120 - (tempC - 20);
    const h_cp = (h1 + h2) / 2;
    const deltaP = RHO_WATER * G * h_cp;
    const eta = ETA_20 * Math.sqrt(tempK / 293.15);

    document.getElementById('gas-viscosity').textContent = "Вязкость газа: " + eta.toExponential(4)*10**5 + " * 10^-5 Па·с";
    document.getElementById('gas-pressure').textContent = "Давление: " + deltaP.toFixed(2) + " Па";
    document.getElementById('gas-output').style.display = 'block';

    const newRow = {
        "h1": h1,
        "h2": h2,
        "h(ср)": h_cp,
        "t,c": t,
        "P,па": deltaP,
        "n(вязкость)": eta,
        "T,C": tempC,
        "T,K": tempK
    };

    fetch('/update_data', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newRow)
    }).then(res => res.json())
      .then(data => console.log("Данные сохранены:", data))
      .catch(err => console.error("Ошибка:", err));
}










