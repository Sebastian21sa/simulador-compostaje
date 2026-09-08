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

También se agregó en `next.config.mjs`:

```js
serverExternalPackages: ["onnxruntime-node"]
```

`onnxruntime-node` carga su binario nativo con un `require()` dinámico
(`../bin/napi-v3/${process.platform}/${process.arch}/onnxruntime_binding.node`). Sin esta opción, el
"file tracing" que usa Vercel para empaquetar la función serverless puede no incluir ese binario, y la
API de predicción (`app/api/predict/route.ts`) fallaría en producción aunque funcione perfecto en local.
Esto es exactamente el tipo de error que solo aparece al desplegar, así que vale la pena confirmarlo
después del primer deploy (ver checklist abajo).

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
