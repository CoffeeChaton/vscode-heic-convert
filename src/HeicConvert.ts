/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable no-await-in-loop */
import convert from 'heic-convert';
import fs from 'node:fs';
import * as vscode from 'vscode';
import { log } from './log';
import { statusBar } from './statusBar';

function toBuffer(ab: ArrayBuffer): Buffer {
    const buf: Buffer = Buffer.alloc(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        buf[i] = view[i];
    }
    return buf;
}

export type TPathPair = {
    inputPath: string,
    outputPath: string, // `${saveFolderFsPath}\\${path.parse(fsPath).name}.${format.toLowerCase()}`
};

type THeicConvertData = {
    pathPairList: TPathPair[],
    quality: number,
    format: 'JPEG' | 'PNG',
    ignore: boolean,
};

/**
 * ```javascript
 * return [ 1 of 57] ; // exp
 * ```
 */
function getHead(i: number, list: TPathPair[]): `[${string}]` {
    const len: number = list.length;
    const iStr: string = `${i + 1}`.padStart(len.toString().length);

    return `[${iStr} of ${len}]`;
}

/**
 * @param quality between 0 and 1
 */
export async function HeicConvert(
    {
        pathPairList: list,
        quality,
        format,
        ignore,
    }: THeicConvertData,
): Promise<void> {
    log.info(`quality : ${quality}, format : "${format}", ignore : ${ignore}`);

    const Time1: number = Date.now();
    for (const entries of list.entries()) {
        const t1: number = Date.now();
        const [i, { inputPath, outputPath }] = entries;
        const head: `[${string}]` = getHead(i, list);
        statusBar.text = `$(loading~spin) ${i} of ${list.length}`;
        statusBar.show();

        try {
            if (!fs.existsSync(inputPath)) {
                log.error(`${head} fs not existsSync "${outputPath}"`, entries);
                continue;
            }
            // ... less parsing time
            if (ignore && fs.existsSync(outputPath)) {
                log.warn(`${head} ignore-case1: file exists "${outputPath}" and ignore`);
                continue;
            }
            const inputBuffer: Buffer = fs.readFileSync(inputPath);

            const outputBuffer: ArrayBuffer = await convert({
                buffer: inputBuffer, // the HEIC file buffer
                format,
                quality,
            });

            // maybe after await ... user input img to fold
            if (fs.existsSync(outputPath)) {
                if (ignore) {
                    log.warn(`${head} ignore-case2: file exists "${outputPath}" and ignore`);
                } else {
                    // cover
                    log.warn(`${head} not-ignore: file exists "${outputPath}" and ignore is false`);
                    fs.writeFileSync(outputPath, toBuffer(outputBuffer));
                }

                continue;
            }

            // OK !!!
            fs.writeFileSync(outputPath, toBuffer(outputBuffer));
            const ms: number = Date.now() - t1;
            log.info(`${head} ${ms} ms "${outputPath}" Convert OK!`);
            //
        } catch (error: unknown) {
            console.error('🚀 ~ error at HeicConvert', error);

            if (error instanceof Error) {
                log.error(error, { entries });
            } else {
                log.error(`unknown error at ${head}`, { entries });
                console.trace('unknown error at HeicConvert');
            }
        }
    }

    statusBar.hide();
    const Time2: number = Date.now();
    log.info(`[all-task] ${Time2 - Time1} ms Convert finish`);
    log.show();
    void vscode.window.showInformationMessage('All Heic Convert Finish');
}
