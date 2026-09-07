"use client"

import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { BookOpen, ExternalLink, FileText, Beaker } from "lucide-react"

const references = [
  {
    id: 1,
    authors: "Kahraman, M. et al.",
    year: 2026,
    title: "Bioprocess modeling and optimization in composting of hazelnut processing wastes and municipal solid waste: Type 1 fuzzy regression, neural network based approaches and genetic algorithm",
    journal: "Journal of Environmental Management",
    volume: "397",
    pages: "128254",
    contribution: "Rangos óptimos de temperatura y humedad para la fase termófila",
    doi: "10.1016/j.jenvman.2025.128254"
  },
  {
    id: 2,
    authors: "Peng, H. et al.",
    year: 2025,
    title: "Integrated machine learning model for prediction of nutrients contents and maturity in rural organic solid wastes aerobic composting",
    journal: "Journal of Environmental Chemical Engineering",
    volume: "13(4)",
    pages: "118138",
    contribution: "Importancia de características y predicción de madurez del compost",
    doi: "10.1016/j.jece.2025.118138"
  },
  {
    id: 3,
    authors: "Liu, B. et al.",
    year: 2026,
    title: "Towards data-driven smart composting techniques and control systems",
    journal: "Bioresource Technology",
    volume: "440",
    pages: "131514",
    contribution: "Monitoreo de temperatura y humedad en tiempo real",
    doi: "10.1016/j.biortech.2025.133514"
  },
  {
    id: 4,
    authors: "Aydın Temel, F. et al.",
    year: 2023,
    title: "Artificial intelligence and machine learning approaches in composting process: A review",
    volume: "370",
    pages: "128539",
    contribution: "Revisión sistemática de ML aplicado a compostaje",
    doi: "10.1016/j.biortech.2022.128539"
  },
]

const optimalRanges = [
  { param: "Temperatura", range: "45-60°C", description: "Fase termófila óptima para degradación" },
  { param: "Humedad", range: "45-65%", description: "Actividad microbiana sin saturación" },
  { param: "Relación C/N", range: "25-30", description: "Balance óptimo carbono/nitrógeno" },
  { param: "Tiempo mínimo", range: "30 días", description: "Maduración inicial del compost" },
]

export function ReferencesSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Rangos óptimos */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-primary/10">
            <Beaker className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Rangos Óptimos según la Literatura</h3>
            <p className="text-sm text-muted-foreground">Parámetros validados por investigaciones revisadas por pares</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {optimalRanges.map((item, index) => (
            <motion.div
              key={item.param}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/30 transition-colors"
            >
              <p className="text-sm text-muted-foreground mb-1">{item.param}</p>
              <p className="text-xl font-bold text-primary mb-2">{item.range}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Referencias científicas */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-chart-2/10">
            <BookOpen className="h-6 w-6 text-chart-2" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Referencias Científicas</h3>
            <p className="text-sm text-muted-foreground">Fuentes utilizadas para el desarrollo del modelo</p>
          </div>
        </div>

        <div className="space-y-4">
          {references.map((ref, index) => (
            <motion.div
              key={ref.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-5 bg-card border-border hover:border-chart-2/30 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center text-chart-2 font-bold">
                    {ref.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">
                          {ref.authors} ({ref.year})
                        </p>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {ref.title}
                        </p>
                        <p className="text-xs text-primary">
                          <span className="italic">{ref.journal}</span>, {ref.volume}, {ref.pages}
                        </p>
                      </div>
                      <a
                        href={`https://doi.org/${ref.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-2 rounded-lg bg-secondary hover:bg-primary/10 transition-colors group-hover:text-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-accent" />
                        <span className="text-xs text-muted-foreground">
                          <span className="text-accent font-medium">Aporte:</span> {ref.contribution}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Nota final */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Nota sobre las fuentes</p>
            <p className="text-sm text-muted-foreground">
              Todos los rangos óptimos y parámetros utilizados en este simulador están extraídos directamente de estudios revisados por pares publicados en revistas científicas de alto impacto. Los modelos de Machine Learning se basan en datasets experimentales recopilados de estas investigaciones.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
