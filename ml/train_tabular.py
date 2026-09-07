"""
Entrena el modelo tabular real del Simulador de Compostaje.

Dataset: hafsa-kibria/Compost-Dataset (CC BY 4.0) - 452 muestras reales
tomadas con sensores durante procesos de compostaje reales.
https://github.com/hafsa-kibria/Compost-Dataset

Features usadas (las que el simulador puede pedir en su formulario):
  - Day            -> tiempoProceso (dias)
  - Temperature    -> temperatura (C)
  - MC(%)          -> humedad (%)
  - C/N Ratio      -> derivado del tipo de residuo (factoresResiduo.cnRatio)

Targets:
  - Score (regresion continua 0-100)   -> produccion/eficiencia del compost
  - categoria de calidad (clasificacion, discretizada por cuartiles de Score)

Nota: el dataset no incluye "tipo de residuo" ni "aireacion". El tipo de
residuo se aproxima via su C/N ratio caracteristico (ya definido en el
simulador). La aireacion no tiene equivalente en el dataset, por lo que se
mantiene como un ajuste heuristico documentado sobre la salida del modelo,
en vez de inventar que el modelo aprendio algo que nunca vio en entrenamiento.
"""
import json

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import KFold, StratifiedKFold

DATA_PATH = "/home/claude/ml-compost/data/compost_data.csv"
MODELS_DIR = "/home/claude/ml-compost/models"
METRICS_PATH = "/home/claude/ml-compost/metrics/tabular_metrics.json"

FEATURES = ["Day", "Temperature", "MC(%)", "C/N Ratio"]
RANDOM_STATE = 42
N_FOLDS = 5


def load_data() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    return df


def discretize_score(score: pd.Series) -> tuple[pd.Series, dict]:
    """Convierte el Score continuo (0-100) en 4 categorias de calidad,
    usando los cuartiles del propio dataset de entrenamiento (data-driven,
    no arbitrario)."""
    q25, q50, q75 = score.quantile([0.25, 0.5, 0.75])
    thresholds = {"q25": float(q25), "q50": float(q50), "q75": float(q75)}

    def bucket(v: float) -> str:
        if v >= q75:
            return "Excelente"
        if v >= q50:
            return "Buena"
        if v >= q25:
            return "Aceptable"
        return "Baja"

    return score.apply(bucket), thresholds


def cross_validate_regressor(X: np.ndarray, y: np.ndarray) -> dict:
    kf = KFold(n_splits=N_FOLDS, shuffle=True, random_state=RANDOM_STATE)
    rmses, maes, r2s = [], [], []
    for train_idx, test_idx in kf.split(X):
        model = RandomForestRegressor(n_estimators=300, max_depth=8, random_state=RANDOM_STATE)
        model.fit(X[train_idx], y[train_idx])
        preds = model.predict(X[test_idx])
        rmses.append(float(np.sqrt(mean_squared_error(y[test_idx], preds))))
        maes.append(float(mean_absolute_error(y[test_idx], preds)))
        r2s.append(float(r2_score(y[test_idx], preds)))
    return {
        "rmse_mean": float(np.mean(rmses)),
        "rmse_std": float(np.std(rmses)),
        "mae_mean": float(np.mean(maes)),
        "r2_mean": float(np.mean(r2s)),
        "folds": N_FOLDS,
    }


def cross_validate_classifier(X: np.ndarray, y: np.ndarray) -> dict:
    skf = StratifiedKFold(n_splits=N_FOLDS, shuffle=True, random_state=RANDOM_STATE)
    accs = []
    for train_idx, test_idx in skf.split(X, y):
        model = RandomForestClassifier(n_estimators=300, max_depth=8, random_state=RANDOM_STATE)
        model.fit(X[train_idx], y[train_idx])
        preds = model.predict(X[test_idx])
        accs.append(float(accuracy_score(y[test_idx], preds)))
    return {
        "accuracy_mean": float(np.mean(accs)),
        "accuracy_std": float(np.std(accs)),
        "folds": N_FOLDS,
    }


def main() -> None:
    df = load_data()
    X = df[FEATURES].to_numpy(dtype=np.float64)
    y_reg = df["Score"].to_numpy(dtype=np.float64)
    y_cls_labels, thresholds = discretize_score(df["Score"])

    class_names = sorted(y_cls_labels.unique().tolist(), key=lambda c: thresholds["q50"] if c == "Buena" else 0)
    # Orden fijo y legible en vez del orden alfabetico de sorted():
    class_order = ["Baja", "Aceptable", "Buena", "Excelente"]
    class_to_idx = {c: i for i, c in enumerate(class_order)}
    y_cls = y_cls_labels.map(class_to_idx).to_numpy()

    print("Distribucion de clases:")
    print(y_cls_labels.value_counts())

    reg_metrics = cross_validate_regressor(X, y_reg)
    cls_metrics = cross_validate_classifier(X, y_cls)

    print("\nMetricas regresor (Score 0-100), 5-fold CV:")
    print(json.dumps(reg_metrics, indent=2))
    print("\nMetricas clasificador (categoria de calidad), 5-fold CV:")
    print(json.dumps(cls_metrics, indent=2))

    # Modelos finales entrenados con TODOS los datos, listos para exportar
    final_regressor = RandomForestRegressor(n_estimators=300, max_depth=8, random_state=RANDOM_STATE)
    final_regressor.fit(X, y_reg)

    final_classifier = RandomForestClassifier(n_estimators=300, max_depth=8, random_state=RANDOM_STATE)
    final_classifier.fit(X, y_cls)

    feature_importances_reg = dict(zip(FEATURES, final_regressor.feature_importances_.tolist()))
    feature_importances_cls = dict(zip(FEATURES, final_classifier.feature_importances_.tolist()))

    metrics = {
        "dataset": {
            "source": "hafsa-kibria/Compost-Dataset (CC BY 4.0)",
            "url": "https://github.com/hafsa-kibria/Compost-Dataset",
            "n_samples": int(len(df)),
            "features_used": FEATURES,
            "note": "Tipo de residuo se mapea a C/N Ratio; aireacion se aplica como ajuste heuristico posterior (no esta en el dataset).",
        },
        "class_thresholds_on_score": thresholds,
        "class_order": class_order,
        "regressor": {**reg_metrics, "feature_importances": feature_importances_reg},
        "classifier": {**cls_metrics, "feature_importances": feature_importances_cls},
    }

    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    # Guardar modelos entrenados (pickle) para el paso de exportacion a ONNX
    import joblib

    joblib.dump(final_regressor, f"{MODELS_DIR}/compost_regressor.joblib")
    joblib.dump(final_classifier, f"{MODELS_DIR}/compost_classifier.joblib")

    print(f"\nMetricas guardadas en {METRICS_PATH}")
    print(f"Modelos guardados en {MODELS_DIR}/")


if __name__ == "__main__":
    main()
