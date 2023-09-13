import path from 'path';
import fs from 'fs';
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import inputAlias from '../src';

const cwd = process.cwd();
const dirname = 'testDir';
const testDir = path.resolve(cwd, dirname);
const dist = path.resolve(cwd, 'dist');
const FileIndex = path.join(testDir, 'index.js');
const FileA = path.join(testDir, 'a', 'index.js');
const FileB = path.join(testDir, 'b.js');

/**
 * @name 删除测试目录和产出目录，并新建测试目录及文件
 */
async function mkfile() {
    const ContentIndex = `const { a } = require('@/a');
const { b } = require('@/b.js');

console.log(a, b);`;
    const ContentA = `exports.a = 'a';`;
    const ContentB = `exports.b = 'b';`;
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
    ]);
}

async function build() {
    await mkfile();
    const bundle = await rollup({
        input: `${testDir}/index.js`,
        plugins: [inputAlias({ alias: { '@': dirname } })],
    });
    await Promise.all([
        bundle.write({
            file: 'dist/index.js',
            format: 'cjs',
            sourcemap: true,
        }),
        bundle.write({
            file: 'dist/index.mjs',
            format: 'es',
            sourcemap: true,
        }),
    ]);
    await bundle.close();
}
build();
