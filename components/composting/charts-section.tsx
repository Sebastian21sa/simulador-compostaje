"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, Cell
} from "recharts"
import { Thermometer, Droplets, Clock, BarChart3 } from "lucide-react"
import { modelMetadata } from "@/lib/model-metadata"
import { pdpDayData, pdpTemperatureData, pdpHumidityData } from "@/lib/model-pdp-data"

// Datos para gráficas de referencia (rangos óptimos según la literatura
// citada en la pestaña "Referencias"; ver references-section.tsx). Estas
// curvas describen el consenso científico, no la salida del modelo entrenado
// -- esa comparación (dependencia parcial real) se muestra debajo de cada una.
const temperatureData = Array.from({ length: 61 }, (_, i) => {
  const t = i + 15
  let efficiency: number
  if (t >= 45 && t <= 60) {
    efficiency = 1.0
  } else if (t < 45) {
    efficiency = Math.max(0.4, 0.4 + (t - 15) * 0.02)
  } else {
    efficiency = Math.max(0.3, 1.0 - (t - 60) * 0.025)
  }
  return { temperatura: t, eficiencia: efficiency }
})

const humidityData = Array.from({ length: 61 }, (_, i) => {
  const h = i + 20
  let efficiency: number
  if (h >= 45 && h <= 65) {
    efficiency = 1.0
  } else if (h < 45) {
    efficiency = Math.max(0.5, 0.5 + (h - 20) * 0.0167)
  } else {
    efficiency = Math.max(0.5, 1.0 - (h - 65) * 0.02)
  }
  return { humedad: h, eficiencia: efficiency }
})

const timeData = Array.from({ length: 120 }, (_, i) => {
  const dia = i + 1
  const produccion = 100 * 0.65 * (1 - Math.exp(-dia / 35))
  return { dia, produccion: Number(produccion.toFixed(1)) }
})

// Importancia de variables REAL, tomada de feature_importances_ del
// RandomForestRegressor entrenado sobre el dataset real (ver
// ml/train_tabular.py y lib/model-metadata.ts). Ya no son porcentajes
// inventados.
const importanceColors: Record<string, string> = {
  Day: "#facc15",
  Temperature: "#f97316",
  "MC(%)": "#22d3ee",
  "C/N Ratio": "#4ade80",
}

const importanceLabels: Record<string, string> = {
  Day: "Tiempo de proceso",
  Temperature: "Temperatura",
  "MC(%)": "Humedad",
  "C/N Ratio": "Tipo de residuo (C/N)",
}

const importanceData = Object.entries(modelMetadata.regressor.featureImportances)
  .map(([key, value]) => ({
    variable: importanceLabels[key] ?? key,
    importancia: value,
    fill: importanceColors[key] ?? "#a78bfa",
  }))
  .sort((a, b) => b.importancia - a.importancia)

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  color: "hsl(var(--foreground))",
}

