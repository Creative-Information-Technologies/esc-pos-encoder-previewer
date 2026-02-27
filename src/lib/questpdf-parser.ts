export interface QuestPdfNode {
  type: 'container' | 'text' | 'image' | 'line' | 'table' | 'row' | 'column' | 'cell' | 'header' | 'placeholder';
  styles: Record<string, string | number>;
  children: QuestPdfNode[];
  content?: string;
  error?: string;
}

export interface ParseResult {
  root: QuestPdfNode;
  errors: string[];
}

function parseStringArg(arg: string): string {
  const trimmed = arg.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseNumberArg(arg: string): number {
  const num = parseFloat(arg.trim());
  return isNaN(num) ? 0 : num;
}

interface MethodCall {
  method: string;
  args: string[];
  raw: string;
}

function tokenizeMethods(code: string): MethodCall[] {
  const methods: MethodCall[] = [];
  const regex = /\.(\w+)\s*\(([^)]*)\)/g;
  let match;
  while ((match = regex.exec(code)) !== null) {
    const method = match[1];
    const argsStr = match[2].trim();
    const args = argsStr ? argsStr.split(',').map(a => a.trim()) : [];
    methods.push({ method, args, raw: match[0] });
  }
  return methods;
}

function applyMethod(node: QuestPdfNode, method: MethodCall): QuestPdfNode | null {
  const { method: name, args } = method;
  const lowerName = name.toLowerCase();

  switch (lowerName) {
    case 'padding': {
      if (args.length >= 1) {
        node.styles.padding = parseNumberArg(args[0]);
      }
      return null;
    }
    case 'paddinghorizontal': {
      const val = args.length >= 1 ? parseNumberArg(args[0]) : 0;
      node.styles.paddingLeft = val;
      node.styles.paddingRight = val;
      return null;
    }
    case 'paddingvertical': {
      const val = args.length >= 1 ? parseNumberArg(args[0]) : 0;
      node.styles.paddingTop = val;
      node.styles.paddingBottom = val;
      return null;
    }
    case 'paddingleft': {
      node.styles.paddingLeft = args.length >= 1 ? parseNumberArg(args[0]) : 0;
      return null;
    }
    case 'paddingright': {
      node.styles.paddingRight = args.length >= 1 ? parseNumberArg(args[0]) : 0;
      return null;
    }
    case 'paddingtop': {
      node.styles.paddingTop = args.length >= 1 ? parseNumberArg(args[0]) : 0;
      return null;
    }
    case 'paddingbottom': {
      node.styles.paddingBottom = args.length >= 1 ? parseNumberArg(args[0]) : 0;
      return null;
    }
    case 'margin': {
      node.styles.margin = args.length >= 1 ? parseNumberArg(args[0]) : 0;
      return null;
    }
    case 'background': {
      node.styles.background = args.length >= 1 ? parseStringArg(args[0]) : '#ffffff';
      return null;
    }
    case 'border': {
      node.styles.borderWidth = args.length >= 1 ? parseNumberArg(args[0]) : 1;
      if (!node.styles.borderStyle) node.styles.borderStyle = 'solid';
      if (!node.styles.borderColor) node.styles.borderColor = '#000000';
      return null;
    }
    case 'bordercolor': {
      node.styles.borderColor = args.length >= 1 ? parseStringArg(args[0]) : '#000000';
      if (!node.styles.borderWidth) node.styles.borderWidth = 1;
      if (!node.styles.borderStyle) node.styles.borderStyle = 'solid';
      return null;
    }
    case 'fontcolor': {
      node.styles.color = args.length >= 1 ? parseStringArg(args[0]) : '#000000';
      return null;
    }
    case 'fontsize': {
      node.styles.fontSize = args.length >= 1 ? parseNumberArg(args[0]) : 12;
      return null;
    }
    case 'fontfamily': {
      node.styles.fontFamily = args.length >= 1 ? parseStringArg(args[0]) : 'Arial';
      return null;
    }
    case 'bold': {
      node.styles.fontWeight = 'bold';
      return null;
    }
    case 'italic': {
      node.styles.fontStyle = 'italic';
      return null;
    }
    case 'underline': {
      node.styles.textDecoration = 'underline';
      return null;
    }
    case 'strikethrough': {
      node.styles.textDecoration = 'line-through';
      return null;
    }
    case 'cornerradius': {
      node.styles.borderRadius = args.length >= 1 ? parseNumberArg(args[0]) : 0;
      return null;
    }
    case 'aligncenter': {
      node.styles.textAlign = 'center';
      node.styles.alignItems = 'center';
      node.styles.justifyContent = 'center';
      return null;
    }
    case 'alignleft': {
      node.styles.textAlign = 'left';
      return null;
    }
    case 'alignright': {
      node.styles.textAlign = 'right';
      return null;
    }
    case 'alignmiddle': {
      node.styles.alignItems = 'center';
      node.styles.justifyContent = 'center';
      return null;
    }
    case 'width': {
      node.styles.width = args.length >= 1 ? parseNumberArg(args[0]) : 'auto';
      return null;
    }
    case 'height': {
      node.styles.height = args.length >= 1 ? parseNumberArg(args[0]) : 'auto';
      return null;
    }
    case 'minwidth': {
      node.styles.minWidth = args.length >= 1 ? parseNumberArg(args[0]) : 0;
      return null;
    }
    case 'minheight': {
      node.styles.minHeight = args.length >= 1 ? parseNumberArg(args[0]) : 0;
      return null;
    }
    case 'maxwidth': {
      node.styles.maxWidth = args.length >= 1 ? parseNumberArg(args[0]) : 'none';
      return null;
    }
    case 'maxheight': {
      node.styles.maxHeight = args.length >= 1 ? parseNumberArg(args[0]) : 'none';
      return null;
    }
    case 'text': {
      const textNode: QuestPdfNode = {
        type: 'text',
        styles: { ...node.styles },
        children: [],
        content: args.length >= 1 ? parseStringArg(args[0]) : '',
      };
      return textNode;
    }
    case 'image': {
      const imgNode: QuestPdfNode = {
        type: 'image',
        styles: { ...node.styles },
        children: [],
        content: args.length >= 1 ? parseStringArg(args[0]) : 'placeholder',
      };
      return imgNode;
    }
    case 'line': case 'linevertical': case 'linehorizontal': {
      const lineNode: QuestPdfNode = {
        type: 'line',
        styles: {
          borderTop: lowerName === 'linevertical' ? 'none' : '1px solid #000',
          borderLeft: lowerName === 'linehorizontal' ? 'none' : '1px solid #000',
          width: lowerName === 'linevertical' ? '1px' : '100%',
          height: lowerName === 'linehorizontal' ? '1px' : '100%',
        },
        children: [],
      };
      if (args.length >= 1) {
        const size = parseNumberArg(args[0]);
        if (lowerName === 'linevertical') {
          lineNode.styles.borderLeft = `${size}px solid ${node.styles.borderColor || '#000'}`;
          lineNode.styles.width = `${size}px`;
        } else {
          lineNode.styles.borderTop = `${size}px solid ${node.styles.borderColor || '#000'}`;
          lineNode.styles.height = `${size}px`;
        }
      }
      return lineNode;
    }
    case 'row': {
      const rowNode: QuestPdfNode = {
        type: 'row',
        styles: { display: 'flex', flexDirection: 'row', width: '100%' },
        children: [],
      };
      return rowNode;
    }
    case 'column': {
      const colNode: QuestPdfNode = {
        type: 'column',
        styles: { display: 'flex', flexDirection: 'column' },
        children: [],
      };
      return colNode;
    }
    case 'table': {
      const tableNode: QuestPdfNode = {
        type: 'table',
        styles: { width: '100%', borderCollapse: 'collapse' },
        children: [],
      };
      return tableNode;
    }
    case 'header': {
      const headerNode: QuestPdfNode = {
        type: 'header',
        styles: { fontWeight: 'bold', fontSize: 18 },
        children: [],
      };
      return headerNode;
    }
    case 'placeholder': {
      const phNode: QuestPdfNode = {
        type: 'placeholder',
        styles: {
          background: '#e5e7eb',
          border: '2px dashed #9ca3af',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 40,
          color: '#6b7280',
          fontSize: 12,
        },
        children: [],
        content: args.length >= 1 ? parseStringArg(args[0]) : 'Placeholder',
      };
      return phNode;
    }
    case 'extend': case 'extendvertical': case 'extendhorizontal': {
      if (lowerName === 'extendhorizontal' || lowerName === 'extend') {
        node.styles.width = '100%';
      }
      if (lowerName === 'extendvertical' || lowerName === 'extend') {
        node.styles.height = '100%';
      }
      return null;
    }
    case 'gap': case 'spacing': {
      node.styles.gap = args.length >= 1 ? parseNumberArg(args[0]) : 0;
      return null;
    }
    case 'relativeitem': case 'constantitem': case 'autoitem': {
      const itemNode: QuestPdfNode = {
        type: 'container',
        styles: {},
        children: [],
      };
      if (lowerName === 'relativeitem' && args.length >= 1) {
        itemNode.styles.flex = parseNumberArg(args[0]);
      } else if (lowerName === 'constantitem' && args.length >= 1) {
        itemNode.styles.width = parseNumberArg(args[0]);
        itemNode.styles.flexShrink = 0;
      } else {
        itemNode.styles.flex = '0 0 auto';
      }
      return itemNode;
    }
    case 'defaulttextstyle': {
      return null;
    }
    default:
      return null;
  }
}

