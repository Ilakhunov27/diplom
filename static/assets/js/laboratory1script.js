let isAnimationRunning = false; // false = кнопки активны, true = заблокированы
let isTimerRunning = false;


function updateTempValue() {
    const value = parseInt(document.getElementById('temperature').value);
    document.getElementById('tempValue').innerText = value;

    const liquid = document.getElementById('thermo-liquid');
    const height = (value - 20) * 8.8 + 152; // каждый шаг 2° = 7.6px
    liquid.style.height = height + 'px';
}


function startTimer(taySeconds, callback) {
    const display = document.getElementById("timerDisplay");
    const tayMs = taySeconds * 1000; // Всегда считаем, что input — секунды
    const startTime = Date.now();

    const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;

        if (elapsed >= tayMs) {
            clearInterval(interval);
            display.textContent = formatTime(tayMs);
            if (callback) callback();
            return;
        }

        display.textContent = formatTime(elapsed);
    }, 10);
}

function formatTime(ms) {
    const totalMs = Math.round(ms);
    const minutes = String(Math.floor(totalMs / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((totalMs % 60000) / 1000)).padStart(2, '0');
    const milliseconds = String(totalMs % 1000).padStart(3, '0');
    return `${minutes}:${seconds}:${milliseconds}`;
}






async function sendData() {
    if (isAnimationRunning || isTimerRunning) return;
    isAnimationRunning = true;

    // Отключаем кнопку смены жидкости
    const liquidButton = document.getElementById('liquid-button');
    if (liquidButton) liquidButton.disabled = true;

    let temperature = document.getElementById('temperature').value;

    let response = await fetch('/laboratory_visualisation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temperature: temperature })
    });

    let result = await response.json();

    // Анимация воды без груши
    const waterRight = document.querySelector('.water-right');
    const waterLeft = document.querySelector('.water-left');
    const capRight = document.querySelector('.cap-right');

    // Проверяем, найден ли capRight
    if (!capRight) console.warn('capRight element not found!');

    // Первая анимация: поднимаем и опускаем воду
    waterRight.style.transition = 'height 10s ease';
    waterRight.style.height = '330px'; // поднимаем
    waterLeft.style.transition = 'height 10s ease';
    waterLeft.style.height = '70px'; // опускаем

    // Ждем завершения анимации воды
    waterRight.addEventListener('transitionend', function handler() {
        // Удаляем обработчик, чтобы он не срабатывал повторно
        waterRight.removeEventListener('transitionend', handler);

        // Открываем крышку, когда вода достигает 330px
        if (capRight) {
            capRight.classList.add('open');
            console.log('Added open class to capRight');
            new Audio("/static/assets/audio/open_tube.mp3").play().catch(e => console.log("Audio error:", e));
        }

        // Через 500ms начинаем возврат воды
        setTimeout(() => {
            // Начинаем спуск воды с 330px
            waterRight.style.transition = 'height 1.54s linear';
            waterRight.style.height = '308px'; // спускаемся до 308px за 1.54 секунды
            waterLeft.style.transition = 'height 1.54s linear';
            waterLeft.style.height = '100px'; // частично поднимаем (пропорционально)

            // По достижении 308px
            setTimeout(() => {
                if (result.tay !== undefined && result.tay > 0) {
                    // Спуск с 308px до 208px за время tay
                    waterRight.style.transition = `height ${result.tay}s linear`;
                    waterRight.style.height = '208px';
                    waterLeft.style.transition = `height ${result.tay}s linear`;
                    waterLeft.style.height = '150px'; // частично поднимаем

                    // Запускаем таймер
                    isTimerRunning = true;
                    startTimer(result.tay, () => {
                        isTimerRunning = false;
                        document.getElementById('output').innerText = 'Вязкость жидкости: ' + result.output;
                        setTimeout(loadTableData, 500);
                        // Включаем кнопку и закрываем крышку
                        if (liquidButton) liquidButton.disabled = false;
                        if (capRight) {
                            capRight.classList.remove('open');
                            console.log('Removed open class from capRight (timer case)');
                        }
                    });

                    // По окончании tay спускаемся до 187px
                    setTimeout(() => {
                        waterRight.style.transition = 'height 1s linear';
                        waterRight.style.height = '187px'; // возвращаем в исходное
                        waterLeft.style.transition = 'height 1s linear';
                        waterLeft.style.height = '170px'; // возвращаем в исходное
                    }, result.tay * 1000);
                } else {
                    console.log('No tay, executing else branch');
                    // Если tay отсутствует, сразу спускаемся до исходного
                    waterRight.style.transition = 'height 1s linear';
                    waterRight.style.height = '187px';
                    waterLeft.style.transition = 'height 1s linear';
                    waterLeft.style.height = '170px';
                    document.getElementById('output').innerText = 'Вязкость жидкости: ' + result.output;
                    setTimeout(loadTableData, 500);
                    // Включаем кнопку и закрываем крышку
                    if (liquidButton) liquidButton.disabled = false;
                    if (capRight) {
                        capRight.classList.remove('open');
                        console.log('Removed open class from capRight (no timer case)');
                    }
                }
            }, 1540); // 1.54 секунды до 308px
        }, 500);
    }, { once: true });

    const bulb = document.querySelector('.bulb');
    let count = 0;
    const interval = setInterval(() => {
        bulb.classList.add('squeeze');
        setTimeout(() => bulb.classList.remove('squeeze'), 200);
        count++;
        if (count === 5) {
            clearInterval(interval);
            isAnimationRunning = false;
        }
    }, 800);
}








