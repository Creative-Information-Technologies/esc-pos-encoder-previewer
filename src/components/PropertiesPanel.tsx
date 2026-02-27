import { colorTokens, typographyTokens } from '../lib/design-tokens';
import { Copy } from 'lucide-react';

interface PropertiesPanelProps {
  onInsert: (code: string) => void;
  darkMode: boolean;
}

function SliderRow({ label, min, max, step, defaultValue, unit, methodName, onInsert }: {
  label: string; min: number; max: number; step: number; defaultValue: number; unit: string; methodName: string; onInsert: (code: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          defaultValue={defaultValue}
          className="flex-1 h-1.5 rounded-full appearance-none bg-gray-200 dark:bg-gray-600 accent-blue-600"
          onChange={(e) => {
            const span = e.target.nextElementSibling;
            if (span) span.textContent = `${e.target.value}${unit}`;
          }}
        />
        <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">{defaultValue}{unit}</span>
        <button
          onClick={(e) => {
            const slider = (e.target as HTMLElement).closest('.space-y-1')?.querySelector('input[type="range"]') as HTMLInputElement;
            if (slider) onInsert(`.${methodName}(${slider.value})`);
          }}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          title="Insertar en editor"
        >
          <Copy size={12} />
        </button>
      </div>
    </div>
  );
}

export function PropertiesPanel({ onInsert, darkMode }: PropertiesPanelProps) {
  return (
    <div className={`h-full overflow-y-auto ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}>
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">Propiedades</h3>
      </div>

      <div className="p-3 space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Espaciado</h4>
          <div className="space-y-3">
            <SliderRow label="Padding" min={0} max={60} step={2} defaultValue={16} unit="px" methodName="Padding" onInsert={onInsert} />
            <SliderRow label="Margin" min={0} max={60} step={2} defaultValue={0} unit="px" methodName="Margin" onInsert={onInsert} />
            <SliderRow label="Gap / Spacing" min={0} max={40} step={2} defaultValue={8} unit="px" methodName="Spacing" onInsert={onInsert} />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tipografia</h4>
          <div className="space-y-3">
            <SliderRow label="Font Size" min={8} max={48} step={1} defaultValue={12} unit="px" methodName="FontSize" onInsert={onInsert} />
            <SliderRow label="Border Radius" min={0} max={30} step={1} defaultValue={0} unit="px" methodName="CornerRadius" onInsert={onInsert} />
            <SliderRow label="Border Width" min={0} max={5} step={0.5} defaultValue={1} unit="px" methodName="Border" onInsert={onInsert} />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Dimensiones</h4>
          <div className="space-y-3">
            <SliderRow label="Width" min={50} max={600} step={10} defaultValue={200} unit="px" methodName="Width" onInsert={onInsert} />
            <SliderRow label="Height" min={20} max={400} step={10} defaultValue={100} unit="px" methodName="Height" onInsert={onInsert} />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Colores</h4>
          <div className="grid grid-cols-3 gap-1.5">
            {colorTokens.map((token) => (
              <button
                key={token.name}
                onClick={() => onInsert(`.Background("${token.value}")`)}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={`${token.name}: ${token.value}`}
              >
                <div
                  className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: token.value }}
                />
                <span className="text-[9px] text-gray-500 dark:text-gray-400 truncate w-full text-center">{token.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Font Colors</h4>
          <div className="grid grid-cols-3 gap-1.5">
            {colorTokens.slice(0, 9).map((token) => (
              <button
                key={`fc-${token.name}`}
                onClick={() => onInsert(`.FontColor("${token.value}")`)}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={`FontColor: ${token.value}`}
              >
                <div className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-bold" style={{ color: token.value }}>
                  A
                </div>
                <span className="text-[9px] text-gray-500 dark:text-gray-400 truncate w-full text-center">{token.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tipografias</h4>
          <div className="space-y-1">
            {typographyTokens.map((token) => (
              <button
                key={token.name}
                onClick={() => onInsert(`.FontSize(${token.fontSize})\n    .FontFamily("${token.fontFamily}")${token.fontWeight === 'bold' ? '\n    .Bold()' : ''}`)}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-xs" style={{ fontFamily: token.fontFamily, fontWeight: token.fontWeight, fontSize: `${Math.min(token.fontSize, 16)}px` }}>
                  {token.name}
                </span>
                <span className="text-[9px] text-gray-400 ml-2">{token.fontSize}px {token.fontFamily}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Metodos Rapidos</h4>
          <div className="grid grid-cols-2 gap-1">
            {[
              { label: 'AlignCenter', code: '.AlignCenter()' },
              { label: 'AlignLeft', code: '.AlignLeft()' },
              { label: 'AlignRight', code: '.AlignRight()' },
              { label: 'Bold', code: '.Bold()' },
              { label: 'Italic', code: '.Italic()' },
              { label: 'Row()', code: '.Row()\n    .Spacing(8)' },
              { label: 'Column()', code: '.Column()\n    .Spacing(8)' },
              { label: 'Text()', code: '.Text("Texto aqui")' },
              { label: 'LineH', code: '.LineHorizontal(1)' },
              { label: 'Placeholder', code: '.Placeholder("Contenido")' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => onInsert(item.code)}
                className="px-2 py-1.5 text-[10px] font-mono rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors truncate"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