function parseBlock(code: string): QuestPdfNode {
  const root: QuestPdfNode = {
    type: 'container',
    styles: { display: 'flex', flexDirection: 'column' },
    children: [],
  };

  const lines = code.split('\n');
  const nodeStack: QuestPdfNode[] = [root];
  const indentStack: number[] = [-1];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue;

    const indent = line.length - line.trimStart().length;
    const methods = tokenizeMethods(trimmed);

    if (trimmed.includes('=>') || trimmed.includes('container =>') || trimmed.includes('column =>') || trimmed.includes('row =>') || trimmed.includes('cell =>') || trimmed.includes('header =>')) {
      continue;
    }

    let hasBlock = trimmed.endsWith('{') || trimmed.includes('=>');

    while (indentStack.length > 1 && indent <= indentStack[indentStack.length - 1]) {
      nodeStack.pop();
      indentStack.pop();
    }

    const currentParent = nodeStack[nodeStack.length - 1];

    if (methods.length > 0) {
      let targetNode: QuestPdfNode = {
        type: 'container',
        styles: {},
        children: [],
      };

      let lastChildNode: QuestPdfNode | null = null;

      for (const method of methods) {
        const childNode = applyMethod(targetNode, method);
        if (childNode) {
          lastChildNode = childNode;
        }
      }

      if (lastChildNode) {
        Object.assign(lastChildNode.styles, targetNode.styles, lastChildNode.styles);
        currentParent.children.push(lastChildNode);
        if (hasBlock) {
          nodeStack.push(lastChildNode);
          indentStack.push(indent);
        }
      } else if (Object.keys(targetNode.styles).length > 0) {
        if (hasBlock) {
          Object.assign(targetNode.styles, { display: targetNode.styles.display || 'flex', flexDirection: targetNode.styles.flexDirection || 'column' });
          currentParent.children.push(targetNode);
          nodeStack.push(targetNode);
          indentStack.push(indent);
        } else {
          Object.assign(currentParent.styles, targetNode.styles);
        }
      }
    }

    if (trimmed === '{') {
      continue;
    }
    if (trimmed === '}' || trimmed === '};') {
      if (nodeStack.length > 1) {
        nodeStack.pop();
        indentStack.pop();
      }
    }
  }

  return root;
}

