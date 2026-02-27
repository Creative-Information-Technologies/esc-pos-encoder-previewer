import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  darkMode: boolean;
}

export function CodeEditor({ code, onChange, darkMode }: CodeEditorProps) {
  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="csharp"
        value={code}
        onChange={(value) => onChange(value || '')}
        theme={darkMode ? 'vs-dark' : 'light'}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          renderWhitespace: 'selection',
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          padding: { top: 8 },
        }}
      />
    </div>
  );
}
