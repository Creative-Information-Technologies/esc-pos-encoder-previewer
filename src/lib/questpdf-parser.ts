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

// ── Helpers ──────────────────────────────────────────────────────────

function parseStringArg(arg: string): string {
  const trimmed = arg.trim();
  // Handle Colors.Hex("...") pattern
  const hexMatch = trimmed.match(/Colors\s*\.\s*Hex\s*\(\s*"([^"]*)"\s*\)/);
  if (hexMatch) return hexMatch[1];
  // Handle Colors.Black, Colors.White, etc.
  const namedColorMatch = trimmed.match(/Colors\s*\.\s*(\w+)/);
  if (namedColorMatch) {
    const colorMap: Record<string, string> = {
      Black: '#000000', White: '#FFFFFF', Red: '#FF0000', Green: '#008000',
      Blue: '#0000FF', Yellow: '#FFFF00', Orange: '#FFA500', Grey: '#808080',
      LightGrey: '#D3D3D3', DarkGrey: '#696969', Transparent: 'transparent',
    };
    return colorMap[namedColorMatch[1]] || '#000000';
  }
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseNumberArg(arg: string): number {
  const num = parseFloat(arg.trim());
  return isNaN(num) ? 0 : num;
}

// ── Tokenizer ────────────────────────────────────────────────────────
// Handles nested parentheses so Colors.Hex("#abc") inside .Background(Colors.Hex("#abc")) works

interface MethodCall {
  method: string;
  args: string[];
  raw: string;
  hasLambda: boolean;
}

function tokenizeMethodsAdvanced(code: string): MethodCall[] {
  const methods: MethodCall[] = [];
  let i = 0;
  const len = code.length;

  while (i < len) {
    // Find next .MethodName(
    const dotMatch = code.slice(i).match(/\.(\w+)\s*\(/);
    if (!dotMatch || dotMatch.index === undefined) break;

    const methodStart = i + dotMatch.index;
    const method = dotMatch[1];
    let parenStart = methodStart + dotMatch[0].length;
    // Find matching closing paren
    let depth = 1;
    let j = parenStart;
    while (j < len && depth > 0) {
      if (code[j] === '(') depth++;
      else if (code[j] === ')') depth--;
      j++;
    }
    const argsStr = code.slice(parenStart, j - 1).trim();
    const raw = code.slice(methodStart, j);

    // Check if this is a lambda: contains =>
    const hasLambda = /=>\s*(\{|$)/.test(argsStr) || argsStr.includes('=>');

    // Parse args (skip if lambda)
    let args: string[] = [];
    if (!hasLambda && argsStr.length > 0) {
      // Split by comma but respect nested parens
      args = splitArgs(argsStr);
    }

    methods.push({ method, args, raw, hasLambda });
    i = j;
  }
  return methods;
}

function splitArgs(argsStr: string): string[] {
  const args: string[] = [];
  let depth = 0;
  let current = '';
  for (let i = 0; i < argsStr.length; i++) {
    const ch = argsStr[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    if (ch === ',' && depth === 0) {
      args.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) args.push(current.trim());
  return args;
}

// ── Style application ────────────────────────────────────────────────

type ApplyResult = { type: 'style' } | { type: 'child'; node: QuestPdfNode };

function applyMethodToNode(node: QuestPdfNode, mc: MethodCall): ApplyResult {
  const name = mc.method.toLowerCase();
  const args = mc.args;
  const a0 = () => args.length >= 1 ? args[0] : '';

  // ── Padding ──
  if (name === 'padding') { node.styles.padding = parseNumberArg(a0()); return { type: 'style' }; }
  if (name === 'paddinghorizontal') { const v = parseNumberArg(a0()); node.styles.paddingLeft = v; node.styles.paddingRight = v; return { type: 'style' }; }
  if (name === 'paddingvertical') { const v = parseNumberArg(a0()); node.styles.paddingTop = v; node.styles.paddingBottom = v; return { type: 'style' }; }
  if (name === 'paddingleft') { node.styles.paddingLeft = parseNumberArg(a0()); return { type: 'style' }; }
  if (name === 'paddingright') { node.styles.paddingRight = parseNumberArg(a0()); return { type: 'style' }; }
  if (name === 'paddingtop') { node.styles.paddingTop = parseNumberArg(a0()); return { type: 'style' }; }
  if (name === 'paddingbottom') { node.styles.paddingBottom = parseNumberArg(a0()); return { type: 'style' }; }

  // ── Margin ──
  if (name === 'margin') { node.styles.margin = parseNumberArg(a0()); return { type: 'style' }; }

  // ── Background ──
  if (name === 'background') { node.styles.background = parseStringArg(a0()); return { type: 'style' }; }

  // ── Border ──
  if (name === 'border') { node.styles.borderWidth = args.length >= 1 ? parseNumberArg(a0()) : 1; if (!node.styles.borderStyle) node.styles.borderStyle = 'solid'; if (!node.styles.borderColor) node.styles.borderColor = '#000000'; return { type: 'style' }; }
  if (name === 'bordercolor') { node.styles.borderColor = parseStringArg(a0()); if (!node.styles.borderWidth) node.styles.borderWidth = 1; if (!node.styles.borderStyle) node.styles.borderStyle = 'solid'; return { type: 'style' }; }
  if (name === 'cornerradius') { node.styles.borderRadius = parseNumberArg(a0()); return { type: 'style' }; }

  // ── Font ──
  if (name === 'fontcolor') { node.styles.color = parseStringArg(a0()); return { type: 'style' }; }
  if (name === 'fontsize') { node.styles.fontSize = parseNumberArg(a0()); return { type: 'style' }; }
  if (name === 'fontfamily') { node.styles.fontFamily = parseStringArg(a0()); return { type: 'style' }; }
  if (name === 'bold') { node.styles.fontWeight = 'bold'; return { type: 'style' }; }
  if (name === 'italic') { node.styles.fontStyle = 'italic'; return { type: 'style' }; }
  if (name === 'underline') { node.styles.textDecoration = 'underline'; return { type: 'style' }; }
  if (name === 'strikethrough') { node.styles.textDecoration = 'line-through'; return { type: 'style' }; }

  // ── Alignment ──
  if (name === 'aligncenter') { node.styles.textAlign = 'center'; node.styles.alignItems = 'center'; node.styles.justifyContent = 'center'; return { type: 'style' }; }
  if (name === 'alignleft') { node.styles.textAlign = 'left'; return { type: 'style' }; }
  if (name === 'alignright') { node.styles.textAlign = 'right'; node.styles.alignItems = 'flex-end'; return { type: 'style' }; }
  if (name === 'alignmiddle') { node.styles.alignItems = 'center'; node.styles.justifyContent = 'center'; return { type: 'style' }; }

  // ── Dimensions ──
  if (name === 'width') { node.styles.width = parseNumberArg(a0()); return { type: 'style' }; }
  if (name === 'height') { node.styles.height = parseNumberArg(a0()); return { type: 'style' }; }
  if (name === 'minwidth') { node.styles.minWidth = parseNumberArg(a0()); return { type: 'style' }; }
  if (name === 'minheight') { node.styles.minHeight = parseNumberArg(a0()); return { type: 'style' }; }
  if (name === 'maxwidth') { node.styles.maxWidth = parseNumberArg(a0()); return { type: 'style' }; }
  if (name === 'maxheight') { node.styles.maxHeight = parseNumberArg(a0()); return { type: 'style' }; }

  // ── Spacing ──
  if (name === 'gap' || name === 'spacing') { node.styles.gap = parseNumberArg(a0()); return { type: 'style' }; }

  // ── Extend ──
  if (name === 'extend' || name === 'extendhorizontal') { node.styles.width = '100%'; return { type: 'style' }; }
  if (name === 'extendvertical') { node.styles.height = '100%'; return { type: 'style' }; }

  // ── Item() — transparent container in column ──
  if (name === 'item') {
    return { type: 'child', node: { type: 'container', styles: {}, children: [] } };
  }

  // ── Element() — named style reference (render as container) ──
  if (name === 'element') {
    const elNode: QuestPdfNode = { type: 'container', styles: { border: '1px dashed #94a3b8', padding: 6, borderRadius: 6 }, children: [] };
    return { type: 'child', node: elNode };
  }

  // ── Text ──
  if (name === 'text') {
    return { type: 'child', node: { type: 'text', styles: {}, children: [], content: args.length >= 1 ? parseStringArg(a0()) : '' } };
  }

  // ── Image ──
  if (name === 'image') {
    return { type: 'child', node: { type: 'image', styles: {}, children: [], content: args.length >= 1 ? parseStringArg(a0()) : 'placeholder' } };
  }

  // ── Lines ──
  if (name === 'linehorizontal' || name === 'line') {
    const sz = args.length >= 1 ? parseNumberArg(a0()) : 1;
    return { type: 'child', node: { type: 'line', styles: { borderTop: `${sz}px solid ${node.styles.borderColor || '#000'}`, width: '100%', height: `${sz}px` }, children: [] } };
  }
  if (name === 'linevertical') {
    const sz = args.length >= 1 ? parseNumberArg(a0()) : 1;
    return { type: 'child', node: { type: 'line', styles: { borderLeft: `${sz}px solid ${node.styles.borderColor || '#000'}`, height: '100%', width: `${sz}px` }, children: [] } };
  }

  // ── Row (with lambda) ──
  if (name === 'row') {
    return { type: 'child', node: { type: 'row', styles: { display: 'flex', flexDirection: 'row', width: '100%' }, children: [] } };
  }

  // ── Column (with lambda) ──
  if (name === 'column') {
    return { type: 'child', node: { type: 'column', styles: { display: 'flex', flexDirection: 'column' }, children: [] } };
  }

  // ── ConstantItem / RelativeItem / AutoItem ──
  if (name === 'constantitem') {
    const w = args.length >= 1 ? parseNumberArg(a0()) : 100;
    return { type: 'child', node: { type: 'container', styles: { width: w, flexShrink: 0 }, children: [] } };
  }
  if (name === 'relativeitem') {
    const flex = args.length >= 1 ? parseNumberArg(a0()) : 1;
    return { type: 'child', node: { type: 'container', styles: { flex }, children: [] } };
  }
  if (name === 'autoitem') {
    return { type: 'child', node: { type: 'container', styles: { flex: '0 0 auto' }, children: [] } };
  }

  // ── Table ──
  if (name === 'table') {
    return { type: 'child', node: { type: 'table', styles: { width: '100%', borderCollapse: 'collapse' }, children: [] } };
  }

  // ── Header ──
  if (name === 'header') {
    return { type: 'child', node: { type: 'header', styles: { fontWeight: 'bold', fontSize: 18 }, children: [] } };
  }

  // ── Placeholder ──
  if (name === 'placeholder') {
    return { type: 'child', node: { type: 'placeholder', styles: { background: '#e5e7eb', border: '2px dashed #9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 40, color: '#6b7280', fontSize: 12 }, children: [], content: args.length >= 1 ? parseStringArg(a0()) : 'Placeholder' } };
  }

  // ── DefaultTextStyle / Page etc. — no-ops ──
  if (name === 'defaulttextstyle' || name === 'page' || name === 'content' || name === 'footer') {
    return { type: 'style' };
  }

  // Unknown — treat as no-op style
  return { type: 'style' };
}

// ── Recursive descent parser ─────────────────────────────────────────
// Handles real QuestPDF code with nested lambda blocks { }

function preprocess(code: string): string {
  // Remove using/namespace/class/void wrappers, comments, variable declarations
  let cleaned = code;
  // Remove single-line comments
  cleaned = cleaned.replace(/\/\/.*$/gm, '');
  // Remove multi-line comments
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove using statements
  cleaned = cleaned.replace(/using\s+[^;]+;/g, '');
  // Remove variable declarations like: byte[] logoBytes; var x = ...; etc.
  cleaned = cleaned.replace(/^\s*(var|byte\[\]|string|int|bool|float|double|decimal)\s+\w+[\s\S]*?;/gm, '');
  // Remove using blocks like: using (var client = ...) { ... }
  cleaned = cleaned.replace(/using\s*\([^)]*\)[^;]*;/g, '');
  // Remove void MethodName(IContainer ...) { wrapper
  cleaned = cleaned.replace(/void\s+\w+\s*\([^)]*\)\s*\{?/g, '');
  // Remove Document.Create( container => {
  cleaned = cleaned.replace(/Document\s*\.\s*Create\s*\(\s*\w+\s*=>\s*\{?/g, '');
  // Remove container.Page(page => {
  cleaned = cleaned.replace(/\w+\s*\.\s*Page\s*\(\s*\w+\s*=>\s*\{?/g, '');
  // Remove page.Content().
  cleaned = cleaned.replace(/\w+\s*\.\s*(Content|Header|Footer)\s*\(\s*\)\s*\./g, '.');
  return cleaned;
}

/**
 * Split code into top-level statements by semicolons that are not inside braces/parens/strings.
 * This handles both multi-line code (newline-separated) and single-line lambda bodies
 * where multiple statements appear separated by `;`.
 */
function splitTopLevelStatements(code: string): string[] {
  const statements: string[] = [];
  let current = '';
  let braceDepth = 0;
  let parenDepth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < code.length; i++) {
    const ch = code[i];

    if (inString) {
      current += ch;
      if (ch === stringChar && code[i - 1] !== '\\') inString = false;
      continue;
    }

    if (ch === '"' || ch === "'") {
      inString = true;
      stringChar = ch;
      current += ch;
      continue;
    }

    if (ch === '{') braceDepth++;
    else if (ch === '}') braceDepth--;
    else if (ch === '(') parenDepth++;
    else if (ch === ')') parenDepth--;

    if (ch === ';' && braceDepth <= 0 && parenDepth <= 0) {
      // End of a top-level statement
      if (current.trim()) statements.push(current.trim());
      current = '';
      continue;
    }

    current += ch;
  }

  if (current.trim()) statements.push(current.trim());
  return statements;
}

function parseBlockContent(code: string, parent: QuestPdfNode): void {
  // First, split by top-level semicolons to separate statements
  const topStatements = splitTopLevelStatements(code);

  for (const stmtBlock of topStatements) {
    // Each statement block may span multiple lines (e.g., chained method calls)
    // Accumulate lines that are continuations (start with '.')
    const lines = stmtBlock.split('\n');
    let buffer = '';

    for (let li = 0; li < lines.length; li++) {
      const trimmed = lines[li].trim();
      if (!trimmed) continue;
      // Skip pure lambda parameter lines like "column =>"
      if (/^\w+\s*=>$/.test(trimmed)) continue;
      // Skip standalone brace/paren lines when NOT accumulating
      if (buffer.trim() === '') {
        if (trimmed === '{' || trimmed === '}' || trimmed === '};' || trimmed === ');') continue;
      }

      buffer += '\n' + trimmed;

      // Check brace/paren balance
      let braceDepth = 0;
      let parenDepth = 0;
      for (const ch of buffer) {
        if (ch === '{') braceDepth++;
        else if (ch === '}') braceDepth--;
        else if (ch === '(') parenDepth++;
        else if (ch === ')') parenDepth--;
      }

      if (braceDepth <= 0 && parenDepth <= 0) {
        // Check if next non-empty line starts with '.' (continuation of chain)
        let isContinuation = false;
        for (let j = li + 1; j < lines.length; j++) {
          const nt = lines[j].trim();
          if (nt) { isContinuation = nt.startsWith('.'); break; }
        }

        if (!isContinuation) {
          processStatement(buffer.trim(), parent);
          buffer = '';
        }
      }
    }

    if (buffer.trim()) {
      processStatement(buffer.trim(), parent);
    }
  }
}

function processStatement(stmt: string, parent: QuestPdfNode): void {
  if (!stmt) return;

  // Remove leading identifier references like "row." "column." "container."
  let cleaned = stmt.replace(/^\w+\s*\./, '.');

  // If doesn't start with dot, try to find the first dot-method
  if (!cleaned.startsWith('.')) {
    const dotIdx = cleaned.indexOf('.');
    if (dotIdx >= 0) {
      cleaned = cleaned.slice(dotIdx);
    } else {
      return; // no methods to parse
    }
  }

  // Build a temporary container to accumulate styles before finding child elements
  const tempNode: QuestPdfNode = { type: 'container', styles: {}, children: [] };
  const methods = tokenizeMethodsAdvanced(cleaned);

  let currentTarget = tempNode;
  // addTo tracks WHERE the next child should be added
  // Starts as parent, but when a non-lambda child is created, subsequent children go into it
  let addTo: QuestPdfNode = parent;
  let anyChildCreated = false;

  for (const mc of methods) {
    const result = applyMethodToNode(currentTarget, mc);

    if (result.type === 'child') {
      const childNode = result.node;

      if (mc.hasLambda) {
        // Extract the lambda body from the raw string
        const braceIdx = mc.raw.indexOf('{');
        if (braceIdx >= 0) {
          const innerEnd = mc.raw.lastIndexOf('}');
          if (innerEnd > braceIdx) {
            const innerCode = mc.raw.slice(braceIdx + 1, innerEnd);
            parseBlockContent(innerCode, childNode);
          }
        }
        // Apply accumulated styles to the lambda child
        applyAccumulatedStyles(tempNode, childNode);
        addTo.children.push(childNode);
        // After a lambda, reset — subsequent items are siblings at parent level
        addTo = parent;
        currentTarget = tempNode;
        tempNode.styles = {};
        anyChildCreated = true;
      } else {
        // Non-lambda child (Text, Image, Item, ConstantItem, etc.)
        applyAccumulatedStyles(tempNode, childNode);
        addTo.children.push(childNode);
        // Subsequent children/lambdas go inside this child
        addTo = childNode;
        currentTarget = childNode;
        tempNode.styles = {};
        anyChildCreated = true;
      }
    }
    // style already applied to currentTarget
  }

  // If we only accumulated styles with no child, apply them to parent
  if (!anyChildCreated && Object.keys(tempNode.styles).length > 0) {
    Object.assign(parent.styles, tempNode.styles);
  }
}

function applyAccumulatedStyles(from: QuestPdfNode, to: QuestPdfNode): void {
  for (const [key, value] of Object.entries(from.styles)) {
    if (!(key in to.styles)) {
      to.styles[key] = value;
    }
  }
}

// ── Main parse function ──────────────────────────────────────────────

export function parseQuestPdfCode(code: string): ParseResult {
  const errors: string[] = [];

  try {
    const cleaned = preprocess(code);
    const root: QuestPdfNode = {
      type: 'container',
      styles: { display: 'flex', flexDirection: 'column' },
      children: [],
    };

    parseBlockContent(cleaned, root);

    // Fallback: if nothing parsed, try the simple flat chain approach
    if (root.children.length === 0 && code.trim().length > 0) {
      const flatCode = cleaned.replace(/\n/g, ' ').trim();
      if (flatCode.startsWith('.') || /^\w+\s*\./.test(flatCode)) {
        processStatement(flatCode, root);
      }
    }

    // Second fallback: brute force tokenize all methods in the whole code
    if (root.children.length === 0 && code.trim().length > 0) {
      const allMethods = tokenizeMethodsAdvanced(code);
      if (allMethods.length > 0) {
        let currentNode = root;
        for (const mc of allMethods) {
          const result = applyMethodToNode(currentNode, mc);
          if (result.type === 'child') {
            root.children.push(result.node);
            currentNode = result.node;
          }
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
