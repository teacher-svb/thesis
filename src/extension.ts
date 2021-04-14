import * as vscode from "vscode";
import { decorateIndent } from "./indentDecorator";

export function activate(context: vscode.ExtensionContext) {
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

	wait(1000).then(() => {
		if (vscode.window.activeTextEditor) {
			decorateIndent(vscode.window.activeTextEditor);
		}
	});
	wait(2000).then(() => {
		if (vscode.window.activeTextEditor) {
			decorateIndent(vscode.window.activeTextEditor);
		}
	});
	wait(3000).then(() => {
		if (vscode.window.activeTextEditor) {
			decorateIndent(vscode.window.activeTextEditor);
		}
	});
	wait(4000).then(() => {
		if (vscode.window.activeTextEditor) {
			decorateIndent(vscode.window.activeTextEditor);
		}
	});
}

function wait(milliseconds: number) {
	return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export function deactivate() {
	// get the current indentation method, as defined by the settings
	vscode.workspace.getConfiguration().update('editor.lineHeight', 0, vscode.ConfigurationTarget.Workspace);
	vscode.workspace.getConfiguration().update('editor.formatOnType', false, vscode.ConfigurationTarget.Workspace);
	vscode.workspace.getConfiguration().update('editor.formatOnSave', false, vscode.ConfigurationTarget.Workspace);
	vscode.workspace.getConfiguration().update('editor.renderWhitespace', true, vscode.ConfigurationTarget.Workspace);
}