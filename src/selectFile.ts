import path from 'node:path';
import * as vscode from 'vscode';
import { getDefaultConfig } from './configUI';
import type { TPathPair } from './HeicConvert';
import { HeicConvert } from './HeicConvert';
import type { TConfig } from './selectConvertConfig';
import { selectConvertConfig } from './selectConvertConfig';
import { statusBarState } from './tools/statusBar';

type TGlobalState = {
    defaultUriInput: vscode.Uri | null,
    defaultUriSave: vscode.Uri | null,
};

const myModuleState: TGlobalState = {
    defaultUriInput: null,
    defaultUriSave: null,
};

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

async function selectInputFileList(): Promise<vscode.Uri[] | null> {
    const defOpt = {
        canSelectFiles: true,
        canSelectMany: true,
        filters: { Images: ['heic', 'heif'] },
    };
    const inputDefaultFoldOption: vscode.OpenDialogOptions = myModuleState.defaultUriInput === null
        ? defOpt
        : { ...defOpt, defaultUri: myModuleState.defaultUriInput };
    const uriList: vscode.Uri[] | undefined = await vscode.window.showOpenDialog(inputDefaultFoldOption);
    if (uriList === undefined) return null;

    const firstUri: vscode.Uri | undefined = uriList.at(0);
    if (firstUri !== undefined) {
        myModuleState.defaultUriInput = vscode.Uri.joinPath(firstUri, '..');
    }
    return uriList;
}

async function selectSaveFold(): Promise<string | null> {
    const saveFolderOpt: vscode.OpenDialogOptions = myModuleState.defaultUriSave === null
        ? { canSelectFolders: true, canSelectMany: false }
        : { canSelectFolders: true, canSelectMany: false, defaultUri: myModuleState.defaultUriSave };
    const saveFolderList: vscode.Uri[] | undefined = await vscode.window.showOpenDialog(saveFolderOpt);
    if (saveFolderList === undefined || saveFolderList.length !== 1) return null;

    const firstUri = saveFolderList[0];
    myModuleState.defaultUriSave = firstUri;
    return firstUri.fsPath;
}

function makePathPairList(uriList: vscode.Uri[], saveFolder: string, fileExt: string): readonly TPathPair[] {
    return uriList.map((uri: vscode.Uri): TPathPair => {
        const inputPath: string = path.normalize(uri.fsPath);
        const outputPath: string = path.normalize(`${saveFolder}\\${path.parse(inputPath).name}.${fileExt}`);

        return {
            inputPath,
            outputPath,
        };
    });
}

async function getConfig(): Promise<TConfig | null> {
    const DefaultConfig: TConfig = getDefaultConfig();
    const byDefault: boolean | undefined = await selectDefaultOrNot(DefaultConfig);
    if (byDefault === undefined) return null;

    return byDefault
        ? DefaultConfig
        : selectConvertConfig();
}

export async function selectFile(): Promise<null> {
    const config: TConfig | null = await getConfig();
    if (config === null) return null;

    const uriList: vscode.Uri[] | null = await selectInputFileList();
    if (uriList === null) return null;

    const saveFolder: string | null = await selectSaveFold();
    if (saveFolder === null) return null;

    const fileExt: string = config.format.toLowerCase();
    const pathPairList: readonly TPathPair[] = makePathPairList(uriList, saveFolder, fileExt);

    statusBarState.work = true;
    await HeicConvert(config, pathPairList);

    return null;
}
