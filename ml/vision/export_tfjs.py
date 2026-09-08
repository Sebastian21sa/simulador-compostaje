"""
Exporta el detector de contaminantes (train_vision.py) a TensorFlow.js para
correr inferencia directamente en el navegador.

Problema real encontrado y resuelto aquí: el modelo entrenado incluye una capa
`data_augmentation` (RandomFlip/RandomRotation/RandomZoom/RandomContrast/
RandomTranslation) que usa variables de estado (SeedGenerator) para generar
aleatoriedad. Esas variables no se "congelan" correctamente al exportar el
grafo de inferencia (tensorflowjs_converter falla con
`AssignVariableOp was passed int64 ... incompatible with expected resource`
y luego `AssertionError: Identity is not in graph`).

La solución: reconstruir un modelo "solo inferencia" que reutiliza las MISMAS
capas entrenadas (mismos pesos, sin volver a entrenar) pero excluye
`data_augmentation` y los dos `Dropout` -- las tres son no-ops en inferencia,
así que el modelo resultante predice exactamente igual (verificado más abajo
con una comparación numérica antes de exportar).

Uso:
    python export_tfjs.py
    # requiere tensorflowjs instalado (ideal en un venv aparte, ya que
    # arrastra su propia versión de protobuf/tensorflow):
    #   python -m venv tfjs-venv && tfjs-venv/bin/pip install tensorflowjs
    tfjs-venv/bin/tensorflowjs_converter \
        --input_format=tf_saved_model \
        --output_format=tfjs_graph_model \
        --signature_name=serve \
        --saved_model_tags=serve \
        vision/models/saved_model_contaminant_inference \
        vision/models/tfjs_contaminant_detector
"""
import numpy as np
import tensorflow as tf

MODEL_PATH = "vision/models/compost_contaminant_detector.keras"
INFERENCE_SAVEDMODEL_PATH = "vision/models/saved_model_contaminant_inference"
IMG_SIZE = (160, 160)

# Capas del modelo entrenado, en orden, EXCLUYENDO data_augmentation y los
# dos Dropout (no-ops en inferencia).
INFERENCE_LAYER_NAMES = [
    "rescaling",
    "conv2d", "batch_normalization", "activation", "max_pooling2d",
    "conv2d_1", "batch_normalization_1", "activation_1", "max_pooling2d_1",
    "conv2d_2", "batch_normalization_2", "activation_2", "max_pooling2d_2",
    "conv2d_3", "batch_normalization_3", "activation_3", "max_pooling2d_3",
    "global_average_pooling2d",
    "dense",
    "dense_1",
]


def main() -> None:
    model = tf.keras.models.load_model(MODEL_PATH)

    inputs = tf.keras.Input(shape=IMG_SIZE + (3,), name="input_image")
    x = inputs
    for layer_name in INFERENCE_LAYER_NAMES:
        x = model.get_layer(layer_name)(x)
    inference_model = tf.keras.Model(inputs, x, name="compost_contaminant_inference")
    inference_model.summary()

    # Verificación: el modelo de inferencia debe predecir EXACTAMENTE igual
    # que el original (dropout/augmentation son no-ops en modo inferencia).
    rng = np.random.default_rng(42)
    test_input = (rng.random((8, *IMG_SIZE, 3)) * 255.0).astype("float32")
    orig_pred = model.predict(test_input, verbose=0)
    new_pred = inference_model.predict(test_input, verbose=0)
    max_diff = float(np.max(np.abs(orig_pred - new_pred)))
    print("Diferencia máxima entre modelo original y modelo de inferencia:", max_diff)
    assert max_diff < 1e-5, "El modelo de inferencia no replica al original"

    inference_model.export(INFERENCE_SAVEDMODEL_PATH)
    print(f"SavedModel de inferencia exportado en {INFERENCE_SAVEDMODEL_PATH}")
    print("Ahora correr tensorflowjs_converter (ver docstring de este archivo).")


if __name__ == "__main__":
    main()
