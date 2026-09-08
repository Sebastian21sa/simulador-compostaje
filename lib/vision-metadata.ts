// Métricas y metadatos reales del detector de contaminantes (Fase 2 - visión).
// Generado por vision/scripts/train_vision.py a partir de un CNN entrenado
// desde cero (ver nota de arquitectura) y evaluado en el test set (nunca
// visto durante entrenamiento). No son cifras inventadas: provienen del
// archivo vision/metrics_vision.json producido por el propio entrenamiento.

export const visionMetadata = {
  classNames: ["compostable", "contaminante"] as const,
  testAccuracy: 0.7163120567375887,
  confusionMatrix: [
    [28, 23],
    [17, 73],
  ],
  classificationReport: {
    compostable: { precision: 0.6222222222222222, recall: 0.5490196078431373, f1: 0.5833333333333334, support: 51 },
    contaminante: { precision: 0.7604166666666666, recall: 0.8111111111111111, f1: 0.7849462365591398, support: 90 },
    macroF1: 0.6841397849462365,
    weightedF1: 0.7120224204987416,
  },
  nTrain: 424,
  nValid: 145,
  nTest: 141,
  imgSize: [160, 160] as [number, number],
  dataset: {
    source: "Compost classification (Johns Hopkins University, Roboflow Universe)",
    url: "https://universe.roboflow.com/johns-hopkins-university-ipy8c/compost-classification",
    license: "CC BY 4.0",
    note:
      "38 clases originales de objetos (cáscaras de huevo, plásticos, vidrio, metales, etc.) reagrupadas en 2 categorías -- compostable / contaminante -- según guías comunes de compostaje doméstico.",
  },
  architecture:
    "CNN compacta entrenada desde cero (4 bloques Conv2D+BatchNorm+MaxPooling, aumento de datos agresivo, regularización L2 y dropout). No usa transfer learning: el entorno donde se entrenó este modelo bloquea el host (storage.googleapis.com) del que Keras descarga los pesos preentrenados de ImageNet para todas sus arquitecturas incluidas (MobileNet, ResNet, EfficientNet, etc.), así que no fue posible partir de un modelo preentrenado. Con transfer learning la precisión esperable sería sensiblemente mayor.",
  limitation:
    "Precisión de test: 71.6% sobre 141 imágenes. Es un modelo real entrenado con datos reales (no una simulación), pero con un dataset pequeño (424 imágenes de entrenamiento) y sin pesos preentrenados, por lo que confunde con más frecuencia la clase 'compostable' (recall 54.9%) que 'contaminante' (recall 81.1%). Pensado como demostración funcional de un pipeline de visión end-to-end, no como un clasificador listo para producción.",
} as const

// Ejemplos de objetos en cada categoría, tal como fueron mapeados desde las
// 38 clases originales del dataset (ver vision/scripts/prepare_binary_dataset.py).
export const visionClassExamples = {
  compostable: [
    "Cáscaras de huevo",
    "Restos de comida y fruta",
    "Pasto y hojas",
    "Bolsitas de té",
    "Astillas de madera sin tratar",
    "Papel y cartón",
    "Envases compostables (bioplástico)",
  ],
  contaminante: [
    "Plásticos y envases reciclables",
    "Vidrio",
    "Metales (aluminio, latas)",
    "Textiles",
    "Poliestireno / icopor",
    "Productos de higiene",
    "Pintura y químicos",
  ],
}
