/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable no-await-in-loop */
import * as vscode from 'vscode';
import { configChangEvent } from './configUI';
import { selectFile } from './selectFile';
import { log } from './tools/log';
import { cancellationTask, statusBar } from './tools/statusBar';

export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand('heic.convert.start', selectFile),
        vscode.commands.registerCommand('heic.convert.cancellation.task', cancellationTask),
        vscode.workspace.onDidChangeConfiguration(configChangEvent),
    );
    // heicConvertExtension.activated
    void vscode.commands.executeCommand('setContext', 'heicConvertExtension.activated', true);
}

export function deactivate(): void {
    log.clear(); // just .clear() not .dispose()
    log.hide();
    statusBar.hide(); // just .hide() not .dispose()
}
