# ESC/POS Encoder Previewer

Aplicacion web para previsualizar recibos ESC/POS a partir de codigo de `esc-pos-encoder` sin imprimir fisicamente.

Permite pegar el flujo de metodos del encoder (por ejemplo `.line()`, `.text()`, `.align()`, `.bold()`, `.image()`, `.cut()`), procesarlo y mostrar una representacion visual del ticket en tiempo real.

## Objetivo

Este proyecto esta pensado para desarrollo y depuracion de plantillas de impresion POS, ayudando a:

- Validar formato antes de enviar a una impresora termica.
- Revisar alineacion, saltos de linea y estilos (negrita/tamano).
- Detectar errores en composicion de texto dinamico.
- Iterar rapido sobre tickets sin depender de hardware.

## Stack Tecnologico

- `React 19`
- `Vite 7`
- `ESLint 9`
- CSS plano (sin framework de UI)

## Estructura del Proyecto

```txt
esc-pos-encoder-previewer/
  public/
  src/
    App.jsx        # Parser, UI principal y previsualizacion
    App.css        # Estilos de editor y ticket
    index.css      # Estilos globales base
    main.jsx       # Punto de entrada React
  eslint.config.js
  vite.config.js
  package.json
```

## Requisitos

- `Node.js` 20+ (recomendado)
- `npm` 10+ (o version compatible)

## Instalacion

```bash
npm install
```

## Ejecucion en Desarrollo

```bash
npm run dev
```

Vite mostrara una URL local (usualmente `http://localhost:5173`).

## Build de Produccion

```bash
npm run build
```

El resultado queda en `dist/`.

Para previsualizar la build:

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

## Flujo de Uso

1. Abrir la aplicacion.
2. Pegar el codigo ESC/POS en el editor izquierdo.
3. Ver la representacion del recibo en el panel derecho.
4. Activar/desactivar `Auto-preview` para parseo automatico o manual.
5. Usar `Ctrl+F` para buscar/reemplazar dentro del codigo.

## Metodos ESC/POS Soportados

El parser interpreta estas llamadas:

- `.initialize()`
- `.align('left' | 'center' | 'right')`
- `.bold(true | false)`
- `.size('small' | 'normal' | 'large')`
- `.text(...)`
- `.line(...)`
- `.newline()`
- `.image(image, width, height, ...)` (placeholder visual)
- `.cut()`

Tambien detecta y omite sin renderizar:

- `.codepage(...)`
- `.raw(...)`
- `.encode()`

## Como Funciona el Parser

El nucleo esta en `src/App.jsx` y se divide en dos fases:

1. `preprocessCode(code)`:
- Normaliza el input.
- Elimina comentarios y partes no relevantes para vista previa.
- Intenta limpiar wrappers comunes (`try/catch`, asignaciones de `result`, etc.).

2. `parseEscPosCode(code)`:
- Usa una expresion regular para extraer metodos del encoder.
- Mantiene estado de formato (`align`, `bold`, `size`).
- Convierte llamadas en una lista de elementos renderizables (`line`, `image`, `cut`).
- `ReceiptPreview` traduce esos elementos a HTML/CSS.

## Entrada Esperada

Acepta diferentes estilos de input:

- Codigo multilinea.
- Codigo serializado con `\n`.
- Literales con comillas simples, dobles o template strings.
- Concatenaciones simples con `+`.
- Variables dinamicas (se muestran como marcadores `[variable]`).

## Limitaciones Actuales

- Es una simulacion visual, no genera bytes ESC/POS reales.
- No interpreta toda la logica JavaScript compleja (condicionales/bucles avanzados).
- Imagenes se muestran como placeholder con dimensiones.
- El parser esta orientado al estilo encadenado de `esc-pos-encoder`.

## Personalizacion Recomendada

Si quieres adaptar el preview a tu entorno:

- Editar ejemplo inicial en `SAMPLE_CODE` dentro de `src/App.jsx`.
- Ajustar tipografia y ancho de ticket en `src/App.css` (`.receipt-paper`).
- Extender el parser para nuevos comandos ESC/POS en `parseEscPosCode`.

## Troubleshooting

- La vista no cambia:
  - Verifica que `Auto-preview` este activo o presiona `Renderizar`.
- El parser no detecta una linea:
  - Revisa que uses formato encadenado `.metodo(...)`.
- Se pierde formato:
  - Confirma que los argumentos de `align`, `bold`, `size` sean validos.

## Scripts Disponibles

- `npm run dev`: entorno local con recarga en caliente.
- `npm run build`: build de produccion.
- `npm run preview`: sirve la build para verificacion.
- `npm run lint`: analisis estatico del codigo.

## Notas de Mantenimiento

- El proyecto es intencionalmente simple: la mayor parte de la logica esta concentrada en `src/App.jsx`.
- Si el parser crece, se recomienda separar en modulos:
  - `parser/preprocess.js`
  - `parser/parseEscPosCode.js`
  - `components/ReceiptPreview.jsx`
  - `components/SearchReplace.jsx`

## Licencia

Sin licencia declarada actualmente. Agrega una (por ejemplo MIT) si vas a distribuirlo externamente.
