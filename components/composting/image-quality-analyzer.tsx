"use client"

import { useCallback, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, ImageIcon, Loader2, CheckCircle2, XCircle, Info } from "lucide-react"
import { visionMetadata, visionClassExamples } from "@/lib/vision-metadata"

const MODEL_URL = "/models/tfjs_contaminant_detector/model.json"

type Prediction = {
  label: "compostable" | "contaminante"
  confidence: number
}

export function ImageQualityAnalyzer() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [prediction, setPrediction] = useState<Prediction | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  // Se cachea el módulo tfjs y el modelo cargado entre predicciones para no
  // recargar los ~1MB de pesos en cada imagen.
  const tfRef = useRef<typeof import("@tensorflow/tfjs") | null>(null)
  const modelRef = useRef<import("@tensorflow/tfjs").GraphModel | null>(null)

  const ensureModel = useCallback(async () => {
    if (modelRef.current) return modelRef.current
    setIsModelLoading(true)
    try {
      const tf = tfRef.current ?? (await import("@tensorflow/tfjs"))
      tfRef.current = tf
      const model = await tf.loadGraphModel(MODEL_URL)
      modelRef.current = model
      return model
    } finally {
      setIsModelLoading(false)
    }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setPrediction(null)
    const reader = new FileReader()
    reader.onload = () => setPreviewUrl(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleAnalyze = useCallback(async () => {
    if (!imgRef.current) return
    setError(null)
    setIsLoading(true)
    try {
      const tf = tfRef.current ?? (await import("@tensorflow/tfjs"))
      tfRef.current = tf
      const model = await ensureModel()

      const result = tf.tidy(() => {
        const pixels = tf.browser.fromPixels(imgRef.current as HTMLImageElement)
        const resized = tf.image.resizeBilinear(pixels, [160, 160])
        // El modelo incluye su propia capa Rescaling(1/255), así que la
        // entrada debe llegar en el mismo rango 0-255 que usó el entrenamiento.
        const input = resized.toFloat().expandDims(0)
        const output = model.execute(input) as import("@tensorflow/tfjs").Tensor
        return output.dataSync()[0]
      })

      const label: Prediction["label"] = result >= 0.5 ? "contaminante" : "compostable"
      const confidence = label === "contaminante" ? result : 1 - result
      setPrediction({ label, confidence })
    } catch (err) {
      console.error(err)
      setError("No se pudo analizar la imagen. Intenta con otra foto.")
    } finally {
      setIsLoading(false)
    }
  }, [ensureModel])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card className="p-6 bg-card border-border">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Detector de contaminantes (visión)</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Sube una foto de un objeto o residuo y una CNN entrenada con imágenes reales estima si es compostable o
              un contaminante para tu compost. La inferencia corre en tu navegador (TensorFlow.js), no se envía
              ninguna imagen a un servidor.
            </p>
          </div>
          <button
            onClick={() => setShowInfo((v) => !v)}
            className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Más información sobre el modelo"
          >
            <Info className="h-5 w-5" />
          </button>
        </div>

        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mb-4 p-4 rounded-lg bg-secondary/40 border border-border text-sm text-muted-foreground space-y-2">
                <p>{visionMetadata.architecture}</p>
                <p>{visionMetadata.limitation}</p>
                <p>
                  Dataset:{" "}
                  <a
                    href={visionMetadata.dataset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    {visionMetadata.dataset.source}
                  </a>{" "}
                  ({visionMetadata.dataset.license}). {visionMetadata.dataset.note}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <p className="font-medium text-foreground mb-1">Ejemplos compostables</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {visionClassExamples.compostable.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">Ejemplos contaminantes</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {visionClassExamples.contaminante.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload / preview */}
          <div className="flex flex-col gap-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative flex flex-col items-center justify-center gap-3 h-64 rounded-lg border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-secondary/20 overflow-hidden"
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  ref={imgRef}
                  src={previewUrl}
                  alt="Imagen a analizar"
                  crossOrigin="anonymous"
                  className="absolute inset-0 w-full h-full object-contain bg-black/20"
                />
              ) : (
                <>
                  <div className="p-3 rounded-full bg-secondary">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Haz clic para subir una foto</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              onClick={handleAnalyze}
              disabled={!previewUrl || isLoading || isModelLoading}
              className="w-full"
            >
              {isModelLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Cargando modelo...
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analizando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" /> Analizar imagen
                </>
              )}
            </Button>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          {/* Result */}
          <div className="flex items-center justify-center">
            <AnimatePresence mode="wait">
              {prediction ? (
                <motion.div
                  key={prediction.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full text-center"
                >
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
                      prediction.label === "compostable"
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {prediction.label === "compostable" ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                    <span className="font-semibold capitalize">{prediction.label}</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1">
                    {(prediction.confidence * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">confianza del modelo</p>
                </motion.div>
              ) : (
                <p className="text-sm text-muted-foreground text-center px-6">
                  Sube una imagen y presiona "Analizar imagen" para ver el resultado aquí.
                </p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Desempeño real del modelo (test set, {visionMetadata.nTest} imágenes)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {[
            { label: "Accuracy", value: `${(visionMetadata.testAccuracy * 100).toFixed(1)}%` },
            { label: "F1 compostable", value: visionMetadata.classificationReport.compostable.f1.toFixed(2) },
            { label: "F1 contaminante", value: visionMetadata.classificationReport.contaminante.f1.toFixed(2) },
            { label: "F1 macro", value: visionMetadata.classificationReport.macroF1.toFixed(2) },
          ].map((m) => (
            <div key={m.label} className="text-center p-3 rounded-lg bg-secondary/30">
              <p className="text-xl font-bold text-foreground">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Matriz de confusión</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Predicho: compostable</th>
                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Predicho: contaminante</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-2 px-3 text-foreground">Real: compostable</td>
                <td className="py-2 px-3 font-mono text-primary">{visionMetadata.confusionMatrix[0][0]}</td>
                <td className="py-2 px-3 font-mono text-muted-foreground">{visionMetadata.confusionMatrix[0][1]}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 text-foreground">Real: contaminante</td>
                <td className="py-2 px-3 font-mono text-muted-foreground">{visionMetadata.confusionMatrix[1][0]}</td>
                <td className="py-2 px-3 font-mono text-primary">{visionMetadata.confusionMatrix[1][1]}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  )
}
