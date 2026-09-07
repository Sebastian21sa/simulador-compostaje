"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Leaf, Gauge, Award, TrendingUp } from "lucide-react"

interface ResultsDisplayProps {
  results: {
    produccion: number
    eficiencia: number
    calidad: string
    colorCalidad: string
    porcentaje: number
  } | null
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  if (!results) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8"
      >
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Leaf className="h-12 w-12 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Configura los parámetros
        </h3>
        <p className="text-muted-foreground max-w-sm">
          Ajusta los valores en el panel izquierdo y presiona &quot;Predecir Compost&quot; para ver los resultados de la simulación.
        </p>
      </motion.div>
    )
  }

  const getQualityIcon = (calidad: string) => {
    if (calidad.includes("Excelente")) return "🌟"
    if (calidad.includes("Buena")) return "✅"
    if (calidad.includes("Aceptable")) return "⚠️"
    return "❌"
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="results"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-4"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Resultados de la simulación</span>
          </motion.div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Producción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Leaf className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Compost producido</p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-bold text-foreground"
              >
                {results.produccion.toFixed(1)}
                <span className="text-lg font-normal text-muted-foreground ml-1">kg</span>
              </motion.p>
              <p className="text-xs text-primary mt-2">
                {results.porcentaje.toFixed(0)}% del residuo original
              </p>
            </Card>
          </motion.div>

          {/* Eficiencia */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 bg-card border-border hover:border-chart-2/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-chart-2/10">
                  <Gauge className="h-6 w-6 text-chart-2" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Eficiencia del proceso</p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-3xl font-bold text-foreground"
              >
                {(results.eficiencia * 100).toFixed(1)}
                <span className="text-lg font-normal text-muted-foreground ml-1">%</span>
              </motion.p>
              <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${results.eficiencia * 100}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="h-full bg-chart-2 rounded-full"
                />
              </div>
            </Card>
          </motion.div>

          {/* Calidad */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 bg-card border-border hover:border-accent/50 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-accent/10">
                  <Award className="h-6 w-6 text-accent" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">Calidad estimada</p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-2"
              >
                <span className="text-3xl">{getQualityIcon(results.calidad)}</span>
                <span
                  className="text-xl font-bold"
                  style={{ color: results.colorCalidad }}
                >
                  {results.calidad.replace(/[🌟✅⚠️❌]/g, "").trim()}
                </span>
              </motion.div>
            </Card>
          </motion.div>
        </div>

        {/* Info adicional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="p-4 rounded-xl bg-primary/5 border border-primary/20"
        >
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-medium">Nota:</span> Los resultados están basados en el modelo Random Forest entrenado con datos de investigaciones científicas. Los valores reales pueden variar según las condiciones específicas del compostaje.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
