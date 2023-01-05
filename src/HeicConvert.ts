/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable no-await-in-loop */
import convert from 'heic-convert';
import fs from 'node:fs';
import path from 'node:path';
import * as vscode from 'vscode';

const statusBar: vscode.StatusBarItem = vscode.window.createStatusBarItem(
    'vscode-heic-convert',
    vscode.StatusBarAlignment.Right,
);

statusBar.tooltip = 'by CoffeeChaton/vscode-heic-convert';
// TODO add cmd to break change statusBar.command = 'ahk.nekoHelp.bar';

function toBuffer(ab: ArrayBuffer): Buffer {
    const buf: Buffer = Buffer.alloc(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

export async function HeicConvert(
    fsPathList: string[],
    saveFolderFsPath: string,
    format: 'JPEG' | 'PNG',
): Promise<void> {
    try {
        for (const [i, fsPath] of fsPathList.entries()) {
            const inputBuffer: Buffer = fs.readFileSync(fsPath);
            const outputBuffer: ArrayBuffer = await convert({
                buffer: inputBuffer, // the HEIC file buffer
                format,
                quality: 1,
            });
            const newName: string = path.basename(fsPath);
            fs.writeFileSync(`${saveFolderFsPath}\\${newName}.${format.toLowerCase()}`, toBuffer(outputBuffer));
            statusBar.text = `$(heart) ${i} of ${fsPathList.length} OK`;
            statusBar.show();
        }

        statusBar.hide();

        void vscode.window.showInformationMessage('All Heic Convert Finish');
    } catch (error: unknown) {
        console.error('🚀', error);
    }
}
