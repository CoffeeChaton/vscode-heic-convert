'use strict';

const esbuild = require('esbuild');

esbuild
    .build({
        // define:DEBUG=false
        // entryNames: '[dir]/neko',
        // keepNames: true,
        // mainFields: ['module', 'main'],
        // splitting: true,
        // tsconfig
        // watch: false,
        bundle: true,
        entryPoints: ['./src/extension.ts'],
           external: ['vscode', 'heic-convert'], // not bundle 'vscode' && https://github.com/modfy/nominal
        format: 'cjs',
        logLevel: 'info',
        minify: false,
        outdir: 'dist',
        platform: 'node',
        sourcemap: true,
        target: ['es2021', 'node16.14'],
        treeShaking: false,
    })
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
