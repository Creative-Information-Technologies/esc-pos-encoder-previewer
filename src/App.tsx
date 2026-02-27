import { useState, useCallback, useRef, useEffect } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { PdfPreview } from './components/PdfPreview';
import { PropertiesPanel } from './components/PropertiesPanel';
import { parseQuestPdfCode } from './lib/questpdf-parser';
import { templates } from './lib/templates';
import type { ParseResult } from './lib/questpdf-parser';
import { Sun, Moon, FileText, PanelRightOpen, PanelRightClose, LayoutTemplate } from 'lucide-react';

const DEFAULT_CODE = templates[0].code;

function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [parseResult, setParseResult] = useState<ParseResult>(() => parseQuestPdfCode(DEFAULT_CODE));
  const [darkMode, setDarkMode] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const result = parseQuestPdfCode(newCode);
      setParseResult(result);
    }, 300);
  }, []);

  const handleInsertCode = useCallback((snippet: string) => {
    const newCode = code + '\n' + snippet;
    setCode(newCode);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setParseResult(parseQuestPdfCode(newCode));
    }, 300);
  }, [code]);

  const handleSelectTemplate = useCallback((templateCode: string) => {
    setCode(templateCode);
    setParseResult(parseQuestPdfCode(templateCode));
    setShowTemplates(false);
  }, []);

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <header className={`flex items-center justify-between px-4 py-2 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shrink-0`}>
        <div className="flex items-center gap-3">
          <FileText size={20} className="text-blue-500" />
          <h1 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            QuestPDF Style Previewer
          </h1>
          <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
            Fluent API
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <LayoutTemplate size={14} />
              Plantillas
            </button>
            {showTemplates && (
              <div className={`absolute right-0 top-full mt-1 w-72 rounded-lg shadow-xl border z-50 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="p-2">
                  {templates.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => handleSelectTemplate(t.code)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                    >
                      <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t.name}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowProperties(!showProperties)}
            className={`p-1.5 rounded-md transition-colors ${darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'}`}
            title={showProperties ? 'Ocultar propiedades' : 'Mostrar propiedades'}
          >
            {showProperties ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-1.5 rounded-md transition-colors ${darkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200'}`}
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className={`flex flex-col border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} style={{ width: showProperties ? '35%' : '45%' }}>
          <div className={`flex items-center justify-between px-4 py-2 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <span className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>EDITOR C# - QuestPDF Fluent API</span>
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{code.length} chars</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <CodeEditor code={code} onChange={handleCodeChange} darkMode={darkMode} />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <PdfPreview root={parseResult.root} errors={parseResult.errors} />
        </div>

        {showProperties && (
          <div className={`border-l ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} style={{ width: '220px' }}>
            <PropertiesPanel onInsert={handleInsertCode} darkMode={darkMode} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
