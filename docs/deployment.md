# Despliegue en Vercel — checklist

## Hallazgo importante ya corregido

Al instalar dependencias localmente apareció `ERR_PNPM_IGNORED_BUILDS`: pnpm (v10+) bloquea por
seguridad los scripts `postinstall` de paquetes nuevos (`onnxruntime-node`, `sharp`, `core-js`) hasta
aprobarlos manualmente con `pnpm approve-builds`. Esa aprobación se guarda solo en la máquina donde se
corre, **no en el repo** — así que un build limpio en Vercel (o cualquier otra máquina) habría fallado
de la misma forma. Ya quedó resuelto declarando la aprobación directamente en `package.json`:

```json
"pnpm": {
  "onlyBuiltDependencies": ["core-js", "onnxruntime-node", "sharp"]
}
```

Con esto, `pnpm install` funciona sin intervención manual en cualquier entorno, incluido Vercel y GitHub
Actions.

## Actualización: esto sí pasó en el primer deploy real

En el primer deploy, "Predecir" falló en producción con "No se pudo calcular la predicción con el
modelo real" (funcionaba perfecto en local). Era justo el escenario anticipado arriba: `onnxruntime-node`
carga su binario nativo con un `require()` dinámico
(`../bin/napi-v3/${process.platform}/${process.arch}/onnxruntime_binding.node`), y `serverExternalPackages`
por sí solo no es suficiente para que el "file tracing" de Vercel (`@vercel/nft`) incluya ese binario en
el paquete de la función serverless -- `@vercel/nft` no puede resolver una ruta que depende de variables
de entorno en tiempo de ejecución.

La corrección final en `next.config.mjs`:

```js
serverExternalPackages: ["onnxruntime-node"],
outputFileTracingIncludes: {
  "/api/predict": [
    "./node_modules/onnxruntime-node/bin/**/*",
    "./models/**/*",
  ],
},
```

`outputFileTracingIncludes` le dice explícitamente a Vercel qué archivos incluir (por ruta) cuando el
tracing automático no los detecta. Se incluyó también `./models/**/*` (los `.onnx` entrenados) por la
misma razón: `onnxruntime-node` los abre con una ruta de archivo en tiempo de ejecución, no con un
`import`/`require` estático que el tracer pueda seguir con certeza.

Tras aplicar esto hace falta un nuevo `git push` para que Vercel vuelva a construir con la config
corregida. Si la predicción sigue fallando después de ese redeploy, el siguiente paso es abrir
Vercel → tu proyecto → pestaña "Logs" (o el deployment específico → "Functions" → `/api/predict`) y
copiar el mensaje de error exacto que imprime `console.error("Error en /api/predict:", error)` en
`app/api/predict/route.ts` -- con eso se puede diagnosticar con precisión en vez de seguir adivinando.

## Pasos para desplegar

1. Confirma que el repo ya está pusheado a GitHub con los cambios de Fase 1-4 (`git push origin main`).
2. Entra a [vercel.com](https://vercel.com), inicia sesión con tu cuenta de GitHub.
3. "Add New" → "Project" → selecciona `Sebastian21sa/simulador-compostaje`.
4. Vercel detecta Next.js automáticamente. No hace falta configurar variables de entorno (el proyecto no
   usa ninguna). Framework Preset: Next.js. Build command: `pnpm build` (por defecto). Deja el resto en
   automático.
5. Click "Deploy". La primera build puede tardar un par de minutos (instala dependencias + compila).

## Checklist después del primer deploy

- [ ] Abre la URL que te da Vercel y prueba la pestaña "Simulador": si la predicción falla (error 500 o
      "failed to fetch"), es casi seguro el problema del binario nativo de `onnxruntime-node` mencionado
      arriba — revisa los "Function Logs" en el dashboard de Vercel para confirmar el mensaje de error
      exacto.
- [ ] Prueba la pestaña "Visión": sube una foto y confirma que el modelo de TensorFlow.js carga y
      predice (se sirve como archivo estático desde `public/models/`, no depende de ninguna función
      serverless, así que si el simulador tabular falla pero visión funciona, confirma que el problema es
      específico de `onnxruntime-node`).
- [ ] Revisa el tamaño de la función serverless en el dashboard de Vercel (Project → Deployments →
      selecciona el deploy → "Functions"). El límite del plan Hobby es 250MB sin comprimir; con un
      Random Forest pequeño no debería acercarse a ese límite.
- [ ] Revisa cuánto tarda la primera petición después de inactividad ("cold start") — aceptable para un
      portafolio, pero vale la pena mencionarlo si preguntan en una entrevista.
- [ ] Confirma que el CI de GitHub Actions (`.github/workflows/ci.yml`, corre lint + build en cada push)
      queda en verde.

## Si `onnxruntime-node` falla en producción a pesar de todo

Alternativa de respaldo (ya documentada en el plan como "opción B"): mover solo el endpoint de
predicción a un microservicio Python aparte en Render (igual que PongIQ), y dejar el resto del sitio en
Vercel. No debería ser necesario con los ajustes de este documento, pero queda como plan B si el
"file tracing" de Vercel sigue sin incluir el binario correctamente.
