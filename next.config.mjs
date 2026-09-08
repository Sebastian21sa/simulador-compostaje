/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // onnxruntime-node carga un binario nativo (.node) por plataforma con un
  // require() dinamico (`../bin/napi-v3/${process.platform}/${process.arch}/...`).
  // serverExternalPackages evita que webpack intente empaquetarlo, pero el
  // "file tracing" de Vercel (@vercel/nft) tampoco puede resolver esa ruta
  // dinamica por si solo, asi que hay que decirle explicitamente que incluya
  // el binario nativo -- y de paso los propios modelos .onnx -- en la
  // funcion serverless de /api/predict. Sin esto, la API de prediccion
  // falla en produccion (500) aunque funcione perfecto en local.
  serverExternalPackages: ["onnxruntime-node"],
  outputFileTracingIncludes: {
    "/api/predict": [
      "./node_modules/onnxruntime-node/bin/**/*",
      "./models/**/*",
    ],
  },
}

export default nextConfig
