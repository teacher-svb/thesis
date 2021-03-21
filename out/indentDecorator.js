"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorateIndent = void 0;
const vscode = require("vscode");
const decorations = [];
const decorationRanges = [];
var DecorationPurpose;
(function (DecorationPurpose) {
    DecorationPurpose[DecorationPurpose["TITLE"] = 0] = "TITLE";
    DecorationPurpose[DecorationPurpose["END"] = 1] = "END";
    DecorationPurpose[DecorationPurpose["CODE"] = 2] = "CODE";
    DecorationPurpose[DecorationPurpose["INDENT"] = 3] = "INDENT";
})(DecorationPurpose || (DecorationPurpose = {}));
var CodeBlockType;
(function (CodeBlockType) {
    CodeBlockType[CodeBlockType["function"] = 0] = "function";
    CodeBlockType[CodeBlockType["class"] = 1] = "class";
    CodeBlockType[CodeBlockType["other"] = 2] = "other";
})(CodeBlockType || (CodeBlockType = {}));
class CodeBlock {
    constructor(range, type, indentLevel) {
        this.range = range;
        this.type = type;
        this.indentLevel = indentLevel;
    }
    decorate() {
        // if (this.type != CodeBlockType.function) return;
        var _a, _b;
        const tabsize = (_a = vscode.workspace.getConfiguration('editor').get('tabSize')) !== null && _a !== void 0 ? _a : 4;
        const useSpaces = (_b = vscode.workspace.getConfiguration('editor').get('insertSpaces')) !== null && _b !== void 0 ? _b : true;
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
        const endStart = (this.indentLevel) * tabsize;
        const endEnd = 999;
        const endRange = new vscode.Range(this.range.end.line, endStart, this.range.end.line, endEnd);
        addDecoration(this.indentLevel, this.type, endRange, DecorationPurpose.END);
    }
}
const codeblocks = [];
function decorateIndent(editor) {
    var _a;
    // get the current indentation method, as defined by the settings
    vscode.workspace.getConfiguration().update('editor.lineHeight', 25, vscode.ConfigurationTarget.Workspace);
    vscode.workspace.getConfiguration().update('editor.formatOnType', true, vscode.ConfigurationTarget.Workspace);
    vscode.workspace.getConfiguration().update('editor.formatOnSave', true, vscode.ConfigurationTarget.Workspace);
    // vscode.commands.executeCommand('editor.action.formatDocument');
    const useSpaces = (_a = vscode.workspace.getConfiguration('editor').get('insertSpaces')) !== null && _a !== void 0 ? _a : true;
    useSpaces ? vscode.commands.executeCommand('editor.action.indentationToSpaces')
        : vscode.commands.executeCommand('editor.action.indentationToTabs');
    fillEmptyLines(editor);
    vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', editor.document.uri).then(symbols => {
        decorationRanges.forEach(options => {
            options[DecorationPurpose.TITLE].length = 0;
            options[DecorationPurpose.END].length = 0;
            options[DecorationPurpose.CODE].length = 0;
            options[DecorationPurpose.INDENT].length = 0;
        });
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
        });
    });
}
exports.decorateIndent = decorateIndent;
function findRanges(editor) {
    var _a, _b;
    // get the current indentation method, as defined by the settings
    const tabsize = (_a = vscode.workspace.getConfiguration('editor').get('tabSize')) !== null && _a !== void 0 ? _a : 4;
    const useSpaces = (_b = vscode.workspace.getConfiguration('editor').get('insertSpaces')) !== null && _b !== void 0 ? _b : true;
    const openRanges = [];
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
            const start = openRanges.pop();
            const end = new vscode.Position(lineNum, 999);
            if (start && end) {
                // closedRanges.push(new vscode.Range(start, end));
                let codeBlock = new CodeBlock(new vscode.Range(start, end), CodeBlockType.other, indentLevel);
                codeblocks.push(codeBlock);
            }
        }
    });
}
function refineRangesBySymbols(editor, symbols) {
    symbols === null || symbols === void 0 ? void 0 : symbols.forEach(symbol => {
        refineRangesBySymbolsRecursive(editor, symbol);
    });
}
function refineRangesBySymbolsRecursive(editor, symbol) {
    switch (symbol.kind) {
        case vscode.SymbolKind.Function:
            refineRange(symbol.range, CodeBlockType.function);
            break;
        default:
            break;
    }
    symbol.children.forEach(child => {
        refineRangesBySymbolsRecursive(editor, child);
    });
}
function refineRange(range, type) {
    const codeblock = codeblocks.find(cb => {
        return cb.range.start.line == range.start.line && cb.range.end.line == range.end.line;
    });
    if (codeblock)
        codeblock.type = type;
}
function fillEmptyLines(editor) {
    var _a, _b;
    // get the current indentation method, as defined by the settings
    const tabsize = (_a = vscode.workspace.getConfiguration('editor').get('tabSize')) !== null && _a !== void 0 ? _a : 4;
    const useSpaces = (_b = vscode.workspace.getConfiguration('editor').get('insertSpaces')) !== null && _b !== void 0 ? _b : true;
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
        });
    });
}
function addDecoration(indentLevel, type, range, purpose) {
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
    const titleDecOptions = [];
    const endDecOptions = [];
    const indentDecOptions = [];
    const codeDecOptions = [];
    return {
        [DecorationPurpose.TITLE]: titleDecOptions,
        [DecorationPurpose.END]: endDecOptions,
        [DecorationPurpose.INDENT]: indentDecOptions,
        [DecorationPurpose.CODE]: codeDecOptions
    };
}
function createDecorationType(type) {
    const typeColors = {
        [CodeBlockType.class]: '255, 100, 100',
        [CodeBlockType.function]: '100, 255, 100',
        [CodeBlockType.other]: '100, 100, 255'
    };
    const color = typeColors[type];
    const titleDecType = vscode.window.createTextEditorDecorationType({
        backgroundColor: `rgba(${color}, 0.5)`,
        outline: `2px solid rgba(${color}, 1)`,
        before: {
            backgroundColor: `rgba(${color}, 1)`,
            width: '2px',
            height: '50%',
            contentText: '',
            margin: '-100% 0 0 0'
        }
    });
    const endDecType = vscode.window.createTextEditorDecorationType({
        backgroundColor: `rgba(${color}, 0.5)`,
        outline: `2px solid rgba(${color}, 1)`,
    });
    const codeDecType = vscode.window.createTextEditorDecorationType({
    // backgroundColor: 'rgba(255, 200, 200, 0.5)',
    });
    const indentDecType = vscode.window.createTextEditorDecorationType({
        backgroundColor: `rgba(${color}, 0.25)`,
        before: {
            backgroundColor: `rgba(${color}, 1)`,
            width: '2px',
            height: '100%',
            contentText: '',
            margin: '-100% 0 0 0'
        }
    });
    return {
        [DecorationPurpose.TITLE]: titleDecType,
        [DecorationPurpose.END]: endDecType,
        [DecorationPurpose.INDENT]: indentDecType,
        [DecorationPurpose.CODE]: codeDecType
    };
}
//# sourceMappingURL=indentDecorator.js.map