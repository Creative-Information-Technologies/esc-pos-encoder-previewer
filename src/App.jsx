import { useState, useCallback, useRef, useEffect } from 'react'
import './App.css'

function parseEscPosCode(code) {
  const elements = [];
  let state = {
    align: 'left',
    bold: false,
    size: 'normal',
    currentLineSpans: [],
  };
  let elementId = 0;

  function flushLine(addNewline) {
    if (state.currentLineSpans.length > 0 || addNewline) {
      elements.push({
        id: elementId++,
        type: 'line',
        align: state.align,
        size: state.size,
        spans: [...state.currentLineSpans],
      });
      state.currentLineSpans = [];
    }
  }

  function addTextSpan(text) {
    if (text === undefined || text === null) return;
    state.currentLineSpans.push({
      text: String(text),
      bold: state.bold,
      size: state.size,
    });
  }

  const cleaned = code
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/try\s*\{/g, '')
    .replace(/\}\s*catch\s*\([^)]*\)\s*\{[^}]*\}/g, '')
    .replace(/const\s+\w+\s*=\s*new\s+Image\(\);/g, '')
    .replace(/image\.\w+\s*=\s*[^;]+;/g, '')
    .replace(/image\.onload\s*=\s*\(\)\s*=>\s*\{/g, '')
    .replace(/image\.onerror\s*=\s*\(\)\s*=>\s*\{/g, '')
    .replace(/resolve\s*\([^)]*\)\s*;/g, '')
    .replace(/\}\s*;?\s*$/g, '');

  const methodRegex = /\.(initialize|align|bold|text|line|newline|size|image|codepage|cut|raw|encode)\s*\(([^)]*)\)/g;

  let match;
  while ((match = methodRegex.exec(cleaned)) !== null) {
    const method = match[1];
    const rawArgs = match[2].trim();

    function parseArg(arg) {
      const trimmed = arg.trim();
      if (trimmed === 'true') return true;
      if (trimmed === 'false') return false;
      if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
        return trimmed.slice(1, -1);
      }
      if (!isNaN(Number(trimmed)) && trimmed.length > 0) return Number(trimmed);
      return trimmed;
    }

    const args = rawArgs ? rawArgs.split(',').map(parseArg) : [];

    switch (method) {
      case 'initialize':
        state.align = 'left';
        state.bold = false;
        state.size = 'normal';
        state.currentLineSpans = [];
        break;

      case 'align':
        if (args[0]) state.align = args[0];
        break;

      case 'bold':
        state.bold = args.length > 0 ? Boolean(args[0]) : true;
        break;

      case 'size':
        if (args[0]) state.size = args[0];
        break;

      case 'text': {
        let textVal = rawArgs.trim();
        if ((textVal.startsWith("'") && textVal.endsWith("'")) ||
            (textVal.startsWith('"') && textVal.endsWith('"'))) {
          textVal = textVal.slice(1, -1);
        } else if (textVal.startsWith('`') && textVal.endsWith('`')) {
          textVal = textVal.slice(1, -1).replace(/\$\{[^}]+\}/g, (m) => {
            const inner = m.slice(2, -1).trim();
            const parts = inner.split('.');
            return `[${parts[parts.length - 1]}]`;
          });
        } else {
          const exprParts = [];
          let remaining = rawArgs.trim();
          const concatParts = remaining.split(/\s*\+\s*/);
          for (const part of concatParts) {
            const p = part.trim();
            if ((p.startsWith("'") && p.endsWith("'")) || (p.startsWith('"') && p.endsWith('"'))) {
              exprParts.push(p.slice(1, -1));
            } else if (p.startsWith('`') && p.endsWith('`')) {
              exprParts.push(p.slice(1, -1).replace(/\$\{[^}]+\}/g, (m) => {
                const inner = m.slice(2, -1).trim();
                const pts = inner.split('.');
                return `[${pts[pts.length - 1]}]`;
              }));
            } else if (p.includes("' '.repeat(")) {
              const repeatMatch = p.match(/(\d+)/);
              const count = repeatMatch ? Math.min(Number(repeatMatch[1]), 48) : 5;
              exprParts.push(' '.repeat(Math.max(1, Math.floor(count / 3))));
            } else if (p === "''") {
              exprParts.push('');
            } else {
              const varParts = p.split('.');
              const varName = varParts[varParts.length - 1]
                .replace(/\[['"]?([^'"\]]+)['"]?\]/g, '$1')
                .replace(/\?/g, '');
              exprParts.push(`[${varName}]`);
            }
          }
          textVal = exprParts.join('');
        }
        addTextSpan(textVal);
        break;
      }

      case 'line': {
        let lineVal = rawArgs.trim();
        if ((lineVal.startsWith("'") && lineVal.endsWith("'")) ||
            (lineVal.startsWith('"') && lineVal.endsWith('"'))) {
          lineVal = lineVal.slice(1, -1);
        } else if (lineVal.startsWith('`') && lineVal.endsWith('`')) {
          lineVal = lineVal.slice(1, -1).replace(/\$\{[^}]+\}/g, (m) => {
            const inner = m.slice(2, -1).trim();
            const parts = inner.split('.');
            return `[${parts[parts.length - 1]}]`;
          });
        } else {
          const exprParts = [];
          const concatParts = lineVal.split(/\s*\+\s*/);
          for (const part of concatParts) {
            const p = part.trim();
            if ((p.startsWith("'") && p.endsWith("'")) || (p.startsWith('"') && p.endsWith('"'))) {
              exprParts.push(p.slice(1, -1));
            } else if (p.startsWith('`') && p.endsWith('`')) {
              exprParts.push(p.slice(1, -1).replace(/\$\{[^}]+\}/g, (m) => {
                const inner = m.slice(2, -1).trim();
                const pts = inner.split('.');
                return `[${pts[pts.length - 1]}]`;
              }));
            } else {
              const varParts = p.split('.');
              const varName = varParts[varParts.length - 1]
                .replace(/\[['"]?([^'"\]]+)['"]?\]/g, '$1')
                .replace(/\?/g, '');
              exprParts.push(`[${varName}]`);
            }
          }
          lineVal = exprParts.join('');
        }
        addTextSpan(lineVal);
        flushLine(true);
        break;
      }

      case 'newline':
        flushLine(true);
        break;

      case 'image': {
        flushLine(false);
        const w = args[1] || 400;
        const h = args[2] || 240;
        elements.push({
          id: elementId++,
          type: 'image',
          width: w,
          height: h,
          align: state.align,
        });
        break;
      }

      case 'cut':
        flushLine(false);
        elements.push({ id: elementId++, type: 'cut' });
        break;

      case 'codepage':
      case 'raw':
      case 'encode':
        break;

      default:
        break;
    }
  }

  flushLine(false);
  return elements;
}

