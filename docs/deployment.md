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

## Segunda vuelta: el build mismo empezó a fallar

Después de aprobar `pnpm.onlyBuiltDependencies`, el *build* completo en Vercel empezó a fallar (antes sí
terminaba, solo la API fallaba en runtime). El log de build mostró que Next.js compila y genera las
páginas sin problema; el corte ocurre en el paso final de Vercel ("Running onBuildComplete").

Causa: al aprobar `onnxruntime-node` en `onlyBuiltDependencies`, Vercel ahora sí ejecuta su script de
`postinstall`. Ese script, en cualquier máquina Linux x64 sin GPU (como las de Vercel), intenta descargar
automáticamente binarios de CUDA (~1GB) desde GitHub -- algo pensado para quien necesita aceleración por
GPU, completamente innecesario aquí (el modelo es un Random Forest chico que corre en CPU). Esa descarga
de casi 1GB muy probablemente esté rompiendo el paso de empaquetado de la función serverless (por tamaño
o por tiempo).

Corrección: `vercel.json` en la raíz del repo, forzando la variable de entorno que el propio script de
`onnxruntime-node` reconoce para saltarse esa descarga:

```json
{
  "installCommand": "ONNXRUNTIME_NODE_INSTALL_CUDA=skip pnpm install"
}
```

Con esto, `pnpm install` se corre exactamente igual pero con `ONNXRUNTIME_NODE_INSTALL_CUDA=skip` fijo,
así que el script de instalación de `onnxruntime-node` se salta la descarga de CUDA sin afectar los
binarios de CPU que sí vienen incluidos en el paquete (esos son los que se usan en producción).

## Tercera vuelta: el error real (usando `vercel --prod` para ver el log completo)

El dashboard web de Vercel cortaba el log justo antes del error real. Usando la CLI (`vercel --prod`,
que muestra el log completo sin paginar) apareció el mensaje exacto:

```
Error: The Vercel Function "api/predict" is 422.24mb uncompressed which exceeds the maximum
uncompressed size limit of 250mb.
```

Causa real (no era CUDA): el patrón `./node_modules/onnxruntime-node/bin/**/*` en
`outputFileTracingIncludes` incluye los binarios nativos de **las 6 plataformas** que trae el paquete
(Windows, macOS Intel/ARM, Linux x64/ARM) -- cada uno con su copia de la librería de ONNX Runtime, que
pesa varias decenas de MB. Sumados, superan los 400MB. La función serverless de Vercel corre en Linux
x64 únicamente, así que sobran 5 de esas 6 copias.

Corrección final en `next.config.mjs` -- apuntar solo a la plataforma que realmente se usa en producción:

```js
outputFileTracingIncludes: {
  "/api/predict": [
    "./node_modules/onnxruntime-node/bin/napi-v3/linux/x64/**/*",
    "./models/**/*",
  ],
},
```

Con este patrón la función queda muy por debajo del límite de 250MB.

## Cuarta vuelta: symlinks de pnpm rompiendo el empaquetado

Con el tamaño ya resuelto, el deploy (visto con `vercel inspect --logs`, que sí muestra el log completo
a diferencia del dashboard web) falló con:

```
The framework produced an invalid deployment package for a Serverless Function. Typically this means
that the framework produces files in symlinked directories. Please verify the framework settings.
```

Causa: pnpm instala `node_modules` con **symlinks** hacia un almacén interno (`node_modules/.pnpm/...`),
en vez de copiar los archivos directamente como npm/yarn. El empaquetador de funciones serverless de
Vercel no sigue bien esos symlinks cuando los archivos se incluyen manualmente vía
`outputFileTracingIncludes` (justo lo que se necesita para el binario nativo de `onnxruntime-node`).

Corrección: `.npmrc` en la raíz del repo:

```
node-linker=hoisted
```

Esto hace que pnpm instale `node_modules` en una estructura plana (sin symlinks, como npm/yarn), evitando
el problema por completo. Requiere borrar `node_modules` y reinstalar (`pnpm install`) una vez, ya que
cambia por completo cómo se organiza la carpeta.

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
