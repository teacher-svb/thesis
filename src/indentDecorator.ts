import * as vscode from "vscode";

const decorations: any[] = [];
const decorationRanges: any[] = [];

enum DecorationPurpose {
    TITLE,
    END,
    CODE,
    INDENT
}

enum CodeBlockType {
    function,
    class,
    other
}

class CodeBlock {
    range: vscode.Range;
    type: CodeBlockType;
    indentLevel: number;
    constructor(range: vscode.Range, type: CodeBlockType, indentLevel: number) {
        this.range = range;
        this.type = type;
        this.indentLevel = indentLevel;
    }

    decorate() {
        // if (this.type != CodeBlockType.function) return;

        const tabsize = vscode.workspace.getConfiguration('editor').get<number>('tabSize') ?? 4;
        const useSpaces = vscode.workspace.getConfiguration('editor').get<boolean>('insertSpaces') ?? true;

        for (let line = this.range.start.line + 1; line <= this.range.end.line; ++line) {
            const startChar = useSpaces ? tabsize * this.indentLevel : this.indentLevel;
            const endChar = useSpaces ? startChar + tabsize : startChar + 1;
            const range = new vscode.Range(line, startChar, line, endChar);
            addDecoration(this.indentLevel, this.type, range, DecorationPurpose.INDENT);
        }
        const titleStart = (this.indentLevel) * tabsize;
        const titleEnd = 999;
        const titleRange = new vscode.Range(this.range.start.line, titleStart, this.range.start.line, titleEnd);
        addDecoration(this.indentLevel, this.type, titleRange, DecorationPurpose.TITLE);

        // const endStart = (this.indentLevel) * tabsize;
        // const endEnd = 999;
        // const endRange = new vscode.Range(this.range.end.line, endStart, this.range.end.line, endEnd);
        // addDecoration(this.indentLevel, this.type, endRange, DecorationPurpose.END);
    }
}

const codeblocks: CodeBlock[] = [];

export function decorateIndent(editor: vscode.TextEditor): void {

    // vscode.commands.executeCommand('editor.action.formatDocument');

    const useSpaces = vscode.workspace.getConfiguration('editor').get<boolean>('insertSpaces') ?? true;
    useSpaces ? vscode.commands.executeCommand('editor.action.indentationToSpaces')
        : vscode.commands.executeCommand('editor.action.indentationToTabs');

    fillEmptyLines(editor);

    vscode.commands.executeCommand<vscode.DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', editor.document.uri).then(symbols => {
        decorationRanges.forEach(options => {
            options[DecorationPurpose.TITLE].length = 0;
            options[DecorationPurpose.END].length = 0;
            options[DecorationPurpose.CODE].length = 0;
            options[DecorationPurpose.INDENT].length = 0;
        })

        codeblocks.length = 0;

        findRanges(editor);
        if (symbols)
            refineRangesBySymbols(editor, symbols);

        codeblocks.forEach(cb => cb.decorate());


        decorationRanges.forEach((options, index) => {
            if (options != null) {
                editor.setDecorations(decorations[index][DecorationPurpose.TITLE], options[DecorationPurpose.TITLE]);
                editor.setDecorations(decorations[index][DecorationPurpose.END], options[DecorationPurpose.END]);
                editor.setDecorations(decorations[index][DecorationPurpose.INDENT], options[DecorationPurpose.INDENT]);
                editor.setDecorations(decorations[index][DecorationPurpose.CODE], options[DecorationPurpose.CODE]);
            }
        })
    });
}

function findRanges(editor: vscode.TextEditor) {
    // get the current indentation method, as defined by the settings
    const tabsize = vscode.workspace.getConfiguration('editor').get<number>('tabSize') ?? 4;
    const useSpaces = vscode.workspace.getConfiguration('editor').get<boolean>('insertSpaces') ?? true;

    const openRanges: vscode.Position[] = [];
    // const closedRanges: vscode.Range[] = [];

    let indentLevel = -1;
    let lineNum = -1;
    const lines = editor.document.getText().split('\n');
    lines.forEach(line => {
        lineNum++;
        let amountOfWhitespaces = line.search(/\S|$/);
        let newIndentLevel = useSpaces ? Math.floor(amountOfWhitespaces / tabsize) : amountOfWhitespaces;
        let indentDelta = line.trim().length !== 0 && indentLevel >= 0 ? newIndentLevel - indentLevel : 0;
        indentLevel = line.trim().length !== 0 ? newIndentLevel : indentLevel;

        // discard indent level 0
        if (indentLevel === 0 && indentDelta >= 0) {
            return;
        }

        if (indentDelta > 0) {
            openRanges.push(new vscode.Position(lineNum - 1, 0));
        }
        if (indentDelta < 0) {

            for (let i = 0; i < Math.abs(indentDelta); ++i) {
                const start = openRanges.pop();
                const end = new vscode.Position(lineNum - 1, 999);
                if (start && end) {
                    // closedRanges.push(new vscode.Range(start, end));
                    let startLineWhitespaces = lines[start.line].search(/\S|$/);
                    let startLineIndentLevel = useSpaces ? Math.floor(startLineWhitespaces / tabsize) : startLineWhitespaces;
                    let codeBlock = new CodeBlock(new vscode.Range(start, end), CodeBlockType.other, startLineIndentLevel);
                    codeblocks.push(codeBlock);
                }
            }
        }
    });

}

function refineRangesBySymbols(editor: vscode.TextEditor, symbols: vscode.DocumentSymbol[]) {
    symbols?.forEach(symbol => {
        refineRangesBySymbolsRecursive(editor, symbol);
    });
}

