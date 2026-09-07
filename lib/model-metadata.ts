// Metadata real generada por ml/train_tabular.py (ver ml/metrics/tabular_metrics.json,
// producido con el dataset real hafsa-kibria/Compost-Dataset, CC BY 4.0).
// Se usa para mostrar metricas reales en la pestana "Modelo"
// (components/composting/model-training.tsx), para las graficas de
// importancia de variables (components/composting/charts-section.tsx),
// y para traducir la clase predicha por el clasificador ONNX en
// app/api/predict/route.ts.

export const modelMetadata = {
  dataset: {
    source: "hafsa-kibria/Compost-Dataset (CC BY 4.0)",
    url: "https://github.com/hafsa-kibria/Compost-Dataset",
    nSamples: 452,
    featuresUsed: ["Day", "Temperature", "MC(%)", "C/N Ratio"],
    note:
      "El tipo de residuo se mapea a su C/N Ratio caracteristico; la aireacion no esta en el dataset y se aplica como ajuste heuristico documentado sobre la salida del modelo.",
  },
  classOrder: ["Baja", "Aceptable", "Buena", "Excelente"] as const,
  classThresholdsOnScore: {
    q25: 36.00214074,
    q50: 51.42948942,
    q75: 64.4956772525,
  },
  regressor: {
    rmseMean: 7.183518139969443,
    maeMean: 4.572268813796091,
    r2Mean: 0.8278099619547662,
    folds: 5,
    featureImportances: {
      Day: 0.3595781176895277,
      Temperature: 0.04568655530266442,
      "MC(%)": 0.37917581215341584,
      "C/N Ratio": 0.21555951485439206,
    },
  },
  classifier: {
    accuracyMean: 0.7656898656898657,
    accuracyStd: 0.05333083983848477,
    folds: 5,
    featureImportances: {
      Day: 0.24804801237391388,
      Temperature: 0.13292624978447448,
      "MC(%)": 0.2857495267096496,
      "C/N Ratio": 0.3332762111319621,
    },
  },
} as const

export const calidadColor: Record<string, string> = {
  Excelente: "#4CAF50",
  Buena: "#8BC34A",
  Aceptable: "#FFC107",
  Baja: "#F44336",
}

export const calidadEmoji: Record<string, string> = {
  Excelente: "🌟",
  Buena: "✅",
  Aceptable: "⚠️",
  Baja: "❌",
}
