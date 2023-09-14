import path from 'path';
import fs from 'fs';
import child_process from 'child_process';
import { strict } from 'assert';
import { rollup, InputPluginOption } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import inputAlias from './src';

const cwd = process.cwd();
const dirname = 'testDir';
const testDir = path.resolve(cwd, dirname);
const dist = path.resolve(cwd, 'dist');
const FileIndex = path.join(testDir, 'index.js');
const FileA = path.join(testDir, 'a', 'index.js');
const FileB = path.join(testDir, 'b.js');
const FileC = path.join(testDir, 'c.js');
const Answer = 'a b c @rollup/plugin-input-alias';

function exec(command: string) {
    return new Promise<void>((resolve, reject) => {
        child_process.exec(command, (error, stdout) => {
            if (error) {
                return reject(error);
            }
            strict.equal(Answer, stdout.trim());
            resolve();
        });
    });
}

/**
 * @name 删除测试目录和产出目录，并新建测试目录及文件
 */
async function mkfile(mode: 'cjs' | 'esm' = 'esm') {
    const ContentIndex =
        mode === 'esm'
            ? `import pkg from '$/package.json';import { a } from '@/a';import { b } from '@/b.js';import c from '@/c.js';console.log(a, b, c, pkg.name);`
            : `const pkg = require('$/package.json');const { a } = require('@/a');const { b } = require('@/b.js');const c = require('@/c.js');console.log(a, b, c, pkg.name);`;
    const ContentA =
        mode === 'esm' ? `export const a = 'a';` : `exports.a = 'a';`;
    const ContentB =
        mode === 'esm' ? `export const b = 'b';` : `exports.b = 'b';`;
    const ContentC =
        mode === 'esm'
            ? `const c = 'c';export default c;`
            : `const c = 'c';module.exports = c;`;
    await Promise.all([
        fs.promises.readdir(testDir).catch(() => {}),
        fs.promises.rm(dist, { recursive: true, force: true }).catch(() => {}),
    ]);
    await fs.promises
        .rm(testDir, { recursive: true, force: true })
        .catch(() => {});
    await fs.promises.mkdir(testDir);
    await Promise.all([
        fs.promises.writeFile(FileIndex, ContentIndex),
        fs.promises
            .mkdir(path.dirname(FileA))
            .then(() => fs.promises.writeFile(FileA, ContentA)),
        fs.promises.writeFile(FileB, ContentB),
        fs.promises.writeFile(FileC, ContentC),
    ]);
}

async function build(mode: 'cjs' | 'esm' = 'esm') {
    const plugins: InputPluginOption = [
        inputAlias({ alias: { '@': dirname, $: '.' } }),
    ];
    if (mode === 'cjs') {
        plugins.push(commonjs({ strictRequires: false, sourceMap: false }));
    }
    plugins.push(json());
    const bundle = await rollup({
        input: `${dirname}/index.js`,
        plugins,
    });
    await Promise.all([
        bundle.write({
            file: 'dist/index.js',
            format: 'cjs',
            sourcemap: false,
        }),
        bundle.write({
            file: 'dist/index.mjs',
            format: 'es',
            sourcemap: false,
        }),
    ]);
    await bundle.close();
}
async function start(mode: 'cjs' | 'esm' = 'esm') {
    await mkfile(mode);
    await build(mode);
    await Promise.all([exec('node dist'), exec('node dist/index.mjs')]);
}

async function test() {
    await start();
    await start('cjs');
    console.log('测试成功');
}
test();