function refineRangesBySymbolsRecursive(editor: vscode.TextEditor, symbol: vscode.DocumentSymbol) {
    switch (symbol.kind) {
        case vscode.SymbolKind.Interface:
        case vscode.SymbolKind.Object:
        case vscode.SymbolKind.Class:
            refineRange(symbol.range, CodeBlockType.class);
            break;
        case vscode.SymbolKind.Function:
        case vscode.SymbolKind.Method:
        case vscode.SymbolKind.Constructor:
            refineRange(symbol.range, CodeBlockType.function);
            break;
        default:
            break;
    }

    symbol.children.forEach(child => {
        refineRangesBySymbolsRecursive(editor, child);
    });
}

function refineRange(range: vscode.Range, type: CodeBlockType) {
    const codeblock = codeblocks.find(cb => {
        return cb.range.start.line == range.start.line;// && cb.range.end.line == range.end.line;
    });
    if (codeblock)
        codeblock.type = type;
}

function fillEmptyLines(editor: vscode.TextEditor) {
    // get the current indentation method, as defined by the settings
    const tabsize = vscode.workspace.getConfiguration('editor').get<number>('tabSize') ?? 4;
    const useSpaces = vscode.workspace.getConfiguration('editor').get<boolean>('insertSpaces') ?? true;
    vscode.workspace.getConfiguration().update('editor.lineHeight', 25, vscode.ConfigurationTarget.Workspace);

    useSpaces ? vscode.commands.executeCommand('editor.action.indentationToSpaces')
        : vscode.commands.executeCommand('editor.action.indentationToTabs');


    let indentLevel = -1;
    let lineNum = -1;
    const lines = editor.document.getText().split('\n');
    editor.edit(edit => {
        lines.forEach(line => {
            lineNum++;
            const amountOfWhitespaces = line.search(/\S|$/);
            const newIndentLevel = useSpaces ? Math.floor(amountOfWhitespaces / tabsize) : amountOfWhitespaces;
            indentLevel = line.trim().length !== 0 ? newIndentLevel : indentLevel;

            // add indentation to empty lines
            if (line.trim().length === 0) {
                const indentSpaces = '' + (useSpaces ? ' '.repeat(tabsize * indentLevel) : '\t'.repeat(indentLevel));
                edit.replace(new vscode.Range(lineNum, 0, lineNum, 999), indentSpaces);
            }
        })
    });
}

function addDecoration(indentLevel: number, type: CodeBlockType, range: vscode.Range, purpose: DecorationPurpose) {
    let decoration = { range };

    if (decorationRanges[type] == null) {
        decorationRanges[type] = createDecorationOption();
    }
    if (decorations[type] == null) {
        decorations[type] = createDecorationType(type);
    }

    decorationRanges[type][purpose].push(decoration);
}

function createDecorationOption() {
    const titleDecOptions: vscode.DecorationOptions[] = [];
    const endDecOptions: vscode.DecorationOptions[] = [];
    const indentDecOptions: vscode.DecorationOptions[] = [];
    const codeDecOptions: vscode.DecorationOptions[] = [];

    return {
        [DecorationPurpose.TITLE]: titleDecOptions,
        [DecorationPurpose.END]: endDecOptions,
        [DecorationPurpose.INDENT]: indentDecOptions,
        [DecorationPurpose.CODE]: codeDecOptions
    }
}

function createDecorationType(type: CodeBlockType) {

    // returns the type of color theme: light (1), dark (2) or high contrast (3)
    // vscode.window.activeColorTheme.kind;

    const typeColors = {
        [CodeBlockType.class]: '255, 100, 100',
        [CodeBlockType.function]: '100, 255, 100',
        [CodeBlockType.other]: '100, 100, 255'
    }

    const opacity = vscode.window.activeColorTheme.kind === 2 ? 0.1 : 0.5;

    const color = typeColors[type];

    const titleDecType = vscode.window.createTextEditorDecorationType({
        // color: '#000',
        backgroundColor: `rgba(${color}, ${opacity})`,
        border: `2px solid rgba(${color}, ${Math.max(opacity * 2, 0.5)})`,
        fontWeight: 'bold',
        before: {
            backgroundColor: `rgba(${color}, ${Math.max(opacity * 2, 0.5)})`,
            width: '4px',
            height: '67%',
            contentText: ' ',
            margin: `-67% 0 0 0`
        }
    })
    const endDecType = vscode.window.createTextEditorDecorationType({
        // backgroundColor: `rgba(${color}, 0.5)`,
        // outline: `2px solid rgba(${color}, 1)`,
        // before: {
        //     backgroundColor: `rgba(${color}, 1)`,
        //     width: '2px',
        //     height: '150%',
        //     contentText: '',
        //     margin: '-50% 0 0 0'
        // }
    })
    const codeDecType = vscode.window.createTextEditorDecorationType({
        // backgroundColor: 'rgba(255, 200, 200, 0.5)',
    })
    const indentDecType = vscode.window.createTextEditorDecorationType({
        backgroundColor: `rgba(${color}, ${opacity})`,
        before: {
            backgroundColor: `rgba(${color}, ${Math.max(opacity * 2, 0.5)})`,
            width: '4px',
            height: '100%',
            contentText: ' ',
            margin: `-100% 0 0 0`
        }
    })

    return {
        [DecorationPurpose.TITLE]: titleDecType,
        [DecorationPurpose.END]: endDecType,
        [DecorationPurpose.INDENT]: indentDecType,
        [DecorationPurpose.CODE]: codeDecType
    }
}