async function clearTableData() {
    if (isAnimationRunning) return;
    let response = await fetch('/clear_table_data', { method: 'POST' });

    if (response.ok) {
        console.log("Таблицы успешно очищены");
        await loadTableData(); // Перезагрузить данные таблицы после очистки
    } else {
        console.error("Ошибка очистки таблицы");
    }
}

async function loadTableData() {
    let response = await fetch('/extra_files/TableCalcData.json');

    if (!response.ok) {
        console.error("Ошибка загрузки JSON:", response.status);
        return;
    }

    let data = await response.json();
    console.log("Загруженные данные:", data);  // 👉 Вывод JSON в консоль

    updateTable1(data["table 1"]);
    updateTable2(data["table 2"]);
    updateTable3(data["table 3"]);
    updateTable4(data["table 4"]);
}


function updateTable1(tableData) {
    let tbody = document.getElementById("table1");
    tbody.innerHTML = "";  // Очистка перед добавлением данных

    for (let i = 0; i < tableData["tay"].length; i++) {
        let row = `<tr>
            <td>${tableData["t(нач)"][i]}</td>
            <td>${tableData["t(кон)"][i]}</td>
            <td>${tableData["tay"][i]}</td>
        </tr>`;
        tbody.innerHTML += row;
    }
}

function updateTable2(tableData) {
    let tbody = document.getElementById("table2");
    tbody.innerHTML = "";

    for (let i = 0; i < tableData["tay"].length; i++) {
        let row = `<tr>
            <td>${tableData["tay"][i]}</td>
            <td>${tableData["n"][i]}</td>
            <td>${tableData["T"][i]}</td>
            <td>${tableData["1/T"][i]}</td>
            <td>${tableData["n/T"][i]}</td>
            <td>${tableData["ln(n/T)"][i]}</td>
        </tr>`;
        tbody.innerHTML += row;
    }
}

function updateTable3(tableData) {
    let tbody = document.getElementById("table3");
    tbody.innerHTML = "";

    for (let i = 0; i < tableData["x"].length; i++) {
        let row = `<tr>
            <td>${i + 1}</td>
            <td>${tableData["x"][i]}</td>
            <td>${tableData["y"][i]}</td>
            <td>${tableData["x^2"][i]}</td>
            <td>${tableData["x*y"][i]}</td>
        </tr>`;
        tbody.innerHTML += row;
    }
}

function updateTable4(tableData) {
    let tbody = document.getElementById("table4");
    tbody.innerHTML = "";

    const length = tableData["h1"].length;
    for (let i = 0; i < length; i++) {
        let row = `<tr>
            <td>${tableData["h1"][i].toFixed(4)}</td>
            <td>${tableData["h2"][i].toFixed(4)}</td>
            <td>${tableData["h(ср)"][i].toFixed(4)}</td>
            <td>${tableData["t,c"][i].toFixed(2)}</td>
            <td>${tableData["P,па"][i].toFixed(2)}</td>
            <td>${(tableData["n(вязкость)"][i] * 1e5).toFixed(2)} × 10⁻⁵</td>
            <td>${tableData["T,C"][i]}</td>
        </tr>`;
        tbody.innerHTML += row;
    }
}


function openPopup(id) {
    document.getElementById(id).style.display = 'block';
}

function closePopup(id) {
    document.getElementById(id).style.display = 'none';
}



function updateGraph() {
    if (isAnimationRunning) return;
    graphsReady = true;
    let graphImg = document.getElementById('graphImage');
    graphImg.src = '/static/plot.png?' + new Date().getTime(); // обновление
}


