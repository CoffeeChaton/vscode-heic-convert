import path from 'node:path';
import * as vscode from 'vscode';
import { getDefaultConfig } from './configUI';
import type { TPathPair } from './HeicConvert';
import { HeicConvert } from './HeicConvert';
import type { TConfig } from './selectConvertConfig';
import { selectConvertConfig } from './selectConvertConfig';
import { statusBarState } from './statusBar';

async function selectDefaultOrNot(DefaultConfig: TConfig): Promise<boolean | undefined> {
    type TPickByDefault = {
        label: string,
        byDefault: boolean,
    };
    const pickByDefault: TPickByDefault | undefined = await vscode.window.showQuickPick<TPickByDefault>([
        {
            label: `0 -> default with settings.json ${JSON.stringify(DefaultConfig)}`,
            byDefault: true,
        },
        {
            label: '1 -> Manual Settings',
            byDefault: false,
        },
    ]);
    return pickByDefault?.byDefault;
}

export async function selectFile(): Promise<null> {
    const DefaultConfig: TConfig = getDefaultConfig();
    const byDefault: boolean | undefined = await selectDefaultOrNot(DefaultConfig);
    if (byDefault === undefined) return null;

    const config: TConfig | null = byDefault
        ? DefaultConfig
        : await selectConvertConfig();
    if (config === null) return null;

    const uriList: vscode.Uri[] | undefined = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectMany: true,
        filters: { Images: ['heic', 'heif'] },
    });

    if (uriList === undefined) return null;

    const saveFolderList: vscode.Uri[] | undefined = await vscode.window.showOpenDialog({
        canSelectFolders: true,
        canSelectMany: false,
    });
    if (saveFolderList === undefined || saveFolderList.length !== 1) return null;
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

    return null;
}
