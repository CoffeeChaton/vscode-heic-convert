import path from 'node:path';
import * as vscode from 'vscode';
import { getDefaultConfig } from './configUI';
import type { TPathPair } from './HeicConvert';
import { HeicConvert } from './HeicConvert';
import type { TConfig } from './selectConvertConfig';
import { selectConvertConfig } from './selectConvertConfig';
import { statusBarState } from './statusBar';

type TGlobalState = {
    // defaultUriInput: vscode.Uri | null,
    defaultUriSave: vscode.Uri | null,
};

const myModuleState: TGlobalState = { defaultUriSave: null };

async function selectDefaultOrNot(DefaultConfig: TConfig): Promise<boolean | undefined> {
    type TPickByDefault = {
        label: string,
        byDefault: boolean,
    };
    const label = `0 -> default with settings.json ${JSON.stringify(DefaultConfig)}`;
    const pickByDefault: TPickByDefault | undefined = await vscode.window.showQuickPick<TPickByDefault>([
        { byDefault: true, label },
        { byDefault: false, label: '1 -> Manual Settings' },
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

    const saveFolderOpt: vscode.OpenDialogOptions = myModuleState.defaultUriSave === null
        ? { canSelectFolders: true, canSelectMany: false }
        : { canSelectFolders: true, canSelectMany: false, defaultUri: myModuleState.defaultUriSave };
    const saveFolderList: vscode.Uri[] | undefined = await vscode.window.showOpenDialog(saveFolderOpt);
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

    // eslint-disable-next-line prefer-destructuring
    myModuleState.defaultUriSave = saveFolderList[0];

    statusBarState.work = true;
    await HeicConvert(config, pathPairList);

    return null;
}
