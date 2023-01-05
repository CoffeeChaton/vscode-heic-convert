import * as vscode from 'vscode';

function validateInput(value: string): vscode.InputBoxValidationMessage | null {
    if (value === '100') return null;

    if ((/^[1-9]\d$/u).test(value)) {
        return null;
    }
    return {
        message: 'should input 10 ~ 100 integer, like 92 or 100',
        severity: vscode.InputBoxValidationSeverity.Error,
    };
}

async function setQuality(format: 'JPEG' | 'PNG'): Promise<number | null> {
    const quality100: string | undefined = await vscode.window.showInputBox({
        title: `input quality of "${format}"`,
        prompt: 'integer of 10 ~ 100 range',
        placeHolder: '92',
        validateInput,
    });
    if (quality100 === undefined) return null;
    if (quality100 === '100') return 1;

    const quality: number = Number.parseInt(quality100, 10);
    // eslint-disable-next-line no-magic-numbers
    if (Number.isNaN(quality) || quality < 10 || quality > 100) return null;

    // eslint-disable-next-line no-magic-numbers
    return quality / 100;
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
            label: 'PNG',
            format: 'PNG',
        },
        {
            label: 'JPEG',
            format: 'JPEG',
        },
    ]);
    return pickFormat?.format;
}

export type TConfig = {
    format: 'JPEG' | 'PNG',
    ignore: boolean,
    quality: number,
};

export async function selectConvertConfig(): Promise<TConfig | null> {
    const ignore: boolean | undefined = await setIgnore();
    if (ignore === undefined) return null;

    const format: 'JPEG' | 'PNG' | undefined = await setFormat();
    if (format === undefined) return null;

    const quality: number | null = await setQuality(format);
    if (quality === null) return null;

    return {
        format,
        ignore,
        quality,
    };
}
