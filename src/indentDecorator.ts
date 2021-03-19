import * as vscode from "vscode";

const decorationTypesList: any[] = [];
const decorationOptionsList: any[] = [];

enum DecorationPurpose {
    TITLE,
    END,
    CODE,
    INDENT
}

export function decorateIndent(editor: vscode.TextEditor): void {
    decorationOptionsList.forEach(options => {
        options[DecorationPurpose.TITLE].length = 0;
        options[DecorationPurpose.END].length = 0;
        options[DecorationPurpose.CODE].length = 0;
        options[DecorationPurpose.INDENT].length = 0;
    })

    // get the current indentation method, as defined by the settings
    const tabsize = vscode.workspace.getConfiguration('editor').get<number>('tabSize') ?? 4;
    const useSpaces = vscode.workspace.getConfiguration('editor').get<boolean>('insertSpaces') ?? true;
    vscode.workspace.getConfiguration().update('editor.lineHeight', 25, vscode.ConfigurationTarget.Workspace);

    useSpaces ? vscode.commands.executeCommand('editor.action.indentationToSpaces')
        : vscode.commands.executeCommand('editor.action.indentationToTabs');


    const lines = editor.document.getText().split('\n');
    let indentLevel = 0;
    let lineNum = -1;
    editor.edit(edit => {
        lines.forEach(line => {
            lineNum++;
            let amountOfWhitespaces = line.search(/\S|$/);
            let newIndentLevel = useSpaces ? Math.floor(amountOfWhitespaces / tabsize) : amountOfWhitespaces;
            let indentDelta = line.trim().length !== 0 ? newIndentLevel - indentLevel : 0;
            indentLevel = line.trim().length !== 0 ? newIndentLevel : indentLevel;


            // discard indent level 0
            if (indentLevel === 0 && indentDelta >= 0) {
                return;
            }

            // add indentation to empty lines
            if (line.trim().length === 0) {
                const indentSpaces = '' + (useSpaces ? ' '.repeat(tabsize * indentLevel) : '\t'.repeat(indentLevel));
                edit.replace(new vscode.Range(lineNum, 0, lineNum, 999), indentSpaces);
            }

            // decorate all other lines
            // decorate indentations
            for (let i = 0; i < indentLevel; ++i) {
                const start = i * tabsize;
                const end = start + tabsize;
                const range = new vscode.Range(lineNum, start, lineNum, end);

                addDecoration(i, range, DecorationPurpose.INDENT);
            }
            // decorate titles
            if (indentDelta > 0) {
                let start = (indentLevel - 1) * tabsize;
                let end = 999;
                let range = new vscode.Range(lineNum - 1, start, lineNum - 1, end);

                addDecoration(indentLevel - 1, range, DecorationPurpose.TITLE);
            }
            // decorate ends
            else if (indentDelta < 0) {
                const start = (indentLevel) * tabsize;
                const end = 999;
                const range = new vscode.Range(lineNum, start, lineNum, end);

                addDecoration(indentLevel, range, DecorationPurpose.END);
            }
            // decorate code
            const start = (indentLevel) * tabsize;
            const end = 999;
            const range = new vscode.Range(lineNum, start, lineNum, end);
            addDecoration(indentLevel, range, DecorationPurpose.CODE);
        });
    });

    decorationOptionsList.forEach((options, index) => {
        if (options != null) {
            editor.setDecorations(decorationTypesList[index][DecorationPurpose.TITLE], options[DecorationPurpose.TITLE]);
            editor.setDecorations(decorationTypesList[index][DecorationPurpose.END], options[DecorationPurpose.END]);
            editor.setDecorations(decorationTypesList[index][DecorationPurpose.INDENT], options[DecorationPurpose.INDENT]);
            editor.setDecorations(decorationTypesList[index][DecorationPurpose.CODE], options[DecorationPurpose.CODE]);
        }
    })
}

function addDecoration(indentLevel: number, range: vscode.Range, purpose: DecorationPurpose) {
    let decoration = { range };

    if (decorationOptionsList[indentLevel] == null) {
        decorationOptionsList[indentLevel] = createDecorationOption();
    }
    if (decorationTypesList[indentLevel] == null) {
        decorationTypesList[indentLevel] = createDecorationType(indentLevel);
    }

    decorationOptionsList[indentLevel][purpose].push(decoration);
}

function createDecorationOption() {
    const titleDecOptions: vscode.DecorationOptions[] = [];
    const endDecOptions: vscode.DecorationOptions[] = [];
    const indentDecOptions: vscode.DecorationOptions[] = [];
    const codeDecOptions: vscode.DecorationOptions[] = [];

    return {
        [DecorationPurpose.TITLE]: titleDecOptions,
        [DecorationPurpose.END]: endDecOptions,
        [DecorationPurpose.INDENT]: indentDecOptions,
        [DecorationPurpose.CODE]: codeDecOptions
    }
}

function createDecorationType(indentLevel: number) {

    const colors = [
        '255, 100, 100',
        '100, 255, 100',
        '100, 100, 255'
    ];

    const color = colors[indentLevel % colors.length];

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
    })
    const endDecType = vscode.window.createTextEditorDecorationType({
        backgroundColor: `rgba(${color}, 0.5)`,
        outline: `2px solid rgba(${color}, 1)`,
        before: {
            backgroundColor: `rgba(${color}, 1)`,
            width: '2px',
            height: '100%',
            contentText: '',
            margin: '-100% 0 0 0'
        }
    })
    const codeDecType = vscode.window.createTextEditorDecorationType({
        // backgroundColor: 'rgba(255, 200, 200, 0.5)',
    })
    const indentDecType = vscode.window.createTextEditorDecorationType({
        backgroundColor: `rgba(${color}, 0.25)`,
        before: {
            backgroundColor: `rgba(${color}, 1)`,
            width: '2px',
            height: '100%',
            contentText: '',
            margin: '-100% 0 0 0'
        }
    })

    return {
        [DecorationPurpose.TITLE]: titleDecType,
        [DecorationPurpose.END]: endDecType,
        [DecorationPurpose.INDENT]: indentDecType,
        [DecorationPurpose.CODE]: codeDecType
    }
}