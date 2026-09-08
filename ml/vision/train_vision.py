"""
Entrena el detector de contaminantes en compost (Fase 2), usando el
dataset real de Johns Hopkins University / Roboflow Universe ("Compost
classification"), reagrupado en 2 clases (compostable / contaminante) por
prepare_binary_dataset.py.

NOTA IMPORTANTE sobre la arquitectura: el plan original era transfer
learning sobre MobileNetV2 con pesos de ImageNet (igual que se hizo con
CNN preentrenadas en otros proyectos). No fue posible: este entorno de
entrenamiento tiene una lista blanca de red que bloquea
storage.googleapis.com (de donde Keras descarga TODOS los pesos
preentrenados de sus modelos incluidos: MobileNet, ResNet, VGG,
EfficientNet, etc. -- se verificaron todos, ninguno tiene un mirror
alternativo). Por eso este script entrena una CNN compacta DESDE CERO,
con regularizacion fuerte y aumento de datos agresivo para compensar el
dataset pequeno (424 imagenes de entrenamiento). Es una limitacion real y
documentada, no una simplificacion arbitraria.
"""
import json

import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix

DATA_DIR = "/home/claude/ml-compost/vision/binary"
IMG_SIZE = (160, 160)
BATCH_SIZE = 16
SEED = 42
MODELS_DIR = "/home/claude/ml-compost/vision/models"
METRICS_PATH = "/home/claude/ml-compost/vision/metrics_vision.json"

AUTOTUNE = tf.data.AUTOTUNE


def build_dataset(split: str, shuffle: bool):
    ds = tf.keras.utils.image_dataset_from_directory(
        f"{DATA_DIR}/{split}",
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        shuffle=shuffle,
        seed=SEED,
        label_mode="binary",
    )
    return ds


def main() -> None:
    train_ds = build_dataset("train", shuffle=True)
    valid_ds = build_dataset("valid", shuffle=False)
    test_ds = build_dataset("test", shuffle=False)

    class_names = train_ds.class_names  # ["compostable", "contaminante"] (orden alfabetico)
    print("Clases (orden de las etiquetas 0/1):", class_names)

    # Pesos de clase para compensar el desbalance (~1.8x mas contaminante que compostable)
    n_compostable = 151
    n_contaminante = 273
    total = n_compostable + n_contaminante
    class_weight = {
        0: total / (2 * n_compostable),
        1: total / (2 * n_contaminante),
    }
    print("class_weight:", class_weight)

    train_ds = train_ds.cache().prefetch(AUTOTUNE)
    valid_ds = valid_ds.cache().prefetch(AUTOTUNE)
    test_ds_eval = test_ds  # sin shuffle, para evaluar en orden

    data_augmentation = tf.keras.Sequential(
        [
            tf.keras.layers.RandomFlip("horizontal"),
            tf.keras.layers.RandomRotation(0.15),
            tf.keras.layers.RandomZoom(0.2),
            tf.keras.layers.RandomContrast(0.15),
            tf.keras.layers.RandomTranslation(0.1, 0.1),
        ],
        name="data_augmentation",
    )

    l2 = tf.keras.regularizers.l2(1e-4)

    def conv_block(x, filters):
        x = tf.keras.layers.Conv2D(filters, 3, padding="same", kernel_regularizer=l2)(x)
        x = tf.keras.layers.BatchNormalization()(x)
        x = tf.keras.layers.Activation("relu")(x)
        x = tf.keras.layers.MaxPooling2D()(x)
        return x

    inputs = tf.keras.Input(shape=IMG_SIZE + (3,))
    x = data_augmentation(inputs)
    x = tf.keras.layers.Rescaling(1.0 / 255)(x)
    x = conv_block(x, 32)
    x = conv_block(x, 64)
    x = conv_block(x, 128)
    x = conv_block(x, 128)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.4)(x)
    x = tf.keras.layers.Dense(64, activation="relu", kernel_regularizer=l2)(x)
    x = tf.keras.layers.Dropout(0.3)(x)
    outputs = tf.keras.layers.Dense(1, activation="sigmoid")(x)
    model = tf.keras.Model(inputs, outputs)
    model.summary()

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="binary_crossentropy",
        metrics=["accuracy"],
    )

    early_stop = tf.keras.callbacks.EarlyStopping(
        monitor="val_loss", patience=8, restore_best_weights=True
    )
    reduce_lr = tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss", factor=0.5, patience=3, min_lr=1e-6
    )

    model.fit(
        train_ds,
        validation_data=valid_ds,
        epochs=60,
        class_weight=class_weight,
        callbacks=[early_stop, reduce_lr],
        verbose=2,
    )

    # --- Evaluacion en test set (nunca visto durante entrenamiento) ---
    y_true = []
    y_pred_prob = []
    for images, labels in test_ds_eval:
        preds = model.predict(images, verbose=0)
        y_true.extend(labels.numpy().flatten().tolist())
        y_pred_prob.extend(preds.flatten().tolist())

    y_true = np.array(y_true)
    y_pred_prob = np.array(y_pred_prob)
    y_pred = (y_pred_prob >= 0.5).astype(int)

    cm = confusion_matrix(y_true, y_pred).tolist()
    report = classification_report(
        y_true, y_pred, target_names=class_names, output_dict=True
    )

    test_loss, test_acc = model.evaluate(test_ds_eval, verbose=0)

    print("\nMatriz de confusion (filas=real, columnas=predicho):")
    print(class_names)
    print(cm)
    print("\nTest accuracy:", test_acc)
    print(json.dumps(report, indent=2))

    metrics = {
        "class_names": class_names,
        "test_accuracy": float(test_acc),
        "test_loss": float(test_loss),
        "confusion_matrix": cm,
        "classification_report": report,
        "n_train": n_compostable + n_contaminante,
        "dataset": {
            "source": "Compost classification (Johns Hopkins University, Roboflow Universe)",
            "url": "https://universe.roboflow.com/johns-hopkins-university-ipy8c/compost-classification",
            "license": "CC BY 4.0",
            "note": "38 clases originales reagrupadas en 2 (compostable/contaminante) segun guias comunes de compostaje.",
        },
        "architecture": "CNN compacta entrenada desde cero (4 bloques conv+BN+pool, sin pesos preentrenados -- storage.googleapis.com, origen de TODOS los pesos ImageNet de Keras, esta bloqueado en este entorno de entrenamiento)",
        "img_size": list(IMG_SIZE),
    }

    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    import os

    os.makedirs(MODELS_DIR, exist_ok=True)
    model.save(f"{MODELS_DIR}/compost_contaminant_detector.keras")
    print(f"\nModelo guardado en {MODELS_DIR}/compost_contaminant_detector.keras")
    print(f"Metricas guardadas en {METRICS_PATH}")


if __name__ == "__main__":
    main()
