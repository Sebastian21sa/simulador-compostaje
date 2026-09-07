"use client"

import { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { SimulatorForm } from "@/components/composting/simulator-form"
import { ResultsDisplay } from "@/components/composting/results-display"
import { ChartsSection } from "@/components/composting/charts-section"
import { ModelTraining } from "@/components/composting/model-training"
import { ReferencesSection } from "@/components/composting/references-section"
import { motion } from "framer-motion"
import { Leaf, FlaskConical, BarChart3, BookOpen, Sparkles } from "lucide-react"

interface PredictResponse {
  produccion: number
  eficiencia: number
  calidad: string
  colorCalidad: string
  porcentaje: number
  scoreModelo: number
}

export default function CompostingSimulator() {
  const [activeTab, setActiveTab] = useState("simulador")
  const [tipoResiduo, setTipoResiduo] = useState("mezcla")
  const [cantidad, setCantidad] = useState(100)
  const [temperatura, setTemperatura] = useState(52)
  const [humedad, setHumedad] = useState(55)
  const [aireacion, setAireacion] = useState(0.8)
  const [tiempoProceso, setTiempoProceso] = useState(45)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<{
    produccion: number
    eficiencia: number
    calidad: string
    colorCalidad: string
    porcentaje: number
  } | null>(null)

  const handlePredict = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipoResiduo,
          cantidad,
          temperatura,
          humedad,
          aireacion,
          tiempoProceso,
        }),
      })

      if (!response.ok) {
        throw new Error("La API de prediccion respondio con un error")
      }

      const data: PredictResponse = await response.json()

      setResults({
        produccion: data.produccion,
        eficiencia: data.eficiencia,
        calidad: data.calidad,
        colorCalidad: data.colorCalidad,
        porcentaje: data.porcentaje,
      })
    } catch (err) {
      console.error("Error al predecir con el modelo real:", err)
      setError(
        "No se pudo calcular la prediccion con el modelo real. Intenta de nuevo en unos segundos."
      )
    } finally {
      setIsLoading(false)
    }
  }, [tipoResiduo, cantidad, temperatura, humedad, aireacion, tiempoProceso])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Simulador de Compostaje con ML</h1>
                <p className="text-xs text-muted-foreground">Prediccion impulsada por Machine Learning</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Random Forest Model</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-6 bg-card border-border">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 hidden sm:flex">
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-2">¿Qué es este simulador?</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Este simulador utiliza un modelo de <span className="text-primary font-medium">Machine Learning (Random Forest)</span> entrenado con un dataset real de sensores de compostaje para predecir la cantidad y calidad del compost que se puede obtener a partir de residuos orgánicos. Está basado en parámetros como el tipo de residuo, temperatura, humedad, aireación y tiempo de proceso, validado contra <span className="text-primary font-medium">investigaciones científicas revisadas por pares</span>.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 h-auto p-1 bg-secondary/50">
            <TabsTrigger value="simulador" className="flex items-center gap-2 py-3">
              <Leaf className="h-4 w-4" />
              <span className="hidden sm:inline">Simulador</span>
            </TabsTrigger>
            <TabsTrigger value="modelo" className="flex items-center gap-2 py-3">
              <FlaskConical className="h-4 w-4" />
              <span className="hidden sm:inline">Modelo</span>
            </TabsTrigger>
            <TabsTrigger value="graficas" className="flex items-center gap-2 py-3">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Gráficas</span>
            </TabsTrigger>
            <TabsTrigger value="referencias" className="flex items-center gap-2 py-3">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Referencias</span>
            </TabsTrigger>
          </TabsList>

          {/* Simulador Tab */}
          <TabsContent value="simulador" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Panel */}
              <div className="lg:col-span-5">
                <Card className="p-6 bg-card border-border sticky top-24">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Leaf className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Parámetros de entrada</h3>
                      <p className="text-xs text-muted-foreground">Ajusta los valores y presiona Predecir</p>
                    </div>
                  </div>
                  <SimulatorForm
                    tipoResiduo={tipoResiduo}
                    setTipoResiduo={setTipoResiduo}
                    cantidad={cantidad}
                    setCantidad={setCantidad}
                    temperatura={temperatura}
                    setTemperatura={setTemperatura}
                    humedad={humedad}
                    setHumedad={setHumedad}
                    aireacion={aireacion}
                    setAireacion={setAireacion}
                    tiempoProceso={tiempoProceso}
                    setTiempoProceso={setTiempoProceso}
                    onPredict={handlePredict}
                    isLoading={isLoading}
                  />
                  {error && (
                    <p className="mt-4 text-sm text-destructive" role="alert">
                      {error}
                    </p>
                  )}
                </Card>
              </div>

              {/* Results Panel */}
              <div className="lg:col-span-7">
                <Card className="p-6 bg-card border-border min-h-[500px]">
                  <ResultsDisplay results={results} />
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Modelo Tab */}
          <TabsContent value="modelo" className="mt-6">
            <ModelTraining />
          </TabsContent>

          {/* Gráficas Tab */}
          <TabsContent value="graficas" className="mt-6">
            <ChartsSection />
          </TabsContent>

          {/* Referencias Tab */}
          <TabsContent value="referencias" className="mt-6">
            <ReferencesSection />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Simulador de Compostaje con ML</span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Elaborado por Melanie Fonseca Infante y Joan Sebastian Sanchez UDEC
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
