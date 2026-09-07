"use client"

import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"
import { Brain, Database, Target, Shuffle } from "lucide-react"

// Generar datos de predicción vs real con variación
const predictionData = Array.from({ length: 80 }, () => {
  const real = Math.random() * 40 + 10
  const pred = real + (Math.random() - 0.5) * 5
  return { real: Number(real.toFixed(1)), pred: Number(Math.max(8, Math.min(52, pred)).toFixed(1)) }
})

export function ModelTraining() {
  const metrics = [
    { icon: Target, label: "R² Score", value: "0.947", delta: "+12%", color: "text-primary" },
    { icon: Database, label: "Muestras", value: "1,247", delta: "experimentos", color: "text-chart-2" },
    { icon: Brain, label: "RMSE", value: "2.34 kg", delta: "-1.2 kg", color: "text-chart-4" },
    { icon: Shuffle, label: "Validación", value: "5-Fold CV", delta: "94.3%", color: "text-accent" },
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
        <h3 className="text-lg font-semibold mb-2 text-foreground">Predicciones vs Valores Experimentales</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Correlación entre las predicciones del modelo y los datos experimentales de producción de compost.
        </p>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                type="number"
                dataKey="real"
                name="Experimental"
                domain={[5, 55]}
                stroke="#94a3b8"
                tick={{ fill: "#e2e8f0", fontSize: 12 }}
                label={{ value: "Valor experimental (kg)", position: "insideBottom", offset: -10, fill: "#e2e8f0" }}
              />
              <YAxis
                type="number"
                dataKey="pred"
                name="Prediccion"
                domain={[5, 55]}
                stroke="#94a3b8"
                tick={{ fill: "#e2e8f0", fontSize: 12 }}
                label={{ value: "Prediccion del modelo (kg)", angle: -90, position: "insideLeft", offset: 10, fill: "#e2e8f0" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))"
                }}
                formatter={(value: number) => [value.toFixed(1) + " kg"]}
              />
              <ReferenceLine
                segment={[{ x: 5, y: 5 }, { x: 55, y: 55 }]}
                stroke="#f87171"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
              <Scatter
                data={predictionData}
                fill="#4ade80"
                fillOpacity={0.7}
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
        <h3 className="text-lg font-semibold mb-4 text-foreground">Estructura del Dataset</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Parámetro</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rango/Valor</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Unidad</th>
              </tr>
            </thead>
            <tbody>
              {[
                { param: "Temperatura", rango: "15 - 75", unidad: "°C" },
                { param: "Humedad", rango: "20 - 80", unidad: "%" },
                { param: "Relación C/N", rango: "15 - 150", unidad: "-" },
                { param: "Aireación", rango: "0.1 - 2.0", unidad: "L/min·kg" },
                { param: "Tiempo", rango: "7 - 120", unidad: "días" },
                { param: "Compost producido", rango: "Variable", unidad: "kg" },
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
      </Card>
    </motion.div>
  )
}