export function ChartsSection() {
  const [activeTab, setActiveTab] = useState("temperatura")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6 bg-secondary/50">
          <TabsTrigger value="temperatura" className="flex items-center gap-2">
            <Thermometer className="h-4 w-4" />
            <span className="hidden sm:inline">Temperatura</span>
          </TabsTrigger>
          <TabsTrigger value="humedad" className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            <span className="hidden sm:inline">Humedad</span>
          </TabsTrigger>
          <TabsTrigger value="tiempo" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Tiempo</span>
          </TabsTrigger>
          <TabsTrigger value="importancia" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Variables</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="temperatura" className="space-y-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Efecto de la Temperatura (referencia teórica)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              La fase termófila (45-60°C) es óptima para la degradación de patógenos y materia orgánica, según la literatura citada en Referencias.
            </p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={temperatureData}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="temperatura"
                    stroke="#94a3b8"
                    tick={{ fill: "#e2e8f0", fontSize: 12 }}
                    label={{ value: "Temperatura (°C)", position: "insideBottom", offset: -5, fill: "#e2e8f0" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: "#e2e8f0", fontSize: 12 }}
                    domain={[0, 1.1]}
                    label={{ value: "Factor de eficiencia", angle: -90, position: "insideLeft", fill: "#e2e8f0" }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <ReferenceLine x={45} stroke="#4ade80" strokeDasharray="5 5" label={{ value: "45°C", fill: "#4ade80" }} />
                  <ReferenceLine x={60} stroke="#4ade80" strokeDasharray="5 5" label={{ value: "60°C", fill: "#4ade80" }} />
                  <Area
                    type="monotone"
                    dataKey="eficiencia"
                    stroke="#f97316"
                    strokeWidth={3}
                    fill="url(#tempGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Lo que aprendió el modelo real (dependencia parcial)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Esta curva sale de <code>sklearn.inspection.partial_dependence</code> aplicado al <code>RandomForestRegressor</code> entrenado con las {modelMetadata.dataset.nSamples} muestras reales -- no es una fórmula escrita a mano. Aquí el modelo muestra un efecto débil y prácticamente plano de la temperatura sobre el Score (de ~53 a ~49 en todo el rango medido), consistente con que Temperatura es la variable de <strong>menor</strong> importancia del modelo (4.6%, ver pestaña "Variables"). No reproduce la campana 45-60°C de la literatura: lo más probable es que, en estos datos reales de sensores, la temperatura esté correlacionada con el día del proceso y la humedad, que absorben buena parte de su efecto aparente -- la dependencia parcial asume independencia entre variables, algo que casi nunca se cumple con datos reales.
            </p>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pdpTemperatureData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="temperatura"
                    stroke="#94a3b8"
                    tick={{ fill: "#e2e8f0", fontSize: 12 }}
                    label={{ value: "Temperatura (°C)", position: "insideBottom", offset: -5, fill: "#e2e8f0" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: "#e2e8f0", fontSize: 12 }}
                    domain={[0, 100]}
                    label={{ value: "Score predicho", angle: -90, position: "insideLeft", fill: "#e2e8f0" }}
                  />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [value.toFixed(1), "Score"]} />
                  <ReferenceLine x={45} stroke="#4ade80" strokeDasharray="5 5" />
                  <ReferenceLine x={60} stroke="#4ade80" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="score" stroke="#f97316" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="humedad" className="space-y-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Efecto de la Humedad (referencia teórica)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              La humedad óptima (45-65%) permite la actividad microbiana sin saturar el material, según la literatura citada en Referencias.
            </p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={humidityData}>
                  <defs>
                    <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="humedad"
                    stroke="#94a3b8"
                    tick={{ fill: "#e2e8f0", fontSize: 12 }}
                    label={{ value: "Humedad (%)", position: "insideBottom", offset: -5, fill: "#e2e8f0" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: "#e2e8f0", fontSize: 12 }}
                    domain={[0, 1.1]}
                    label={{ value: "Factor de eficiencia", angle: -90, position: "insideLeft", fill: "#e2e8f0" }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <ReferenceLine x={45} stroke="#4ade80" strokeDasharray="5 5" label={{ value: "45%", fill: "#4ade80" }} />
                  <ReferenceLine x={65} stroke="#4ade80" strokeDasharray="5 5" label={{ value: "65%", fill: "#4ade80" }} />
                  <Area
                    type="monotone"
                    dataKey="eficiencia"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    fill="url(#humGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Lo que aprendió el modelo real (dependencia parcial)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Aquí sí hay una señal fuerte y real: Humedad (MC%) es la variable de <strong>mayor</strong> importancia del modelo (37.9%). Pero su forma no es la campana simétrica de la literatura, sino más bien un escalón: el Score se mantiene alto y estable hasta ~42% de humedad, cae de forma pronunciada entre 42% y 50%, y luego se mantiene bajo el resto del rango. En estas 452 muestras reales no aparece penalización por humedad baja (la literatura sí la predice), y la zona "óptima" de la literatura (45-65%) coincide justo con donde el modelo ya muestra el score más bajo -- otra evidencia de que estos datos observacionales reflejan correlaciones específicas del experimento, no necesariamente la relación causal general que describe la literatura.
            </p>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pdpHumidityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="humedad"
                    stroke="#94a3b8"
                    tick={{ fill: "#e2e8f0", fontSize: 12 }}
                    label={{ value: "Humedad (%)", position: "insideBottom", offset: -5, fill: "#e2e8f0" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: "#e2e8f0", fontSize: 12 }}
                    domain={[0, 100]}
                    label={{ value: "Score predicho", angle: -90, position: "insideLeft", fill: "#e2e8f0" }}
                  />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [value.toFixed(1), "Score"]} />
                  <ReferenceLine x={45} stroke="#4ade80" strokeDasharray="5 5" />
                  <ReferenceLine x={65} stroke="#4ade80" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tiempo" className="space-y-6">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Maduración del Compost (referencia teórica)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              La producción de compost sigue una curva exponencial que se estabiliza aproximadamente a los 60 días.
            </p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="dia"
                    stroke="#94a3b8"
                    tick={{ fill: "#e2e8f0", fontSize: 12 }}
                    label={{ value: "Dias de proceso", position: "insideBottom", offset: -5, fill: "#e2e8f0" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: "#e2e8f0", fontSize: 12 }}
                    label={{ value: "Compost acumulado (kg)", angle: -90, position: "insideLeft", fill: "#e2e8f0" }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <ReferenceLine x={30} stroke="#facc15" strokeDasharray="5 5" label={{ value: "Min. 30 dias", fill: "#facc15" }} />
                  <Line
                    type="monotone"
                    dataKey="produccion"
                    stroke="#4ade80"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Lo que aprendió el modelo real (dependencia parcial)</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Este es el caso donde el modelo real y la referencia teórica concuerdan mejor en forma: el Score sube rápido al inicio del proceso y se estabiliza en una meseta, el mismo patrón de saturación que la curva de referencia. La diferencia es la velocidad: en estos datos reales el modelo ya alcanza casi su valor máximo hacia el día ~20-25 (vs. los ~60 días de la curva de referencia), y Day resulta ser, junto con la humedad, una de las dos variables más importantes del modelo (36.0%).
            </p>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pdpDayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="dia"
                    stroke="#94a3b8"
                    tick={{ fill: "#e2e8f0", fontSize: 12 }}
                    label={{ value: "Dias de proceso", position: "insideBottom", offset: -5, fill: "#e2e8f0" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: "#e2e8f0", fontSize: 12 }}
                    domain={[0, 100]}
                    label={{ value: "Score predicho", angle: -90, position: "insideLeft", fill: "#e2e8f0" }}
                  />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [value.toFixed(1), "Score"]} />
                  <ReferenceLine x={30} stroke="#facc15" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="score" stroke="#4ade80" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="importancia">
          <Card className="p-6 bg-card border-border">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Importancia de Variables</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Contribución relativa real de cada variable (<code>feature_importances_</code>) en las predicciones del <code>RandomForestRegressor</code> entrenado con {modelMetadata.dataset.nSamples} muestras reales de {modelMetadata.dataset.source}.
            </p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={importanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    tick={{ fill: "#e2e8f0", fontSize: 12 }}
                    domain={[0, 0.4]}
                  />
                  <YAxis
                    type="category"
                    dataKey="variable"
                    stroke="#94a3b8"
                    tick={{ fill: "#e2e8f0", fontSize: 12 }}
                    width={140}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, "Importancia"]}
                  />
                  <Legend />
                  <Bar
                    dataKey="importancia"
                    radius={[0, 8, 8, 0]}
                  >
                    {importanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
