# rollup-plugin-input-alias

Rollup path alias plugin, similar to webpack's `resolve.alias`, with simpler configuration.

[汉语](https://github.com/magickeyyy/rollup-plugin-input-alias/blob/master/README.zh.md)

## Installation

pnpm

```bash
pnpm add @rollup/plugin-input-alias --save-dev
```

npm

```bash
npm install @rollup/plugin-input-alias --save-dev
```

yarn

```bash
yarn add @rollup/plugin-input-alias --save-dev
```

## Usage

```js
// rollup.config.mjs
import inputAlias from '@rollup/plugin-input-alias';

export default {
    plugins: [inputAlias({ alias: { '@': 'src' } })],
};
```

## Configuration

### alias

Type: <code>Record<string,string></code>  
Default: <code>null</code>

Alias configuration, where each key is an alias and the value is a relative path based on the working directory.  
When Rollup resolves a file, if the path starts with an alias, the plugin will replace it with an absolute path (`path.join(cwd, alias, the rest of source)`). If the path omits the file name, the plugin will attempt to find an `index.xx` file in the directory in the order specified by `extensions`. It will then calculate the relative path based on the file that imported this path and perform the replacement.

### cwd

Type: <code>string</code>  
Default : <code>process.cwd()</code>

Working directory path.

### extensions

Type: <code>string[]</code>  
Default: <code>['.js', '.ts'] | ['.ts', '.js']</code>

When the file name is omitted (determined by `path.extname`), it will look for an `index.xx` file in the directory in this order, and throw an exception if not found.  
The plugin will check if there is a `tsconfig.json` in the working directory. If so, the default value is <code>['.ts', '.js']</code>, otherwise it is <code>['.js', '.ts']</code>.
