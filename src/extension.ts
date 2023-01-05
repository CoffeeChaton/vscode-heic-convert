/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable no-await-in-loop */
import * as vscode from 'vscode';
import { log } from './log';
import { selectFile } from './selectFile';
import { statusBar } from './statusBar';

export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand('heic.convert.start', selectFile),
    );
}

export function deactivate(): void {
    log.clear(); // just .clear() not .dispose()
    log.hide();
    statusBar.hide(); // just .hide() not .dispose()
}
