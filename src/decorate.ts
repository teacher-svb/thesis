// import { parse } from "@babel/parser";
// import traverse from "@babel/traverse";
// import generate from "@babel/generator";
// import * as t from "@babel/types";
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

    // const ast = parse(code);
    // traverse(ast, {
    //     FunctionDeclaration(path) {
    //         decorateFunction(path.node);
    //     },
    //     IfStatement(path) {
    //         decorateIfStatement(path.node);
    //     }
    // });

    const document = editor.document;

    vscode.commands.executeCommand<vscode.DocumentSymbol[]>('vscode.executeDocumentSymbolProvider', document.uri).then(symbols => {
        symbols?.forEach(symbol => {
            decorateSymbolRecursive(symbol);
        });
    });

    // vscode.commands.executeCommand<vscode.DocumentHighlight[]>('vscode.executeDocumentHighlights', document.uri, document.positionAt(0)).then(highlights => {
    //     console.log(highlights);
    // })

    // vscode.commands.executeCommand<vscode.SemanticTokensLegend>('vscode.provideDocumentSemanticTokensLegend', document.uri).then(tokenslegend => {
    //     vscode.commands.executeCommand<vscode.SemanticTokens>('vscode.provideDocumentSemanticTokens', document.uri).then(tokens => {
    //         if (tokens) {
    //             let line = 0;
    //             let column = 0;
    //             for (let i = 0; i < tokens.data.length; i += 5) {
    //                 let deltaline = tokens.data[i];
    //                 let deltacolumn = tokens.data[i + 1];
    //                 line += deltaline;
    //                 if (deltaline > 0)
    //                     column = 0;
    //                 column += deltacolumn;
    //                 let length = tokens.data[i + 2];
    //                 let type = tokenslegend?.tokenTypes[tokens.data[i + 3]];
    //                 let modifier = tokenslegend?.tokenModifiers[tokens.data[i + 4]];

    //                 let range = new vscode.Range(line, column, line, column + length);
    //                 let text = document.getText(range);

    //                 // console.log(
    //                 //     `${text}: \t`,
    //                 //     `line: ${line}\t`,
    //                 //     `column: ${column}\t`,
    //                 //     `length: ${length}\t`,
    //                 //     `type: ${type}\t`,
    //                 //     `modifier: ${modifier}`
    //                 // );
    //             }
    //         }
    //     });
    // });


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

// function decorateFunction(node: t.FunctionDeclaration): void {
//     const location = node.loc;
//     if (!location)
//         throw new Error("node not found");

//     let range = new vscode.Range(
//         new vscode.Position(location.start.line - 1, location.start.column),
//         new vscode.Position(location.end.line - 1, location.end.column)
//     );

//     let decoration = { range };
//     functionDecorations.push(decoration);
// }

// function decorateIfStatement(node: t.IfStatement): void {
//     const location = node.loc;
//     if (!location)
//         throw new Error("node not found");

//     let range = new vscode.Range(
//         new vscode.Position(location.start.line - 1, location.start.column),
//         new vscode.Position(location.end.line - 1, location.end.column)
//     );

//     let decoration = { range };
//     ifDecorations.push(decoration);
// }