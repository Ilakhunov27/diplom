// Функция обновления значения температуры
function updateTempValue() {
    document.getElementById('tempValue').innerText = document.getElementById('temperature').value;
}

async function sendData() {
    let temperature = document.getElementById('temperature').value;

    let response = await fetch('/laboratory_visualisation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ temperature: temperature })
    });

    let result = await response.json();
    document.getElementById('output').innerText = 'Результат: ' + result.output;

    // Принудительно загружаем таблицы после вычислений
    setTimeout(loadTableData, 500);
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




function updateGraph() {
    let graphImg = document.getElementById('graphImage');
    graphImg.src = '/static/plot.png?' + new Date().getTime(); // Обновление для избежания кеширования
}

function openPopup(id) {
    document.getElementById(id).style.display = 'block';
}

function closePopup(id) {
    document.getElementById(id).style.display = 'none';
}


function changeLiquid() {
    let selectedLiquid = document.getElementById('liquid-select').value;

    fetch('/laboratory_visualisation', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({liquid: selectedLiquid})
    })
    .then(response => response.json())
    .then(data => {
        console.log("Выбрана жидкость:", selectedLiquid, "Плотность:", data.ro);
    });
}

async function clearTableCalcData() {
    let response = await fetch('/extra_files/TableCalcData.json');

    if (!response.ok) {
        console.error("Ошибка загрузки JSON:", response.status);
        return;
    }

    let data = await response.json();

    // Очищаем все массивы внутри JSON
    for (let table of Object.values(data)) {
        for (let key in table) {
            table[key] = [];
        }
    }

    // Отправляем обновленный JSON на сервер
    await fetch('/save_table_data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    console.log("Таблицы успешно очищены.");
}

