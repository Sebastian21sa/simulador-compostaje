"use client"

import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Brain, Database, Target, Shuffle } from "lucide-react"
import { modelMetadata } from "@/lib/model-metadata"
import { modelScatterData } from "@/lib/model-scatter-data"

export function ModelTraining() {
  const metrics = [
    {
      icon: Target,
      label: "R² Score (regresor)",
      value: modelMetadata.regressor.r2Mean.toFixed(3),
      delta: `5-fold CV, ${modelMetadata.regressor.folds} folds`,
      color: "text-primary",
    },
    {
      icon: Database,
      label: "Muestras reales",
      value: modelMetadata.dataset.nSamples.toString(),
      delta: "sensores de compostaje",
      color: "text-chart-2",
    },
    {
      icon: Brain,
      label: "RMSE (Score 0-100)",
      value: modelMetadata.regressor.rmseMean.toFixed(2),
      delta: `MAE: ${modelMetadata.regressor.maeMean.toFixed(2)}`,
      color: "text-chart-4",
    },
    {
      icon: Shuffle,
      label: "Accuracy (clasificador)",
      value: `${(modelMetadata.classifier.accuracyMean * 100).toFixed(1)}%`,
      delta: "4 categorias de calidad",
      color: "text-accent",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 bg-card border-border hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-secondary ${metric.color}`}>
                  <metric.icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-muted-foreground">{metric.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{metric.delta}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Gráfica de correlación */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold mb-2 text-foreground">Predicciones vs Valores Reales (fuera de muestra)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Cada punto es una predicción del <code>RandomForestRegressor</code> sobre una fila que NO vio durante su entrenamiento (validación cruzada de 5 folds), comparada contra el Score real medido en el dataset de {modelMetadata.dataset.nSamples} muestras de{" "}
          <a
            href={modelMetadata.dataset.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2"
          >
            {modelMetadata.dataset.source}
          </a>
          .
        </p>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                dataKey="real"
                name="Score real"
                domain={[0, 100]}
                stroke="#94a3b8"
                tick={{ fill: "#e2e8f0", fontSize: 12 }}
                label={{ value: "Score real (0-100)", position: "insideBottom", offset: -10, fill: "#e2e8f0" }}
              />
              <YAxis
                type="number"
                dataKey="pred"
                name="Score predicho"
                domain={[0, 100]}
                stroke="#94a3b8"
                tick={{ fill: "#e2e8f0", fontSize: 12 }}
                label={{ value: "Score predicho (0-100)", angle: -90, position: "insideLeft", offset: 10, fill: "#e2e8f0" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))"
                }}
                formatter={(value: number) => [value.toFixed(1)]}
              />
              <ReferenceLine
                segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]}
                stroke="#f87171"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
              <Scatter
                data={modelScatterData}
                fill="#4ade80"
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          La línea punteada roja representa la predicción perfecta (y = x)
        </p>
      </Card>

      {/* Dataset info */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Dataset de entrenamiento real</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {modelMetadata.dataset.note}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Parámetro</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rango real observado</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Unidad</th>
              </tr>
            </thead>
            <tbody>
              {[
                { param: "Tiempo (Day)", rango: "0 - 120", unidad: "días" },
                { param: "Temperatura", rango: "9.5 - 68.8", unidad: "°C" },
                { param: "Humedad (MC)", rango: "11 - 79.2", unidad: "%" },
                { param: "Relación C/N", rango: "4.6 - 39.7", unidad: "-" },
                { param: "Score (madurez)", rango: "0 - 100", unidad: "-" },
              ].map((row, index) => (
                <motion.tr
                  key={row.param}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="py-3 px-4 text-foreground">{row.param}</td>
                  <td className="py-3 px-4 text-primary font-mono">{row.rango}</td>
                  <td className="py-3 px-4 text-muted-foreground">{row.unidad}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          La aireación no está presente en este dataset: el simulador la aplica como un ajuste heurístico documentado sobre la salida del modelo (ver <code>app/api/predict/route.ts</code>), no como algo que el modelo aprendió de datos reales.
        </p>
      </Card>
    </motion.div>
  )
}
