import path from 'path';
import fs from 'fs';
import { rollup } from 'rollup';
import inputAlias from '../src';

const cwd = process.cwd();
const dirname = 'testDir';
const testDir = path.resolve(cwd, dirname);
const dist = path.resolve(cwd, 'dist');
const FileIndex = path.join(dist, 'index.js');
const FileA = path.join(dist, 'a', 'index.js');
const FileB = path.join(dist, 'b.js');
const ContentIndex = `
const { a } = require('@/a');
const { b } = require('@/b.js');

console.log(a, b);
`;
const ContentA = `
exports.a = 'a';
`;
const ContentB = `
exports.b = 'b';
`;

async function mkfile() {
    await fs.promises.readdir(testDir).catch(() => {});
    await fs.promises.rm(testDir, { recursive: true, force: true });
    await Promise.all([
        fs.promises.mkdir(testDir),
        fs.promises.rm(dist, { recursive: true, force: true }),
    ]);
    await Promise.all([
        fs.promises.writeFile(FileIndex, ContentIndex),
        fs.promises.writeFile(FileA, ContentA),
        fs.promises.writeFile(FileB, ContentB),
    ]);
}

async function build() {}
