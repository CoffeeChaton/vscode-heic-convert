/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable no-await-in-loop */
/* eslint no-magic-numbers: ["error", { "ignore": [1,30,100] }] */
import convert from 'heic-convert';
import fs from 'node:fs';
import { log } from './log';
import type { TConfig } from './selectConvertConfig';
import { statusBar, statusBarState } from './statusBar';
import { sleep } from './tools/sleep';

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

/**
 * ```javascript
 * return [ 1 of 57] ; // exp
 * ```
 */
function getHead(i: number, list: readonly TPathPair[]): `[${string} of ${number}]` {
    const lenStr: number = list.length;
    const iStr: string = `${i + 1}`.padStart(lenStr.toString().length);

    return `[${iStr} of ${lenStr}]`;
}

export async function HeicConvert(Config: TConfig, pathPairList: readonly TPathPair[]): Promise<void> {
    log.info('task start', Config);
    log.show(true);
    statusBar.show();
    const { format, ignore } = Config;
    const quality: number = format === 'JPEG'
        // eslint-disable-next-line unicorn/consistent-destructuring
        ? Config.quality100 / 100
        : 1;

    await sleep(100);

    const Time1: number = Date.now();
    for (const entries of pathPairList.entries()) {
        await sleep(30); // wait to get statusBarState.work
        if (!statusBarState.work) {
            log.info('cancellation Task');
            break;
        }

        const t1: number = Date.now();
        const [i, { inputPath, outputPath }] = entries;
        const head: `[${string}]` = getHead(i, pathPairList);
        statusBar.text = `$(loading~spin) ${i} of ${pathPairList.length}`;

        try {
            if (!fs.existsSync(inputPath)) {
                log.error(`${head} fs not existsSync "${outputPath}"`, entries);
                continue;
            }
            // ... less parsing time
            if (ignore && fs.existsSync(outputPath)) {
                log.warn(`${head} ignore-case1: file exists "${outputPath}"`);
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
                    log.warn(`${head} ignore-case2: file exists "${outputPath}"`);
                } else {
                    // cover
                    log.warn(`${head} not-ignore: file exists "${outputPath}" and cover it`);
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
            if (error instanceof Error) {
                log.error(error, { entries });
            } else {
                log.error(`${head} unknown error!`, error, { entries });
            }
        }
    }

    statusBar.text = 'all-task-finish';
    statusBar.hide();
    log.info(`[all-task-finish] ${Date.now() - Time1} ms`, Config);
    log.show();
    statusBarState.work = true;
}
