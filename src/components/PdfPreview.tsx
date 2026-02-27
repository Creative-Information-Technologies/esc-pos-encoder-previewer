import { useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';
import type { QuestPdfNode } from '../lib/questpdf-parser';

interface PdfPreviewProps {
  root: QuestPdfNode;
  errors: string[];
}

function nodeToStyle(styles: Record<string, string | number>): React.CSSProperties {
  const css: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(styles)) {
    if (typeof value === 'number') {
      const pxKeys = ['padding', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom',
        'margin', 'marginLeft', 'marginRight', 'marginTop', 'marginBottom',
        'borderWidth', 'borderRadius', 'fontSize', 'width', 'height',
        'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'gap'];
      if (pxKeys.includes(key)) {
        css[key] = `${value}px`;
      } else {
        css[key] = value;
      }
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

export function PdfPreview({ root, errors }: PdfPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

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
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Vista Previa PDF</span>
        <button
          onClick={handleDownload}
          disabled={!hasContent}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Download size={14} />
          Descargar PDF
        </button>
      </div>

      {errors.length > 0 && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-red-600 dark:text-red-400">{err}</p>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-6 flex justify-center">
        <div className="w-full max-w-2xl">
          <div
            ref={previewRef}
            className="bg-white shadow-lg mx-auto"
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
                  <p className="text-lg mb-2">Vista previa vacia</p>
                  <p className="text-sm">Escribe codigo QuestPDF en el editor para ver la previsualizacion</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
