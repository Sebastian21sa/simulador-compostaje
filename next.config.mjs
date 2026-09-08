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
  // dinamica por si solo. La funcion serverless de Vercel corre en
  // Linux x64, asi que solo se incluye ese binario -- incluir "bin/**/*"
  // completo trae los binarios de las 6 plataformas que el paquete soporta
  // (Windows/Mac/Linux x64/arm64) y hace que la funcion pese >400MB,
  // superando el limite de 250MB de Vercel.
  serverExternalPackages: ["onnxruntime-node"],
  outputFileTracingIncludes: {
    "/api/predict": [
      "./node_modules/onnxruntime-node/bin/napi-v3/linux/x64/**/*",
      "./models/**/*",
    ],
  },
}

export default nextConfig
