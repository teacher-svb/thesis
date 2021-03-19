"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decorateIndent = void 0;
const vscode = require("vscode");
const decorationTypesList = [];
const decorationOptionsList = [];
var DecorationPurpose;
(function (DecorationPurpose) {
    DecorationPurpose[DecorationPurpose["TITLE"] = 0] = "TITLE";
    DecorationPurpose[DecorationPurpose["END"] = 1] = "END";
    DecorationPurpose[DecorationPurpose["CODE"] = 2] = "CODE";
    DecorationPurpose[DecorationPurpose["INDENT"] = 3] = "INDENT";
})(DecorationPurpose || (DecorationPurpose = {}));
function decorateIndent(editor) {
    var _a, _b;
    decorationOptionsList.forEach(options => {
        options[DecorationPurpose.TITLE].length = 0;
        options[DecorationPurpose.END].length = 0;
        options[DecorationPurpose.CODE].length = 0;
        options[DecorationPurpose.INDENT].length = 0;
    });
    // get the current indentation method, as defined by the settings
    const tabsize = (_a = vscode.workspace.getConfiguration('editor').get('tabSize')) !== null && _a !== void 0 ? _a : 4;
    const useSpaces = (_b = vscode.workspace.getConfiguration('editor').get('insertSpaces')) !== null && _b !== void 0 ? _b : true;
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
    });
}
exports.decorateIndent = decorateIndent;
function addDecoration(indentLevel, range, purpose) {
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
    const titleDecOptions = [];
    const endDecOptions = [];
    const indentDecOptions = [];
    const codeDecOptions = [];
    return {
        [DecorationPurpose.TITLE]: titleDecOptions,
        [DecorationPurpose.END]: endDecOptions,
        [DecorationPurpose.INDENT]: indentDecOptions,
        [DecorationPurpose.CODE]: codeDecOptions
    };
}
function createDecorationType(indentLevel) {
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
    });
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
    });
    const codeDecType = vscode.window.createTextEditorDecorationType({
    // backgroundColor: 'rgba(255, 200, 200, 0.5)',
    });
    const indentDecType = vscode.window.createTextEditorDecorationType({
        backgroundColor: `rgba(${color}, 0.25)`,
        before: {
            backgroundColor: `rgba(${color}, 1)`,
            width: '2px',
            height: '100%',
            contentText: '',
            margin: '-100% 0 0 0'
        }
    });
    return {
        [DecorationPurpose.TITLE]: titleDecType,
        [DecorationPurpose.END]: endDecType,
        [DecorationPurpose.INDENT]: indentDecType,
        [DecorationPurpose.CODE]: codeDecType
    };
}
//# sourceMappingURL=indentDecorator.js.map