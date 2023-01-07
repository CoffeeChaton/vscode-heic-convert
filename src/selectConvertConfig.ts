/* eslint-disable @typescript-eslint/indent */
/* eslint no-magic-numbers: ["error", { "ignore": [1,10,100] }] */
import * as vscode from 'vscode';

export type TConfigOLD = Readonly<{
    format: 'JPEG' | 'PNG',
    ignore: boolean,
    quality100: number,
}>;

export type TConfig = Readonly<
    {
        format: 'JPEG',
        ignore: boolean,
        quality100: number,
    } | {
        format: 'PNG',
        ignore: boolean,
    }
>;

function validateInput(value: string): vscode.InputBoxValidationMessage | null {
    if (value === '100') return null; // OK
    if ((/^[1-9]\d$/u).test(value)) return null; // OK

    return {
        message: 'should input 10 ~ 100 integer, like 92 or 100',
        severity: vscode.InputBoxValidationSeverity.Error,
    };
}

async function setQuality(format: 'JPEG' | 'PNG'): Promise<number | null> {
    const quality100Str: string | undefined = await vscode.window.showInputBox({
        title: `input quality of "${format}"`,
        prompt: 'int in range(10, 100)',
        placeHolder: '92',
        validateInput,
    });
    if (quality100Str === undefined) return null;
    if (quality100Str === '100') return 100;

    const quality100: number = Number.parseInt(quality100Str, 10);
    return Number.isNaN(quality100) || quality100 < 10 || quality100 > 100
        ? null
        : quality100;
}

async function setIgnore(): Promise<boolean | undefined> {
    type TPickIgnore = {
        label: string,
        ignore: boolean,
    };
    const pickIgnore: TPickIgnore | undefined = await vscode.window.showQuickPick<TPickIgnore>([
        {
            label: '0 -> true (default) ignore file with the same name',
            ignore: true,
        },
        {
            label: '1 -> false ',
            ignore: false,
        },
    ]);
    return pickIgnore?.ignore;
}

async function setFormat(): Promise<'JPEG' | 'PNG' | undefined> {
    type TPickFormat = {
        label: string,
        format: 'JPEG' | 'PNG',
    };
    const pickFormat: TPickFormat | undefined = await vscode.window.showQuickPick<TPickFormat>([
        {
            label: '0 -> PNG (default)',
            format: 'PNG',
        },
        {
            label: '1 -> JPEG',
            format: 'JPEG',
        },
    ]);
    return pickFormat?.format;
}

export async function selectConvertConfig(): Promise<TConfig | null> {
    const ignore: boolean | undefined = await setIgnore();
    if (ignore === undefined) return null;

    const format: 'JPEG' | 'PNG' | undefined = await setFormat();
    if (format === undefined) return null;

    if (format === 'PNG') {
        return { format, ignore };
    }

    const quality100: number | null = await setQuality(format);
    return quality100 === null
        ? null
        : {
            format,
            ignore,
            quality100,
        };
}
