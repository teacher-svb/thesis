"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const indentDecorator_1 = require("./indentDecorator");
function activate(context) {
    var _a, _b;
    console.log("Congratulations, your extension is now active!");
    // get the current indentation method, as defined by the settings
    vscode.workspace.getConfiguration().update('editor.lineHeight', 25, vscode.ConfigurationTarget.Workspace);
    vscode.workspace.getConfiguration().update('editor.formatOnType', true, vscode.ConfigurationTarget.Workspace);
    vscode.workspace.getConfiguration().update('editor.formatOnSave', true, vscode.ConfigurationTarget.Workspace);
    vscode.workspace.getConfiguration().update('editor.renderWhitespace', 'none', vscode.ConfigurationTarget.Workspace);
    vscode.workspace.getConfiguration().update('files.autoSave', 'afterDelay', vscode.ConfigurationTarget.Workspace);
    vscode.workspace.getConfiguration().update('files.autoSaveDelay', 500, vscode.ConfigurationTarget.Workspace);
    const tabsize = (_a = vscode.workspace.getConfiguration('editor').get('tabSize')) !== null && _a !== void 0 ? _a : 4;
    const useSpaces = (_b = vscode.workspace.getConfiguration('editor').get('insertSpaces')) !== null && _b !== void 0 ? _b : true;
    useSpaces ? vscode.commands.executeCommand('editor.action.indentationToSpaces')
        : vscode.commands.executeCommand('editor.action.indentationToTabs');
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
    vscode.workspace.getConfiguration().update('editor.renderWhitespace', 'all', vscode.ConfigurationTarget.Workspace);
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map