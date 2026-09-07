// Predicciones fuera-de-muestra (out-of-fold, 5-fold CV) del RandomForestRegressor
// real sobre las 452 muestras de hafsa-kibria/Compost-Dataset. Generado por
// ml/train_tabular.py + validacion cruzada (ver ml/metrics/scatter_oof.json).
// Cada punto es una prediccion genuina hecha por un modelo que NO vio esa fila
// durante su entrenamiento (evita el sesgo optimista de evaluar sobre datos de train).
export interface ScatterPoint {
  real: number
  pred: number
}

export const modelScatterData: ScatterPoint[] = [
  {
    real: 28.04,
    pred: 30.09
  },
  {
    real: 36.19,
    pred: 34.59
  },
  {
    real: 37.07,
    pred: 39.79
  },
  {
    real: 51.25,
    pred: 50.98
  },
  {
    real: 59.7,
    pred: 59.16
  },
  {
    real: 63.66,
    pred: 63.94
  },
  {
    real: 67.36,
    pred: 63.98
  },
  {
    real: 68.58,
    pred: 67.97
  },
  {
    real: 28.22,
    pred: 29.72
  },
  {
    real: 34.83,
    pred: 34.59
  },
  {
    real: 42.01,
    pred: 42.07
  },
  {
    real: 55.71,
    pred: 53.03
  },
  {
    real: 64.48,
    pred: 61.16
  },
  {
    real: 67.06,
    pred: 74.22
  },
  {
    real: 70.79,
    pred: 70.54
  },
  {
    real: 71.67,
    pred: 74.02
  },
  {
    real: 28.87,
    pred: 29.43
  },
  {
    real: 37.38,
    pred: 33.62
  },
  {
    real: 47.66,
    pred: 42.59
  },
  {
    real: 56.26,
    pred: 52.37
  },
  {
    real: 65.87,
    pred: 69.53
  },
  {
    real: 67.78,
    pred: 71.32
  },
  {
    real: 70.33,
    pred: 70.25
  },
  {
    real: 71.02,
    pred: 74.33
  },
  {
    real: 29.53,
    pred: 29.7
  },
  {
    real: 35.55,
    pred: 34.7
  },
  {
    real: 41.39,
    pred: 40.66
  },
  {
    real: 56.58,
    pred: 54.41
  },
  {
    real: 61.24,
    pred: 63.65
  },
  {
    real: 66.2,
    pred: 69.17
  },
  {
    real: 70.48,
    pred: 70.51
  },
  {
    real: 70.33,
    pred: 69.93
  },
  {
    real: 28.04,
    pred: 31.89
  },
  {
    real: 36.33,
    pred: 29.61
  },
  {
    real: 34.08,
    pred: 47.66
  },
  {
    real: 46.67,
    pred: 46.81
  },
  {
    real: 53.91,
    pred: 57.27
  },
  {
    real: 57.15,
    pred: 57.52
  },
  {
    real: 61.18,
    pred: 59.69
  },
  {
    real: 62.26,
    pred: 60.06
  },
  {
    real: 63.52,
    pred: 58.69
  },
  {
    real: 28.22,
    pred: 32.0
  },
  {
    real: 32.18,
    pred: 36.38
  },
  {
    real: 35.27,
    pred: 50.89
  },
  {
    real: 47.99,
    pred: 42.77
  },
  {
    real: 56.1,
    pred: 41.1
  },
  {
    real: 57.98,
    pred: 49.73
  },
  {
    real: 61.64,
    pred: 70.83
  },
  {
    real: 62.88,
    pred: 73.82
  },
  {
    real: 63.86,
    pred: 75.52
  },
  {
    real: 28.87,
    pred: 29.03
  },
  {
    real: 35.32,
    pred: 33.54
  },
  {
    real: 41.03,
    pred: 45.86
  },
  {
    real: 49.84,
    pred: 47.81
  },
  {
    real: 55.83,
    pred: 50.37
  },
  {
    real: 59.11,
    pred: 54.1
  },
  {
    real: 60.16,
    pred: 54.9
  },
  {
    real: 61.38,
    pred: 59.83
  },
  {
    real: 63.13,
    pred: 63.74
  },
  {
    real: 29.53,
    pred: 31.37
  },
  {
    real: 33.77,
    pred: 33.99
  },
  {
    real: 39.53,
    pred: 40.1
  },
  {
    real: 53.77,
    pred: 57.41
  },
  {
    real: 58.14,
    pred: 63.35
  },
  {
    real: 63.24,
    pred: 69.57
  },
  {
    real: 67.63,
    pred: 70.11
  },
  {
    real: 68.05,
    pred: 74.49
  },
  {
    real: 70.09,
    pred: 70.78
  },
  {
    real: 24.37,
    pred: 27.33
  },
  {
    real: 42.34,
    pred: 40.19
  },
  {
    real: 63.1,
    pred: 61.69
  },
  {
    real: 73.67,
    pred: 69.87
  },
  {
    real: 68.81,
    pred: 70.36
  },
  {
    real: 69.32,
    pred: 69.9
  },
  {
    real: 21.19,
    pred: 31.57
  },
  {
    real: 46.29,
    pred: 42.87
  },
  {
    real: 52.37,
    pred: 45.74
  },
  {
    real: 62.21,
    pred: 61.73
  },
  {
    real: 64.75,
    pred: 68.57
  },
  {
    real: 71.12,
    pred: 73.42
  },
  {
    real: 26.65,
    pred: 33.41
  },
  {
    real: 38.25,
    pred: 38.43
  },
  {
    real: 52.31,
    pred: 61.13
  },
  {
    real: 64.48,
    pred: 67.39
  },
  {
    real: 70.18,
    pred: 71.09
  },
  {
    real: 66.77,
    pred: 76.06
  },
  {
    real: 33.31,
    pred: 28.62
  },
  {
    real: 36.45,
    pred: 39.15
  },
  {
    real: 61.99,
    pred: 55.87
  },
  {
    real: 68.96,
    pred: 60.76
  },
  {
    real: 64.19,
    pred: 62.19
  },
  {
    real: 65.29,
    pred: 65.1
  },
  {
    real: 25.88,
    pred: 30.05
  },
  {
    real: 48.97,
    pred: 50.36
  },
  {
    real: 70.28,
    pred: 68.49
  },
  {
    real: 75.97,
    pred: 71.57
  },
  {
    real: 71.02,
    pred: 71.98
  },
  {
    real: 79.64,
    pred: 69.19
  },
  {
    real: 31.39,
    pred: 32.15
  },
  {
    real: 42.13,
    pred: 41.88
  },
  {
    real: 59.33,
    pred: 56.8
  },
  {
    real: 65.46,
    pred: 67.58
  },
  {
    real: 61.61,
    pred: 63.75
  },
  {
    real: 66.15,
    pred: 69.1
  },
  {
    real: 40.26,
    pred: 30.19
  },
  {
    real: 47.07,
    pred: 40.41
  },
  {
    real: 61.03,
    pred: 56.19
  },
  {
    real: 60.6,
    pred: 60.16
  },
  {
    real: 61.52,
    pred: 65.83
  },
  {
    real: 61.87,
    pred: 66.01
  },
  {
    real: 22.48,
    pred: 35.51
  },
  {
    real: 42.01,
    pred: 43.42
  },
  {
    real: 62.43,
    pred: 60.08
  },
  {
    real: 67.35,
    pred: 69.26
  },
  {
    real: 82.39,
    pred: 66.78
  },
  {
    real: 75.13,
    pred: 77.43
  },
  {
    real: 23.87,
    pred: 30.21
  },
  {
    real: 39.18,
    pred: 39.66
  },
  {
    real: 57.96,
    pred: 60.45
  },
  {
    real: 63.33,
    pred: 61.98
  },
  {
    real: 65.74,
    pred: 67.49
  },
  {
    real: 66.97,
    pred: 72.9
  },
  {
    real: 32.73,
    pred: 29.58
  },
  {
    real: 55.88,
    pred: 45.85
  },
  {
    real: 65.76,
    pred: 57.72
  },
  {
    real: 66.4,
    pred: 68.09
  },
  {
    real: 68.51,
    pred: 70.11
  },
  {
    real: 72.77,
    pred: 69.72
  },
  {
    real: 32.3,
    pred: 33.32
  },
  {
    real: 31.6,
    pred: 33.15
  },
  {
    real: 40.34,
    pred: 39.51
  },
  {
    real: 46.71,
    pred: 48.21
  },
  {
    real: 56.49,
    pred: 60.11
  },
  {
    real: 71.21,
    pred: 76.04
  },
  {
    real: 78.18,
    pred: 77.89
  },
  {
    real: 79.67,
    pred: 75.56
  },
  {
    real: 33.46,
    pred: 33.39
  },
  {
    real: 32.44,
    pred: 32.09
  },
  {
    real: 39.49,
    pred: 39.71
  },
  {
    real: 46.65,
    pred: 48.0
  },
  {
    real: 58.37,
    pred: 60.41
  },
  {
    real: 64.71,
    pred: 61.94
  },
  {
    real: 73.63,
    pred: 73.22
  },
  {
    real: 77.18,
    pred: 76.1
  },
  {
    real: 33.6,
    pred: 33.15
  },
  {
    real: 23.08,
    pred: 33.25
  },
  {
    real: 37.97,
    pred: 39.18
  },
  {
    real: 44.68,
    pred: 44.66
  },
  {
    real: 51.04,
    pred: 54.55
  },
  {
    real: 64.22,
    pred: 63.21
  },
  {
    real: 71.46,
    pred: 74.94
  },
  {
    real: 74.4,
    pred: 76.04
  },
  {
    real: 33.83,
    pred: 32.91
  },
  {
    real: 33.06,
    pred: 36.59
  },
  {
    real: 37.28,
    pred: 39.14
  },
  {
    real: 45.45,
    pred: 44.48
  },
  {
    real: 59.71,
    pred: 57.57
  },
  {
    real: 72.67,
    pred: 70.04
  },
  {
    real: 79.16,
    pred: 76.19
  },
  {
    real: 82.93,
    pred: 76.65
  },
  {
    real: 32.96,
    pred: 32.94
  },
  {
    real: 31.61,
    pred: 40.02
  },
  {
    real: 28.65,
    pred: 34.56
  },
  {
    real: 31.65,
    pred: 41.58
  },
  {
    real: 41.76,
    pred: 44.15
  },
  {
    real: 57.6,
    pred: 60.52
  },
  {
    real: 57.07,
    pred: 56.24
  },
  {
    real: 59.29,
    pred: 62.66
  },
  {
    real: 32.78,
    pred: 33.14
  },
  {
    real: 32.61,
    pred: 36.81
  },
  {
    real: 37.72,
    pred: 38.74
  },
  {
    real: 31.99,
    pred: 38.1
  },
  {
    real: 38.06,
    pred: 35.43
  },
  {
    real: 53.89,
    pred: 51.92
  },
  {
    real: 66.86,
    pred: 62.48
  },
  {
    real: 71.62,
    pred: 72.66
  },
  {
    real: 34.28,
    pred: 30.72
  },
  {
    real: 33.14,
    pred: 33.11
  },
  {
    real: 32.59,
    pred: 41.32
  },
  {
    real: 34.66,
    pred: 39.02
  },
  {
    real: 38.45,
    pred: 44.56
  },
  {
    real: 41.58,
    pred: 46.59
  },
  {
    real: 46.28,
    pred: 49.36
  },
  {
    real: 45.79,
    pred: 50.49
  },
  {
    real: 46.25,
    pred: 50.86
  },
  {
    real: 48.07,
    pred: 49.25
  },
  {
    real: 50.9,
    pred: 48.62
  },
  {
    real: 37.88,
    pred: 34.27
  },
  {
    real: 43.38,
    pred: 41.28
  },
  {
    real: 50.18,
    pred: 50.59
  },
  {
    real: 56.56,
    pred: 56.77
  },
  {
    real: 60.76,
    pred: 62.25
  },
  {
    real: 62.48,
    pred: 63.16
  },
  {
    real: 61.79,
    pred: 66.85
  },
  {
    real: 37.56,
    pred: 35.16
  },
  {
    real: 42.3,
    pred: 43.48
  },
  {
    real: 55.89,
    pred: 52.31
  },
  {
    real: 61.95,
    pred: 59.35
  },
  {
    real: 60.65,
    pred: 63.14
  },
  {
    real: 65.62,
    pred: 67.88
  },
  {
    real: 68.22,
    pred: 73.85
  },
  {
    real: 37.56,
    pred: 33.95
  },
  {
    real: 44.57,
    pred: 43.0
  },
  {
    real: 54.75,
    pred: 55.46
  },
  {
    real: 59.27,
    pred: 63.07
  },
  {
    real: 63.39,
    pred: 66.71
  },
  {
    real: 68.27,
    pred: 69.81
  },
  {
    real: 64.65,
    pred: 73.76
  },
  {
    real: 36.12,
    pred: 35.37
  },
  {
    real: 40.34,
    pred: 43.76
  },
  {
    real: 50.94,
    pred: 52.94
  },
  {
    real: 57.65,
    pred: 59.91
  },
  {
    real: 63.05,
    pred: 62.71
  },
  {
    real: 62.99,
    pred: 63.15
  },
  {
    real: 62.57,
    pred: 63.93
  },
  {
    real: 65.64,
    pred: 65.29
  },
  {
    real: 36.12,
    pred: 34.2
  },
  {
    real: 46.7,
    pred: 41.48
  },
  {
    real: 54.06,
    pred: 51.52
  },
  {
    real: 62.94,
    pred: 61.31
  },
  {
    real: 61.46,
    pred: 63.08
  },
  {
    real: 66.95,
    pred: 64.03
  },
  {
    real: 74.09,
    pred: 68.11
  },
  {
    real: 69.97,
    pred: 71.96
  },
  {
    real: 36.12,
    pred: 34.2
  },
  {
    real: 48.66,
    pred: 42.74
  },
  {
    real: 55.36,
    pred: 50.86
  },
  {
    real: 58.42,
    pred: 59.12
  },
  {
    real: 62.85,
    pred: 60.81
  },
  {
    real: 61.81,
    pred: 62.11
  },
  {
    real: 66.6,
    pred: 63.49
  },
  {
    real: 65.53,
    pred: 64.13
  },
  {
    real: 34.75,
    pred: 33.27
  },
  {
    real: 49.84,
    pred: 41.72
  },
  {
    real: 60.05,
    pred: 52.99
  },
  {
    real: 69.86,
    pred: 69.51
  },
  {
    real: 68.3,
    pred: 74.4
  },
  {
    real: 77.08,
    pred: 77.55
  },
  {
    real: 79.23,
    pred: 70.99
  },
  {
    real: 76.27,
    pred: 74.15
  },
  {
    real: 34.75,
    pred: 33.33
  },
  {
    real: 40.43,
    pred: 45.7
  },
  {
    real: 45.01,
    pred: 50.08
  },
  {
    real: 44.06,
    pred: 49.07
  },
  {
    real: 47.09,
    pred: 49.37
  },
  {
    real: 45.87,
    pred: 49.76
  },
  {
    real: 48.41,
    pred: 48.36
  },
  {
    real: 49.53,
    pred: 48.37
  },
  {
    real: 34.75,
    pred: 34.02
  },
  {
    real: 44.22,
    pred: 39.54
  },
  {
    real: 51.8,
    pred: 47.69
  },
  {
    real: 50.3,
    pred: 49.37
  },
  {
    real: 52.89,
    pred: 49.67
  },
  {
    real: 52.6,
    pred: 51.76
  },
  {
    real: 52.17,
    pred: 52.13
  },
  {
    real: 50.9,
    pred: 51.86
  },
  {
    real: 16.65,
    pred: 31.06
  },
  {
    real: 24.21,
    pred: 27.5
  },
  {
    real: 22.78,
    pred: 36.82
  },
  {
    real: 30.69,
    pred: 44.39
  },
  {
    real: 35.5,
    pred: 46.79
  },
  {
    real: 60.45,
    pred: 62.23
  },
  {
    real: 50.82,
    pred: 46.88
  },
  {
    real: 65.67,
    pred: 53.08
  },
  {
    real: 62.9,
    pred: 56.25
  },
  {
    real: 82.41,
    pred: 70.21
  },
  {
    real: 34.13,
    pred: 34.26
  },
  {
    real: 35.92,
    pred: 41.14
  },
  {
    real: 42.68,
    pred: 48.91
  },
  {
    real: 56.53,
    pred: 59.24
  },
  {
    real: 64.53,
    pred: 58.55
  },
  {
    real: 67.34,
    pred: 49.97
  },
  {
    real: 32.36,
    pred: 31.08
  },
  {
    real: 32.12,
    pred: 31.07
  },
  {
    real: 43.59,
    pred: 40.14
  },
  {
    real: 53.8,
    pred: 51.67
  },
  {
    real: 62.64,
    pred: 61.31
  },
  {
    real: 63.43,
    pred: 61.35
  },
  {
    real: 36.26,
    pred: 32.31
  },
  {
    real: 35.97,
    pred: 34.37
  },
  {
    real: 43.18,
    pred: 46.57
  },
  {
    real: 57.51,
    pred: 62.34
  },
  {
    real: 67.15,
    pred: 60.46
  },
  {
    real: 69.18,
    pred: 61.46
  },
  {
    real: 36.01,
    pred: 31.89
  },
  {
    real: 35.6,
    pred: 33.47
  },
  {
    real: 37.89,
    pred: 35.28
  },
  {
    real: 49.72,
    pred: 44.94
  },
  {
    real: 56.06,
    pred: 47.93
  },
  {
    real: 57.56,
    pred: 50.89
  },
  {
    real: 33.61,
    pred: 32.55
  },
  {
    real: 33.42,
    pred: 33.17
  },
  {
    real: 42.8,
    pred: 49.65
  },
  {
    real: 56.19,
    pred: 55.75
  },
  {
    real: 67.32,
    pred: 62.04
  },
  {
    real: 71.96,
    pred: 68.41
  },
  {
    real: 33.68,
    pred: 34.47
  },
  {
    real: 35.05,
    pred: 38.51
  },
  {
    real: 50.97,
    pred: 51.87
  },
  {
    real: 59.36,
    pred: 55.72
  },
  {
    real: 60.94,
    pred: 42.07
  },
  {
    real: 64.47,
    pred: 67.5
  },
  {
    real: 31.77,
    pred: 32.77
  },
  {
    real: 35.55,
    pred: 37.44
  },
  {
    real: 42.58,
    pred: 43.64
  },
  {
    real: 50.49,
    pred: 50.32
  },
  {
    real: 49.41,
    pred: 50.9
  },
  {
    real: 50.24,
    pred: 53.2
  },
  {
    real: 34.6,
    pred: 34.11
  },
  {
    real: 37.11,
    pred: 39.49
  },
  {
    real: 45.41,
    pred: 53.3
  },
  {
    real: 50.13,
    pred: 59.74
  },
  {
    real: 56.75,
    pred: 65.75
  },
  {
    real: 59.74,
    pred: 67.05
  },
  {
    real: 33.47,
    pred: 32.84
  },
  {
    real: 37.16,
    pred: 33.54
  },
  {
    real: 36.9,
    pred: 42.29
  },
  {
    real: 41.95,
    pred: 40.12
  },
  {
    real: 39.06,
    pred: 44.13
  },
  {
    real: 41.15,
    pred: 43.75
  },
  {
    real: 34.71,
    pred: 34.04
  },
  {
    real: 21.58,
    pred: 28.88
  },
  {
    real: 34.82,
    pred: 46.37
  },
  {
    real: 55.94,
    pred: 59.65
  },
  {
    real: 69.56,
    pred: 67.57
  },
  {
    real: 71.92,
    pred: 68.9
  },
  {
    real: 34.41,
    pred: 33.97
  },
  {
    real: 19.94,
    pred: 25.05
  },
  {
    real: 37.91,
    pred: 52.31
  },
  {
    real: 57.73,
    pred: 61.09
  },
  {
    real: 71.05,
    pred: 64.67
  },
  {
    real: 74.38,
    pred: 64.82
  },
  {
    real: 34.56,
    pred: 33.91
  },
  {
    real: 22.35,
    pred: 24.52
  },
  {
    real: 32.89,
    pred: 44.63
  },
  {
    real: 52.87,
    pred: 57.58
  },
  {
    real: 68.26,
    pred: 73.89
  },
  {
    real: 70.66,
    pred: 72.96
  },
  {
    real: 17.87,
    pred: 22.44
  },
  {
    real: 12.15,
    pred: 17.25
  },
  {
    real: 2.26,
    pred: 49.42
  },
  {
    real: 0.0,
    pred: 46.35
  },
  {
    real: 13.0,
    pred: 33.16
  },
  {
    real: 37.03,
    pred: 41.52
  },
  {
    real: 17.38,
    pred: 22.46
  },
  {
    real: 18.33,
    pred: 18.88
  },
  {
    real: 18.29,
    pred: 34.62
  },
  {
    real: 23.02,
    pred: 23.58
  },
  {
    real: 11.05,
    pred: 30.57
  },
  {
    real: 69.62,
    pred: 31.04
  },
  {
    real: 19.36,
    pred: 22.81
  },
  {
    real: 20.36,
    pred: 20.97
  },
  {
    real: 20.2,
    pred: 33.87
  },
  {
    real: 23.86,
    pred: 24.35
  },
  {
    real: 23.93,
    pred: 22.57
  },
  {
    real: 37.29,
    pred: 44.67
  },
  {
    real: 25.62,
    pred: 26.33
  },
  {
    real: 34.56,
    pred: 29.71
  },
  {
    real: 34.83,
    pred: 31.82
  },
  {
    real: 40.27,
    pred: 47.3
  },
  {
    real: 46.51,
    pred: 59.05
  },
  {
    real: 55.29,
    pred: 63.26
  },
  {
    real: 59.92,
    pred: 63.97
  },
  {
    real: 65.16,
    pred: 66.31
  },
  {
    real: 24.35,
    pred: 27.55
  },
  {
    real: 30.49,
    pred: 30.73
  },
  {
    real: 31.75,
    pred: 32.65
  },
  {
    real: 43.5,
    pred: 46.98
  },
  {
    real: 47.04,
    pred: 52.78
  },
  {
    real: 56.34,
    pred: 62.05
  },
  {
    real: 62.26,
    pred: 63.19
  },
  {
    real: 65.57,
    pred: 65.57
  },
  {
    real: 27.2,
    pred: 25.31
  },
  {
    real: 38.66,
    pred: 31.75
  },
  {
    real: 33.32,
    pred: 34.69
  },
  {
    real: 51.61,
    pred: 50.43
  },
  {
    real: 54.64,
    pred: 53.16
  },
  {
    real: 63.92,
    pred: 59.84
  },
  {
    real: 70.43,
    pred: 63.53
  },
  {
    real: 72.77,
    pred: 65.47
  },
  {
    real: 19.14,
    pred: 29.46
  },
  {
    real: 21.65,
    pred: 33.59
  },
  {
    real: 27.69,
    pred: 32.66
  },
  {
    real: 42.46,
    pred: 48.76
  },
  {
    real: 42.54,
    pred: 45.52
  },
  {
    real: 56.12,
    pred: 60.44
  },
  {
    real: 60.21,
    pred: 62.71
  },
  {
    real: 66.55,
    pred: 65.47
  },
  {
    real: 22.93,
    pred: 24.65
  },
  {
    real: 34.42,
    pred: 26.28
  },
  {
    real: 36.69,
    pred: 31.02
  },
  {
    real: 43.91,
    pred: 38.06
  },
  {
    real: 49.34,
    pred: 46.27
  },
  {
    real: 58.93,
    pred: 56.26
  },
  {
    real: 64.83,
    pred: 60.72
  },
  {
    real: 66.88,
    pred: 61.91
  },
  {
    real: 36.56,
    pred: 33.32
  },
  {
    real: 30.87,
    pred: 30.3
  },
  {
    real: 50.96,
    pred: 46.61
  },
  {
    real: 55.93,
    pred: 60.12
  },
  {
    real: 56.95,
    pred: 69.47
  },
  {
    real: 76.58,
    pred: 77.01
  },
  {
    real: 65.76,
    pred: 81.0
  },
  {
    real: 37.89,
    pred: 35.27
  },
  {
    real: 28.62,
    pred: 31.64
  },
  {
    real: 48.47,
    pred: 54.48
  },
  {
    real: 49.52,
    pred: 57.84
  },
  {
    real: 59.54,
    pred: 70.5
  },
  {
    real: 76.05,
    pred: 74.11
  },
  {
    real: 91.42,
    pred: 71.2
  },
  {
    real: 35.53,
    pred: 34.62
  },
  {
    real: 27.19,
    pred: 30.59
  },
  {
    real: 51.7,
    pred: 54.84
  },
  {
    real: 48.81,
    pred: 52.2
  },
  {
    real: 69.49,
    pred: 64.11
  },
  {
    real: 76.34,
    pred: 71.62
  },
  {
    real: 75.62,
    pred: 76.17
  },
  {
    real: 36.91,
    pred: 34.61
  },
  {
    real: 45.79,
    pred: 36.39
  },
  {
    real: 54.51,
    pred: 54.25
  },
  {
    real: 68.3,
    pred: 58.86
  },
  {
    real: 64.02,
    pred: 67.45
  },
  {
    real: 68.23,
    pred: 71.49
  },
  {
    real: 75.91,
    pred: 69.45
  },
  {
    real: 28.55,
    pred: 32.02
  },
  {
    real: 32.45,
    pred: 29.7
  },
  {
    real: 51.05,
    pred: 39.47
  },
  {
    real: 79.6,
    pred: 48.34
  },
  {
    real: 83.56,
    pred: 64.84
  },
  {
    real: 100.0,
    pred: 73.14
  },
  {
    real: 94.49,
    pred: 79.04
  },
  {
    real: 31.99,
    pred: 31.88
  },
  {
    real: 35.35,
    pred: 31.64
  },
  {
    real: 44.86,
    pred: 38.99
  },
  {
    real: 72.6,
    pred: 48.25
  },
  {
    real: 59.83,
    pred: 60.05
  },
  {
    real: 94.13,
    pred: 84.91
  },
  {
    real: 79.33,
    pred: 77.28
  },
  {
    real: 32.7,
    pred: 32.01
  },
  {
    real: 32.4,
    pred: 30.36
  },
  {
    real: 44.1,
    pred: 38.13
  },
  {
    real: 63.43,
    pred: 48.37
  },
  {
    real: 65.47,
    pred: 63.34
  },
  {
    real: 96.67,
    pred: 86.94
  },
  {
    real: 90.51,
    pred: 78.86
  },
  {
    real: 30.38,
    pred: 30.35
  },
  {
    real: 28.74,
    pred: 27.68
  },
  {
    real: 53.4,
    pred: 39.75
  },
  {
    real: 89.72,
    pred: 53.33
  },
  {
    real: 82.46,
    pred: 72.78
  },
  {
    real: 84.21,
    pred: 84.51
  },
  {
    real: 88.78,
    pred: 81.08
  }
]
