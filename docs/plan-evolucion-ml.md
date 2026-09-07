# Plan de evolución — Simulador de Compostaje con ML

**Estado:** dataset del modelo tabular (Fase 1) y del módulo de CV (Fase 2) ya definidos con fuentes públicas reales — queda una única decisión abierta marcada con ⚠️ en la Fase 2 (confirmar la reformulación a "detector de contaminantes")
**Alcance:** pasar de un simulador con fórmulas heurísticas a un producto con modelo tabular real, módulo de visión por computadora, gráficas derivadas del modelo real, y despliegue — todo dentro de un único proyecto Next.js.

## 1. Punto de partida

El simulador actual (`app/page.tsx` + `components/composting/*`) es un Next.js 16 / React 19 con Tailwind y shadcn/ui. Su pestaña "Simulador" no llama a ningún modelo: `handlePredict` corre un `setTimeout` y calcula todo en el cliente con factores fijos (`calcTempFactor`, `calcHumedadFactor`, tabla `factoresResiduo`). La pestaña "Gráficas" también usa datos generados a mano con esas mismas fórmulas (`temperatureData`, `humidityData`, `timeData`, e `importanceData` con porcentajes inventados). La pestaña "Referencias" sí tiene contenido real: 4 papers (2023-2026) sobre ML aplicado a compostaje, y una tabla de rangos óptimos (T° 45-60, humedad 45-65%, C/N 25-30, mínimo 30 días) que ya usamos como ancla científica. No existe backend: todo vive en el propio Next.js.

Esto significa que hoy el proyecto se presenta como "impulsado por ML" pero no entrena ni sirve ningún modelo. Las cuatro líneas de trabajo que pediste cierran exactamente esa brecha.

## 2. Arquitectura objetivo — dónde vive el backend

Confirmaste que quieres seguir en Next.js en vez de replicar el Flask+Docker+Render de PongIQ. Next.js sí puede ser tu backend: cualquier archivo en `app/api/*/route.ts` es un *Route Handler* que corre en un runtime Node.js en servidor (en Vercel, como función serverless) — es indistinguible en función de un backend Flask, solo que vive en el mismo repo y se despliega junto con el frontend.

El único obstáculo real es que Node no ejecuta directamente librerías Python como scikit-learn o TensorFlow/Keras. La solución estándar (y la que recomiendo) es un flujo de dos etapas:

1. **Entrenamiento offline en Python** (fuera del repo de producción, o en una carpeta `ml/` que no se despliega): ahí se usa scikit-learn para el modelo tabular y TensorFlow/Keras para el modelo de imágenes, exactamente como en PongIQ.
2. **Exportación a un formato que Node sí puede ejecutar**, y consumo desde el Route Handler:
   - Modelo tabular (Random Forest) → exportar a **ONNX** con `skl2onnx` → cargar en `app/api/predict/route.ts` con `onnxruntime-node`.
   - Modelo de imágenes → exportar a **TensorFlow.js** con `tensorflowjs_converter` → correrlo directamente en el navegador con `@tensorflow/tfjs` (no necesita ni siquiera un route handler; ver Fase 2).

Con esto el backend "existe", vive en `app/api/`, se despliega junto al frontend en Vercel, y el modelo real corre en producción sin depender de un servicio Python separado. Si más adelante el modelo de imágenes crece (una CNN más pesada) y el runtime serverless de Vercel se queda corto en tamaño o tiempo de arranque, la opción B de respaldo es un microservicio Python aparte en Render — igual que PongIQ — pero no es necesario para arrancar.

Estructura de carpetas propuesta:

```
simulador-compostaje/
├── ml/                          # NO se despliega; solo para entrenar
│   ├── data/                    # dataset tabular + imágenes
│   ├── train_tabular.py         # RandomForest (sklearn)
│   ├── train_vision.py          # CNN transfer learning (tf/keras)
│   └── export/                  # scripts de exportación a onnx / tfjs
├── public/models/
│   └── compost-quality-tfjs/    # modelo de imágenes servido estático
├── app/api/
│   └── predict/route.ts         # inferencia del modelo tabular (onnxruntime-node)
├── models/
│   └── compost-rf.onnx          # artefacto versionado
└── components/composting/
    └── image-quality-analyzer.tsx   # nuevo: sube foto, corre TFJS en el navegador
```

## 3. Fase 1 — Modelo tabular real (reemplaza el heurístico)

