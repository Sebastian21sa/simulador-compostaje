# Plan de evolución — Simulador de Compostaje con ML

**Estado:** Fase 1 (modelo tabular real) y Fase 2 (visión: detector de contaminantes) completadas e integradas en el repo. Quedan Fase 3 (gráficas ya parcialmente actualizadas con datos reales) y Fase 4 (despliegue) por confirmar/cerrar.
**Alcance:** pasar de un simulador con fórmulas heurísticas a un producto con modelo tabular real, módulo de visión por computadora, gráficas derivadas del modelo real, y despliegue — todo dentro de un único proyecto Next.js.

## 1. Punto de partida

El simulador actual (`app/page.tsx` + `components/composting/*`) es un Next.js 16 / React 19 con Tailwind y shadcn/ui. Su pestaña "Simulador" no llama a ningún modelo: `handlePredict` corre un `setTimeout` y calcula todo en el cliente con factores fijos (`calcTempFactor`, `calcHumedadFactor`, tabla `factoresResiduo`). La pestaña "Gráficas" también usa datos generados a mano con esas mismas fórmulas (`temperatureData`, `humidityData`, `timeData`, e `importanceData` con porcentajes inventados). La pestaña "Referencias" sí tiene contenido real: 4 papers (2023-2026) sobre ML aplicado a compostaje, y una tabla de rangos óptimos (T° 45-60, humedad 45-65%, C/N 25-30, mínimo 30 días) que ya usamos como ancla científica. No existe backend: todo vive en el propio Next.js.

Esto significa que hoy el proyecto se presenta como "impulsado por ML" pero no entrena ni sirve ningún modelo. Las cuatro líneas de trabajo que pediste cierran exactamente esa brecha.

## 2. Arquitectura objetivo — dónde vive el backend

Confirmaste que quieres seguir en Next.js en vez de replicar el Flask+Docker+Render de PongIQ. Next.js sí puede ser tu backend: cualquier archivo en `app/api/*/route.ts` es un *Route Handler* que corre en un runtime Node.js en servidor (en Vercel, como función serverless) — es indistinguible en función de un backend Flask, solo que vive en el mismo repo y se despliega junto con el frontend.

El flujo implementado fue el de dos etapas:

1. **Entrenamiento offline en Python** (fuera del repo de producción): scikit-learn para el modelo tabular, TensorFlow/Keras para el modelo de imágenes.
2. **Exportación a un formato que Node/el navegador sí puede ejecutar**:
   - Modelo tabular (Random Forest) → **ONNX** (`skl2onnx`) → `app/api/predict/route.ts` con `onnxruntime-node`.
   - Modelo de imágenes → **TensorFlow.js** (`tensorflowjs_converter`) → corre directamente en el navegador con `@tensorflow/tfjs`, sin route handler.

Con esto el backend "existe", vive en `app/api/`, se despliega junto al frontend en Vercel, y ambos modelos reales corren en producción sin depender de un servicio Python separado.

## 3. Fase 1 — Modelo tabular real ✅ completada