export function parseQuestPdfCode(code: string): ParseResult {
  const errors: string[] = [];

  try {
    let cleaned = code
      .replace(/\/\/.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/using\s+[^;]+;/g, '')
      .replace(/namespace\s+\w+[\s\S]*?\{/g, '')
      .replace(/public\s+class\s+\w+[\s\S]*?\{/g, '')
      .replace(/public\s+void\s+\w+\s*\([^)]*\)\s*\{/g, '')
      .replace(/Document\.Create\s*\(\s*container\s*=>\s*\{?/g, '')
      .replace(/container\s*\.\s*Page\s*\(\s*page\s*=>\s*\{?/g, '')
      .replace(/page\s*\.\s*(Content|Header|Footer)\s*\(\s*\)\s*\.\s*/g, '');

    const root = parseBlock(cleaned);

    if (root.children.length === 0 && code.trim().length > 0) {
      const simpleMethods = tokenizeMethods(code);
      if (simpleMethods.length > 0) {
        const simpleRoot: QuestPdfNode = {
          type: 'container',
          styles: { display: 'flex', flexDirection: 'column' },
          children: [],
        };

        let currentNode = simpleRoot;
        for (const method of simpleMethods) {
          const child = applyMethod(currentNode, method);
          if (child) {
            currentNode.children.push(child);
          }
        }

        if (simpleRoot.children.length > 0 || Object.keys(simpleRoot.styles).length > 2) {
          return { root: simpleRoot, errors };
        }
      }
    }

    return { root, errors };
  } catch (e) {
    errors.push(e instanceof Error ? e.message : 'Error de parseo desconocido');
    return {
      root: { type: 'container', styles: {}, children: [] },
      errors,
    };
  }
}
