import { useState, useCallback, useRef, useEffect } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { PdfPreview } from './components/PdfPreview';
import { PropertiesPanel } from './components/PropertiesPanel';
import { parseQuestPdfCode } from './lib/questpdf-parser';
import { templates } from './lib/templates';
import type { ParseResult } from './lib/questpdf-parser';
import { Sun, Moon, FileText, PanelRightOpen, PanelRightClose, LayoutTemplate, AlertCircle, CheckCircle2, Copy, Undo2 } from 'lucide-react';

const DEFAULT_CODE = templates[0].code;

function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [parseResult, setParseResult] = useState<ParseResult>(() => parseQuestPdfCode(DEFAULT_CODE));
  const [darkMode, setDarkMode] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [codeHistory, setCodeHistory] = useState<string[]>([DEFAULT_CODE]);
  const [copied, setCopied] = useState(false);
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
    setCodeHistory(prev => [...prev, newCode]);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setParseResult(parseQuestPdfCode(newCode));
    }, 300);
  }, [code]);

  const handleSelectTemplate = useCallback((templateCode: string) => {
    setCode(templateCode);
    setCodeHistory(prev => [...prev, templateCode]);
    setParseResult(parseQuestPdfCode(templateCode));
    setShowTemplates(false);
  }, []);

  const handleUndo = useCallback(() => {
    if (codeHistory.length > 1) {
      const newHistory = [...codeHistory];
      newHistory.pop();
      const previousCode = newHistory[newHistory.length - 1];
      setCodeHistory(newHistory);
      setCode(previousCode);
      setParseResult(parseQuestPdfCode(previousCode));
    }
  }, [codeHistory]);

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const errorCount = parseResult.errors.length;

  return (
    <div className={`h-screen flex flex-col transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-4 py-2 border-b shrink-0 transition-colors duration-200 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-blue-900/50' : 'bg-blue-50'}`}>
            <FileText size={18} className="text-blue-500" />
          </div>
          <div>
            <h1 className={`text-sm font-bold leading-tight ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              QuestPDF Style Previewer
            </h1>
            <span className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Fluent API - Vista previa en tiempo real
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Status indicator */}
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium mr-2 ${
            errorCount > 0
              ? darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'
              : darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'
          }`}>
            {errorCount > 0 ? (
              <><AlertCircle size={12} /> {errorCount} error{errorCount > 1 ? 'es' : ''}</>
            ) : (
              <><CheckCircle2 size={12} /> Sin errores</>
            )}
          </div>

          {/* Templates dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                darkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <LayoutTemplate size={14} />
              Plantillas
            </button>
            {showTemplates && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowTemplates(false)} />
                <div className={`absolute right-0 top-full mt-1 w-80 rounded-lg shadow-xl border z-50 ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className={`px-3 py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>PLANTILLAS BASE</p>
                  </div>
                  <div className="p-1.5">
                    {templates.map((t) => (
                      <button
                        key={t.name}
                        onClick={() => handleSelectTemplate(t.code)}
                        className={`w-full text-left px-3 py-2.5 rounded-md transition-colors ${
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        }`}
                      >
                        <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t.name}</p>
                        <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setShowProperties(!showProperties)}
            className={`p-1.5 rounded-md transition-colors ${
              darkMode
                ? showProperties ? 'text-blue-400 bg-blue-900/30' : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                : showProperties ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
            }`}
            title={showProperties ? 'Ocultar propiedades' : 'Mostrar propiedades'}
          >
            {showProperties ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-1.5 rounded-md transition-colors ${
              darkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200'
            }`}
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor panel */}
        <div
          className={`flex flex-col border-r transition-colors duration-200 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
          style={{ width: showProperties ? '35%' : '45%', minWidth: '300px' }}
        >
          <div className={`flex items-center justify-between px-3 py-1.5 border-b ${
            darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${
              darkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Editor C# - QuestPDF
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handleUndo}
                disabled={codeHistory.length <= 1}
                className={`p-1 rounded transition-colors disabled:opacity-30 ${
                  darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200' : 'text-gray-500 hover:bg-gray-200'
                }`}
                title="Deshacer"
              >
                <Undo2 size={13} />
              </button>
              <button
                onClick={handleCopyCode}
                className={`p-1 rounded transition-colors ${
                  darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200' : 'text-gray-500 hover:bg-gray-200'
                }`}
                title="Copiar codigo"
              >
                <Copy size={13} />
              </button>
              {copied && (
                <span className="text-[10px] text-green-500 font-medium animate-pulse">Copiado</span>
              )}
              <span className={`text-[10px] ml-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                {code.length} chars
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <CodeEditor code={code} onChange={handleCodeChange} darkMode={darkMode} />
          </div>
        </div>

        {/* Preview panel */}
        <div className="flex-1 overflow-hidden">
          <PdfPreview root={parseResult.root} errors={parseResult.errors} darkMode={darkMode} />
        </div>

        {/* Properties panel */}
        {showProperties && (
          <div
            className={`border-l transition-colors duration-200 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            style={{ width: '240px', minWidth: '240px' }}
          >
            <PropertiesPanel onInsert={handleInsertCode} darkMode={darkMode} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
