import path from 'path';
import fs from 'fs';

const PluginName = 'input-alias';
const NullValue = { name: PluginName, resolveId: () => null };

function isRecord<T extends Record<string, any> = Record<string, any>>(
    data: unknown,
): data is T {
    return Object.prototype.toString.call(data) === '[object Object]';
}

function isString<T extends string = string>(data: unknown): data is T {
    return typeof data === 'string';
}

/**
 * @name 默认文件后缀
 */
const extensions = ['.js', '.ts'];
try {
    fs.readFileSync(path.resolve(process.cwd(), 'tsconfig.json'));
    const js = extensions[0];
    extensions[0] = extensions[1];
    extensions[1] = js;
} catch (e) {}

/**
 * @name 按规则找出缺省文件名的路径对应的文件路径
 * @description 如果路径已经指向一个文件，直接返回路径。
 * @description 否则认为路径指向一个文件夹，将按extensions的顺序一直解析到目标文件夹下index.xxx文件，否则报错
 * @param {string} cwd 工作目录路径
 * @param {string} src 基于工作目录的相对路径
 * @returns {string} 返回的是原src或者补全了index.xxx的src
 */
function findFile(cwd: string, src: string, exts: string[] = extensions) {
    src = /\/$/.test(src) ? src.replace(/\/$/, '') : src;
    let ext = path.extname(src);
    let i = -1;
    return new Promise<string>(async (success, reject) => {
        function off() {
            ++i;
            if (!exts[i])
                return reject(
                    new Error('can not resolve ' + src + ' in ' + cwd),
                );
            ext = exts[i];
            return recursion(src + '/index' + exts[i]);
        }
        async function recursion(p: string): Promise<string | void> {
            if (ext) {
                const isFile = await fs.promises
                    .stat(path.resolve(cwd, p))
                    .then((stat) => stat.isFile())
                    .catch(() => false);
                if (isFile) return success(p);
                return off();
            }
            return off();
        }
        return recursion(src).catch(reject);
    });
}

/**
 * @name 路径别名
 * @description 别名只能映射到目录，不能隐射到文件
 * @description 映射的路径必须是与cwd的相对路径
 * @param options 别名隐射关系，值是基于工作目录的相对路径
 */
export default async function inputAlias(options: {
    alias: Record<string, string>;
    cwd?: string;
    extensions?: string;
}) {
    if (
        !isRecord(options) ||
        !isRecord(options.alias) ||
        !Object.keys(options.alias).length ||
        options.extensions?.length === 0
    ) {
        console.warn('incorrect options');
        return NullValue;
    }
    const cwd = options.cwd ?? process.cwd();
    const aliases = await Promise.all(
        Object.entries(options.alias).map(([alias, value]) =>
            fs.promises.lstat(path.join(cwd, value)).then((stat) => {
                if (stat.isDirectory() || stat.isSymbolicLink()) {
                    return alias;
                }
                throw new Error(`${alias} is not a directory or symbolic link`);
            }),
        ),
    );
    /**
     * @description 找出别名映射的路径
     */
    const findAlias = (source: string) =>
        aliases.find((alias) => isString(source) && source.startsWith(alias));

    return {
        name: PluginName,
        async resolveId(
            source: string,
            importer: string | undefined,
            option: any,
        ) {
            const alias = findAlias(source);
            if (
                option.isEntry ||
                path.isAbsolute(source) ||
                !alias ||
                !importer
            )
                return (this as any)
                    .resolve(
                        source,
                        importer,
                        Object.assign({ skipSelf: true }, option),
                    )
                    .then((resolved: any) => resolved || { id: source });
            const origin = await findFile(
                cwd,
                source.replace(alias, options.alias[alias]),
            );
            const to = path.resolve(cwd, origin);
            const from = path.isAbsolute(importer)
                ? importer
                : path.resolve(cwd, importer);
            let updatedSource = path
                .relative(path.dirname(from), to)
                .split(path.sep)
                .join('/');
            // 必须改成相对路径
            if (!updatedSource.startsWith('./')) {
                updatedSource = './' + updatedSource;
            }
            return (this as any)
                .resolve(
                    updatedSource,
                    importer,
                    Object.assign({ skipSelf: true }, option),
                )
                .then((resolved: any) => resolved || { id: updatedSource });
        },
    };
}
