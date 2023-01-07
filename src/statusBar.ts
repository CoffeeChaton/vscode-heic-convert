import * as vscode from 'vscode';
import { log } from './log';

export const statusBar: vscode.StatusBarItem = vscode.window.createStatusBarItem(
    'vscode-heic-convert',
    vscode.StatusBarAlignment.Right,
);
statusBar.tooltip = 'by CoffeeChaton/vscode-heic-convert';
statusBar.command = 'heic.convert.cancellation.task'; // TODO replace with quickPick

/*
 * A cancellation token is passed to an asynchronous or long running
 * operation to request cancellation, like cancelling a request
 */
export const statusBarState = {
    work: true,
};

export function cancellationTask(): void {
    statusBarState.work = false;
    statusBar.text = '$(sync-ignored) wait to cancellation Task';
    log.warn('wait to cancellation Task');
    log.show();
}
