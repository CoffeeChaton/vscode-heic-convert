import path from 'node:path';
import * as vscode from 'vscode';
import type { TPathPair } from './HeicConvert';
import { HeicConvert } from './HeicConvert';
import type { TConfig } from './selectConvertConfig';
import { selectConvertConfig } from './selectConvertConfig';
import { statusBarState } from './statusBar';

export async function selectFile(): Promise<0> {
    const config: TConfig | null = await selectConvertConfig();
    if (config === null) return 0;

    const uriList: vscode.Uri[] | undefined = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectMany: true,
        filters: { Images: ['heic', 'heif'] },
    });

    if (uriList === undefined) return 0;

    const saveFolderList: vscode.Uri[] | undefined = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectMany: false,
    });
    if (saveFolderList === undefined || saveFolderList.length !== 1) return 0;
    const saveFolder: string = saveFolderList[0].fsPath;

    const formatLowerCase: string = config.format.toLowerCase();
    const pathPairList: readonly TPathPair[] = uriList.map((uri: vscode.Uri): TPathPair => {
        const inputPath: string = path.normalize(uri.fsPath);
        const outputPath: string = path.normalize(`${saveFolder}\\${path.parse(inputPath).name}.${formatLowerCase}`);

        return {
            inputPath,
            outputPath,
        };
    });

    statusBarState.work = true;
    await HeicConvert(config, pathPairList);

    return 0;
}
