"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Leaf, Thermometer, Droplets, Wind, Clock, Scale, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

interface SimulatorFormProps {
  tipoResiduo: string
  setTipoResiduo: (value: string) => void
  cantidad: number
  setCantidad: (value: number) => void
  temperatura: number
  setTemperatura: (value: number) => void
  humedad: number
  setHumedad: (value: number) => void
  aireacion: number
  setAireacion: (value: number) => void
  tiempoProceso: number
  setTiempoProceso: (value: number) => void
  onPredict: () => void
  isLoading: boolean
}

const residuoOptions = [
  { value: "comida", label: "Restos de comida", icon: "🍎" },
  { value: "poda", label: "Restos de poda", icon: "🌿" },
  { value: "papel", label: "Papel y cartón", icon: "📦" },
  { value: "cafe", label: "Residuos de café", icon: "☕" },
  { value: "huevo", label: "Cáscaras de huevo", icon: "🥚" },
  { value: "mezcla", label: "Mezcla variada", icon: "🍂" },
]

export function SimulatorForm({
  tipoResiduo,
  setTipoResiduo,
  cantidad,
  setCantidad,
  temperatura,
  setTemperatura,
  humedad,
  setHumedad,
  aireacion,
  setAireacion,
  tiempoProceso,
  setTiempoProceso,
  onPredict,
  isLoading,
}: SimulatorFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Tipo de residuo */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Leaf className="h-4 w-4 text-primary" />
          Tipo de residuo orgánico
        </Label>
        <Select value={tipoResiduo} onValueChange={setTipoResiduo}>
          <SelectTrigger className="bg-secondary/50 border-border hover:bg-secondary/80 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {residuoOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span className="flex items-center gap-2">
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cantidad */}
      <div className="space-y-3">
        <Label className="flex items-center justify-between text-sm font-medium text-foreground">
          <span className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            Cantidad de residuo
          </span>
          <span className="text-primary font-mono">{cantidad} kg</span>
        </Label>
        <Slider
          value={[cantidad]}
          onValueChange={([v]) => setCantidad(v)}
          min={10}
          max={500}
          step={10}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>10 kg</span>
          <span>500 kg</span>
        </div>
      </div>

      {/* Temperatura */}
      <div className="space-y-3">
        <Label className="flex items-center justify-between text-sm font-medium text-foreground">
          <span className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-chart-4" />
            Temperatura del proceso
          </span>
          <span className="text-chart-4 font-mono">{temperatura}°C</span>
        </Label>
        <Slider
          value={[temperatura]}
          onValueChange={([v]) => setTemperatura(v)}
          min={15}
          max={75}
          step={1}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>15°C</span>
          <span className="text-primary">Óptimo: 45-60°C</span>
          <span>75°C</span>
        </div>
      </div>

      {/* Humedad */}
      <div className="space-y-3">
        <Label className="flex items-center justify-between text-sm font-medium text-foreground">
          <span className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-chart-2" />
            Humedad del proceso
          </span>
          <span className="text-chart-2 font-mono">{humedad}%</span>
        </Label>
        <Slider
          value={[humedad]}
          onValueChange={([v]) => setHumedad(v)}
          min={20}
          max={80}
          step={1}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>20%</span>
          <span className="text-primary">Óptimo: 45-65%</span>
          <span>80%</span>
        </div>
      </div>

      {/* Aireación */}
      <div className="space-y-3">
        <Label className="flex items-center justify-between text-sm font-medium text-foreground">
          <span className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-chart-5" />
            Aireación
          </span>
          <span className="text-chart-5 font-mono">{aireacion.toFixed(1)} L/min·kg</span>
        </Label>
        <Slider
          value={[aireacion * 10]}
          onValueChange={([v]) => setAireacion(v / 10)}
          min={1}
          max={20}
          step={1}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0.1</span>
          <span className="text-primary">Óptimo: ≥0.8</span>
          <span>2.0</span>
        </div>
      </div>

      {/* Tiempo de proceso */}
      <div className="space-y-3">
        <Label className="flex items-center justify-between text-sm font-medium text-foreground">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" />
            Tiempo de proceso
          </span>
          <span className="text-accent font-mono">{tiempoProceso} días</span>
        </Label>
        <Slider
          value={[tiempoProceso]}
          onValueChange={([v]) => setTiempoProceso(v)}
          min={7}
          max={120}
          step={1}
          className="py-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>7 días</span>
          <span className="text-primary">Mín. recomendado: 30 días</span>
          <span>120 días</span>
        </div>
      </div>

      {/* Botón Predecir */}
      <Button
        onClick={onPredict}
        disabled={isLoading}
        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-5 w-5" />
          </motion.div>
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            Predecir Compost
          </>
        )}
      </Button>
    </motion.div>
  )
}
