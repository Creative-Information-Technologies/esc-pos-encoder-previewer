import { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import type { QuestPdfNode } from '../lib/questpdf-parser';

interface PdfPreviewProps {
  root: QuestPdfNode;
  errors: string[];
  darkMode: boolean;
}

const PX_KEYS = new Set([
  'padding', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom',
  'margin', 'marginLeft', 'marginRight', 'marginTop', 'marginBottom',
  'borderWidth', 'borderRadius', 'fontSize', 'width', 'height',
  'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'gap',
]);

function nodeToStyle(styles: Record<string, string | number>): React.CSSProperties {
  const css: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(styles)) {
    if (typeof value === 'number' && PX_KEYS.has(key)) {
      css[key] = `${value}px`;
    } else {
      css[key] = value;
    }
  }
  return css as React.CSSProperties;
}

function RenderNode({ node }: { node: QuestPdfNode }) {
  const style = nodeToStyle(node.styles);

  if (node.type === 'text') {
    return <span style={style}>{node.content || ''}</span>;
  }

  if (node.type === 'image') {
    return (
      <div style={{ ...style, background: '#e5e7eb', border: '2px dashed #9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', color: '#6b7280', fontSize: '12px' }}>
        [Imagen: {node.content || 'placeholder'}]
      </div>
    );
  }

  if (node.type === 'line') {
    return <div style={{ ...style, margin: '4px 0' }} />;
  }

  if (node.type === 'placeholder') {
    return (
      <div style={style}>
        {node.content || 'Placeholder'}
      </div>
    );
  }

  return (
    <div style={style}>
      {node.children.map((child, i) => (
        <RenderNode key={i} node={child} />
      ))}
    </div>
  );
}

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];

export function PdfPreview({ root, errors, darkMode }: PdfPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => {
    const idx = ZOOM_LEVELS.indexOf(zoom);
    if (idx < ZOOM_LEVELS.length - 1) setZoom(ZOOM_LEVELS[idx + 1]);
  };

  const handleZoomOut = () => {
    const idx = ZOOM_LEVELS.indexOf(zoom);
    if (idx > 0) setZoom(ZOOM_LEVELS[idx - 1]);
  };

  const handleResetZoom = () => setZoom(100);

  const handleDownload = async () => {
    if (!previewRef.current) return;
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter',
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save('questpdf-preview.pdf');
    } catch (e) {
      console.error('Error generating PDF:', e);
    }
  };

  const hasContent = root.children.length > 0 || Object.keys(root.styles).length > 2;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className={`flex items-center justify-between px-3 py-1.5 border-b transition-colors ${
        darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${
          darkMode ? 'text-gray-500' : 'text-gray-400'
        }`}>Vista Previa PDF</span>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className={`flex items-center gap-0.5 rounded-md border px-1 ${
            darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
          }`}>
            <button
              onClick={handleZoomOut}
              disabled={zoom <= ZOOM_LEVELS[0]}
              className={`p-1 rounded transition-colors disabled:opacity-30 ${
                darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Reducir zoom"
            >
              <ZoomOut size={13} />
            </button>
            <button
              onClick={handleResetZoom}
              className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors ${
                darkMode ? 'text-gray-300 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Restablecer zoom"
            >
              {zoom}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
              className={`p-1 rounded transition-colors disabled:opacity-30 ${
                darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Aumentar zoom"
            >
              <ZoomIn size={13} />
            </button>
          </div>

          <button
            onClick={handleResetZoom}
            className={`p-1 rounded-md transition-colors ${
              darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200' : 'text-gray-500 hover:bg-gray-200'
            }`}
            title="Restablecer vista"
          >
            <RotateCcw size={13} />
          </button>

          <button
            onClick={handleDownload}
            disabled={!hasContent}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Download size={13} />
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className={`px-4 py-2 border-b ${
          darkMode ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50 border-red-200'
        }`}>
          {errors.map((err, i) => (
            <p key={i} className={`text-xs ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{err}</p>
          ))}
        </div>
      )}

      {/* Preview area */}
      <div className={`flex-1 overflow-auto p-6 flex justify-center transition-colors ${
        darkMode ? 'bg-gray-900/50' : 'bg-gray-100'
      }`}>
        <div className="w-full max-w-3xl" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
          <div
            ref={previewRef}
            className="bg-white shadow-xl mx-auto border border-gray-200"
            style={{
              width: '100%',
              minHeight: '200px',
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: '12px',
              color: '#000000',
              lineHeight: 1.4,
            }}
          >
            {hasContent ? (
              <RenderNode node={root} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <FileIcon />
                  <p className="text-base mt-3 font-medium">Vista previa vacia</p>
                  <p className="text-sm mt-1 text-gray-300">Escribe codigo QuestPDF en el editor para ver la previsualizacion</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FileIcon() {
  return (
    <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
