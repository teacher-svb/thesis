"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const indentDecorator_1 = require("./indentDecorator");
function activate(context) {
    console.log("Congratulations, your extension is now active!");
    // get the current indentation method, as defined by the settings
    vscode.workspace.getConfiguration().update('editor.lineHeight', 25, vscode.ConfigurationTarget.Workspace);
    vscode.workspace.getConfiguration().update('editor.formatOnType', true, vscode.ConfigurationTarget.Workspace);
    vscode.workspace.getConfiguration().update('editor.formatOnSave', true, vscode.ConfigurationTarget.Workspace);
    vscode.workspace.getConfiguration().update('editor.renderWhitespace', false, vscode.ConfigurationTarget.Workspace);
    vscode.workspace.getConfiguration().update('files.autoSave', 'afterDelay', vscode.ConfigurationTarget.Workspace);
    vscode.workspace.getConfiguration().update('files.autoSaveDelay', 500, vscode.ConfigurationTarget.Workspace);
    vscode.window.onDidChangeVisibleTextEditors(event => {
        event.forEach(openEditor => {
            indentDecorator_1.decorateIndent(openEditor);
        });
    });
    vscode.workspace.onWillSaveTextDocument(event => {
        const openEditor = vscode.window.visibleTextEditors.filter(editor => editor.document.uri === event.document.uri)[0];
        indentDecorator_1.decorateIndent(openEditor);
    });
    if (vscode.window.activeTextEditor) {
        indentDecorator_1.decorateIndent(vscode.window.activeTextEditor);
    }
    wait(1000).then(() => {
        if (vscode.window.activeTextEditor) {
            indentDecorator_1.decorateIndent(vscode.window.activeTextEditor);
        }
    });
    wait(2000).then(() => {
        if (vscode.window.activeTextEditor) {
            indentDecorator_1.decorateIndent(vscode.window.activeTextEditor);
        }
    });
    wait(3000).then(() => {
        if (vscode.window.activeTextEditor) {
            indentDecorator_1.decorateIndent(vscode.window.activeTextEditor);
        }
    });
    wait(4000).then(() => {
        if (vscode.window.activeTextEditor) {
            indentDecorator_1.decorateIndent(vscode.window.activeTextEditor);
        }
    });
}
exports.activate = activate;
function wait(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
function deactivate() {
    // get the current indentation method, as defined by the settings
    vscode.workspace.getConfiguration().update('editor.lineHeight', 0, vscode.ConfigurationTarget.Workspace);
    vscode.workspace.getConfiguration().update('editor.formatOnType', false, vscode.ConfigurationTarget.Workspace);
    vscode.workspace.getConfiguration().update('editor.formatOnSave', false, vscode.ConfigurationTarget.Workspace);
    vscode.workspace.getConfiguration().update('editor.renderWhitespace', true, vscode.ConfigurationTarget.Workspace);
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map