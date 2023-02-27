import * as vscode from 'vscode';
import type { TConfig } from './selectConvertConfig';
import { log } from './tools/log';
import { statusBar } from './tools/statusBar';

/**
 * [Configuration example](https://code.visualstudio.com/api/references/contribution-points%5C#Configuration-example)
 */
type TPackConfig = Readonly<{
    statusBarDisplayColor: string,
    default: TConfig,
}>;

const enum EEnum {
    // eslint-disable-next-line no-magic-numbers
    quality92 = 92,
    // eslint-disable-next-line @typescript-eslint/no-mixed-enums
    head = 'heicConvert',
}

// ---set start---

function getConfig(Configs: vscode.WorkspaceConfiguration): TPackConfig {
    const ed: TPackConfig = {
        statusBarDisplayColor: Configs.get<string>('heicConvert.statusBar.displayColor', '#e783e1'),
        default: {
            quality100: Configs.get<number>('default.quality100', EEnum.quality92),
            format: Configs.get<'JPEG' | 'PNG'>('default.format', 'PNG'),
            ignore: Configs.get<boolean>('default.ignore', true),
        },
    } as const;

    statusBar.color = ed.statusBarDisplayColor;
    return ed;
}

let config: TPackConfig = getConfig(vscode.workspace.getConfiguration(EEnum.head));

export function configChangEvent(): void {
    config = getConfig(vscode.workspace.getConfiguration(EEnum.head));
    log.info('config Chang Event', config);
}

// ---set end---

export function getDefaultConfig(): TConfig {
    return config.default;
}
