/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable no-await-in-loop */
import * as vscode from 'vscode';
import { HeicConvert } from './HeicConvert';

async function selectFile(): Promise<number> {
    const uriList: vscode.Uri[] | undefined = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        //    canSelectFolders: true,
        canSelectMany: true,
        filters: { Images: ['heic', 'heif'] },
    });

    if (uriList === undefined) return 0;

    const saveFolderList: vscode.Uri[] | undefined = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectMany: false,
    });
    if (saveFolderList === undefined || saveFolderList.length > 1) return 0;
    const saveFolder = saveFolderList[0].fsPath;

    for (const { fsPath } of uriList) {
        console.log('🚀 ~ fsPath', fsPath);
    }
    console.log('🚀 ~ saveFolder', saveFolderList);

    try {
        await HeicConvert(uriList.map((u) => u.fsPath), saveFolder, 'PNG');
    } catch (error: unknown) {
        console.error('🚀 ~ file:', error);
    }
    return 0;
}

export function activate(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand('heic.convert.start', selectFile),
    );
}

export function deactivate(): void {
    // nothing
}
