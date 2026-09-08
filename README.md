# Simulador de Compostaje con ML

Simulador de compostaje impulsado por dos modelos de Machine Learning reales (no heurísticas
disfrazadas de IA): un modelo tabular que predice la calidad del compost a partir de sus condiciones
de proceso, y un detector de contaminantes por visión que analiza fotos de residuos.

**Demo en vivo:** https://v0-composting-simulator.vercel.app

## Qué es esto

Este proyecto empezó como una demo con fórmulas fijas presentada como "impulsada por ML". La versión
actual reemplaza esas fórmulas por modelos de Machine Learning entrenados con datasets públicos reales,
evaluados con métricas reales (no inventadas), y con las limitaciones de cada modelo documentadas
explícitamente en la propia interfaz en vez de ocultarlas.

Todo vive dentro de un único proyecto Next.js: no hay un backend Python separado. El modelo tabular se
entrena offline en Python y se sirve en producción vía [ONNX](https://onnx.ai/) desde un Route Handler
de Next.js; el modelo de visión se convierte a [TensorFlow.js](https://www.tensorflow.org/js) y corre
completo en el navegador del usuario (ninguna imagen se envía a un servidor).

## Funcionalidades

- **Simulador**: ajusta tipo de residuo, temperatura, humedad, aireación y tiempo de proceso, y obtén
  una predicción de producción y calidad de compost calculada por el modelo real (no una fórmula fija).
- **Visión**: sube una foto de un objeto o residuo y un modelo de visión entrenado con imágenes reales
  estima si es compostable o un contaminante (plástico, vidrio, metal, etc.), con nivel de confianza.
- **Modelo**: métricas reales del modelo tabular (R², RMSE, accuracy) y un gráfico de predicciones fuera
  de muestra contra los valores reales del dataset de entrenamiento.
- **Gráficas**: importancia de variables real (`feature_importances_`) y dependencia parcial real
  (`partial_dependence`) del modelo entrenado, comparadas honestamente contra los rangos "óptimos" de la
  literatura científica — incluyendo dónde el modelo coincide con la teoría y dónde no.
- **Referencias**: papers académicos (2023-2026) sobre ML aplicado a compostaje que fundamentan los
  rangos de referencia usados en la app.

## Los modelos de Machine Learning

### Modelo tabular (predicción de calidad)

- **Dataset**: [Compost-Dataset (hafsa-kibria)](https://github.com/hafsa-kibria/Compost-Dataset), CC BY
  4.0 — 452 muestras reales tomadas con sensores (Arduino Mega + ESP-32) durante procesos de
  compostaje reales.
- **Modelo**: `RandomForestRegressor` (predicción continua del Score 0-100) y `RandomForestClassifier`
  (categoría de calidad discretizada en cuartiles), entrenados con scikit-learn y validados con 5-fold
  cross-validation.
- **Métricas reales**: R² = 0.828, RMSE = 7.18, MAE = 4.57 (regresor); accuracy = 76.6% (clasificador).
- **Servido en producción** vía ONNX (`skl2onnx` + `onnxruntime-node`) desde `app/api/predict/route.ts`.
- La aireación y el tipo de residuo no están en el dataset de entrenamiento; se aplican como un ajuste
  heurístico documentado sobre la salida del modelo, no como algo que el modelo "aprendió".

### Modelo de visión (detector de contaminantes)

- **Dataset**: [Compost classification (Johns Hopkins University, Roboflow Universe)](https://universe.roboflow.com/johns-hopkins-university-ipy8c/compost-classification),
  CC BY 4.0 — 38 clases originales reagrupadas en 2 (compostable / contaminante) según guías de
  compostaje doméstico.
- **Modelo**: CNN compacta entrenada desde cero (4 bloques Conv2D + BatchNorm + MaxPooling, aumento de
  datos agresivo, regularización L2 y dropout). No usa transfer learning: el entorno donde se entrenó
  bloqueaba el acceso a los pesos preentrenados de ImageNet que usa Keras, así que se optó por entrenar
  desde cero y documentar la limitación en vez de simular un resultado mejor del real.
- **Métrica real**: 71.6% de accuracy en test set (141 imágenes nunca vistas en entrenamiento).
- **Servido en producción** como TensorFlow.js estático (`public/models/tfjs_contaminant_detector/`),
  corre 100% client-side.

## Stack tecnológico

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS · shadcn/ui · Recharts · Framer Motion
· scikit-learn · TensorFlow/Keras · ONNX Runtime · TensorFlow.js

## Estructura del proyecto

```
app/
  page.tsx                 # UI principal (pestañas: Simulador, Visión, Modelo, Gráficas, Referencias)
  api/predict/route.ts     # Route Handler: inferencia del modelo tabular (ONNX)
components/composting/     # Componentes de cada pestaña
lib/                       # Metadatos y datos reales de los modelos (métricas, PDP, scatter)
ml/                        # Scripts de entrenamiento (Python, no se despliega)
  train_tabular.py
  export_onnx.py
  compute_pdp.py
  vision/
    prepare_binary_dataset.py
    train_vision.py
    export_tfjs.py
models/                    # Modelos .onnx entrenados (servidos por la API)
public/models/             # Modelo TensorFlow.js (servido como estático)
docs/
  plan-evolucion-ml.md     # Plan de evolución del proyecto, fase por fase
  deployment.md            # Checklist de despliegue en Vercel + problemas reales encontrados
```

## Correrlo localmente

Requiere [pnpm](https://pnpm.io/).

```bash
pnpm install
```

La primera vez, pnpm puede pedir aprobar los scripts de instalación de `onnxruntime-node` y `sharp`
(esto ya queda declarado en `package.json` para instalaciones futuras, pero puede pedirse una vez):

```bash
pnpm approve-builds
```

```bash
pnpm dev
```

Abre `http://localhost:3000`.

## Despliegue

Desplegado en Vercel. El proyecto tiene algunas particularidades de configuración necesarias por usar
un modelo nativo (`onnxruntime-node`) dentro de una función serverless — están todas documentadas, con
los errores reales encontrados y cómo se resolvieron, en [`docs/deployment.md`](docs/deployment.md).

## Autor

**Joan Sebastian Sanchez** — [GitHub](https://github.com/Sebastian21sa)

Otro proyecto del portafolio: [PongIQ](https://pongiq-murex.vercel.app) — analizador de técnica de
tenis de mesa impulsado por ML.
