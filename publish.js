/*
 * 构建、生成其他npm package文件
 * build后到dist目录 npm login;npm publish
 */
const child_process = require('child_process');
const path = require('path');
const fs = require('fs');

const version = process.argv[2];
if (
    version &&
    !(
        ['major', 'minor', 'patch'].includes(version) ||
        /^\d+\.\d+\.\d+/.test(version)
    )
) {
    console.log('version不合规范');
    process.exit(1);
}
function exec(command, options) {
    return new Promise((resolve, reject) => {
        child_process.exec(command, options, (error) => {
            if (error) {
                return reject(error);
            }
            resolve();
        });
    });
}
/**
 * @name:
 * @description 修改readme coverage，拷贝到dist
 */
async function readme() {
    const md = await fs.promises.readFile(path.resolve(__dirname, 'README.md'));
    await fs.promises.writeFile(path.resolve(__dirname, 'dist/README.md'), md);
}

/**
 * @description 重写package.json
 */
async function package() {
    const {
        name,
        version,
        description,
        keywords,
        author,
        license,
        repository,
        homepage,
    } = require('./package.json');
    return fs.promises.writeFile(
        path.resolve(__dirname, 'dist/package.json'),
        JSON.stringify(
            {
                name,
                version,
                description,
                keywords,
                author,
                license,
                repository,
                homepage,
                main: './index.js',
                module: './index.mjs',
                typings: './index.d.ts',
            },
            undefined,
            2,
        ),
    );
}

(async () => {
    await fs.promises
        .rm(path.resolve(__dirname, 'dist'), { recursive: true })
        .catch(() => {});
    await exec('npm run test');
    await exec('npm run build');
    if (version) {
        await exec(`npm version ${version}`);
    }
    return Promise.all([readme(), package()]);
})();
