import VuePlugin from 'rollup-plugin-vue';

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'esm',
    },
    plugins: [VuePlugin()],
    external: ['vue', '@transifex/native'],
  },
];
