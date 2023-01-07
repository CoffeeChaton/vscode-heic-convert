'use strict';

const esbuild = require('esbuild');

esbuild
    .build({
        bundle: true,
        entryPoints: ['./src/extension.ts'],
        external: ['vscode', 'heic-convert'], // not bundle
        format: 'cjs',
        logLevel: 'info',
        minify: false,
        outdir: 'dist',
        platform: 'node',
        sourcemap: true,
        target: ['es2021', 'node16.14'],
        treeShaking: true,
    })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
