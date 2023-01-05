import * as vscode from 'vscode';

/**
 * # INFO
 * - [info] [ 42 of 100] 15 ms - OK - "d:\To png\20210507_094011.png"
 * - ;--------^ padStart -----^ OK - ^--- output
 */
export const log: vscode.LogOutputChannel = vscode.window.createOutputChannel('heic-convert', { log: true });
log.info('Initialized "vscode-heic-convert"');

// TODO add: warn format exp
