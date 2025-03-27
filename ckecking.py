import json

with open("extra_files/TableCalcData.json", "r+", encoding="utf-8") as file:
    data = json.load(file)
    for table in data.values():
        for key in table:
            table[key] = []
    file.seek(0)
    json.dump(data, file, ensure_ascii=False, indent=4)
    file.truncate()
