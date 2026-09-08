# Plan de evolución — Simulador de Compostaje con ML

**Estado:** Fases 1, 2, 3 y 4 completadas. Falta que hagas el commit/push final y el primer deploy en Vercel siguiendo `docs/deployment.md`.
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

## 5. Fase 3 — Gráficas basadas en el modelo real ✅ completada

`charts-section.tsx` usa la importancia de variables real del `RandomForestRegressor` (`Day`=0.360, `MC(%)`=0.379, `C/N Ratio`=0.216, `Temperature`=0.046). Además, cada una de las pestañas Temperatura/Humedad/Tiempo ahora muestra, debajo de la curva de referencia teórica, la **dependencia parcial real** (`sklearn.inspection.partial_dependence`) calculada sobre el `RandomForestRegressor` entrenado (script `ml/compute_pdp.py`, datos en `lib/model-pdp-data.ts`).

El resultado se presenta con honestidad, no se forzó a calzar con la literatura:
- **Tiempo**: buena concordancia de forma (sube y luego se estabiliza en meseta), aunque el modelo real satura más rápido (~día 20-25) que la curva de referencia (~día 60).
- **Temperatura**: el modelo muestra un efecto débil y casi plano, consistente con ser la variable de menor importancia (4.6%) — no reproduce la campana 45-60°C de la literatura, probablemente por correlación con otras variables en los datos reales (la dependencia parcial asume independencia, algo que no se cumple aquí).
- **Humedad**: efecto fuerte pero en forma de escalón (cae bruscamente entre 42-50% de humedad), no la campana simétrica de la literatura — una diferencia real entre lo que dicen los datos observacionales de este dataset específico y el consenso general de la literatura.

La matriz de confusión del modelo de visión se muestra en la nueva pestaña "Visión" (no se duplicó aquí).

## 6. Fase 4 — Despliegue ✅ preparado (falta el deploy en sí)

Hallazgo real durante esta fase: al instalar dependencias apareció `ERR_PNPM_IGNORED_BUILDS` — pnpm
(v10+) bloquea por seguridad los scripts `postinstall` de paquetes nuevos (`onnxruntime-node`, `sharp`,
`core-js`) hasta aprobarlos con `pnpm approve-builds`. Esa aprobación se guarda solo en la máquina local,
no en el repo, así que un build limpio en Vercel habría fallado igual. Se corrigió declarando la
aprobación en `package.json` (`pnpm.onlyBuiltDependencies`).

También se agregó `serverExternalPackages: ["onnxruntime-node"]` en `next.config.mjs`: ese paquete carga
su binario nativo con un `require()` dinámico según plataforma/arquitectura, y sin esta opción el "file
tracing" de Vercel puede no incluirlo en la función serverless — un error que solo aparecería en
producción, no en local.

Se agregó `.github/workflows/ci.yml` (lint + build en cada push a `main`, igual que en PongIQ).

Ver `docs/deployment.md` para el paso a paso de despliegue en Vercel y el checklist de verificación
post-deploy (incluye qué revisar si `onnxruntime-node` fallara en producción a pesar de estos ajustes,
con la opción B de respaldo: microservicio Python en Render, igual que PongIQ).

## 7. Próximo paso inmediato

De tu lado: `git add . && git commit && git push`, confirmar que el CI queda en verde, y seguir
`docs/deployment.md` para el primer deploy en Vercel. El proyecto queda con backend real (ONNX), visión
por computadora real (TensorFlow.js), gráficas derivadas del modelo real, y listo para desplegarse.
