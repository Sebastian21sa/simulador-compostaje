// Tabla de residuos organicos usada tanto por el formulario del simulador
// (components/composting/simulator-form.tsx) como por el modelo real
// (app/api/predict/route.ts). El C/N Ratio es la unica senal de "tipo de
// residuo" que el modelo tabular vio durante el entrenamiento (ver
// ml/train_tabular.py) -- el campo "eficienciaReferencia" de la version
// anterior (heuristica) del simulador ya no se usa para calcular
// resultados; se conserva solo como dato informativo/de referencia.

export interface ResiduoInfo {
  cnRatio: number
  eficienciaReferencia: number
}

export const factoresResiduo: Record<string, ResiduoInfo> = {
  comida: { cnRatio: 20, eficienciaReferencia: 1.0 },
  poda: { cnRatio: 60, eficienciaReferencia: 0.85 },
  papel: { cnRatio: 150, eficienciaReferencia: 0.7 },
  cafe: { cnRatio: 25, eficienciaReferencia: 0.9 },
  huevo: { cnRatio: 9, eficienciaReferencia: 0.75 },
  mezcla: { cnRatio: 30, eficienciaReferencia: 0.92 },
}
