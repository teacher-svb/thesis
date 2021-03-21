"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorate = void 0;
const vscode = require("vscode");
// from decoration tut
const functionDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    isWholeLine: true
});
const ifDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    isWholeLine: true
});
const functionDecorations = [];
const ifDecorations = [];
function decorate(editor) {
    let code = editor.document.getText();
    const document = editor.document;
    vscode.commands.executeCommand('vscode.executeDocumentSymbolProvider', document.uri).then(symbols => {
        symbols === null || symbols === void 0 ? void 0 : symbols.forEach(symbol => {
            decorateSymbolRecursive(symbol);
        });
    });
    editor.setDecorations(functionDecorationType, functionDecorations);
    editor.setDecorations(ifDecorationType, ifDecorations);
}
exports.decorate = decorate;
function decorateSymbolRecursive(symbol) {
    let range = symbol.range;
    let decoration = { range };
    switch (symbol.kind) {
        case vscode.SymbolKind.Function:
            functionDecorations.push(decoration);
            break;
        default:
            break;
    }
    symbol.children.forEach(child => {
        decorateSymbolRecursive(child);
    });
}
//# sourceMappingURL=decorate.js.map