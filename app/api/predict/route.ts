import { NextResponse } from "next/server"
import * as ort from "onnxruntime-node"
import path from "path"
import { factoresResiduo } from "@/lib/compost-constants"
import { modelMetadata, calidadColor, calidadEmoji } from "@/lib/model-metadata"

// onnxruntime-node necesita el runtime de Node.js (no funciona en Edge).
export const runtime = "nodejs"

// Las sesiones ONNX se crean una sola vez por instancia del servidor y se
// reutilizan entre requests, para no releer los archivos .onnx en cada
// prediccion.
let regressorSession: ort.InferenceSession | null = null
let classifierSession: ort.InferenceSession | null = null

async function getSessions() {
  if (!regressorSession) {
    regressorSession = await ort.InferenceSession.create(
      path.join(process.cwd(), "models", "compost_regressor.onnx")
    )
  }
  if (!classifierSession) {
    classifierSession = await ort.InferenceSession.create(
      path.join(process.cwd(), "models", "compost_classifier.onnx")
    )
  }
  return { regressorSession, classifierSession }
}

interface PredictRequestBody {
  tipoResiduo: string
  cantidad: number
  temperatura: number
  humedad: number
  aireacion: number
  tiempoProceso: number
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PredictRequestBody
    const { tipoResiduo, cantidad, temperatura, humedad, aireacion, tiempoProceso } = body

    const residuo = factoresResiduo[tipoResiduo] ?? factoresResiduo.mezcla

    const { regressorSession: reg, classifierSession: cls } = await getSessions()

    // Orden de features identico al usado en el entrenamiento:
    // Day, Temperature, MC(%), C/N Ratio (ver ml/train_tabular.py)
    const featureVector = Float32Array.from([
      tiempoProceso,
      temperatura,
      humedad,
      residuo.cnRatio,
    ])
    const tensor = new ort.Tensor("float32", featureVector, [1, 4])

    const regOutput = await reg.run({ input: tensor })
    const clsOutput = await cls.run({ input: tensor })

    const regKey = Object.keys(regOutput)[0]
    const scoreRaw = Number(regOutput[regKey].data[0])
    const score = Math.min(100, Math.max(0, scoreRaw))

    const clsKey = Object.keys(clsOutput)[0]
    const classIndex = Number(clsOutput[clsKey].data[0])
    const calidadLabel = modelMetadata.classOrder[classIndex] ?? "Aceptable"

    // La aireacion no esta en el dataset real de entrenamiento (ver
    // ml/train_tabular.py); se aplica aqui como ajuste heuristico
    // documentado sobre la salida del modelo, en vez de fingir que el
    // modelo aprendio un efecto que nunca vio en los datos.
    const aireacionFactor = aireacion >= 0.8 ? 1.0 : 0.7 + aireacion * 0.375

    const eficienciaModelo = score / 100
    const eficienciaTotal = Math.min(0.98, Math.max(0.05, eficienciaModelo * aireacionFactor))

    const produccionCompost = cantidad * 0.65 * eficienciaTotal

    return NextResponse.json({
      produccion: produccionCompost,
      eficiencia: eficienciaTotal,
      calidad: `${calidadEmoji[calidadLabel]} ${calidadLabel}`,
      colorCalidad: calidadColor[calidadLabel],
      porcentaje: (produccionCompost / cantidad) * 100,
      scoreModelo: score,
    })
  } catch (error) {
    console.error("Error en /api/predict:", error)
    return NextResponse.json(
      { error: "No se pudo calcular la prediccion con el modelo real." },
      { status: 500 }
    )
  }
}
