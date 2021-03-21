import * as vscode from "vscode";


// from decoration tut
const functionDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    isWholeLine: true
})
const ifDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    isWholeLine: true
})

const functionDecorations: vscode.DecorationOptions[] = [];
const ifDecorations: vscode.DecorationOptions[] = [];

export function decorate(editor: vscode.TextEditor): void {
    let code = editor.document.getText();

    const document = editor.document;

    vscode.commands.executeCommand<vscode.DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', document.uri).then(symbols => {
        symbols?.forEach(symbol => {
            decorateSymbolRecursive(symbol);
        });
    });


    editor.setDecorations(functionDecorationType, functionDecorations);
    editor.setDecorations(ifDecorationType, ifDecorations);
}

function decorateSymbolRecursive(symbol: vscode.DocumentSymbol) {
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