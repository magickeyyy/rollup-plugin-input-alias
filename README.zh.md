# rollup-plugin-input-alias

rollup 路径别名插件，类似 webpack 的`resolve.alias`，配置更简单。  
[English](https://github.com/magickeyyy/rollup-plugin-input-alias/blob/master/README.md)

## 安装

pnpm

```bash
pnpm add rollup-plugin-input-alias --save-dev
```

npm

```bash
npm install rollup-plugin-input-alias --save-dev
```

yarn

```bash
yarn add rollup-plugin-input-alias --save-dev
```

## 使用

```js
// rollup.config.mjs
import inputAlias from 'rollup-plugin-input-alias';

export default {
    plugins: [inputAlias({ alias: { '@': 'src' } })],
};
```

## 配置

### alias

Type: <code>Record<string,string></code>  
Default: <code>null</code>

别名配置，一个 key 就是一个别名，value 是基于工作目录的相对路径。  
当 rollup 解析文件时，如果路径是以别名开头的字符串，插件会替换别名，形成绝对路径（`path.join(cwd, alias, the rest of source)`）。如果路径省略了文件名，插件会尝试按`extensions`的顺序查找目录下`index.xx`文件。然后根据引入该路径的文件的路径计算出相对路径，进行替换。

### cwd

Type: <code>string</code>  
Default : <code>process.cwd()</code>

工作目录路径。

### extensions

Type: <code>string[]</code>  
Default: <code>['.js', '.ts'] | ['.ts', '.js']</code>

当文件名缺省时（用`path.extname`判断），会按这个顺序查找目录下`index.xx`文件，找不到抛出异常。  
插件会检查工作目录下是否有`tsconfig.json`，如果有，默认值是<code>['.ts', '.js']</code>，否则是<code>['.js', '.ts']</code>
