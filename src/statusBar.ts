import * as vscode from 'vscode';

export const statusBar: vscode.StatusBarItem = vscode.window.createStatusBarItem(
    'vscode-heic-convert',
    vscode.StatusBarAlignment.Right,
);
statusBar.tooltip = 'by CoffeeChaton/vscode-heic-convert';
// TODO add cmd to break change task
// TODO add color with change color