function changeLiquid() {
    // Проверяем оба флага
    if (isAnimationRunning || isTimerRunning) return;
    isAnimationRunning = true;

    const selectedLiquid = document.getElementById('liquid-select').value;
    const waterLayer = document.querySelector('.water-layer');
    const thermoLiquid = document.querySelector('.thermo-liquid');
    const waterLeft = document.querySelector('.water-left');
    const waterRight = document.querySelector('.water-right');

    const liquidColors = {
        "Вода": "#2196F399",
        "Ртуть": "#C0C0C0",
        "Мёд": "#DAA520",
        "Молоко": "#FFFDD0",
        "Масло подсолнечное": "#FFD700",
        "Спирт": "#CDEDF6",
        "Ацетон": "#E0F7FA",
        "Бензин": "#F0E68C",
        "Масло машинное": "#3E2723"
    };

    const selectedColor = liquidColors[selectedLiquid] || '#4FC3F7';
    const gradient = `linear-gradient(
        to top,
        ${hexToRgba(selectedColor, 0.9)},
        ${hexToRgba(selectedColor, 0.6)}
    )`;

    // Переходы
    waterLayer.style.transition = 'height 5s ease, background 0.5s ease';
    thermoLiquid.style.transition = 'height 5s ease';
    waterLeft.style.transition = 'height 2s ease, background 0.5s ease';
    waterRight.style.transition = 'height 2s ease, background 0.5s ease';

    // Отключаем кнопку смены жидкости
    const liquidButton = document.getElementById('liquid-button');
    if (liquidButton) liquidButton.disabled = true;

    // Опустошение
    new Audio("/static/assets/audio/output_w2.mp3").play().catch(e => console.log("Audio error:", e));
    waterLayer.style.height = '0%';
    thermoLiquid.style.height = '0px';
    waterLeft.style.height = '0px';
    waterRight.style.height = '0px';

    // Спустя 5с — когда резервуар пуст — меняем цвет
    setTimeout(() => {
        waterLayer.style.background = gradient;
        waterLayer.style.borderTop = `1px solid ${selectedColor}`;
        waterLeft.style.background = gradient;
        waterRight.style.background = gradient;
    }, 5000);

    // Заполнение резервуара через 7с
    setTimeout(() => {
        waterLayer.style.height = '65%';
    }, 7000);

    // Воспроизведение звука через 6.2с
    setTimeout(() => {
        new Audio("/static/assets/audio/input_w2.mp3").play().catch(e => console.log("Audio error:", e));
    }, 6200);

    // Подъём термометра — 9с
    setTimeout(() => {
        thermoLiquid.style.height = '152px';
    }, 9000);

    // Заполнение вискозиметра — 9с
    setTimeout(() => {
        waterLeft.style.height = '170px';
        waterRight.style.height = '187px';
    }, 9000);

    // Включаем кнопку и завершаем анимацию
    setTimeout(() => {
        isAnimationRunning = false;
        if (liquidButton) liquidButton.disabled = false;
    }, 12000);

    fetch('/laboratory_visualisation', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ liquid: selectedLiquid })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Выбрана жидкость:", selectedLiquid, "Плотность:", data.ro);
        clearTables();
    });
}

function hexToRgba(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}



function clearTables() {
    let tables = document.querySelectorAll("table");
    tables.forEach(table => {
        let rows = table.querySelectorAll("tr:not(:first-child)"); // Пропускаем заголовок
        rows.forEach(row => row.remove());
    });

    console.log("Таблицы очищены.");
}

async function calculateResults() {
    if (isAnimationRunning) return;
    try {
        let response = await fetch('/extra_files/TableCalcData.json');

        if (!response.ok) {
            console.error("Ошибка загрузки JSON:", response.status);
            return;
        }

        let data = await response.json();
        let table = data["table 3"];
        if (!table) {
            console.error("Таблица 'table 3' не найдена в JSON");
            return;
        }

        let x = table["x"] || [];
        let y = table["y"] || [];
        let x2 = table["x^2"] || [];
        let xy = table["x*y"] || [];

        if (x.length === 0 || y.length === 0 || x2.length === 0 || xy.length === 0) {
            console.error("Одна из таблиц пустая!");
            return;
        }

        let sumX = x.reduce((acc, val) => acc + val, 0);
        let sumY = y.reduce((acc, val) => acc + val, 0);
        let sumX2 = x2.reduce((acc, val) => acc + val, 0);
        let sumXY = xy.reduce((acc, val) => acc + val, 0);
        let n = x.length;
        let k = 1.38e-23;

        let denominator = sumX ** 2 - n * sumX2;
        if (denominator === 0) {
            console.error("Деление на ноль в расчетах!");
            return;
        }

        let a = (sumX * sumXY - sumX2 * sumY) / denominator;
        let b = (sumY * sumX - n * sumXY) / denominator;

        let U = (b * k * 1e20).toFixed(3);
        let A = (Math.exp(a) * 1e7).toFixed(3);
        let formula = `η = ${A} * 10^-7 * T * exp(${Math.round(b)}/T)`;

        // Обновляем нужные элементы
        document.getElementById('activation-energy').innerHTML = `Энергия активации (U): ${U} * 10^-20 Дж`;
        document.getElementById('average-values').innerHTML = `Средние значения: 
            ΣX = ${sumX.toFixed(3)}, 
            ΣY = ${sumY.toFixed(3)}, 
            ΣX² = ${sumX2.toFixed(3)}, 
            ΣXY = ${sumXY.toFixed(3)}`;
        document.getElementById('empirical-formula').innerHTML = `Полуэмпирическая формула: ${formula}`;
    } catch (error) {
        console.error("Ошибка выполнения JS-кода:", error);
    }
}

let currentSlide = 0;
const images = ['/static/plot.png', '/static/plot_ln.png'];
let graphsReady = false;

function changeSlide(step) {
    if (!graphsReady) return; // блокируем стрелки
    currentSlide = (currentSlide + step + images.length) % images.length;
    const graphImg = document.getElementById('graphImage');
    graphImg.style.opacity = 0;
    setTimeout(() => {
        graphImg.src = images[currentSlide] + '?' + new Date().getTime();
        graphImg.style.opacity = 1;
    }, 300);
}