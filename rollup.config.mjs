import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/index.mjs',
            format: 'es',
            sourcemap: true,
        },
        {
            file: 'dist/index.js',
            format: 'cjs',
            sourcemap: true,
        },
    ],
    external: ['path', 'fs'],
    plugins: [typescript({ compilerOptions: { module: 'ESNext' } }), terser()],
};
