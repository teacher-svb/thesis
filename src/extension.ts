import * as vscode from "vscode";
import { decorateIndent } from "./indentDecorator";

export function activate(context: vscode.ExtensionContext) {
	console.log("Congratulations, your extension is now active!");

	// get the current indentation method, as defined by the settings
	vscode.workspace.getConfiguration().update('editor.lineHeight', 25, vscode.ConfigurationTarget.Workspace);
	vscode.workspace.getConfiguration().update('editor.formatOnType', true, vscode.ConfigurationTarget.Workspace);
	vscode.workspace.getConfiguration().update('editor.formatOnSave', true, vscode.ConfigurationTarget.Workspace);
	vscode.workspace.getConfiguration().update('editor.renderWhitespace', false, vscode.ConfigurationTarget.Workspace);


	vscode.window.onDidChangeVisibleTextEditors(event => {
		event.forEach(openEditor => {
			decorateIndent(openEditor);
		})
	});

	vscode.workspace.onWillSaveTextDocument(event => {
		const openEditor = vscode.window.visibleTextEditors.filter(
			editor => editor.document.uri === event.document.uri
		)[0];
		decorateIndent(openEditor);
	});

	if (vscode.window.activeTextEditor) {
		decorateIndent(vscode.window.activeTextEditor);
	}
}

export function deactivate() {
	// get the current indentation method, as defined by the settings
	vscode.workspace.getConfiguration().update('editor.lineHeight', 0, vscode.ConfigurationTarget.Workspace);
	vscode.workspace.getConfiguration().update('editor.formatOnType', false, vscode.ConfigurationTarget.Workspace);
	vscode.workspace.getConfiguration().update('editor.formatOnSave', false, vscode.ConfigurationTarget.Workspace);
	vscode.workspace.getConfiguration().update('editor.renderWhitespace', true, vscode.ConfigurationTarget.Workspace);
}