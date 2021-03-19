"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const decorate_1 = require("./decorate");
// from decoration tut
const decorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'green',
    border: '2px solid white',
});
function activate(context) {
    console.log("Congratulations, your extension is now active!");
    vscode.workspace.onWillSaveTextDocument(event => {
        const openEditor = vscode.window.visibleTextEditors.filter(editor => editor.document.uri === event.document.uri)[0];
        decorate_1.decorate(openEditor);
        // decorateIndent(openEditor);
    });
}
exports.activate = activate;
function write(code) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        throw new Error("There's no active editor");
    }
    const edit = new vscode.WorkspaceEdit();
    const wholeDocument = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(editor.document.lineCount, 0));
    const updateCode = new vscode.TextEdit(wholeDocument, code);
    edit.set(editor.document.uri, [updateCode]);
    vscode.workspace.applyEdit(edit);
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map