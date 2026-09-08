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
  // Sin esto, el "file tracing" de Vercel puede no incluir ese binario en el
  // paquete de la funcion serverless y la API de prediccion fallaria en
  // produccion aunque funcione en local. Ver app/api/predict/route.ts.
  serverExternalPackages: ["onnxruntime-node"],
}

export default nextConfig