**Actualización — sí existe un dataset público real y usable.** [`hafsa-kibria/Compost-Dataset` en GitHub](https://github.com/hafsa-kibria/Compost-Dataset) (CC BY 4.0) contiene **452 muestras reales** tomadas con sensores (Arduino Mega + ESP-32) durante procesos de compostaje reales, con 14 columnas: día, temperatura, humedad (MC %), pH, relación C/N, amonio, nitrato, TN%, TOC%, EC, materia orgánica (OM%), T-Value, GI% (índice de germinación) y un `Score` que es directamente el indicador de madurez del compost — es decir, ya trae la variable objetivo. Es del paper "Compost Maturity Prediction and Gas Emissions Monitoring: A Sensor-Based and Interpretable Machine Learning Approach". Esto es mejor que generar datos sintéticos: es un dataset real, con licencia abierta, y con casi las mismas variables que ya manejas en el simulador (temperatura, humedad, C/N ya están; aireación y tipo de residuo no están, pero eso se puede tratar como metadata adicional del simulador que no entra al modelo, o inferir un proxy).

Pasos:
1. Descargar `Compost Data.csv` del repo y hacer EDA (rangos, valores faltantes, correlación con el `Score`).
2. Mapear las columnas del dataset a las variables del simulador: `Score` → categoría de calidad (excelente/buena/aceptable/baja, discretizando el score), y usar temperatura/humedad/C-N directamente; para "tipo de residuo" y "aireación" (que el dataset no tiene) se puede mantener como ajuste heurístico ligero sobre la predicción del modelo, dejándolo documentado como tal — más honesto que inventar que el modelo "sabe" algo que no vio en entrenamiento.
3. Entrenar `RandomForestRegressor` (para producción/score continuo) y `RandomForestClassifier` (para la categoría de calidad discretizada) con scikit-learn.
4. Validar con k-fold cross-validation (como en PongIQ) y reportar métricas reales (RMSE / accuracy) — esto reemplaza los porcentajes inventados de "74%, 76%" que hoy no existen aquí.
5. Exportar a ONNX (`skl2onnx`), probar inferencia en Node con `onnxruntime-node`.
6. Crear `app/api/predict/route.ts`, y actualizar `simulator-form.tsx` / la función `handlePredict` en `page.tsx` para llamar a la API en vez de calcular todo localmente.
7. Documentar en la pestaña "Modelo" (`model-training.tsx`) las métricas reales, el dataset usado (con su cita/link) y la limitación de que aireación/tipo de residuo son ajustes heurísticos complementarios al modelo entrenado.

*(Si el dataset resulta insuficiente en variedad tras el EDA, la alternativa de respaldo sigue siendo generar datos sintéticos fundamentados en los 4 papers de `references-section.tsx`, pero conviene partir de datos reales.)*

## 4. Fase 2 — Módulo de visión por computadora (decisión de datos ya tomada: dataset público)

Investigué a fondo buscando un dataset público de fotos de compost etiquetadas por **madurez/calidad visual** (que es la tarea que originalmente planteamos: "fresco / en proceso / maduro / mal manejado"). Conclusión honesta: **no existe un dataset público así**. Lo que sí encontré, en varios ángulos de búsqueda (Kaggle, Roboflow Universe, GitHub, Mendeley, Zenodo, papers académicos):

- Papers académicos que hacen exactamente esta tarea con imágenes — ["Prediction of agricultural waste compost maturity using Faster R-CNN"](https://www.sciencedirect.com/science/article/abs/pii/S2214785323001645), ["Image-driven in situ grading of compost maturity using deep feature clustering"](https://pubmed.ncbi.nlm.nih.gov/42217798/) — pero sus datasets de fotos de laboratorio no están publicados abiertamente.
- Datasets públicos de imágenes que sí existen y son descargables, pero resuelven **otra tarea** (reconocer objetos, no evaluar la calidad de una pila de compost):
  - [**Compost classification (Johns Hopkins University, Roboflow Universe)**](https://universe.roboflow.com/johns-hopkins-university-ipy8c/compost-classification) — 710 imágenes, 39 clases, CC BY 4.0, descargable directo en formatos para TensorFlow/Keras. Clasifica *qué objeto* es (cáscara de huevo, cartón, vidrio, plástico, etc.), es decir compostable vs. contaminante.
  - [CompostNet](https://github.com/sarahmfrost/compostnet) — clasifica una foto en compost/reciclaje/basura (para saber en qué caneca tirarla), no la calidad del compost.

**Recomendación:** en vez de forzar un dataset que no calza con "madurez visual", reformulamos ligeramente el alcance del módulo de CV hacia algo que sí tiene datos reales y que sigue siendo una señal legítima de calidad de compost: un **detector de contaminantes**. El usuario sube una foto de su pila/balde de compost, el modelo (entrenado con el dataset de Johns Hopkins, 39 clases → agrupadas en 2: *compostable* vs. *contaminante*) identifica si hay materiales no compostables (plástico, vidrio, metal, sanitarios) mezclados — que es justamente uno de los motivos reales por los que un compost baja de calidad. El resultado se puede mostrar como un ajuste sobre la predicción del modelo tabular ("se detectó contaminación visual: -X% en el score de calidad estimado").

⚠️ Última decisión que sí queda en tus manos: ¿seguimos con esta reformulación (contaminantes) usando el dataset de Johns Hopkins, o prefieres que sigamos buscando específicamente algo de madurez visual (con el riesgo real, ya comprobado en esta búsqueda, de no encontrar nada público y tener que volver a la opción de tus propias fotos)?

Pasos una vez confirmado:
1. Descargar el dataset de Johns Hopkins desde Roboflow (exportable en formato Keras/TensorFlow o carpetas por clase).
2. Reagrupar las 39 clases en 2 (compostable / contaminante) o mantener granularidad si sirve para mostrar qué contaminante específico se detectó.
3. Fine-tuning de una CNN preentrenada (MobileNetV2/EfficientNetB0 + cabeza nueva) — igual stack que PongIQ (TensorFlow/Keras).
4. Validación con matriz de confusión.
5. Exportar a TensorFlow.js (`tensorflowjs_converter`).
6. Nuevo componente `image-quality-analyzer.tsx`: input de imagen, carga el modelo TFJS desde `/public/models/...`, corre la inferencia **en el navegador** (sin subir la foto a ningún servidor — más simple de desplegar y mejor para privacidad), muestra si hay contaminación detectada y con qué confianza.
7. Integrarlo como una nueva pestaña o sección dentro de "Simulador", combinando su resultado con el del modelo tabular de la Fase 1.

## 5. Fase 3 — Gráficas basadas en el modelo real

Hoy `charts-section.tsx` grafica funciones escritas a mano, incluyendo una `importanceData` con porcentajes inventados (35%/25%/18%/12%/10%). Una vez exista el modelo real de la Fase 1, esa pestaña debería mostrar:
- Importancia de variables real, tomada de `model.feature_importances_` del Random Forest entrenado (exportada una sola vez como JSON en el build, no hay que recalcularla en cada request).
- Las curvas de temperatura/humedad como *partial dependence* del modelo real en vez de la función piecewise actual — visualmente similares pero ahora sí reflejan lo que el modelo aprendió, no una fórmula fija.
- Una gráfica nueva: comparación heurístico-viejo vs. modelo-nuevo, útil para mostrar la mejora en una entrevista.
- Si ya existe el modelo de visión, una matriz de confusión de esa clasificación.

Este paso depende de la Fase 1 (no se puede graficar importancia real sin el modelo real), así que naturalmente va después.

## 6. Fase 4 — Despliegue

Con todo dentro de Next.js (Route Handler para el modelo tabular vía ONNX, TensorFlow.js corriendo en cliente para imágenes), el despliegue es un solo `vercel deploy` del repo actual, igual que `web-sebastian.vercel.app`. Puntos a validar antes de desplegar:
- Tamaño del artefacto ONNX + `onnxruntime-node` dentro del límite de función serverless de Vercel (250MB sin comprimir) — con un Random Forest pequeño no debería ser problema.
- Cold starts: la primera petición después de inactividad puede tardar más por la carga del runtime de ONNX; aceptable para un portafolio, pero vale la pena medirlo.
- Modelo de imágenes servido como archivo estático en `public/models/` (no cuenta contra el límite de función, se sirve como CDN estático).
- CI básico (GitHub Actions) que corra lint/build en cada push, igual que en PongIQ.

## 7. Orden sugerido

Dado que la Fase 3 depende de la Fase 1, el orden con menos bloqueos es:

1. **Fase 1** (modelo tabular real, con `Compost-Dataset` de hafsa-kibria) — se puede arrancar ya, no depende de ninguna decisión externa.
2. **Fase 2** (visión por computadora, con el dataset de Johns Hopkins reformulado como detector de contaminantes) — puede arrancar en paralelo a la Fase 1 en cuanto confirmes la reformulación (⚠️ en la sección 4); ya no depende de tomar fotos propias.
3. **Fase 3** (gráficas reales) — después de la Fase 1, reutiliza lo generado ahí.
4. **Fase 4** (despliegue) — se puede hacer en paralelo desde el principio (dejar el proyecto siempre desplegable) o al cierre.

## 8. Próximo paso inmediato

Empezar la Fase 1: descargar `Compost Data.csv`, hacer el EDA, y entrenar el primer `RandomForestRegressor`/`Classifier` con scikit-learn. Es la fase sin decisiones pendientes y desbloquea la Fase 3; en paralelo solo falta tu confirmación sobre la Fase 2 para arrancarla también.
