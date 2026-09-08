"""
Calcula la dependencia parcial (partial dependence) real del
RandomForestRegressor entrenado en train_tabular.py, para las 3 variables
que el simulador muestra como gráficas (Day, Temperature, MC%). Genera el
archivo lib/model-pdp-data.ts que consume components/composting/charts-section.tsx.

Uso: python compute_pdp.py
"""
import json

import joblib
import numpy as np
import pandas as pd
from sklearn.inspection import partial_dependence

MODEL_PATH = "models/compost_regressor.joblib"
DATA_PATH = "data/compost_data.csv"
OUTPUT_PATH = "../lib/model-pdp-data.ts"

FEATURES = ["Day", "Temperature", "MC(%)", "C/N Ratio"]

# Rangos usados para cada curva: cubren todo el rango observado en el
# dataset (y un poco más en Temperature/MC% para no cortar la curva justo
# en el borde de los datos).
GRIDS = {
    "Day": np.linspace(0, 120, 41),
    "Temperature": np.linspace(15, 70, 41),
    "MC(%)": np.linspace(15, 80, 41),
}

X_KEYS = {"Day": "dia", "Temperature": "temperatura", "MC(%)": "humedad"}
TS_NAMES = {"Day": "pdpDayData", "Temperature": "pdpTemperatureData", "MC(%)": "pdpHumidityData"}


def main() -> None:
    reg = joblib.load(MODEL_PATH)
    df = pd.read_csv(DATA_PATH)
    X = df[FEATURES].astype(float)

    header = '''// Dependencia parcial (partial dependence) REAL del RandomForestRegressor
// entrenado en ml/train_tabular.py, calculada con
// sklearn.inspection.partial_dependence sobre las 452 muestras reales del
// dataset. Cada punto es el Score promedio (0-100) que predice el modelo al
// fijar la variable en ese valor y promediar sobre todas las combinaciones
// reales de las otras 3 variables -- es decir, es el efecto marginal que el
// modelo aprendio de los datos, no una formula escrita a mano.
//
// Importante: la dependencia parcial asume que las variables son
// independientes entre si, algo que casi nunca es cierto en datos de
// sensores reales (aqui Day/Temperature/MC(%)/C-N estan correlacionadas
// entre si). Por eso estas curvas no tienen por que coincidir con los
// rangos "optimos" de la literatura -- y de hecho no coinciden siempre (ver
// charts-section.tsx para la comparacion y la explicacion caso por caso).

'''

    blocks = []
    for feat, grid in GRIDS.items():
        pd_result = partial_dependence(reg, X, [feat], kind="average", custom_values={feat: grid})
        avg = pd_result["average"][0]
        xkey = X_KEYS[feat]
        lines = [f"  {{ {xkey}: {round(float(g), 1)}, score: {round(float(p), 2)} }}," for g, p in zip(grid, avg)]
        blocks.append(f"export const {TS_NAMES[feat]} = [\n" + "\n".join(lines) + "\n]\n")

    with open(OUTPUT_PATH, "w") as f:
        f.write(header + "\n".join(blocks))

    print(f"Escrito {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