Dataset usado: [`hafsa-kibria/Compost-Dataset`](https://github.com/hafsa-kibria/Compost-Dataset) (CC BY 4.0), 452 muestras reales de sensores (Arduino Mega + ESP-32), con `Score` de madurez como variable objetivo.

Lo implementado:
- `RandomForestRegressor` (Score continuo) y `RandomForestClassifier` (4 categorías de calidad discretizadas por cuartiles) entrenados con scikit-learn, validados con 5-fold cross-validation.
- **Métricas reales**: regresor R²=0.828, RMSE=7.18, MAE=4.57 (sobre Score 0-100); clasificador accuracy=76.6%.
- Exportación a ONNX (`skl2onnx`), verificada con paridad exacta contra el modelo scikit-learn original (diff máxima 0.000051 en el regresor, 100% de coincidencia en el clasificador).
- `app/api/predict/route.ts` (Route Handler, `runtime = "nodejs"`) sirve ambos modelos vía `onnxruntime-node`; `handlePredict` en `page.tsx` ahora hace `fetch` a esta API en vez de calcular todo en el cliente.
- Pestaña "Modelo" (`model-training.tsx`) muestra las métricas reales y un scatter real de predicciones fuera de muestra (452 puntos de `cross_val_predict`), con cita al dataset.
- Aireación y tipo de residuo (no presentes en el dataset) se mantienen como ajuste heurístico documentado sobre la salida del modelo — explicado explícitamente en la UI, no ocultado.

Nota técnica resuelta: `onnxruntime-node` ≥1.22 tiene un bug conocido que rompe la instalación en Linux (intenta descargar un paquete DirectML de NuGet incluso fuera de Windows). Se fijó la versión exacta `1.21.0` en `package.json`.

## 4. Fase 2 — Visión por computadora: detector de contaminantes ✅ completada

Como ya se había acordado, no existe un dataset público de "madurez visual de compost", así que el módulo se reformuló a un **detector de contaminantes**: el usuario sube una foto de un objeto/residuo y el modelo estima si es compostable o un contaminante (plástico, vidrio, metal, etc. mezclado en el compost).

Dataset: [Compost classification (Johns Hopkins University, Roboflow Universe)](https://universe.roboflow.com/johns-hopkins-university-ipy8c/compost-classification), CC BY 4.0 — 38 clases originales reagrupadas en 2 (compostable/contaminante) según guías de compostaje doméstico, conservando los splits train/valid/test originales (424/145/141 imágenes).

**Limitación real encontrada y documentada (no oculta):** el entorno donde se entrenó este modelo bloquea el acceso a `storage.googleapis.com`, que es el único host desde el que Keras descarga los pesos preentrenados de ImageNet para *todas* sus arquitecturas (MobileNet, ResNet, VGG, EfficientNet, etc. — se verificó una por una). Esto hizo inviable el transfer learning planeado originalmente. Se optó por entrenar una **CNN compacta desde cero** (4 bloques Conv2D+BatchNorm+MaxPooling, aumento de datos agresivo, regularización L2 y dropout, class weights por el desbalance de clases) en vez de degradar el resultado silenciosamente.

Resultado: **71.6% de accuracy en el test set** (141 imágenes nunca vistas), F1 macro 0.68 — un modelo real y funcional, pero con margen de mejora claro si se re-entrena con transfer learning en una máquina sin esa restricción de red (opción que queda documentada como mejora futura, no como pendiente bloqueante).

Lo implementado:
- `vision/scripts/prepare_binary_dataset.py`: reagrupa las 38 clases en 2.
- `vision/scripts/train_vision.py`: entrena la CNN, evalúa en test set, guarda métricas reales en `metrics_vision.json`.
- Conversión a TensorFlow.js: se encontró y resolvió un problema real de conversión (las capas de aumento de datos —`RandomFlip`, `RandomRotation`, etc.— usan variables de estado que no se congelan correctamente al exportar el grafo de inferencia). Solución: reconstrucción de un modelo "solo inferencia" que reutiliza las capas entrenadas (mismos pesos) pero excluye aumento de datos y dropout (ambas son no-ops en inferencia). Verificado bit a bit: diferencia máxima de 6×10⁻⁸ entre las predicciones de Keras (Python) y TensorFlow.js (Node/navegador) sobre imágenes reales del test set.
- `lib/vision-metadata.ts`: métricas reales (accuracy, matriz de confusión, precision/recall por clase) para mostrar en la UI.
- `components/composting/image-quality-analyzer.tsx`: nueva pestaña "Visión" — sube una foto, corre la inferencia **en el navegador** con `@tensorflow/tfjs` (ninguna imagen se envía a un servidor), muestra el resultado con nivel de confianza y las métricas reales del modelo.
- Modelo servido como archivo estático en `public/models/tfjs_contaminant_detector/` (~1MB).

## 5. Fase 3 — Gráficas basadas en el modelo real (parcialmente completada)

`charts-section.tsx` ya usa la importancia de variables real del `RandomForestRegressor` de la Fase 1 (`Day`=0.360, `MC(%)`=0.379, `C/N Ratio`=0.216, `Temperature`=0.046) en vez de los porcentajes inventados originales. Pendiente de decidir/hacer:
- Las curvas de temperatura/humedad/tiempo siguen siendo curvas de referencia basadas en literatura (no partial dependence del modelo real): al calcular la dependencia parcial real se encontraron formas que no coinciden limpiamente con la campana de la literatura y requieren un encuadre cuidadoso en la UI antes de reemplazarlas — para no reemplazar una simplificación honesta por otra que confunda al usuario.
- Falta la matriz de confusión del modelo de visión en esta pestaña (hoy vive en la nueva pestaña "Visión").

## 6. Fase 4 — Despliegue (pendiente)

Con todo dentro de Next.js (Route Handler ONNX + TensorFlow.js en cliente), el despliegue es un `vercel deploy` del repo actual. Puntos a validar antes de desplegar:
- Tamaño del artefacto ONNX + `onnxruntime-node` dentro del límite de función serverless de Vercel (250MB sin comprimir) — sin problema con un Random Forest pequeño.
- Cold starts de la función que carga ONNX.
- El modelo de visión (`public/models/tfjs_contaminant_detector/`, ~1MB) se sirve como estático, no cuenta contra el límite de función.
- Ejecutar `pnpm install && pnpm build` localmente para confirmar que todo compila con las nuevas dependencias (`onnxruntime-node@1.21.0`, `@tensorflow/tfjs@4.22.0`) — no se pudo verificar un build completo desde este entorno por restricciones de red/tiempo del entorno de trabajo remoto, solo verificación de sintaxis de cada archivo nuevo/modificado.
- CI básico (GitHub Actions) que corra lint/build en cada push, igual que en PongIQ.

## 7. Próximo paso inmediato

Correr `pnpm install && pnpm build` localmente para confirmar que compila con los cambios de Fase 1 y Fase 2, revisar visualmente las pestañas "Modelo" y "Visión" en `pnpm dev`, y decidir si se avanza con Fase 3 (partial dependence) y Fase 4 (despliegue en Vercel).