function ReceiptPreview({ elements }) {
  if (!elements || elements.length === 0) {
    return (
      <div className="receipt-paper">
        <div style={{ textAlign: 'center', color: '#ccc', padding: '40px 0' }}>
          Pega tu codigo ESC/POS a la izquierda para ver la previsualizacion aqui
        </div>
      </div>
    );
  }

  return (
    <div className="receipt-paper">
      {elements.map((el) => {
        if (el.type === 'cut') {
          return <div key={el.id} className="receipt-cut" />;
        }

        if (el.type === 'image') {
          return (
            <div key={el.id} style={{ textAlign: el.align }}>
              <div
                className="receipt-image-placeholder"
                style={{ width: el.width, height: el.height }}
              >
                [Imagen {el.width}x{el.height}]
              </div>
            </div>
          );
        }

        if (el.type === 'line') {
          const hasContent = el.spans.length > 0 && el.spans.some(s => s.text.length > 0);
          if (!hasContent) {
            return <div key={el.id} className={`receipt-line align-${el.align}`}>&nbsp;</div>;
          }

          return (
            <div key={el.id} className={`receipt-line align-${el.align}`}>
              {el.spans.map((span, i) => (
                <span
                  key={i}
                  className={`${span.bold ? 'receipt-span-bold' : 'receipt-span-normal'} receipt-size-${span.size}`}
                >
                  {span.text}
                </span>
              ))}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

const SAMPLE_CODE = `result = encoder
  .initialize()
  .align('center')
  .image(image, 400, 240, 'atkinson', 1)
  .codepage('cp437')
  .newline()
  .align('center')
  .bold(true)
  .line('Mi Negocio S.A.')
  .bold(false)
  .line('Razon Social del Negocio')
  .newline()
  .align('left')
  .bold(true)
  .line('Direccion Establecimiento:')
  .bold(false)
  .line('Col. Centro, Calle Principal #123')
  .newline()
  .bold(true)
  .text('Telefono: ')
  .bold(false)
  .text('2234-5678')
  .newline()
  .bold(true)
  .text('Correo: ')
  .bold(false)
  .text('info@minegocio.com')
  .newline()
  .bold(true)
  .text('RTN: ')
  .bold(false)
  .text('0801-1990-12345')
  .newline()
  .bold(true)
  .text('CAI: ')
  .bold(false)
  .text('ABC123-DEF456-GHI789')
  .newline()
  .align('center')
  .newline()
  .line('------------------------------------------------')
  .line('                 FACTURA                         ')
  .line('------------------------------------------------')
  .newline()
  .bold(true)
  .line('001-001-01-00000001')
  .newline()
  .align('left')
  .bold(true)
  .text('Cliente: ')
  .bold(false)
  .text('Juan Perez')
  .newline()
  .bold(true)
  .text('RTN Cliente: ')
  .bold(false)
  .text('0801-1985-00001')
  .newline()
  .bold(true)
  .text('Fecha: ')
  .bold(false)
  .text('14/02/2026 10:30:00')
  .newline()
  .bold(true)
  .text('Generada por: ')
  .bold(false)
  .text('Cajero 1')
  .newline()
  .newline()
  .align('left')
  .bold(true)
  .line('Cant  Descripcion          Precio    Total')
  .bold(false)
  .line('1     Hamburguesa Classic   L. 120.00 L. 120.00')
  .line('------------------------------------------------')
  .line('2     Coca-Cola 500ml       L.  35.00 L.  70.00')
  .line('------------------------------------------------')
  .line('1     Papas Fritas Grande   L.  55.00 L.  55.00')
  .line('------------------------------------------------')
  .newline()
  .text('Subtotal                          L. 245.00')
  .newline()
  .text('Descuentos Exentos                L.   0.00')
  .newline()
  .text('Descuentos Gravados               L.   0.00')
  .newline()
  .text('Exento                            L.   0.00')
  .newline()
  .text('Gravado                           L. 245.00')
  .newline()
  .text('ISV 15%                           L.  36.75')
  .newline()
  .text('ISV 18%                           L.   0.00')
  .newline()
  .bold(true)
  .text('TOTAL A PAGAR                     L. 281.75')
  .bold(false)
  .newline()
  .newline()
  .line('SON: Doscientos ochenta y uno con 75/100 Lempiras')
  .line('------------------------------------------------')
  .text('Efectivo                          L. 300.00')
  .newline()
  .line('------------------------------------------------')
  .text('Cambio                            L.  18.25')
  .newline()
  .line('------------------------------------------------')
  .newline()
  .bold(true)
  .text('Fecha Limite Emision: ')
  .bold(false)
  .text('31/12/2026')
  .newline()
  .bold(true)
  .line('Rango Autorizado: ')
  .bold(false)
  .line('001-001-01-00000001 a 001-001-01-00050000')
  .bold(true)
  .text('Original: ')
  .bold(false)
  .text('Cliente')
  .newline()
  .bold(true)
  .text('Copia: ')
  .bold(false)
  .text('Obligado Tributario Emisor')
  .bold(true)
  .newline()
  .text('G = Gravado , E = Exento')
  .newline()
  .bold(false)
  .align('center')
  .bold(true)
  .line('Gracias por su preferencia')
  .line('La factura es beneficio de todos, EXIJALA')
  .newline()
  .newline()
  .align('center')
  .size('small')
  .bold(true)
  .line('** YALO COBRO POS v 4.0 **')
  .newline()
  .newline()
  .cut()
  .encode()`;

function App() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [elements, setElements] = useState(() => parseEscPosCode(SAMPLE_CODE));
  const [error, setError] = useState(null);
  const [autoPreview, setAutoPreview] = useState(true);
  const debounceRef = useRef(null);

  const doParse = useCallback((input) => {
    try {
      const result = parseEscPosCode(input);
      setElements(result);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  const handleCodeChange = useCallback((e) => {
    const val = e.target.value;
    setCode(val);
    if (autoPreview) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => doParse(val), 300);
    }
  }, [autoPreview, doParse]);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  return (
    <div className="app-container">
      <div className="editor-panel">
        <div className="editor-header">
          <h2>ESC/POS Encoder Code</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label className="auto-label">
              <input
                type="checkbox"
                checked={autoPreview}
                onChange={(e) => setAutoPreview(e.target.checked)}
              />
              Auto-preview
            </label>
            {!autoPreview && (
              <button className="parse-btn" onClick={() => doParse(code)}>
                Renderizar
              </button>
            )}
          </div>
        </div>
        {error && <div className="error-msg">Error: {error}</div>}
        <textarea
          className="editor-textarea"
          value={code}
          onChange={handleCodeChange}
          placeholder={`Pega tu codigo ESC/POS encoder aqui...\n\nEjemplo:\nresult = encoder\n  .initialize()\n  .align('center')\n  .bold(true)\n  .line('Mi Negocio')\n  .bold(false)\n  .text('Hola mundo')\n  .newline()\n  .cut()\n  .encode()`}
          spellCheck={false}
        />
        <div className="status-bar">
          <span>{code.length} caracteres</span>
          <span>{elements.length} elementos renderizados</span>
        </div>
      </div>
      <div className="preview-panel">
        <div className="preview-header">
          <h2>Vista Previa del Recibo</h2>
        </div>
        <div className="preview-scroll">
          <ReceiptPreview elements={elements} />
        </div>
      </div>
    </div>
  );
}

export default App
