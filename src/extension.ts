import * as vscode from "vscode";
import { decorate } from "./decorate";
import { decorateIndent } from "./indentDecorator";

// from decoration tut
const decorationType = vscode.window.createTextEditorDecorationType({
	backgroundColor: 'green',
	border: '2px solid white',
})

export function activate(context: vscode.ExtensionContext) {
	console.log("Congratulations, your extension is now active!");

	vscode.workspace.onWillSaveTextDocument(event => {
		const openEditor = vscode.window.visibleTextEditors.filter(
			editor => editor.document.uri === event.document.uri
		)[0];
		decorate(openEditor);
		// decorateIndent(openEditor);
	});
}

function write(code: string): void {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		throw new Error("There's no active editor");
	}

	const edit = new vscode.WorkspaceEdit();

	const wholeDocument = new vscode.Range(
		new vscode.Position(0, 0),
		new vscode.Position(editor.document.lineCount, 0)
	);
	const updateCode = new vscode.TextEdit(wholeDocument, code);

	edit.set(editor.document.uri, [updateCode]);

	vscode.workspace.applyEdit(edit);
}

export function deactivate() { }