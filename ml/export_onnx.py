"""
Exporta los modelos Random Forest entrenados a ONNX, y verifica que
onnxruntime reproduce (dentro de una tolerancia razonable) las mismas
predicciones que scikit-learn antes de usarlos desde Node.js.
"""
import json

import joblib
import numpy as np
import onnxruntime as ort
from sklearn.ensemble import RandomForestClassifier
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

MODELS_DIR = "/home/claude/ml-compost/models"
FEATURES = ["Day", "Temperature", "MC(%)", "C/N Ratio"]

initial_type = [("input", FloatTensorType([None, len(FEATURES)]))]


def export_model(pickle_path: str, onnx_path: str, options=None):
    model = joblib.load(pickle_path)
    onnx_model = convert_sklearn(
        model,
        initial_types=initial_type,
        options=options,
        target_opset=17,
    )
    with open(onnx_path, "wb") as f:
        f.write(onnx_model.SerializeToString())
    return model


def verify(model, onnx_path: str, X: np.ndarray, is_classifier: bool):
    sess = ort.InferenceSession(onnx_path, providers=["CPUExecutionProvider"])
    input_name = sess.get_inputs()[0].name
    onnx_outputs = sess.run(None, {input_name: X.astype(np.float32)})

    if is_classifier:
        sklearn_preds = model.predict(X)
        onnx_preds = onnx_outputs[0]
        match = float(np.mean(sklearn_preds == onnx_preds))
        print(f"  Coincidencia de clase predicha (sklearn vs onnx): {match * 100:.1f}%")
        return match > 0.99
    else:
        sklearn_preds = model.predict(X)
        onnx_preds = onnx_outputs[0].reshape(-1)
        max_abs_diff = float(np.max(np.abs(sklearn_preds - onnx_preds)))
        print(f"  Diferencia maxima absoluta (sklearn vs onnx): {max_abs_diff:.6f}")
        return max_abs_diff < 1e-2


def main():
    # Datos de prueba: unas cuantas combinaciones plausibles de las 4 features
    X_test = np.array(
        [
            [0, 35.0, 60.0, 26.0],
            [15, 52.0, 55.0, 30.0],
            [45, 40.0, 45.0, 20.0],
            [90, 25.0, 35.0, 60.0],
        ],
        dtype=np.float32,
    )

    print("Exportando regresor...")
    reg_model = export_model(
        f"{MODELS_DIR}/compost_regressor.joblib",
        f"{MODELS_DIR}/compost_regressor.onnx",
    )
    ok_reg = verify(reg_model, f"{MODELS_DIR}/compost_regressor.onnx", X_test, is_classifier=False)

    print("Exportando clasificador...")
    cls_model = export_model(
        f"{MODELS_DIR}/compost_classifier.joblib",
        f"{MODELS_DIR}/compost_classifier.onnx",
        options={RandomForestClassifier: {"zipmap": False}},
    )
    ok_cls = verify(cls_model, f"{MODELS_DIR}/compost_classifier.onnx", X_test, is_classifier=True)

    print(f"\nRegresor OK: {ok_reg}")
    print(f"Clasificador OK: {ok_cls}")

    if not (ok_reg and ok_cls):
        raise SystemExit("La verificacion de paridad sklearn vs onnx fallo")


if __name__ == "__main__":
    main()
